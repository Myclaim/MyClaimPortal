import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PartnerForm = ({ defaultRole }) => {
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
    
    // Partner specific fields
    role: defaultRole || 'partner',
    superPartner: defaultRole === 'super_partner' ? 'yes' : 'no',
    currentProfession: '', entity: '', category: '', 
    companyName: '', deadline: '', dateOfCommencement: '', 
    partnerStatus: 'active', notes: ''
  });

  const [files, setFiles] = useState({ 
    aadhar: null, pan: null, passport: null, license: null, 
    other: null, rent: null, partnerAgreement: null 
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
      
      return newErrors;
    });
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    if (name === 'aadharNo' || name === 'phone' || name === 'alternatePhone') {
      value = value.replace(/\D/g, ''); 
    }
    
    if (name === 'superPartner') {
      setForm(prev => ({ ...prev, superPartner: value, role: value === 'yes' ? 'super_partner' : 'partner' }));
    } else if (type === 'radio') {
      if (checked) setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    validateField(name, value);
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

      const payload = {
        ...form,
        name: form.name || `${form.firstName} ${form.lastName}`.trim() || form.username,
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

      // Document Upload for KYC & Partner Agreement
      const uploadNeeded = files.aadhar || files.pan || files.passport || files.license || files.other || files.rent || files.partnerAgreement;
      
      if (uploadNeeded && newUser._id) {
        const formData = new FormData();
        formData.append('userId', newUser._id);
        
        if (files.aadhar) { formData.append('files', files.aadhar); formData.append('docType', 'aadharCard'); }
        if (files.pan) { formData.append('files', files.pan); formData.append('docType', 'panCard'); }
        if (files.passport) { formData.append('files', files.passport); formData.append('docType', 'passport'); }
        if (files.license) { formData.append('files', files.license); formData.append('docType', 'drivingLicence'); }
        if (files.other) { formData.append('files', files.other); formData.append('docType', 'otherDocs'); }
        if (files.rent) { formData.append('files', files.rent); formData.append('docType', 'rentAgreementVeraBill'); }
        if (files.partnerAgreement) { formData.append('files', files.partnerAgreement); formData.append('docType', 'partnerAgreement'); }

        await api.post('/users/kyc-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess('Partner profile saved successfully!');
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page active" style={{ display: 'block', minHeight: '100vh', padding: '32px 16px', background: 'var(--bg)' }}>
      <style>{`
        .pf-wrap { max-width: 980px; margin: 0 auto; }
        .pf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .pf-title { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; display: flex; align-items: center; gap: 12px; }
        .pf-badge { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; background: var(--blue); color: #fff; font-size: 16px; }
        .pf-card { background: var(--card); border-radius: 16px; box-shadow: 0 2px 12px rgba(91,110,245,0.08); padding: 36px 40px; border: 1px solid var(--border); }
        
        /* Photo Section */
        .pf-photo-section { display: flex; align-items: center; gap: 20px; margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
        .pf-avatar-wrap { position: relative; width: 88px; height: 88px; border-radius: 50%; overflow: hidden; background: #e8eaf5; flex-shrink: 0; cursor: pointer; border: 3px solid #eef0ff; transition: border-color 0.2s; }
        .pf-avatar-wrap:hover { border-color: var(--blue); }
        .pf-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pf-avatar-overlay { position: absolute; inset: 0; background: rgba(37,99,235,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: #fff; font-size: 12px; font-weight: 600; text-align: center; padding: 4px; }
        .pf-avatar-wrap:hover .pf-avatar-overlay { opacity: 1; }
        .pf-photo-actions { display: flex; flex-direction: column; gap: 10px; }
        .pf-photo-actions .pf-hint { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        
        .pf-btn-row { display: flex; gap: 10px; }
        .pf-btn { padding: 9px 20px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.18s, transform 0.1s; letter-spacing: 0.01em; }
        .pf-btn:active { transform: scale(0.97); }
        .pf-btn-primary { background: var(--blue); color: #000; font-weight: 700; }
        .pf-btn-primary:hover { background: #1d4ed8; color: #fff; }
        .pf-btn-reset { background: #f1f5f9; color: #000; font-weight: 600; border: 1.5px solid var(--border); }
        .pf-btn-reset:hover { background: #e2e8f0; }
        .pf-btn-submit { background: var(--blue); color: #000; font-weight: 700; padding: 13px; font-size: 15px; border-radius: 10px; width: 100%; margin-top: 8px; letter-spacing: 0.01em; box-shadow: 0 4px 14px rgba(37,99,235,0.24); }
        .pf-btn-submit:hover { background: #1d4ed8; color: #fff; box-shadow: 0 6px 20px rgba(37,99,235,0.28); }
        
        /* Grid */
        .pf-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; }
        .pf-full-width { grid-column: 1 / -1; }
        
        /* Field */
        .pf-field { display: flex; flex-direction: column; gap: 5px; }
        .pf-field label { font-size: 12.5px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.01em; }
        .pf-req { color: #f43f5e; }
        .pf-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg); font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text) !important; -webkit-text-fill-color: var(--text) !important; caret-color: var(--blue); outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; appearance: none; color-scheme: dark; }
        .pf-input::placeholder { color: #818cf8; opacity: 0.7; }
        .pf-input:focus { border-color: var(--blue); background: var(--bg); color: var(--text) !important; -webkit-text-fill-color: var(--text) !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.25); }
        
        .pf-input:-webkit-autofill,
        .pf-input:-webkit-autofill:hover, 
        .pf-input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--text) !important;
          -webkit-box-shadow: 0 0 0px 1000px var(--bg) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        .pf-input.pf-error-input { border-color: #f43f5e !important; }
        .pf-input.pf-error-input:focus { box-shadow: 0 0 0 3px rgba(244,63,94,0.25); }
        .pf-error-msg { font-size: 11px; color: #f43f5e; margin-top: 3px; font-weight: 500; }
        
        .pf-pw-wrap { position: relative; }
        .pf-pw-wrap .pf-input { padding-right: 42px; }
        .pf-pw-toggle { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px; display: flex; align-items: center; }
        .pf-pw-toggle:hover { color: var(--blue); }
        
        .pf-select-wrap { position: relative; }
        .pf-select-wrap select { padding-right: 36px; cursor: pointer; }
        .pf-select-wrap::after { content: ''; position: absolute; right: 13px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid var(--text-muted); pointer-events: none; }
        
        .pf-file-field { display: flex; align-items: center; gap: 0; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg); overflow: hidden; min-height: 42px; transition: border-color 0.18s; }
        .pf-file-field:focus-within { border-color: var(--blue); }
        .pf-file-field input[type="file"] { display: none; }
        .pf-file-btn { padding: 9px 14px; background: rgba(255,255,255,0.08); border: none; border-right: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--text); cursor: pointer; white-space: nowrap; transition: background 0.15s; }
        .pf-file-btn:hover { background: rgba(255,255,255,0.15); }
        .pf-file-name { padding: 9px 12px; font-size: 13px; color: var(--text-muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pf-file-name.picked { color: var(--text); font-weight: 500; }
        
        /* Radio */
        .pf-radio-group { display: flex; gap: 20px; flex-wrap: wrap; padding: 4px 0; }
        .pf-radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--text); user-select: none; }
        .pf-radio-label input[type="radio"] { display: none; }
        .pf-radio-dot { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s; }
        .pf-radio-label input[type="radio"]:checked ~ .pf-radio-dot { border-color: var(--blue); background: var(--blue); }
        .pf-radio-label input[type="radio"]:checked ~ .pf-radio-dot::after { content: ''; width: 6px; height: 6px; background: #fff; border-radius: 50%; }
        
        /* Section */
        .pf-section-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--blue); padding-top: 14px; border-top: 1px solid var(--border); grid-column: 1 / -1; }
        .pf-section-title:first-child { border-top: none; padding-top: 0; }
        
        .pf-field textarea { resize: vertical; min-height: 96px; }

        @media (max-width: 640px) {
          .pf-form-grid { grid-template-columns: 1fr; }
          .pf-full-width { grid-column: 1; }
          .pf-card { padding: 24px 18px; }
          .pf-photo-section { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="pf-wrap">
        <div className="pf-header">
          <div className="pf-title">
            <span className="pf-badge">🤝</span>
            Partner Profile
          </div>
          <button className="pf-btn pf-btn-reset" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={16} /> Cancel
          </button>
        </div>
        
        <div className="pf-card">
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}><AlertCircle size={18} /> {error}</div>}
          {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}><CheckCircle size={18} /> {success}</div>}

          {/* Photo Section */}
          <div className="pf-photo-section">
            <div className="pf-avatar-wrap" onClick={() => document.getElementById('photoInput').click()}>
              <img src={avatarPreview} alt="Partner Photo" />
              <div className="pf-avatar-overlay">Change</div>
            </div>
            <div className="pf-photo-actions">
              <div className="pf-btn-row">
                <button type="button" className="pf-btn pf-btn-primary" onClick={() => document.getElementById('photoInput').click()}>Upload new photo</button>
                <button type="button" className="pf-btn pf-btn-reset" onClick={resetPhoto}>Reset</button>
              </div>
              <p className="pf-hint">Allowed JPG, GIF or PNG.</p>
            </div>
            <input type="file" id="photoInput" accept="image/jpeg,image/gif,image/png" onChange={previewPhoto} style={{ display: 'none' }} />
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="pf-form-grid">

              {/* Personal Information */}
              <div className="pf-section-title">Personal Information</div>

              <div className="pf-field">
                <label>First Name <span className="pf-req">*</span></label>
                <input type="text" name="firstName" className="pf-input" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
              </div>

              <div className="pf-field">
                <label>Last Name <span className="pf-req">*</span></label>
                <input type="text" name="lastName" className="pf-input" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
              </div>

              <div className="pf-field">
                <label>User Name <span className="pf-req">*</span></label>
                <input type="text" name="username" className="pf-input" placeholder="Enter User Name" value={form.username} onChange={handleChange} required />
              </div>

              <div className="pf-field">
                <label>Password <span className="pf-req">*</span></label>
                <div className="pf-pw-wrap">
                  <input type={showPassword ? 'text' : 'password'} name="password" className="pf-input" placeholder="••••••••••" value={form.password} onChange={handleChange} required />
                  <button type="button" className="pf-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pf-field">
                <label>E-mail <span className="pf-req">*</span></label>
                <input type="email" name="email" className={`pf-input ${formErrors.email ? 'pf-error-input' : ''}`} placeholder="john.doe@example.com" value={form.email} onChange={handleChange} required />
                {formErrors.email && <div className="pf-error-msg">{formErrors.email}</div>}
              </div>

              <div className="pf-field">
                <label>My Claim E-mail</label>
                <input type="email" name="myClaimEmail" className={`pf-input ${formErrors.myClaimEmail ? 'pf-error-input' : ''}`} placeholder="john.doe@myclaimindia.com" value={form.myClaimEmail} onChange={handleChange} />
                {formErrors.myClaimEmail && <div className="pf-error-msg">{formErrors.myClaimEmail}</div>}
              </div>

              <div className="pf-field">
                <label>Phone Number <span className="pf-req">*</span></label>
                <input type="tel" name="phone" className={`pf-input ${formErrors.phone ? 'pf-error-input' : ''}`} placeholder="9876543210" value={form.phone} onChange={handleChange} required maxLength={10} />
                {formErrors.phone && <div className="pf-error-msg">{formErrors.phone}</div>}
              </div>

              <div className="pf-field">
                <label>Alternate Phone Number</label>
                <input type="tel" name="alternatePhone" className={`pf-input ${formErrors.alternatePhone ? 'pf-error-input' : ''}`} placeholder="9876543210" value={form.alternatePhone} onChange={handleChange} maxLength={10} />
                {formErrors.alternatePhone && <div className="pf-error-msg">{formErrors.alternatePhone}</div>}
              </div>

              <div className="pf-field">
                <label>Date of Birth</label>
                <input type="date" name="dob" className="pf-input" value={form.dob} onChange={handleChange} />
              </div>

              {/* Identity Documents */}
              <div className="pf-section-title">Identity Documents</div>

              <div className="pf-field">
                <label>Aadhar Card No</label>
                <input type="text" name="aadharNo" className={`pf-input ${formErrors.aadharNo ? 'pf-error-input' : ''}`} placeholder="Enter Aadhar No" value={form.aadharNo} onChange={handleChange} maxLength={12} />
                {formErrors.aadharNo && <div className="pf-error-msg">{formErrors.aadharNo}</div>}
              </div>

              <div className="pf-field">
                <label>Pan Card No</label>
                <input type="text" name="panNo" className={`pf-input ${formErrors.panNo ? 'pf-error-input' : ''}`} placeholder="Enter Pan No" value={form.panNo} onChange={handleChange} maxLength={10} style={{ textTransform: 'uppercase' }} />
                {formErrors.panNo && <div className="pf-error-msg">{formErrors.panNo}</div>}
              </div>

              <div className="pf-field">
                <label>Aadhar Card</label>
                <div className="pf-file-field">
                  <button type="button" className="pf-file-btn" onClick={() => document.getElementById('aadharFile').click()}>Choose File</button>
                  <span className={`pf-file-name ${files.aadhar ? 'picked' : ''}`}>{files.aadhar ? files.aadhar.name : 'No file chosen'}</span>
                  <input type="file" id="aadharFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'aadhar')} />
                </div>
              </div>

              <div className="pf-field">
                <label>Pan Card</label>
                <div className="pf-file-field">
                  <button type="button" className="pf-file-btn" onClick={() => document.getElementById('panFile').click()}>Choose File</button>
                  <span className={`pf-file-name ${files.pan ? 'picked' : ''}`}>{files.pan ? files.pan.name : 'No file chosen'}</span>
                  <input type="file" id="panFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'pan')} />
                </div>
              </div>

              <div className="pf-field">
                <label>Passport</label>
                <div className="pf-file-field">
                  <button type="button" className="pf-file-btn" onClick={() => document.getElementById('passportFile').click()}>Choose File</button>
                  <span className={`pf-file-name ${files.passport ? 'picked' : ''}`}>{files.passport ? files.passport.name : 'No file chosen'}</span>
                  <input type="file" id="passportFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'passport')} />
                </div>
              </div>

              <div className="pf-field">
                <label>Driving License</label>
                <div className="pf-file-field">
                  <button type="button" className="pf-file-btn" onClick={() => document.getElementById('licenseFile').click()}>Choose File</button>
                  <span className={`pf-file-name ${files.license ? 'picked' : ''}`}>{files.license ? files.license.name : 'No file chosen'}</span>
                  <input type="file" id="licenseFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'license')} />
                </div>
              </div>

              <div className="pf-field">
                <label>Other Docs</label>
                <div className="pf-file-field">
                  <button type="button" className="pf-file-btn" onClick={() => document.getElementById('otherFile').click()}>Choose File</button>
                  <span className={`pf-file-name ${files.other ? 'picked' : ''}`}>{files.other ? files.other.name : 'No file chosen'}</span>
                  <input type="file" id="otherFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'other')} />
                </div>
              </div>

              <div className="pf-field">
                <label>Other Docs Desc</label>
                <input type="text" name="otherDocsDesc" className="pf-input" placeholder="Enter Other Docs Desc" value={form.otherDocsDesc} onChange={handleChange} />
              </div>

              {/* Additional Details */}
              <div className="pf-section-title">Additional Details</div>

              <div className="pf-field">
                <label>Gender</label>
                <div className="pf-radio-group">
                  <label className="pf-radio-label"><input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={handleChange} /><span className="pf-radio-dot"></span>Male</label>
                  <label className="pf-radio-label"><input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={handleChange} /><span className="pf-radio-dot"></span>Female</label>
                  <label className="pf-radio-label"><input type="radio" name="gender" value="Others" checked={form.gender === 'Others'} onChange={handleChange} /><span className="pf-radio-dot"></span>Others</label>
                </div>
              </div>

              <div className="pf-field">
                <label>Referred By Id</label>
                <input type="text" name="referredById" className="pf-input" placeholder="Enter Referral ID" value={form.referredById} onChange={handleChange} />
              </div>

              {/* Address */}
              <div className="pf-section-title">Address</div>

              <div className="pf-field">
                <label>Country</label>
                <input type="text" name="country" className="pf-input" placeholder="Enter Country" value={form.country} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>State</label>
                <input type="text" name="state" className="pf-input" placeholder="Enter State" value={form.state} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>City</label>
                <input type="text" name="city" className="pf-input" placeholder="Enter City" value={form.city} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Pincode</label>
                <input type="text" name="pincode" className="pf-input" placeholder="Enter Pincode" value={form.pincode} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Marital Status</label>
                <div className="pf-select-wrap">
                  <select name="maritalStatus" className="pf-input" value={form.maritalStatus} onChange={handleChange}>
                    <option value="" disabled>Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="pf-field">
                <label>Permanent Address</label>
                <input type="text" name="permanentAddress" className="pf-input" placeholder="Permanent Address" value={form.permanentAddress} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Temporary Address</label>
                <input type="text" name="temporaryAddress" className="pf-input" placeholder="Temporary Address" value={form.temporaryAddress} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Rent Agreement / Vera Bill</label>
                <div className="pf-file-field">
                  <button type="button" className="pf-file-btn" onClick={() => document.getElementById('rentFile').click()}>Choose File</button>
                  <span className={`pf-file-name ${files.rent ? 'picked' : ''}`}>{files.rent ? files.rent.name : 'No file chosen'}</span>
                  <input type="file" id="rentFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'rent')} />
                </div>
              </div>

              {/* Partner Details */}
              <div className="pf-section-title">Partner Details</div>

              <div className="pf-field">
                <label>Current Profession</label>
                <input type="text" name="currentProfession" className="pf-input" placeholder="Enter Profession" value={form.currentProfession} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Entity</label>
                <div className="pf-select-wrap">
                  <select name="entity" className="pf-input" value={form.entity} onChange={handleChange}>
                    <option value="" disabled>Select Entity</option>
                    <option value="Individual">Individual</option>
                    <option value="Company">Company</option>
                    <option value="Firm">Firm</option>
                    <option value="Trust">Trust</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pf-field">
                <label>Super Partner</label>
                <div className="pf-select-wrap">
                  <select name="superPartner" className="pf-input" value={form.superPartner} onChange={handleChange}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="pf-field">
                <label>Category</label>
                <div className="pf-select-wrap">
                  <select name="category" className="pf-input" value={form.category} onChange={handleChange}>
                    <option value="" disabled>Select Category</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
              </div>

              <div className="pf-field">
                <label>Current Company Name</label>
                <input type="text" name="companyName" className="pf-input" placeholder="Enter Company Name" value={form.companyName} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Partner Agreement</label>
                <div className="pf-file-field">
                  <button type="button" className="pf-file-btn" onClick={() => document.getElementById('partnerAgreementFile').click()}>Choose File</button>
                  <span className={`pf-file-name ${files.partnerAgreement ? 'picked' : ''}`}>{files.partnerAgreement ? files.partnerAgreement.name : 'No file chosen'}</span>
                  <input type="file" id="partnerAgreementFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'partnerAgreement')} />
                </div>
              </div>

              <div className="pf-field">
                <label>Deadline</label>
                <input type="date" name="deadline" className="pf-input" value={form.deadline} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Date of Commencement</label>
                <input type="date" name="dateOfCommencement" className="pf-input" value={form.dateOfCommencement} onChange={handleChange} />
              </div>

              <div className="pf-field">
                <label>Partner Status</label>
                <div className="pf-select-wrap">
                  <select name="partnerStatus" className="pf-input" value={form.partnerStatus} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="pf-section-title">Notes</div>
              <div className="pf-field pf-full-width">
                <label>Notes</label>
                <textarea name="notes" className="pf-input" placeholder="Additional notes..." value={form.notes} onChange={handleChange}></textarea>
              </div>

              {/* Submit */}
              <div className="pf-full-width">
                <button type="submit" className="pf-btn pf-btn-submit" disabled={loading}>
                  {loading ? 'Saving Profile...' : 'Save Partner Profile'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerForm;
