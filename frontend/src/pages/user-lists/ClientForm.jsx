import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, AlertCircle, CheckCircle,
  ChevronRight, ChevronLeft, X,
  User, Shield, Users, Calendar, MapPin, FileText, Upload, Link as LinkIcon,
  Search, ChevronDown
} from 'lucide-react';
import api from '../../services/api';

const ClientForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

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
    name: '', dob: '', gender: 'Male', maritalStatus: '', oldName: '', citizenship: 'Indian',
    // Step 3
    phone: '', alternatePhone: '', email: '', myClaimEmail: '',
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
  const [files, setFiles] = useState({ aadhar: null, pan: null, passport: null, other: null });

  const steps = [
    { id: 1, title: 'Basic Details',     icon: <User size={17} /> },
    { id: 2, title: 'Personal Info',     icon: <Calendar size={17} /> },
    { id: 3, title: 'Contact & Address', icon: <MapPin size={17} /> },
    { id: 4, title: 'Identification',    icon: <FileText size={17} /> },
    { id: 5, title: 'Relationship',      icon: <Users size={17} /> },
    { id: 6, title: 'Reference',         icon: <LinkIcon size={17} /> },
    { id: 7, title: 'Nominee',           icon: <Users size={17} /> },
    { id: 8, title: 'Finalize',          icon: <Shield size={17} /> },
  ];
  const totalSteps = steps.length;

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'aadharNo') {
      let val = value.replace(/\D/g, '');
      if (val.length > 12) val = val.slice(0, 12);
      val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
      value = val;
    }

    if (name === 'panNo') {
      let val = value.toUpperCase();
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i < 4) {
          if (/[A-Z]/.test(val[i])) formatted += val[i];
        } else if (i < 8) {
          if (/[0-9]/.test(val[i])) formatted += val[i];
        } else if (i < 9) {
          if (/[A-Z]/.test(val[i])) formatted += val[i];
        }
      }
      value = formatted;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const uploadKycFiles = async (userId) => {
    const formData = new FormData();
    formData.append('userId', userId);

    if (files.aadhar) { formData.append('files', files.aadhar); formData.append('docType', 'aadharCard'); }
    if (files.pan) { formData.append('files', files.pan); formData.append('docType', 'panCard'); }
    if (files.passport) { formData.append('files', files.passport); formData.append('docType', 'passport'); }
    if (files.other) { formData.append('files', files.other); formData.append('docType', 'otherDocs'); }

    if (files.aadhar || files.pan || files.passport || files.other) {
      await api.post('/users/kyc-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (!form.username || !form.password || !form.email || !form.phone) {
        throw new Error('Username, Password, Email and Phone are required.');
      }

      const payload = {
        ...form,
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

      const { data } = await api.post('/users/enrol', payload);
      await uploadKycFiles(data._id);

      setSuccess('Client enrolled successfully!');
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
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
                onClick={() => currentStep > idx + 1 && setCurrentStep(idx + 1)}
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
                  <div className="cf-section">STEP 1: LOGIN CREDENTIALS</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">First Name <span>*</span></label><input name="firstName" className="cf-input" placeholder="John" value={form.firstName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Middle Name</label><input name="middleName" className="cf-input" placeholder="M." value={form.middleName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Last Name <span>*</span></label><input name="lastName" className="cf-input" placeholder="Doe" value={form.lastName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Username <span>*</span></label><input name="username" className="cf-input" placeholder="johndoe123" value={form.username} onChange={handleChange} /></div>
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
                  <div className="cf-section">STEP 2: PERSONAL INFORMATION</div>
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
                    <div className="cf-group"><label className="cf-label">Marital Status</label><select name="maritalStatus" className="cf-select" value={form.maritalStatus} onChange={handleChange}><option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option></select></div>
                    <div className="cf-group"><label className="cf-label">Citizenship</label><select name="citizenship" className="cf-select" value={form.citizenship} onChange={handleChange}><option value="Indian">Indian</option><option value="NRI">NRI</option><option value="OCI">OCI</option></select></div>
                    <div className="cf-group"><label className="cf-label">Old Name (if any)</label><input name="oldName" className="cf-input" placeholder="Previous name" value={form.oldName} onChange={handleChange} /></div>
                  </div>
                </>
              )}

              {/* STEP 3 — Contact & Address */}
              {stepId === 3 && (
                <>
                  <div className="cf-section">STEP 3: CONTACT & ADDRESS</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">Phone <span>*</span></label><input name="phone" className="cf-input" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Email <span>*</span></label><input name="email" type="email" className="cf-input" placeholder="john@email.com" value={form.email} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Alternate Phone</label><input name="alternatePhone" className="cf-input" value={form.alternatePhone} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">MyClaim Email</label><input name="myClaimEmail" type="email" className="cf-input" value={form.myClaimEmail} onChange={handleChange} /></div>
                    <div className="cf-group" style={{ gridColumn: 'span 2' }}><label className="cf-label">Permanent Address</label><textarea name="permanentAddress" className="cf-input" style={{ minHeight: 68 }} value={form.permanentAddress} onChange={handleChange}></textarea></div>
                    <div className="cf-group"><label className="cf-label">City</label><input name="city" className="cf-input" value={form.city} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">State</label><input name="state" className="cf-input" value={form.state} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Pincode</label><input name="pincode" className="cf-input" value={form.pincode} onChange={handleChange} /></div>
                    <div className="cf-group" style={{ gridColumn: 'span 2' }}><label className="cf-label">Old Address</label><textarea name="oldAddress" className="cf-input" style={{ minHeight: 68 }} value={form.oldAddress} onChange={handleChange}></textarea></div>
                    <div className="cf-group"><label className="cf-label">Old City</label><input name="cityOld" className="cf-input" value={form.cityOld} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Old State</label><input name="stateOld" className="cf-input" value={form.stateOld} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Old Pincode</label><input name="pincodeOld" className="cf-input" value={form.pincodeOld} onChange={handleChange} /></div>
                  </div>
                </>
              )}

              {/* STEP 4 — Identification */}
              {stepId === 4 && (
                <>
                  <div className="cf-section">STEP 4: IDENTIFICATION DOCUMENTS</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">Aadhar Number</label><input name="aadharNo" className="cf-input" placeholder="1234 5678 9012" value={form.aadharNo} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">PAN Number</label><input name="panNo" className="cf-input" placeholder="ABCD1234E" style={{ textTransform: 'uppercase' }} value={form.panNo} onChange={handleChange} /></div>
                    {[
                      { label: 'Aadhar Card', field: 'aadhar', docType: 'aadharCard' },
                      { label: 'PAN Card', field: 'pan', docType: 'panCard' },
                      { label: 'Passport', field: 'passport', docType: 'passport' }
                    ].map((doc) => (
                      <div className="cf-group" key={doc.field}>
                        <label className="cf-label">{doc.label}</label>
                        <div style={{ border: '1.5px dashed var(--border)', borderRadius: 11, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg)' }} onClick={() => document.getElementById(`cf-${doc.field}`).click()}>
                          <Upload size={16} color="var(--text-muted)" />
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Upload {doc.label}</div>
                          <input id={`cf-${doc.field}`} type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, doc.field)} />
                          {files[doc.field] && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text)' }}>{files[doc.field].name}</div>}
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
                                const uid = u.client_id_ref || String(u._id).slice(-6).toUpperCase();
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
                                const uid = u.client_id_ref || String(u._id).slice(-6).toUpperCase();
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
                    <div className="cf-group"><label className="cf-label">Nominee Age</label><input name="nomineeAge" type="number" className="cf-input" value={form.nomineeAge} onChange={handleChange} /></div>
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
