import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, AlertCircle, CheckCircle,
  ChevronRight, ChevronLeft, X,
  User, Shield, Users, Calendar, MapPin, FileText, Upload, Link as LinkIcon,
  Search, ChevronDown, Scan, Download
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../services/api';
import { extractAadharDetails, extractPanDetails } from '../../utils/ocrUtils';
import { COUNTRY_CODES } from '../../utils/countryCodes';

const ClientForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState({ aadharFront: false, aadharBack: false, pan: false });
  const [ocrData, setOcrData] = useState({ aadharFront: null, aadharBack: null, pan: null });
  const [docMatchStatus, setDocMatchStatus] = useState(null);

  const applyVerifiedDetails = (aadharData, panData) => {
    const updates = {};

    // 1. Identification Numbers
    if (aadharData?.aadharNo) updates.aadharNo = aadharData.aadharNo;
    if (panData?.panNo) updates.panNo = panData.panNo;

    // 2. Name & Split Parts
    const verifiedName = aadharData?.name || panData?.name || '';
    if (verifiedName) {
      updates.name = verifiedName;
      const parts = verifiedName.split(' ').filter(Boolean);
      if (parts.length === 1) {
        updates.firstName = parts[0];
      } else if (parts.length === 2) {
        updates.firstName = parts[0];
        updates.lastName = parts[1];
      } else if (parts.length > 2) {
        updates.firstName = parts[0];
        updates.middleName = parts.slice(1, -1).join(' ');
        updates.lastName = parts[parts.length - 1];
      }
    }

    // 3. Date of Birth
    const verifiedDob = aadharData?.dob || panData?.dob || '';
    if (verifiedDob) updates.dob = verifiedDob;

    // 4. Gender (from Aadhar)
    if (aadharData?.gender) updates.gender = aadharData.gender;

    // 4b. Father's Name (from PAN or Aadhar)
    const verifiedFather = panData?.fatherName || aadharData?.fatherName || '';
    if (verifiedFather) updates.fatherName = verifiedFather;

    // 5. Phone (if available in Aadhar)
    if (aadharData?.phone) updates.phone = aadharData.phone;

    // 6. Address (from Aadhar Back / Front)
    if (aadharData?.address) updates.permanentAddress = aadharData.address;
    if (aadharData?.pincode) updates.pincode = aadharData.pincode;
    if (aadharData?.state) updates.state = aadharData.state;
    if (aadharData?.city) updates.city = aadharData.city;

    setForm(prev => ({ ...prev, ...updates }));
  };

  const clearAutoFilledDetails = () => {
    setForm(prev => ({
      ...prev,
      firstName: '',
      middleName: '',
      lastName: '',
      name: '',
      dob: '',
      fatherName: '',
      aadharNo: '',
      panNo: '',
      permanentAddress: '',
      city: '',
      state: '',
      pincode: '',
    }));
  };

  const checkAndSyncDocs = (currentOcr) => {
    const aFront = currentOcr.aadharFront || {};
    const aBack = currentOcr.aadharBack || {};
    const panInfo = currentOcr.pan;

    const aadharInfo = {
      ...aBack,
      ...aFront,
      name: aFront.name || aBack.name || '',
      fatherName: aBack.fatherName || aFront.fatherName || '',
      dob: aFront.dob || aBack.dob || '',
      aadharNo: aFront.aadharNo || aBack.aadharNo || '',
      gender: aFront.gender || aBack.gender || 'Male',
      phone: aFront.phone || aBack.phone || '',
      address: aBack.address || aFront.address || '',
      pincode: aBack.pincode || aFront.pincode || '',
      state: aBack.state || aFront.state || '',
      city: aBack.city || aFront.city || '',
    };

    const hasAadhar = Boolean(aadharInfo.name || aadharInfo.aadharNo || aadharInfo.dob);
    const hasPan = Boolean(panInfo && (panInfo.name || panInfo.panNo || panInfo.dob));

    if (!hasAadhar && !hasPan) {
      setDocMatchStatus(null);
      return;
    }

    // Only Aadhaar uploaded so far: wait for PAN
    if (hasAadhar && !hasPan) {
      setDocMatchStatus('waiting_pan');
      return;
    }

    // Only PAN uploaded so far: wait for Aadhaar
    if (hasPan && !hasAadhar) {
      setDocMatchStatus('waiting_aadhar');
      return;
    }

    // Both are present: cross-validate Name & DOB!
    const aName = (aadharInfo.name || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    const pName = (panInfo.name || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    const aDob = aadharInfo.dob;
    const pDob = panInfo.dob;

    let isMatch = true;

    // Check DOB
    if (aDob && pDob && aDob !== pDob) {
      isMatch = false;
    }

    // Check Name
    if (aName && pName) {
      const aWords = aName.split(/\s+/).filter(w => w.length > 2);
      const pWords = pName.split(/\s+/).filter(w => w.length > 2);
      const hasCommonWord = aWords.some(w => pName.includes(w)) || pWords.some(w => aName.includes(w));

      if (aName !== pName && !aName.includes(pName) && !pName.includes(aName) && !hasCommonWord) {
        isMatch = false;
      }
    }

    if (isMatch) {
      setDocMatchStatus('match');
      // Only auto-fill when matched!
      applyVerifiedDetails(aadharInfo, panInfo);
    } else {
      setDocMatchStatus('mismatch');
      // Details do not match: do NOT auto-fill and clear any mismatched auto-filled data
      clearAutoFilledDetails();
    }
  };

  // ── Live user list for Reference & Relationship dropdowns ──
  const [allUsers, setAllUsers] = useState([]);
  const [refSearch, setRefSearch] = useState('');
  const [refDropOpen, setRefDropOpen] = useState(false);
  const [relSearch, setRelSearch] = useState('');
  const [relDropOpen, setRelDropOpen] = useState(false);
  const refDropRef = useRef(null);
  const relDropRef = useRef(null);

  useEffect(() => {
    api.get('/users').then(({ data }) => {
      // Keep partners, super_partners, and clients for reference selection
      const usable = data.filter(u =>
        ['partner', 'super_partner', 'client'].includes(u.role)
      );
      setAllUsers(usable);
    }).catch(() => {});

    // Close dropdowns on outside click
    const handleClickOutside = (e) => {
      if (refDropRef.current && !refDropRef.current.contains(e.target)) setRefDropOpen(false);
      if (relDropRef.current && !relDropRef.current.contains(e.target)) setRelDropOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered lists
  const filteredRefUsers = allUsers.filter(u => {
    const q = refSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.client_id_ref?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q)
    );
  });

  const filteredRelPartners = allUsers.filter(u => {
    const q = relSearch.toLowerCase();
    return (
      ['partner', 'super_partner'].includes(u.role) &&
      (
        u.name?.toLowerCase().includes(q) ||
        u.client_id_ref?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
    );
  });

  const getRoleBadge = (role) => {
    if (role === 'partner') return { label: 'Partner', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' };
    if (role === 'super_partner') return { label: 'Super Partner', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' };
    return { label: 'Client', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' };
  };

  const [form, setForm] = useState({
    // Step 1
    firstName: '', middleName: '', lastName: '', username: '', password: '',
    // Step 2
    name: '', dob: '', gender: 'Male', maritalStatus: '', oldName: '', citizenship: 'Indian', fatherName: '',
    // Step 3
    phone: '', phoneCountryCode: '+91', alternatePhone: '', alternatePhoneCountryCode: '+91', email: '', myClaimEmail: '',
    country: 'India', state: '', city: '', pincode: '', permanentAddress: '', temporaryAddress: '',
    stateOld: '', cityOld: '', pincodeOld: '', oldAddress: '',
    // Step 4
    aadharNo: '', panNo: '', otherDocsDesc: '',
    // Step 5
    relation: 'Direct', relationWithHolder: '', relationWithHolderOther: '',
    parent_id: '',          // ← set when partner is selected — controls which partner sees this client
    // Step 6
    reference: 'Indirect', referenceName: '', referenceMobileNo: '', referredById: '',
    // Step 7
    nomineeName: '', nomineeAge: '', nomineeDob: '', nomineeRelation: '', nomineeRelationOther: '',
    // Step 8
    preference: '', status: 'active', notes: '',
    role: 'client',
  });
  const [files, setFiles] = useState({ aadharFront: null, aadharBack: null, pan: null, passport: null, other: null });

  const steps = [
    { id: 1, title: 'Basic Details',     icon: <User size={17} /> },
    { id: 2, title: 'Personal Info',     icon: <Calendar size={17} /> },
    { id: 3, title: 'Contact & Address', icon: <MapPin size={17} /> },
    { id: 4, title: 'Identification',    icon: <FileText size={17} /> },
    { id: 5, title: 'Relationship',      icon: <Users size={17} /> },
    { id: 6, title: 'Reference',         icon: <LinkIcon size={17} /> },
    { id: 7, title: 'Nominee',           icon: <Users size={17} /> },
    { id: 8, title: 'Finalize',          icon: <Shield size={17} /> },
    { id: 9, title: 'Review',            icon: <CheckCircle size={17} /> },
  ];
  const totalSteps = steps.length;

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'aadharNo') {
      const digits = value.replace(/\D/g, '').slice(0, 12);
      value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    if (name === 'panNo') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }

    if (name === 'nomineeDob') {
      const nomineeBirthDate = new Date(`${value}T00:00:00`);
      const today = new Date();
      let nomineeAge = today.getFullYear() - nomineeBirthDate.getFullYear();
      const birthdayThisYear = new Date(today.getFullYear(), nomineeBirthDate.getMonth(), nomineeBirthDate.getDate());

      if (today < birthdayThisYear) nomineeAge -= 1;
      if (!value || Number.isNaN(nomineeBirthDate.getTime()) || nomineeAge < 0) nomineeAge = '';

      setForm(prev => ({ ...prev, nomineeDob: value, nomineeAge: String(nomineeAge) }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [fieldName]: file }));

    if (fieldName === 'aadharFront' || fieldName === 'aadharBack' || fieldName === 'aadhar') {
      setIsScanning(p => ({ ...p, [fieldName]: true }));
      const result = await extractAadharDetails(file);
      if (result) {
        setOcrData(prev => {
          const updated = { ...prev, [fieldName]: result };
          checkAndSyncDocs(updated);
          return updated;
        });
      }
      setIsScanning(p => ({ ...p, [fieldName]: false }));
    } else if (fieldName === 'pan') {
      setIsScanning(p => ({ ...p, pan: true }));
      const result = await extractPanDetails(file);
      if (result) {
        setOcrData(prev => {
          const updated = { ...prev, pan: result };
          checkAndSyncDocs(updated);
          return updated;
        });
      }
      setIsScanning(p => ({ ...p, pan: false }));
    }
  };

  const uploadKycFiles = async (userId) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('formName', 'Client Registration Form');

    if (files.aadharFront) { formData.append('files', files.aadharFront); formData.append('docType', 'aadharCard'); }
    if (files.aadharBack) { formData.append('files', files.aadharBack); formData.append('docType', 'aadharCard'); }
    if (files.pan) { formData.append('files', files.pan); formData.append('docType', 'panCard'); }
    if (files.passport) { formData.append('files', files.passport); formData.append('docType', 'passport'); }
    if (files.other) { formData.append('files', files.other); formData.append('docType', 'otherDocs'); }

    if (files.aadharFront || files.aadharBack || files.pan || files.passport || files.other) {
      await api.post('/users/kyc-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  };

  const nextStep = () => {
    setError('');
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (currentStep === 4) {
      const rawAadhar = (form.aadharNo || '').replace(/\D/g, '');
      if (form.aadharNo && rawAadhar.length !== 12) {
        setError('Aadhaar number must be 12 digits (e.g., 1234 5678 9012).');
        return;
      }
      if (form.panNo && !panRegex.test(form.panNo.toUpperCase())) {
        setError('PAN number is invalid. Format must be 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F).');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    try {
      if (!form.username || !form.password || !form.email || !form.phone) {
        throw new Error('Username, Password, Email and Phone are required.');
      }
      const rawAadhar = (form.aadharNo || '').replace(/\D/g, '');
      if (form.aadharNo && rawAadhar.length !== 12) {
        throw new Error('Aadhaar number must be 12 digits (e.g., 1234 5678 9012).');
      }
      if (form.panNo && !panRegex.test(form.panNo.toUpperCase())) {
        throw new Error('PAN number is invalid. Format must be 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F).');
      }

      const payload = {
        ...form,
        phone: form.phone ? `${form.phoneCountryCode} ${form.phone}` : '',
        alternatePhone: form.alternatePhone ? `${form.alternatePhoneCountryCode} ${form.alternatePhone}` : '',
        relationWithHolder: form.relationWithHolder === 'Other' ? form.relationWithHolderOther : form.relationWithHolder,
        nomineeRelation: form.nomineeRelation === 'Other' ? form.nomineeRelationOther : form.nomineeRelation,
        name: form.name || `${form.firstName} ${form.lastName}`.trim() || form.username,
        email: form.email.toLowerCase(),
        kyc_data: {
          pan: form.panNo,
          aadhaar: form.aadharNo,
        },
        address: {
          country: form.country,
          state: form.state,
          city: form.city,
          pincode: form.pincode,
          permanentAddress: form.permanentAddress,
          temporaryAddress: form.temporaryAddress,
        },
      };

      if (!payload.parent_id || payload.parent_id === '') {
        delete payload.parent_id;
      }

      const { data } = await api.post('/users/enrol', payload);
      
      // Kick off KYC upload asynchronously in background to ensure lightning-fast form submission
      uploadKycFiles(data._id).catch(uploadErr => console.error('Background KYC upload error:', uploadErr));

      setSuccess('Client enrolled successfully!');
      setLoading(false);
      setTimeout(() => navigate(-1), 300);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const reviewRef = useRef(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reviewRef.current) return;
    setDownloadingPdf(true);
    try {
      const element = reviewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0a0f1d',
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Multi-page handling
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const clientName = form.name || [form.firstName, form.lastName].filter(Boolean).join('_') || 'Client';
      pdf.save(`Client_Enrolment_${clientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Could not generate PDF. Please check console and try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderVal = (v) => {
    if (v === null || v === undefined) {
      return <span style={{ color: '#64748b', fontStyle: 'italic', fontWeight: 600 }}>NA</span>;
    }
    const str = String(v).trim();
    if (!str) {
      return <span style={{ color: '#64748b', fontStyle: 'italic', fontWeight: 600 }}>NA</span>;
    }
    return <span style={{ color: '#f8fafc', fontWeight: 600, wordBreak: 'break-word' }}>{str}</span>;
  };

  const stepId = steps[currentStep - 1].id;

  return (
    <div className="page active" style={{ display: 'block', minHeight: '100vh', padding: '32px 16px', background: 'var(--bg)' }}>
      <style>{`
        .cf-wrap { max-width: 1000px; margin: 0 auto; }
        .cf-card { background: var(--card); border-radius: 20px; border: 1px solid var(--border); display: flex; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .cf-sidebar { width: 240px; background: rgba(0,0,0,0.02); border-right: 1px solid var(--border); padding: 28px 18px; display: flex; flex-direction: column; gap: 4px; }
        .cf-step { display: flex; align-items: center; gap: 10px; padding: 11px 13px; border-radius: 11px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .cf-step.active { background: var(--bg); border: 1px solid var(--border); color: var(--blue, #10b981); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .cf-step.done { color: var(--blue, #10b981); }
        .cf-num { width: 20px; height: 20px; border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }
        .cf-step.active .cf-num { background: var(--blue, #10b981); color: #fff; }
        .cf-step.done .cf-num { background: rgba(16, 185, 129, 0.1); color: var(--blue, #10b981); }
        .cf-body { flex: 1; padding: 40px 44px; }
        .cf-section { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 1.5px; text-transform: uppercase; border-bottom: 2px solid var(--border); padding-bottom: 8px; margin: 0 0 20px; }
        .cf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .cf-group { display: flex; flex-direction: column; gap: 7px; }
        .cf-label { font-size: 11px; font-weight: 700; color: var(--text-muted); }
        .cf-label span { color: #f43f5e; }
        .cf-input { padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13.5px; color: var(--text) !important; -webkit-text-fill-color: var(--text) !important; caret-color: var(--blue, #10b981); background: var(--bg); outline: none; transition: 0.2s; width: 100%; box-sizing: border-box; font-family: inherit; color-scheme: dark; }
        .cf-input:focus { border-color: var(--blue, #10b981); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18); background: var(--bg); color: var(--text) !important; -webkit-text-fill-color: var(--text) !important; }
        .cf-input::placeholder { color: #818cf8; opacity: 0.7; }
        
        .cf-input:-webkit-autofill,
        .cf-input:-webkit-autofill:hover, 
        .cf-input:-webkit-autofill:focus,
        .cf-select:-webkit-autofill {
          -webkit-text-fill-color: var(--text) !important;
          -webkit-box-shadow: 0 0 0px 1000px var(--bg) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .cf-select { padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13.5px; color: var(--text) !important; -webkit-text-fill-color: var(--text) !important; background: var(--bg); outline: none; width: 100%; font-family: inherit; cursor: pointer; color-scheme: dark; }
        .cf-select option { background: #0d1526; color: #ffffff; }
        .cf-radio-row { display: flex; gap: 20px; padding: 8px 0; }
        .cf-radio { display: flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 600; color: var(--text); cursor: pointer; }
        .cf-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 36px; padding-top: 28px; border-top: 1.5px solid var(--border); }
        .cf-btn { padding: 11px 24px; border-radius: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; border: none; font-size: 14px; font-family: inherit; }
        .cf-btn-prev { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); }
        .cf-btn-prev:hover { background: var(--border); color: var(--text); }
        .cf-btn-next { background: var(--blue, #10b981); color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); }
        .cf-btn-next:hover { background: #059669; transform: translateY(-1px); }
        .cf-btn-submit { background: var(--blue, #10b981); color: #fff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); }
        .cf-btn-submit:hover { transform: translateY(-1px); }
        .cf-counter { font-size: 13px; font-weight: 700; color: var(--text-muted); }
        .cf-fade { animation: cfFade 0.3s ease; }
        @keyframes cfFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .cf-review-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cf-review-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          padding-bottom: 10px;
          font-size: 11.5px;
          font-weight: 800;
          color: #10b981;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .cf-review-icon {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cf-review-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .cf-review-item {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 9px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          justifyContent: center;
        }
        .cf-review-label {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 4px;
        }
        .cf-review-val {
          font-size: 13px;
          min-height: 18px;
          display: flex;
          align-items: center;
          word-break: break-word;
        }
      `}</style>

      <div className="cf-wrap">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 28px' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--text)' }}>New Client Enrolment</h1>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 14 }}>Complete 8-step comprehensive registration</p>
          </div>
          <button className="cf-btn cf-btn-prev" onClick={() => navigate(-1)} style={{ padding: '9px 20px', borderRadius: '8px' }}>
            <X size={16} /> Cancel
          </button>
        </div>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: 14, borderRadius: 12, marginBottom: 20, border: '1px solid #fee2e2', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}><AlertCircle size={15} /> {error}</div>}
        {success && <div style={{ background: '#f0fdf4', color: '#15803d', padding: 14, borderRadius: 12, marginBottom: 20, border: '1px solid #dcfce7', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}><CheckCircle size={15} /> {success}</div>}

        <div className="cf-card">
          {/* Sidebar */}
          <div className="cf-sidebar">
            <div style={{ fontSize: 9, fontWeight: 900, color: '#94a3b8', letterSpacing: 2, marginBottom: 14 }}>CLIENT ONBOARDING</div>
            {steps.map((s, idx) => (
              <div
                key={s.id}
                className={`cf-step ${currentStep === idx + 1 ? 'active' : ''} ${currentStep > idx + 1 ? 'done' : ''}`}
                onClick={() => setCurrentStep(idx + 1)}
              >
                <div className="cf-num">{currentStep > idx + 1 ? '✓' : idx + 1}</div>
                {s.title}
              </div>
            ))}
          </div>

          {/* Main body */}
          <div className="cf-body">
            <div className="cf-fade" key={stepId}>

              {/* STEP 1 — Basic Details */}
              {stepId === 1 && (
                <>
                  {/* OCR QUICK FILL BANNER */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 100%)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 16, padding: '20px', marginBottom: 32,
                    display: 'flex', flexDirection: 'column', gap: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scan size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Quick Auto-fill with ID Cards</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upload Aadhar or PAN to automatically extract and fill details below using AI OCR.</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <label style={{
                        flex: '1 1 auto', minWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: 12, padding: '14px 20px',
                        cursor: isScanning.aadharFront ? 'wait' : 'pointer', transition: '0.2s', position: 'relative', overflow: 'hidden'
                      }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'aadharFront')} disabled={isScanning.aadharFront} />
                        {isScanning.aadharFront ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 700 }}><div className="loader-spinner" style={{width: 14, height: 14, border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}} /> Scanning Front...</div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', fontSize: 13, fontWeight: 700 }}><Upload size={16} color="#10b981" /> Aadhar Front</div>
                        )}
                        {files.aadharFront && !isScanning.aadharFront && <div style={{ position: 'absolute', top: 4, right: 4, background: '#10b981', borderRadius: '50%', padding: 2 }}><CheckCircle size={10} color="#fff" /></div>}
                      </label>
                      
                      <label style={{
                        flex: '1 1 auto', minWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(16,185,129,0.3)', borderRadius: 12, padding: '14px 20px',
                        cursor: isScanning.aadharBack ? 'wait' : 'pointer', transition: '0.2s', position: 'relative', overflow: 'hidden'
                      }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'aadharBack')} disabled={isScanning.aadharBack} />
                        {isScanning.aadharBack ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 13, fontWeight: 700 }}><div className="loader-spinner" style={{width: 14, height: 14, border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}} /> Scanning Back...</div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', fontSize: 13, fontWeight: 700 }}><Upload size={16} color="#10b981" /> Aadhar Back</div>
                        )}
                        {files.aadharBack && !isScanning.aadharBack && <div style={{ position: 'absolute', top: 4, right: 4, background: '#10b981', borderRadius: '50%', padding: 2 }}><CheckCircle size={10} color="#fff" /></div>}
                      </label>

                      <label style={{
                        flex: '1 1 auto', minWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(6,182,212,0.3)', borderRadius: 12, padding: '14px 20px',
                        cursor: isScanning.pan ? 'wait' : 'pointer', transition: '0.2s', position: 'relative', overflow: 'hidden'
                      }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'pan')} disabled={isScanning.pan} />
                        {isScanning.pan ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#06b6d4', fontSize: 13, fontWeight: 700 }}><div className="loader-spinner" style={{width: 14, height: 14, border: '2px solid #06b6d4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}} /> Scanning PAN...</div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', fontSize: 13, fontWeight: 700 }}><Upload size={16} color="#06b6d4" /> Upload PAN Card</div>
                        )}
                        {files.pan && !isScanning.pan && <div style={{ position: 'absolute', top: 4, right: 4, background: '#06b6d4', borderRadius: '50%', padding: 2 }}><CheckCircle size={10} color="#fff" /></div>}
                      </label>
                    </div>

                    {/* Document Match Validation UI */}
                    {docMatchStatus && (
                      <div style={{
                        marginTop: 4, padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
                        background: docMatchStatus === 'match' 
                          ? 'rgba(16,185,129,0.1)' 
                          : docMatchStatus === 'mismatch' 
                            ? 'rgba(244,63,94,0.1)' 
                            : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${
                          docMatchStatus === 'match' 
                            ? 'rgba(16,185,129,0.3)' 
                            : docMatchStatus === 'mismatch' 
                              ? 'rgba(244,63,94,0.3)' 
                              : 'rgba(245,158,11,0.3)'
                        }`,
                      }}>
                        {docMatchStatus === 'match' ? (
                          <CheckCircle size={18} color="#10b981" />
                        ) : docMatchStatus === 'mismatch' ? (
                          <AlertCircle size={18} color="#f43f5e" />
                        ) : (
                          <Scan size={18} color="#f59e0b" />
                        )}
                        <div style={{
                          fontSize: 13, 
                          fontWeight: 700, 
                          color: docMatchStatus === 'match' 
                            ? '#10b981' 
                            : docMatchStatus === 'mismatch' 
                              ? '#f43f5e' 
                              : '#f59e0b'
                        }}>
                          {docMatchStatus === 'match' && 'Documents Verified: Aadhar and PAN details match! All details have been auto-filled below.'}
                          {docMatchStatus === 'mismatch' && 'Document info not matched: Name or DOB mismatch between Aadhar and PAN. Details will not be auto-filled until documents match.'}
                          {docMatchStatus === 'waiting_pan' && 'Aadhar uploaded. Please upload PAN Card to cross-verify — details will be auto-filled once both documents match.'}
                          {docMatchStatus === 'waiting_aadhar' && 'PAN Card uploaded. Please upload Aadhar Card to cross-verify — details will be auto-filled once both documents match.'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="cf-section">STEP 1: LOGIN CREDENTIALS</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">First Name <span>*</span></label><input name="firstName" className="cf-input" placeholder="John" value={form.firstName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Middle Name</label><input name="middleName" className="cf-input" placeholder="M." value={form.middleName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Last Name <span>*</span></label><input name="lastName" className="cf-input" placeholder="Doe" value={form.lastName} onChange={handleChange} /></div>
                    <div className="cf-group">
                      <label className="cf-label">Username <span>*</span></label>
                      <input
                        name="username"
                        className="cf-input"
                        placeholder="Phone (9876543210) or Email (john@email.com)"
                        value={form.username}
                        onChange={handleChange}
                      />
                      {form.username && (() => {
                        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username);
                        const isPhone = /^[0-9]{10}$/.test(form.username.replace(/\s/g, ''));
                        if (!isEmail && !isPhone) {
                          return <span style={{ fontSize: 11, color: '#f43f5e', marginTop: 4, display: 'block' }}>Enter a valid 10-digit phone number or email address.</span>;
                        }
                        return <span style={{ fontSize: 11, color: '#10b981', marginTop: 4, display: 'block' }}>✓ Valid {isEmail ? 'email' : 'phone number'} username</span>;
                      })()}
                      <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>Accepted formats: Phone number or Email address</span>
                    </div>
                    <div className="cf-group">
                      <label className="cf-label">Password <span>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input name="password" type={showPassword ? 'text' : 'password'} className="cf-input" placeholder="••••••••" value={form.password} onChange={handleChange} />
                        <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2 — Personal Info */}
              {stepId === 2 && (
                <>
                  <div className="cf-section">STEP 2: PERSONAL INFORMATION (as per PAN)</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">Full Display Name</label><input name="name" className="cf-input" placeholder="John M. Doe" value={form.name} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Date of Birth</label><input name="dob" type="date" className="cf-input" value={form.dob} onChange={handleChange} /></div>
                    <div className="cf-group">
                      <label className="cf-label">Gender</label>
                      <div className="cf-radio-row">
                        {['Male', 'Female', 'Others'].map(g => (
                          <label key={g} className="cf-radio"><input type="radio" name="gender" value={g} checked={form.gender === g} onChange={handleChange} /> {g}</label>
                        ))}
                      </div>
                    </div>
                    <div className="cf-group"><label className="cf-label">Marital Status <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><select name="maritalStatus" className="cf-select" value={form.maritalStatus} onChange={handleChange}><option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option></select></div>
                    <div className="cf-group"><label className="cf-label">Citizenship <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><select name="citizenship" className="cf-select" value={form.citizenship} onChange={handleChange}><option value="Indian">Indian</option><option value="NRI">NRI</option><option value="OCI">OCI</option></select></div>
                    <div className="cf-group"><label className="cf-label">Father's Name</label><input name="fatherName" className="cf-input" placeholder="Auto-filled from PAN" value={form.fatherName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Old Name (if any) <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><input name="oldName" className="cf-input" placeholder="Previous name" value={form.oldName} onChange={handleChange} /></div>
                  </div>
                </>
              )}

              {/* STEP 3 — Contact & Address */}
              {stepId === 3 && (
                <>
                  <div className="cf-section">STEP 3: CONTACT &amp; ADDRESS (as per Aadhar)</div>
                  <div className="cf-grid">
                    <div className="cf-group">
                      <label className="cf-label">Phone <span>*</span> <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select name="phoneCountryCode" className="cf-select" style={{ width: '90px', padding: '11px 8px', flexShrink: 0 }} value={form.phoneCountryCode} onChange={handleChange}>
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>{c.label}</option>
                          ))}
                        </select>
                        <input name="phone" className="cf-input" placeholder="98765 43210" value={form.phone} onChange={handleChange} style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div className="cf-group"><label className="cf-label">Email <span>*</span> <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><input name="email" type="email" className="cf-input" placeholder="john@email.com" value={form.email} onChange={handleChange} /></div>
                    <div className="cf-group">
                      <label className="cf-label">Alternate Phone <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select name="alternatePhoneCountryCode" className="cf-select" style={{ width: '90px', padding: '11px 8px', flexShrink: 0 }} value={form.alternatePhoneCountryCode} onChange={handleChange}>
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>{c.label}</option>
                          ))}
                        </select>
                        <input name="alternatePhone" className="cf-input" placeholder="98765 43210" value={form.alternatePhone} onChange={handleChange} style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div className="cf-group"><label className="cf-label">MyClaim Email <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><input name="myClaimEmail" type="email" className="cf-input" value={form.myClaimEmail} onChange={handleChange} /></div>
                    <div className="cf-group" style={{ gridColumn: 'span 2' }}><label className="cf-label">Permanent Address</label><textarea name="permanentAddress" className="cf-input" style={{ minHeight: 68 }} value={form.permanentAddress} onChange={handleChange}></textarea></div>
                    <div className="cf-group"><label className="cf-label">City</label><input name="city" className="cf-input" value={form.city} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">State</label><input name="state" className="cf-input" value={form.state} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Pincode</label><input name="pincode" className="cf-input" value={form.pincode} onChange={handleChange} /></div>
                    <div className="cf-group" style={{ gridColumn: 'span 2' }}><label className="cf-label">Old Address <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><textarea name="oldAddress" className="cf-input" style={{ minHeight: 68 }} value={form.oldAddress} onChange={handleChange}></textarea></div>
                    <div className="cf-group"><label className="cf-label">Old City <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><input name="cityOld" className="cf-input" value={form.cityOld} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Old State <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><input name="stateOld" className="cf-input" value={form.stateOld} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Old Pincode <span style={{fontSize:10,color:'#f59e0b',fontWeight:600,marginLeft:4}}>(Enter manually)</span></label><input name="pincodeOld" className="cf-input" value={form.pincodeOld} onChange={handleChange} /></div>
                  </div>
                </>
              )}

              {/* STEP 4 — Identification */}
              {stepId === 4 && (
                <>
                  <div className="cf-section">STEP 4: IDENTIFICATION DOCUMENTS</div>
                  <div className="cf-grid">
                    <div className="cf-group">
                      <label className="cf-label">Aadhar Number</label>
                      <input name="aadharNo" className="cf-input" placeholder="1234 5678 9012" value={form.aadharNo} onChange={handleChange} maxLength={14} />
                      {form.aadharNo && form.aadharNo.replace(/\D/g, '').length < 12 && (
                        <span style={{ fontSize: 11, color: '#f43f5e', marginTop: -4 }}>Aadhaar number must be 12 digits.</span>
                      )}
                    </div>
                    <div className="cf-group">
                      <label className="cf-label">PAN Number</label>
                      <input name="panNo" className="cf-input" placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} value={form.panNo} onChange={handleChange} maxLength={10} />
                      {form.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNo.toUpperCase()) && (
                        <span style={{ fontSize: 11, color: '#f43f5e', marginTop: -4 }}>Invalid PAN format (e.g., ABCDE1234F).</span>
                      )}
                    </div>
                    {[
                      { label: 'Passport', field: 'passport', docType: 'passport' }
                    ].map((doc) => (
                      <div className="cf-group" key={doc.field}>
                        <label className="cf-label">{doc.label}</label>
                        <div style={{ border: '1.5px dashed var(--border)', borderRadius: 11, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg)' }} onClick={() => document.getElementById(`cf-${doc.field}`).click()}>
                          <Upload size={16} color="var(--text-muted)" />
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Upload {doc.label}</div>
                          <input id={`cf-${doc.field}`} type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, doc.field)} />
                          {isScanning[doc.field] ? (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#10b981', fontWeight: 700 }}>Scanning for details...</div>
                          ) : (
                            files[doc.field] && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text)' }}>{files[doc.field].name}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="cf-group"><label className="cf-label">Other Documents</label><input name="otherDocsDesc" className="cf-input" placeholder="Driving License, Voter ID..." value={form.otherDocsDesc} onChange={handleChange} /></div>
                    <div className="cf-group">
                      <label className="cf-label">Upload Other Document</label>
                      <div style={{ border: '1.5px dashed var(--border)', borderRadius: 11, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg)' }} onClick={() => document.getElementById('cf-other').click()}>
                        <Upload size={16} color="var(--text-muted)" />
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Upload Other Document</div>
                        <input id="cf-other" type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'other')} />
                        {files.other && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text)' }}>{files.other.name}</div>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 5 — Relationship */}
              {stepId === 5 && (
                <>
                  <div className="cf-section">STEP 5: RELATIONSHIP</div>
                  <div className="cf-grid">
                    <div className="cf-group">
                      <label className="cf-label">Relationship Type</label>
                      <select name="relation" className="cf-select" value={form.relation} onChange={handleChange}>
                        <option value="Direct">Direct</option>
                        <option value="Indirect">Indirect</option>
                      </select>
                    </div>
                    <div className="cf-group">
                      <label className="cf-label">Relation with Holder</label>
                      <select name="relationWithHolder" className="cf-select" value={form.relationWithHolder} onChange={handleChange}>
                        <option value="">Select Relation</option>
                        <option value="Self">Self</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {form.relationWithHolder === 'Other' && (
                      <div className="cf-group">
                        <label className="cf-label">Specify Other Relation</label>
                        <input name="relationWithHolderOther" className="cf-input" placeholder="e.g. Grandson" value={form.relationWithHolderOther} onChange={handleChange} />
                      </div>
                    )}

                    {/* ── Partner / Referred-By Dropdown ── */}
                    <div className="cf-group" style={{ gridColumn: 'span 2' }} ref={relDropRef}>
                      <label className="cf-label">Assigned Partner <span style={{ color: '#94a3b8', fontWeight: 400 }}>(who brought this client?)</span></label>
                      <div style={{ position: 'relative' }}>
                        {/* Trigger */}
                        <div
                          onClick={() => setRelDropOpen(o => !o)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 11,
                            background: 'var(--bg)', cursor: 'pointer', userSelect: 'none',
                            borderColor: relDropOpen ? '#10b981' : 'var(--border)',
                            boxShadow: relDropOpen ? '0 0 0 3px rgba(16,185,129,0.07)' : 'none',
                            transition: '0.2s'
                          }}
                        >
                          {form.referredById ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                                {(form.referenceName || form.referredById).substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{form.referenceName}</div>
                                <div style={{ fontSize: 11, color: '#10b981' }}>{form.referredById}</div>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Search by name, ID or email…</span>
                          )}
                          <ChevronDown size={15} color="var(--text-muted)" style={{ transform: relDropOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </div>

                        {/* Dropdown panel */}
                        {relDropOpen && (
                          <div style={{
                            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 9999,
                            background: '#0f172a', border: '1.5px solid #10b981', borderRadius: 14,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden'
                          }}>
                            {/* Search box */}
                            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a' }}>
                              <Search size={14} color="#10b981" />
                              <input
                                autoFocus
                                placeholder="Search partners…"
                                value={relSearch}
                                onChange={e => setRelSearch(e.target.value)}
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)' }}
                              />
                            </div>
                            {/* List */}
                            <div style={{ maxHeight: 240, overflowY: 'auto', background: '#0f172a' }}>
                              {filteredRelPartners.length === 0 ? (
                                <div style={{ padding: '18px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No partners found</div>
                              ) : filteredRelPartners.map(u => {
                                const badge = getRoleBadge(u.role);
                                const uid = u.client_id_ref || `CLT-${parseInt(String(u._id).substring(0,8), 16)}`;
                                return (
                                  <div
                                    key={u._id}
                                    onClick={() => {
                                      setForm(prev => ({
                                        ...prev,
                                        referredById: uid,
                                        referenceName: u.name,
                                        parent_id: u._id,   // ← THIS is what makes the client appear in the partner's dashboard
                                      }));
                                      setRelDropOpen(false);
                                      setRelSearch('');
                                    }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                      cursor: 'pointer', transition: '0.15s',
                                      background: form.referredById === uid ? 'rgba(16,185,129,0.15)' : '#0f172a'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = form.referredById === uid ? 'rgba(16,185,129,0.08)' : 'transparent'}
                                  >
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                                      {u.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{u.name}</div>
                                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: badge.bg, color: badge.color }}>{badge.label}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{uid}</span>
                                      </div>
                                    </div>
                                    {form.referredById === uid && <CheckCircle size={14} color="#10b981" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* ── Sync confirmation banner ── */}
                    {form.parent_id && (
                      <div style={{
                        gridColumn: 'span 2',
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 12,
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                        marginTop: 4
                      }}>
                        <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                            ✅ Client will appear under <span style={{ color: '#fff' }}>{form.referenceName}</span>'s Partner Dashboard
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            Partner ID: {form.referredById} · parent_id synced
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* STEP 6 — Reference */}
              {stepId === 6 && (
                <>
                  <div className="cf-section">STEP 6: REFERENCE DETAILS</div>
                  <div className="cf-grid">
                    {/* Reference Type */}
                    <div className="cf-group">
                      <label className="cf-label">Reference Type</label>
                      <select name="reference" className="cf-select" value={form.reference} onChange={handleChange}>
                        <option value="Indirect">Indirect</option>
                        <option value="Direct">Direct</option>
                        <option value="Partner">Partner</option>
                        <option value="Self">Self</option>
                      </select>
                    </div>

                    {/* Reference Mobile (manual) */}
                    <div className="cf-group">
                      <label className="cf-label">Reference Mobile</label>
                      <input name="referenceMobileNo" className="cf-input" placeholder="+91 98765 43210" value={form.referenceMobileNo} onChange={handleChange} />
                    </div>

                    {/* ── Reference Person Searchable Dropdown (full width) ── */}
                    <div className="cf-group" style={{ gridColumn: 'span 2' }} ref={refDropRef}>
                      <label className="cf-label">Reference Person <span style={{ color: '#94a3b8', fontWeight: 400 }}>(select from all registered users)</span></label>
                      <div style={{ position: 'relative' }}>
                        {/* Trigger */}
                        <div
                          onClick={() => setRefDropOpen(o => !o)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 11,
                            background: 'var(--bg)', cursor: 'pointer', userSelect: 'none',
                            borderColor: refDropOpen ? '#10b981' : 'var(--border)',
                            boxShadow: refDropOpen ? '0 0 0 3px rgba(16,185,129,0.07)' : 'none',
                            transition: '0.2s'
                          }}
                        >
                          {form.referenceName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                                {form.referenceName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{form.referenceName}</div>
                                {form.referenceMobileNo && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.referenceMobileNo}</div>}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Search by name, ID, email or phone…</span>
                          )}
                          <ChevronDown size={15} color="var(--text-muted)" style={{ transform: refDropOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </div>

                        {/* Dropdown panel */}
                        {refDropOpen && (
                          <div style={{
                            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 9999,
                            background: '#0f172a', border: '1.5px solid #10b981', borderRadius: 14,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.7)', overflow: 'hidden'
                          }}>
                            {/* Search */}
                            <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a' }}>
                              <Search size={14} color="#10b981" />
                              <input
                                autoFocus
                                placeholder="Search all users…"
                                value={refSearch}
                                onChange={e => setRefSearch(e.target.value)}
                                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)' }}
                              />
                            </div>
                            {/* Count */}
                            <div style={{ padding: '6px 14px', fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 1, background: '#0a1628', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                              {filteredRefUsers.length} USER{filteredRefUsers.length !== 1 ? 'S' : ''} FOUND
                            </div>
                            {/* List */}
                            <div style={{ maxHeight: 260, overflowY: 'auto', background: '#0f172a' }}>
                              {filteredRefUsers.length === 0 ? (
                                <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No users found</div>
                              ) : filteredRefUsers.map(u => {
                                const badge = getRoleBadge(u.role);
                                const uid = u.client_id_ref || `CLT-${parseInt(String(u._id).substring(0,8), 16)}`;
                                const isSelected = form.referenceName === u.name && form.referenceMobileNo === (u.phone || '');
                                return (
                                  <div
                                    key={u._id}
                                    onClick={() => {
                                      setForm(prev => ({
                                        ...prev,
                                        referenceName: u.name,
                                        referenceMobileNo: u.phone || '',
                                        referredById: uid,
                                        // If the reference person is a partner, also assign them as parent
                                        ...((['partner','super_partner'].includes(u.role)) ? { parent_id: u._id } : {}),
                                      }));
                                      setRefDropOpen(false);
                                      setRefSearch('');
                                    }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                                      cursor: 'pointer', transition: '0.15s',
                                      background: isSelected ? 'rgba(16,185,129,0.15)' : '#0f172a',
                                      borderBottom: '1px solid rgba(255,255,255,0.06)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.background = isSelected ? 'rgba(16,185,129,0.15)' : '#0f172a'}
                                  >
                                    {/* Avatar */}
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: badge.bg, color: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                                      {u.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{u.name}</div>
                                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: badge.bg, color: badge.color }}>{badge.label}</span>
                                        <span style={{ fontSize: 11, color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>#{uid}</span>
                                        {u.phone && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📞 {u.phone}</span>}
                                      </div>
                                    </div>
                                    {/* Email */}
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                    {isSelected && <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Manual override hint */}
                      <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Or type manually:</span>
                        <input
                          name="referenceName"
                          className="cf-input"
                          placeholder="Reference person name"
                          value={form.referenceName}
                          onChange={handleChange}
                          style={{ flex: 1, fontSize: 12, padding: '8px 12px' }}
                        />
                      </div>
                    </div>

                    {/* Auto-filled Referral ID */}
                    <div className="cf-group" style={{ gridColumn: 'span 2' }}>
                      <label className="cf-label">Internal Referral ID <span style={{ color: '#94a3b8', fontWeight: 400 }}>(auto-filled from selection above)</span></label>
                      <input
                        name="referredById"
                        className="cf-input"
                        placeholder="e.g. MC1234 — auto-filled when you pick a reference person"
                        value={form.referredById}
                        onChange={handleChange}
                        style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 7 — Nominee */}
              {stepId === 7 && (
                <>
                  <div className="cf-section">STEP 7: NOMINEE DETAILS</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">Nominee Name</label><input name="nomineeName" className="cf-input" value={form.nomineeName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Nominee Age</label><input name="nomineeAge" type="number" className="cf-input" value={form.nomineeAge} readOnly placeholder="Auto-calculated" /></div>
                    <div className="cf-group">
                      <label className="cf-label">Nominee Relation</label>
                      <select name="nomineeRelation" className="cf-select" value={form.nomineeRelation} onChange={handleChange}>
                        <option value="">Select Relation</option>
                        <option value="Self">Self</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {form.nomineeRelation === 'Other' && (
                      <div className="cf-group">
                        <label className="cf-label">Specify Other Nominee Relation</label>
                        <input name="nomineeRelationOther" className="cf-input" placeholder="e.g. Grandson" value={form.nomineeRelationOther} onChange={handleChange} />
                      </div>
                    )}
                    <div className="cf-group"><label className="cf-label">Nominee Date of Birth</label><input name="nomineeDob" type="date" className="cf-input" value={form.nomineeDob} onChange={handleChange} /></div>
                  </div>
                </>
              )}

              {/* STEP 8 — Finalize */}
              {stepId === 8 && (
                <>
                  <div className="cf-section">STEP 8: FINALIZE</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">Communication Preference</label><select name="preference" className="cf-select" value={form.preference} onChange={handleChange}><option value="">Select</option><option value="Email">Email</option><option value="SMS">SMS</option><option value="Call">Phone Call</option></select></div>
                    <div className="cf-group"><label className="cf-label">Status</label><select name="status" className="cf-select" value={form.status} onChange={handleChange}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                    <div className="cf-group" style={{ gridColumn: 'span 2' }}><label className="cf-label">Staff Notes</label><textarea name="notes" className="cf-input" style={{ minHeight: 80 }} placeholder="Internal notes…" value={form.notes} onChange={handleChange}></textarea></div>
                  </div>
                </>
              )}

              {/* STEP 9 — Review */}
              {stepId === 9 && (
                <>
                  {/* Top Bar with Section Title and Download Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <div className="cf-section" style={{ margin: 0, border: 'none', padding: 0 }}>STEP 9: FULL FORM REVIEW</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                        Please review all details from all 8 pages before completing enrolment. Unfilled fields are marked as <strong style={{ color: '#94a3b8' }}>NA</strong>.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={downloadingPdf}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '11px 20px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 13.5,
                        cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                        transition: 'all 0.2s ease',
                        opacity: downloadingPdf ? 0.75 : 1
                      }}
                    >
                      <Download size={17} />
                      {downloadingPdf ? 'Generating PDF…' : 'Download Form (PDF)'}
                    </button>
                  </div>

                  {/* Printable/Exportable Review Container */}
                  <div ref={reviewRef} style={{ display: 'flex', flexDirection: 'column', gap: 18, background: '#0a0f1d', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 22 }}>
                    
                    {/* Official Document Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 12,
                      flexWrap: 'wrap',
                      gap: 12
                    }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff', letterSpacing: 0.5 }}>
                          CLIENT ONBOARDING ENROLMENT FORM
                        </div>
                        <div style={{ fontSize: 11, color: '#10b981', marginTop: 3, fontWeight: 700, letterSpacing: 0.5 }}>
                          MYCLAIM PORTAL · VERIFIED ENROLMENT DOSSIER
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                          {form.name || [form.firstName, form.lastName].filter(Boolean).join(' ') || 'Client Enrolment'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          Date: {new Date().toLocaleDateString('en-GB')} · Status: <span style={{ color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>{form.status || 'Active'}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 1: Basic Details & Login Credentials ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><User size={15} /></div>
                        <span>STEP 1: LOGIN CREDENTIALS &amp; BASIC DETAILS</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">First Name</div>
                          <div className="cf-review-val">{renderVal(form.firstName)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Middle Name</div>
                          <div className="cf-review-val">{renderVal(form.middleName)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Last Name</div>
                          <div className="cf-review-val">{renderVal(form.lastName)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Username / Login ID</div>
                          <div className="cf-review-val">{renderVal(form.username)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Password</div>
                          <div className="cf-review-val">{renderVal(form.password ? '••••••••' : '')}</div>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 2: Personal Information (as per PAN) ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><Calendar size={15} /></div>
                        <span>STEP 2: PERSONAL INFORMATION (AS PER PAN)</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">Full Display Name</div>
                          <div className="cf-review-val">{renderVal(form.name)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Father's Name</div>
                          <div className="cf-review-val">{renderVal(form.fatherName)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Date of Birth</div>
                          <div className="cf-review-val">{renderVal(form.dob)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Gender</div>
                          <div className="cf-review-val">{renderVal(form.gender)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Marital Status</div>
                          <div className="cf-review-val">{renderVal(form.maritalStatus)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Citizenship</div>
                          <div className="cf-review-val">{renderVal(form.citizenship)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Old Name (if any)</div>
                          <div className="cf-review-val">{renderVal(form.oldName)}</div>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 3: Contact & Address (as per Aadhar) ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><MapPin size={15} /></div>
                        <span>STEP 3: CONTACT &amp; ADDRESS (AS PER AADHAR)</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">Primary Mobile</div>
                          <div className="cf-review-val">{renderVal(form.phone ? `${form.phoneCountryCode || '+91'} ${form.phone}` : '')}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Alternate Mobile</div>
                          <div className="cf-review-val">{renderVal(form.alternatePhone ? `${form.alternatePhoneCountryCode || '+91'} ${form.alternatePhone}` : '')}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Primary Email</div>
                          <div className="cf-review-val">{renderVal(form.email)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">MyClaim Email</div>
                          <div className="cf-review-val">{renderVal(form.myClaimEmail)}</div>
                        </div>
                        <div className="cf-review-item" style={{ gridColumn: 'span 2' }}>
                          <div className="cf-review-label">Permanent Address</div>
                          <div className="cf-review-val">{renderVal(form.permanentAddress)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">City</div>
                          <div className="cf-review-val">{renderVal(form.city)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">State</div>
                          <div className="cf-review-val">{renderVal(form.state)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Pincode</div>
                          <div className="cf-review-val">{renderVal(form.pincode)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Country</div>
                          <div className="cf-review-val">{renderVal(form.country)}</div>
                        </div>
                        <div className="cf-review-item" style={{ gridColumn: 'span 2' }}>
                          <div className="cf-review-label">Old Address (if any)</div>
                          <div className="cf-review-val">{renderVal(form.oldAddress)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Old City</div>
                          <div className="cf-review-val">{renderVal(form.cityOld)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Old State</div>
                          <div className="cf-review-val">{renderVal(form.stateOld)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Old Pincode</div>
                          <div className="cf-review-val">{renderVal(form.pincodeOld)}</div>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 4: Identification & Documents ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><FileText size={15} /></div>
                        <span>STEP 4: IDENTIFICATION DOCUMENTS</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">Aadhar Number</div>
                          <div className="cf-review-val">{renderVal(form.aadharNo)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">PAN Number</div>
                          <div className="cf-review-val">{renderVal(form.panNo)}</div>
                        </div>
                        <div className="cf-review-item" style={{ gridColumn: 'span 2' }}>
                          <div className="cf-review-label">Other Documents Description</div>
                          <div className="cf-review-val">{renderVal(form.otherDocsDesc)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Aadhar Card (Front)</div>
                          <div className="cf-review-val">{files.aadharFront?.name ? <span style={{ color: '#10b981', fontWeight: 700 }}>📎 {files.aadharFront.name}</span> : renderVal('')}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Aadhar Card (Back)</div>
                          <div className="cf-review-val">{files.aadharBack?.name ? <span style={{ color: '#10b981', fontWeight: 700 }}>📎 {files.aadharBack.name}</span> : renderVal('')}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">PAN Card File</div>
                          <div className="cf-review-val">{files.pan?.name ? <span style={{ color: '#10b981', fontWeight: 700 }}>📎 {files.pan.name}</span> : renderVal('')}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Passport File</div>
                          <div className="cf-review-val">{files.passport?.name ? <span style={{ color: '#10b981', fontWeight: 700 }}>📎 {files.passport.name}</span> : renderVal('')}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Other File</div>
                          <div className="cf-review-val">{files.other?.name ? <span style={{ color: '#10b981', fontWeight: 700 }}>📎 {files.other.name}</span> : renderVal('')}</div>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 5: Relationship Details ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><Users size={15} /></div>
                        <span>STEP 5: RELATIONSHIP DETAILS</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">Relation Type</div>
                          <div className="cf-review-val">{renderVal(form.relation)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Relation with Holder</div>
                          <div className="cf-review-val">{renderVal(form.relationWithHolder)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Specified Other Relation</div>
                          <div className="cf-review-val">{renderVal(form.relationWithHolderOther)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Assigned Partner Name</div>
                          <div className="cf-review-val">{renderVal(form.referenceName)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Assigned Partner Referral ID</div>
                          <div className="cf-review-val">{renderVal(form.referredById)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Assigned Partner Database ID (parent_id)</div>
                          <div className="cf-review-val">{renderVal(form.parent_id)}</div>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 6: Reference Details ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><LinkIcon size={15} /></div>
                        <span>STEP 6: REFERENCE DETAILS</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">Reference Type</div>
                          <div className="cf-review-val">{renderVal(form.reference)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Reference Person Name</div>
                          <div className="cf-review-val">{renderVal(form.referenceName)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Reference Mobile</div>
                          <div className="cf-review-val">{renderVal(form.referenceMobileNo)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Internal Referral ID</div>
                          <div className="cf-review-val">{renderVal(form.referredById)}</div>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 7: Nominee Details ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><Shield size={15} /></div>
                        <span>STEP 7: NOMINEE DETAILS</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">Nominee Name</div>
                          <div className="cf-review-val">{renderVal(form.nomineeName)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Nominee Age</div>
                          <div className="cf-review-val">{renderVal(form.nomineeAge)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Nominee Relation</div>
                          <div className="cf-review-val">{renderVal(form.nomineeRelation)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Specified Other Nominee Relation</div>
                          <div className="cf-review-val">{renderVal(form.nomineeRelationOther)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Nominee Date of Birth</div>
                          <div className="cf-review-val">{renderVal(form.nomineeDob)}</div>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 8: Finalize & Preferences ── */}
                    <div className="cf-review-card">
                      <div className="cf-review-header">
                        <div className="cf-review-icon"><CheckCircle size={15} /></div>
                        <span>STEP 8: FINALIZE &amp; PREFERENCES</span>
                      </div>
                      <div className="cf-review-grid">
                        <div className="cf-review-item">
                          <div className="cf-review-label">Communication Preference</div>
                          <div className="cf-review-val">{renderVal(form.preference)}</div>
                        </div>
                        <div className="cf-review-item">
                          <div className="cf-review-label">Account Status</div>
                          <div className="cf-review-val">{renderVal(form.status)}</div>
                        </div>
                        <div className="cf-review-item" style={{ gridColumn: 'span 2' }}>
                          <div className="cf-review-label">Staff / Internal Notes</div>
                          <div className="cf-review-val">{renderVal(form.notes)}</div>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              )}

            </div>

            {/* Footer */}
            <div className="cf-footer">
              <button className="cf-btn cf-btn-prev" onClick={prevStep} disabled={currentStep === 1}><ChevronLeft size={16} /> Previous</button>
              <span className="cf-counter">STEP {currentStep} OF {totalSteps}</span>
              {currentStep < totalSteps
                ? <button className="cf-btn cf-btn-next" onClick={nextStep}>Next <ChevronRight size={16} /></button>
                : <button className="cf-btn cf-btn-submit" onClick={handleSubmit} disabled={loading}>{loading ? 'Enrolling…' : '✓ Complete Enrolment'}</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;
