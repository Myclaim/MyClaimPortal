import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const EmployeeForm = ({ defaultRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('https://i.pravatar.cc/200?img=12');

  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', password: '',
    name: '', dob: '', gender: 'Male', maritalStatus: '',
    phone: '', alternatePhone: '', email: '', myClaimEmail: '',
    country: 'India', state: '', city: '', pincode: '', permanentAddress: '', temporaryAddress: '',
    aadharNo: '', panNo: '', otherDocsDesc: '',
    referredById: '', 
    
    // Employee specific fields
    role: defaultRole || 'employee',
    specialization: '', department: '', roles: '', notes: ''
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [files, setFiles] = useState({ 
    aadhar: null, pan: null, passport: null, license: null, 
    other: null, rent: null, agreement: null 
  });

  const validateField = (name, value) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      
      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) newErrors.email = 'Please enter a valid email address.';
        else delete newErrors.email;
      }
      if (name === 'myClaimEmail') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) newErrors.myClaimEmail = 'Please enter a valid email address.';
        else delete newErrors.myClaimEmail;
      }
      if (name === 'phone') {
        if (value && value.length !== 10) newErrors.phone = 'Phone number must be exactly 10 digits.';
        else delete newErrors.phone;
      }
      if (name === 'alternatePhone') {
        if (value && value.length !== 10) newErrors.alternatePhone = 'Alternate phone number must be exactly 10 digits.';
        else delete newErrors.alternatePhone;
      }
      if (name === 'aadharNo') {
        if (value && value.length !== 12) newErrors.aadharNo = 'Aadhar number must be exactly 12 digits.';
        else delete newErrors.aadharNo;
      }
      if (name === 'panNo') {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (value && !panRegex.test(value.toUpperCase())) newErrors.panNo = 'PAN number is invalid (e.g., ABCDE1234F).';
        else delete newErrors.panNo;
      }
      if (name === 'pincode') {
        if (value && value.length < 4) newErrors.pincode = 'Enter a valid pincode.';
        else delete newErrors.pincode;
      }
      
      return newErrors;
    });
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    if (name === 'aadharNo' || name === 'phone' || name === 'alternatePhone' || name === 'pincode') {
      value = value.replace(/\D/g, ''); 
    }
    
    if (type === 'radio') {
      if (checked) setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    validateField(name, value);
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const tag = skillInput.replace(/,$/, '').trim();
      if (tag && !skills.includes(tag)) {
        setSkills([...skills, tag]);
      }
      setSkillInput('');
    } else if (e.key === 'Backspace' && !skillInput && skills.length) {
      setSkills(skills.slice(0, -1));
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleFileChange = (e, fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: e.target.files[0] }));
  };

  const previewPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const resetPhoto = (e) => {
    e.preventDefault();
    setAvatarPreview('https://i.pravatar.cc/200?img=12');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (Object.keys(formErrors).length > 0) {
      setError('Please fix the highlighted errors before submitting.');
      setLoading(false);
      return;
    }

    try {
      if (!form.username || !form.password || !form.email || !form.phone) {
        throw new Error('Username, Password, Email and Phone are required.');
      }

      let finalSkills = [...skills];
      const pending = skillInput.trim();
      if (pending) {
        pending.split(/[,;]+/).forEach((chunk) => {
          const t = chunk.trim();
          if (t && !finalSkills.includes(t)) finalSkills.push(t);
        });
      }

      const payload = {
        ...form,
        name: form.name || `${form.firstName} ${form.lastName}`.trim() || form.username,
        skills: finalSkills.join(','),
        address: { 
          country: form.country, 
          state: form.state, 
          city: form.city, 
          pincode: form.pincode, 
          permanentAddress: form.permanentAddress,
          temporaryAddress: form.temporaryAddress
        }
      };
      
      const response = await api.post('/users', payload);
      const newUser = response.data;

      // Document Upload for KYC & Employee Agreement
      const uploadNeeded = files.aadhar || files.pan || files.passport || files.license || files.other || files.rent || files.agreement;
      
      if (uploadNeeded && newUser._id) {
        const formData = new FormData();
        formData.append('userId', newUser._id);
        
        if (files.aadhar) { formData.append('files', files.aadhar); formData.append('docType', 'aadharCard'); }
        if (files.pan) { formData.append('files', files.pan); formData.append('docType', 'panCard'); }
        if (files.passport) { formData.append('files', files.passport); formData.append('docType', 'passport'); }
        if (files.license) { formData.append('files', files.license); formData.append('docType', 'drivingLicence'); }
        if (files.other) { formData.append('files', files.other); formData.append('docType', 'otherDocs'); }
        if (files.rent) { formData.append('files', files.rent); formData.append('docType', 'rentAgreementVeraBill'); }
        if (files.agreement) { formData.append('files', files.agreement); formData.append('docType', 'employeeAgreement'); }

        await api.post('/users/kyc-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess('Employee profile saved successfully!');
<<<<<<< HEAD
      setTimeout(() => navigate(-1), 2000);
=======
      setTimeout(() => navigate(-1), 300);
>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page active" style={{ display: 'block', minHeight: '100vh', padding: '32px 16px', background: 'var(--bg)' }}>
      <style>{`
        .ef-wrap { max-width: 980px; margin: 0 auto; }
        .ef-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ef-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
        .ef-card { background: var(--card); border-radius: 16px; box-shadow: 0 2px 12px rgba(91,110,245,0.08); padding: 36px 40px; border: 1px solid var(--border); }
        
        /* Photo Section */
        .ef-photo-section { display: flex; align-items: center; gap: 20px; margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
        .ef-avatar-wrap { position: relative; width: 88px; height: 88px; border-radius: 50%; overflow: hidden; background: #e8eaf5; flex-shrink: 0; cursor: pointer; border: 3px solid #eef0ff; transition: border-color 0.2s; }
        .ef-avatar-wrap:hover { border-color: var(--blue); }
        .ef-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ef-avatar-overlay { position: absolute; inset: 0; background: rgba(37,99,235,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: #fff; font-size: 12px; font-weight: 600; text-align: center; padding: 4px; }
        .ef-avatar-wrap:hover .ef-avatar-overlay { opacity: 1; }
        .ef-photo-actions { display: flex; flex-direction: column; gap: 10px; }
        .ef-photo-actions .ef-hint { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        
        .ef-btn-row { display: flex; gap: 10px; }
        .ef-btn { padding: 9px 20px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.18s, transform 0.1s; letter-spacing: 0.01em; }
        .ef-btn:active { transform: scale(0.97); }
        .ef-btn-primary { background: var(--blue); color: #000; font-weight: 700; }
        .ef-btn-primary:hover { background: #1d4ed8; color: #fff; }
        .ef-btn-reset { background: #f1f5f9; color: #000; font-weight: 600; border: 1.5px solid var(--border); }
        .ef-btn-reset:hover { background: #e2e8f0; }
        .ef-btn-submit { background: var(--blue); color: #000; font-weight: 700; padding: 13px; font-size: 15px; border-radius: 10px; width: 100%; margin-top: 8px; letter-spacing: 0.01em; box-shadow: 0 4px 14px rgba(37,99,235,0.24); }
        .ef-btn-submit:hover { background: #1d4ed8; color: #fff; box-shadow: 0 6px 20px rgba(37,99,235,0.28); }
        
        /* Grid */
        .ef-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; }
        .ef-full-width { grid-column: 1 / -1; }
        
        /* Field */
        .ef-field { display: flex; flex-direction: column; gap: 5px; }
        .ef-field label { font-size: 12.5px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.01em; }
        .ef-req { color: #f43f5e; }
        .ef-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg); font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text); outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; appearance: none; }
        .ef-input::placeholder { color: #b0b6cc; }
        .ef-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .ef-input.ef-error-input { border-color: #f43f5e; }
        .ef-input.ef-error-input:focus { box-shadow: 0 0 0 3px rgba(244,63,94,0.15); }
        .ef-error-msg { font-size: 11px; color: #f43f5e; margin-top: 2px; }
        
        .ef-pw-wrap { position: relative; }
        .ef-pw-wrap .ef-input { padding-right: 42px; }
        .ef-pw-toggle { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px; display: flex; align-items: center; }
        .ef-pw-toggle:hover { color: var(--blue); }
        
        .ef-select-wrap { position: relative; }
        .ef-select-wrap select { padding-right: 36px; cursor: pointer; }
        .ef-select-wrap::after { content: ''; position: absolute; right: 13px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid var(--text-muted); pointer-events: none; }
        
        .ef-file-field { display: flex; align-items: center; gap: 0; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg); overflow: hidden; min-height: 42px; transition: border-color 0.18s; }
        .ef-file-field:focus-within { border-color: var(--blue); }
        .ef-file-field input[type="file"] { display: none; }
        .ef-file-btn { padding: 9px 14px; background: #f1f5f9; border: none; border-right: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #000; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
        .ef-file-btn:hover { background: #e2e8f0; }
        .ef-file-name { padding: 9px 12px; font-size: 13px; color: var(--text-muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ef-file-name.picked { color: var(--text); font-weight: 500; }
        
        /* Radio */
        .ef-radio-group { display: flex; gap: 20px; flex-wrap: wrap; padding: 4px 0; }
        .ef-radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--text); user-select: none; }
        .ef-radio-label input[type="radio"] { display: none; }
        .ef-radio-dot { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s; }
        .ef-radio-label input[type="radio"]:checked ~ .ef-radio-dot { border-color: var(--blue); background: var(--blue); }
        .ef-radio-label input[type="radio"]:checked ~ .ef-radio-dot::after { content: ''; width: 6px; height: 6px; background: #fff; border-radius: 50%; }
        
        /* Section */
        .ef-section-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--blue); padding-top: 14px; border-top: 1px solid var(--border); grid-column: 1 / -1; }
        .ef-section-title:first-child { border-top: none; padding-top: 0; }
        
        .ef-field textarea { resize: vertical; min-height: 96px; }

        /* Tags for Skills — match card/input contrast in light & dark themes */
        .ef-tags-wrap {
          display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
          padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px;
          background: var(--card); min-height: 48px; cursor: text;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .ef-tags-wrap:focus-within {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.18);
          background: var(--card);
        }
        .ef-tag { display: inline-flex; align-items: center; gap: 5px; background: rgba(37,99,235,0.12); color: var(--blue); border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; border: 1px solid rgba(37,99,235,0.2); }
        .ef-tag-remove { background: none; border: none; cursor: pointer; color: var(--blue); font-size: 15px; line-height: 1; padding: 0; display: flex; align-items: center; opacity: 0.85; }
        .ef-tag-remove:hover { color: #f43f5e; opacity: 1; }
        .ef-tags-input {
          border: none; outline: none; background: transparent;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          color: var(--text); caret-color: var(--blue);
          flex: 1; min-width: 160px; min-height: 28px; padding: 4px 6px; line-height: 1.4;
        }
        .ef-tags-input::placeholder { color: var(--text-muted); opacity: 0.9; }

        @media (max-width: 640px) {
          .ef-form-grid { grid-template-columns: 1fr; }
          .ef-full-width { grid-column: 1; }
          .ef-card { padding: 24px 18px; }
          .ef-photo-section { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="ef-wrap">
        <div className="ef-header">
          <div className="ef-title">Employee Profile</div>
          <button className="ef-btn ef-btn-reset" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={16} /> Cancel
          </button>
        </div>
        
        <div className="ef-card">
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}><AlertCircle size={18} /> {error}</div>}
          {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}><CheckCircle size={18} /> {success}</div>}

          {/* Photo Section */}
          <div className="ef-photo-section">
            <div className="ef-avatar-wrap" onClick={() => document.getElementById('photoInput').click()}>
              <img src={avatarPreview} alt="Employee Photo" />
              <div className="ef-avatar-overlay">Change</div>
            </div>
            <div className="ef-photo-actions">
              <div className="ef-btn-row">
                <button type="button" className="ef-btn ef-btn-primary" onClick={() => document.getElementById('photoInput').click()}>Upload new photo</button>
                <button type="button" className="ef-btn ef-btn-reset" onClick={resetPhoto}>Reset</button>
              </div>
              <p className="ef-hint">Allowed JPG, GIF or PNG.</p>
            </div>
            <input type="file" id="photoInput" accept="image/jpeg,image/gif,image/png" onChange={previewPhoto} style={{ display: 'none' }} />
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="ef-form-grid">

              {/* Personal Information */}
              <div className="ef-section-title">Personal Information</div>

              <div className="ef-field">
                <label>First Name <span className="ef-req">*</span></label>
                <input type="text" name="firstName" className="ef-input" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
              </div>

              <div className="ef-field">
                <label>Last Name <span className="ef-req">*</span></label>
                <input type="text" name="lastName" className="ef-input" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
              </div>

              <div className="ef-field">
                <label>User Name <span className="ef-req">*</span></label>
                <input type="text" name="username" className="ef-input" placeholder="Enter User Name" value={form.username} onChange={handleChange} required />
              </div>

              <div className="ef-field">
                <label>Password <span className="ef-req">*</span></label>
                <div className="ef-pw-wrap">
                  <input type={showPassword ? 'text' : 'password'} name="password" className="ef-input" placeholder="••••••••••" value={form.password} onChange={handleChange} required />
                  <button type="button" className="ef-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="ef-field">
                <label>E-mail <span className="ef-req">*</span></label>
                <input type="email" name="email" className={`ef-input ${formErrors.email ? 'ef-error-input' : ''}`} placeholder="john.doe@example.com" value={form.email} onChange={handleChange} required />
                {formErrors.email && <div className="ef-error-msg">{formErrors.email}</div>}
              </div>

              <div className="ef-field">
                <label>My Claim E-mail</label>
                <input type="email" name="myClaimEmail" className={`ef-input ${formErrors.myClaimEmail ? 'ef-error-input' : ''}`} placeholder="john.doe@myclaimindia.com" value={form.myClaimEmail} onChange={handleChange} />
                {formErrors.myClaimEmail && <div className="ef-error-msg">{formErrors.myClaimEmail}</div>}
              </div>

              <div className="ef-field">
                <label>Phone Number <span className="ef-req">*</span></label>
                <input type="tel" name="phone" className={`ef-input ${formErrors.phone ? 'ef-error-input' : ''}`} placeholder="9876543210" value={form.phone} onChange={handleChange} required maxLength={10} />
                {formErrors.phone && <div className="ef-error-msg">{formErrors.phone}</div>}
              </div>

              <div className="ef-field">
                <label>Alternate Phone Number</label>
                <input type="tel" name="alternatePhone" className={`ef-input ${formErrors.alternatePhone ? 'ef-error-input' : ''}`} placeholder="9876543210" value={form.alternatePhone} onChange={handleChange} maxLength={10} />
                {formErrors.alternatePhone && <div className="ef-error-msg">{formErrors.alternatePhone}</div>}
              </div>

              <div className="ef-field">
                <label>Date of Birth</label>
                <input type="date" name="dob" className="ef-input" value={form.dob} onChange={handleChange} />
              </div>

              {/* Identity Documents */}
              <div className="ef-section-title">Identity Documents</div>

              <div className="ef-field">
                <label>Aadhar Card No</label>
                <input type="text" name="aadharNo" className={`ef-input ${formErrors.aadharNo ? 'ef-error-input' : ''}`} placeholder="Enter Aadhar No" value={form.aadharNo} onChange={handleChange} maxLength={12} />
                {formErrors.aadharNo && <div className="ef-error-msg">{formErrors.aadharNo}</div>}
              </div>

              <div className="ef-field">
                <label>Pan Card No</label>
                <input type="text" name="panNo" className={`ef-input ${formErrors.panNo ? 'ef-error-input' : ''}`} placeholder="Enter Pan No" value={form.panNo} onChange={handleChange} maxLength={10} style={{ textTransform: 'uppercase' }} />
                {formErrors.panNo && <div className="ef-error-msg">{formErrors.panNo}</div>}
              </div>

              <div className="ef-field">
                <label>Aadhar Card</label>
                <div className="ef-file-field">
                  <button type="button" className="ef-file-btn" onClick={() => document.getElementById('aadharFile').click()}>Choose File</button>
                  <span className={`ef-file-name ${files.aadhar ? 'picked' : ''}`}>{files.aadhar ? files.aadhar.name : 'No file chosen'}</span>
                  <input type="file" id="aadharFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'aadhar')} />
                </div>
              </div>

              <div className="ef-field">
                <label>Pan Card</label>
                <div className="ef-file-field">
                  <button type="button" className="ef-file-btn" onClick={() => document.getElementById('panFile').click()}>Choose File</button>
                  <span className={`ef-file-name ${files.pan ? 'picked' : ''}`}>{files.pan ? files.pan.name : 'No file chosen'}</span>
                  <input type="file" id="panFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'pan')} />
                </div>
              </div>

              <div className="ef-field">
                <label>Passport</label>
                <div className="ef-file-field">
                  <button type="button" className="ef-file-btn" onClick={() => document.getElementById('passportFile').click()}>Choose File</button>
                  <span className={`ef-file-name ${files.passport ? 'picked' : ''}`}>{files.passport ? files.passport.name : 'No file chosen'}</span>
                  <input type="file" id="passportFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'passport')} />
                </div>
              </div>

              <div className="ef-field">
                <label>Driving License</label>
                <div className="ef-file-field">
                  <button type="button" className="ef-file-btn" onClick={() => document.getElementById('licenseFile').click()}>Choose File</button>
                  <span className={`ef-file-name ${files.license ? 'picked' : ''}`}>{files.license ? files.license.name : 'No file chosen'}</span>
                  <input type="file" id="licenseFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'license')} />
                </div>
              </div>

              <div className="ef-field">
                <label>Other Docs</label>
                <div className="ef-file-field">
                  <button type="button" className="ef-file-btn" onClick={() => document.getElementById('otherFile').click()}>Choose File</button>
                  <span className={`ef-file-name ${files.other ? 'picked' : ''}`}>{files.other ? files.other.name : 'No file chosen'}</span>
                  <input type="file" id="otherFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'other')} />
                </div>
              </div>

              <div className="ef-field">
                <label>Other Docs Desc</label>
                <input type="text" name="otherDocsDesc" className="ef-input" placeholder="Enter Other Docs Desc" value={form.otherDocsDesc} onChange={handleChange} />
              </div>

              {/* Additional Details */}
              <div className="ef-section-title">Additional Details</div>

              <div className="ef-field">
                <label>Gender</label>
                <div className="ef-radio-group">
                  <label className="ef-radio-label"><input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={handleChange} /><span className="ef-radio-dot"></span>Male</label>
                  <label className="ef-radio-label"><input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={handleChange} /><span className="ef-radio-dot"></span>Female</label>
                  <label className="ef-radio-label"><input type="radio" name="gender" value="Others" checked={form.gender === 'Others'} onChange={handleChange} /><span className="ef-radio-dot"></span>Others</label>
                </div>
              </div>

              <div className="ef-field">
                <label>Referred By Id</label>
                <input type="text" name="referredById" className="ef-input" placeholder="Enter Referral ID" value={form.referredById} onChange={handleChange} />
              </div>

              {/* Address */}
              <div className="ef-section-title">Address</div>

              <div className="ef-field">
                <label>Country</label>
                <input type="text" name="country" className="ef-input" placeholder="Enter Country" value={form.country} onChange={handleChange} />
              </div>

              <div className="ef-field">
                <label>State</label>
                <input type="text" name="state" className="ef-input" placeholder="Enter State" value={form.state} onChange={handleChange} />
              </div>

              <div className="ef-field">
                <label>City</label>
                <input type="text" name="city" className="ef-input" placeholder="Enter City" value={form.city} onChange={handleChange} />
              </div>

              <div className="ef-field">
                <label>Pincode</label>
                <input type="text" name="pincode" className={`ef-input ${formErrors.pincode ? 'ef-error-input' : ''}`} placeholder="Enter Pincode" value={form.pincode} onChange={handleChange} maxLength={10} />
                {formErrors.pincode && <div className="ef-error-msg">{formErrors.pincode}</div>}
              </div>

              <div className="ef-field">
                <label>Marital Status</label>
                <div className="ef-select-wrap">
                  <select name="maritalStatus" className="ef-input" value={form.maritalStatus} onChange={handleChange}>
                    <option value="" disabled>Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="ef-field">
                <label>Permanent Address</label>
                <input type="text" name="permanentAddress" className="ef-input" placeholder="Permanent Address" value={form.permanentAddress} onChange={handleChange} />
              </div>

              <div className="ef-field">
                <label>Temporary Address</label>
                <input type="text" name="temporaryAddress" className="ef-input" placeholder="Temporary Address" value={form.temporaryAddress} onChange={handleChange} />
              </div>

              <div className="ef-field">
                <label>Rent Agreement / Vera Bill</label>
                <div className="ef-file-field">
                  <button type="button" className="ef-file-btn" onClick={() => document.getElementById('rentFile').click()}>Choose File</button>
                  <span className={`ef-file-name ${files.rent ? 'picked' : ''}`}>{files.rent ? files.rent.name : 'No file chosen'}</span>
                  <input type="file" id="rentFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'rent')} />
                </div>
              </div>

              {/* Employee Details */}
              <div className="ef-section-title">Employee Details</div>

              <div className="ef-field">
                <label>Specialization</label>
                <input type="text" name="specialization" className="ef-input" placeholder="Enter Specialization" value={form.specialization} onChange={handleChange} />
              </div>

              <div className="ef-field">
                <label>Skills</label>
                <p className="ef-hint" style={{ marginTop: 0, marginBottom: 6 }}>Type a skill, then press Enter or comma. Paste several separated by commas.</p>
                <div className="ef-tags-wrap" onClick={() => document.getElementById('skillsInput').focus()}>
                  {skills.map((tag, idx) => (
                    <span key={idx} className="ef-tag">
                      {tag}
                      <button type="button" className="ef-tag-remove" onClick={() => removeSkill(idx)}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    id="skillsInput"
                    className="ef-tags-input"
                    placeholder="e.g. KYC, Claims — Enter or , to add"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
              </div>

              <div className="ef-field">
                <label>Employee Agreement</label>
                <div className="ef-file-field">
                  <button type="button" className="ef-file-btn" onClick={() => document.getElementById('agreementFile').click()}>Choose File</button>
                  <span className={`ef-file-name ${files.agreement ? 'picked' : ''}`}>{files.agreement ? files.agreement.name : 'No file chosen'}</span>
                  <input type="file" id="agreementFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'agreement')} />
                </div>
              </div>

              <div className="ef-field">
                <label>Department</label>
                <input type="text" name="department" className="ef-input" placeholder="Enter Department" value={form.department} onChange={handleChange} />
              </div>

              <div className="ef-field ef-full-width">
                <label>Roles</label>
                <input type="text" name="roles" className="ef-input" placeholder="Enter Roles" value={form.roles} onChange={handleChange} />
              </div>

              {/* User Type — when adding from /users/add?role=employee, account is always Employee */}
              <div className="ef-section-title">User Type</div>

              <div className="ef-field ef-full-width">
                {defaultRole === 'employee' ? (
                  <p className="ef-hint" style={{ margin: 0 }}>This profile is saved as an <strong>Employee</strong> account.</p>
                ) : (
                  <div className="ef-radio-group">
                    <label className="ef-radio-label"><input type="radio" name="role" value="partner" checked={form.role === 'partner'} onChange={handleChange} /><span className="ef-radio-dot"></span>Partner</label>
                    <label className="ef-radio-label"><input type="radio" name="role" value="employee" checked={form.role === 'employee'} onChange={handleChange} /><span className="ef-radio-dot"></span>Employee</label>
                    <label className="ef-radio-label"><input type="radio" name="role" value="admin" checked={form.role === 'admin'} onChange={handleChange} /><span className="ef-radio-dot"></span>Admin</label>
                    <label className="ef-radio-label"><input type="radio" name="role" value="super_admin" checked={form.role === 'super_admin'} onChange={handleChange} /><span className="ef-radio-dot"></span>Super Admin</label>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="ef-section-title">Notes</div>
              <div className="ef-field ef-full-width">
                <label>Notes</label>
                <textarea name="notes" className="ef-input" placeholder="Additional notes..." value={form.notes} onChange={handleChange}></textarea>
              </div>

              {/* Submit */}
              <div className="ef-full-width">
                <button type="submit" className="ef-btn ef-btn-submit" disabled={loading}>
                  {loading ? 'Saving Profile...' : 'Save Employee Profile'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
