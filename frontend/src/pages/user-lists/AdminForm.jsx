import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminForm = ({ role }) => {
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
    profession: '', companyName: '', notes: '', department: '',
    role: role || 'admin',
    adminType: 'ClaimAdmin'
  });

  const [files, setFiles] = useState({ aadhar: null, pan: null, passport: null, license: null, other: null, rent: null });

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
        const rawDigits = value.replace(/\D/g, '');
        if (value && rawDigits.length !== 12) newErrors.aadharNo = 'Aadhaar number must be 12 digits (e.g., 1234 5678 9012).';
        else delete newErrors.aadharNo;
      }
      if (name === 'panNo') {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (value && !panRegex.test(value.toUpperCase())) newErrors.panNo = 'PAN number is invalid. Format must be 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F).';
        else delete newErrors.panNo;
      }
      
      return newErrors;
    });
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    if (name === 'aadharNo') {
      const digits = value.replace(/\D/g, '').slice(0, 12);
      value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'phone' || name === 'alternatePhone') {
      value = value.replace(/\D/g, '').slice(0, 10); 
    }

    if (name === 'panNo') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
    
    if (type === 'radio') {
      if (checked) setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Trigger real-time validation
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
    
    // Check if there are any lingering form errors
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

      // Document Upload for KYC
      if ((files.aadhar || files.pan || files.passport || files.license || files.other || files.rent) && newUser._id) {
        const formData = new FormData();
        formData.append('userId', newUser._id);
        formData.append('formName', 'Admin Registration Form');
        
        if (files.aadhar) { formData.append('files', files.aadhar); formData.append('docType', 'aadharCard'); }
        if (files.pan) { formData.append('files', files.pan); formData.append('docType', 'panCard'); }
        if (files.passport) { formData.append('files', files.passport); formData.append('docType', 'passport'); }
        if (files.license) { formData.append('files', files.license); formData.append('docType', 'drivingLicence'); }
        if (files.other) { formData.append('files', files.other); formData.append('docType', 'otherDocs'); }
        if (files.rent) { formData.append('files', files.rent); formData.append('docType', 'rentAgreementVeraBill'); }

        api.post('/users/kyc-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).catch(e => console.error('Admin KYC upload error:', e));
      }

      setSuccess('User profile saved successfully!');
      setLoading(false);
      setTimeout(() => navigate(-1), 300);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page active" style={{ display: 'block', minHeight: '100vh', padding: '32px 16px', background: 'var(--bg)' }}>
      <style>{`
        .page-wrap { max-width: 980px; margin: 0 auto; }
        .form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .form-header h1 { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; margin: 0; }
        .card { background: var(--card); border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 36px 40px; border: 1px solid var(--border); }
        
        /* ── Photo Section ── */
        .photo-section { display: flex; align-items: center; gap: 20px; margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
        .avatar-wrap { position: relative; width: 88px; height: 88px; border-radius: 50%; overflow: hidden; background: #e8eaf5; flex-shrink: 0; cursor: pointer; border: 3px solid var(--blue); transition: border-color 0.2s; }
        .avatar-wrap:hover { border-color: #1d4ed8; }
        .avatar-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .avatar-overlay { position: absolute; inset: 0; background: rgba(37,99,235,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: #fff; font-size: 12px; font-weight: 600; text-align: center; padding: 4px; }
        .avatar-wrap:hover .avatar-overlay { opacity: 1; }
        .photo-actions { display: flex; flex-direction: column; gap: 10px; }
        .photo-actions .hint { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        
        .btn-row { display: flex; gap: 10px; }
        .btn { padding: 9px 20px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.18s, transform 0.1s; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--blue); color: #000; font-weight: 700; }
        .btn-primary:hover { background: #1d4ed8; color: #fff; }
        .btn-reset { background: #f1f5f9; color: #000; font-weight: 600; border: 1.5px solid var(--border); }
        .btn-reset:hover { background: #e2e8f0; }
        .btn-submit { background: var(--blue); color: #000; font-weight: 700; padding: 13px; font-size: 15px; border-radius: 10px; width: 100%; margin-top: 8px; letter-spacing: 0.01em; box-shadow: 0 4px 14px rgba(37,99,235,0.24); }
        .btn-submit:hover { background: #1d4ed8; color: #fff; box-shadow: 0 6px 20px rgba(37,99,235,0.28); }
        
        /* ── Grid ── */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; }
        .full-width { grid-column: 1 / -1; }
        
        /* ── Field ── */
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field label { font-size: 12.5px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.01em; }
        .field input, .field select, .field textarea { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg); font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text) !important; -webkit-text-fill-color: var(--text) !important; caret-color: var(--blue); outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; appearance: none; color-scheme: dark; }
        .field input::placeholder, .field textarea::placeholder { color: #818cf8; opacity: 0.7; }
        .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--blue); background: var(--bg); color: var(--text) !important; -webkit-text-fill-color: var(--text) !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.25); }
        
        .field input:-webkit-autofill,
        .field input:-webkit-autofill:hover, 
        .field input:-webkit-autofill:focus,
        .field textarea:-webkit-autofill,
        .field select:-webkit-autofill {
          -webkit-text-fill-color: var(--text) !important;
          -webkit-box-shadow: 0 0 0px 1000px var(--bg) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        .field input.error, .field select.error { border-color: #f43f5e !important; }
        .field input.error:focus, .field select.error:focus { box-shadow: 0 0 0 3px rgba(244,63,94,0.25); }
        .err-msg { font-size: 11px; color: #f43f5e; margin-top: 3px; font-weight: 500; }
        
        .pw-wrap { position: relative; }
        .pw-wrap input { padding-right: 42px; }
        .pw-toggle { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 2px; display: flex; align-items: center; }
        .pw-toggle:hover { color: var(--blue); }
        
        .select-wrap { position: relative; }
        .select-wrap select { padding-right: 36px; cursor: pointer; }
        .select-wrap::after { content: ''; position: absolute; right: 13px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid var(--text-muted); pointer-events: none; }
        
        .file-field { display: flex; align-items: center; gap: 0; border: 1.5px solid var(--border); border-radius: 10px; background: var(--bg); overflow: hidden; min-height: 42px; transition: border-color 0.18s; }
        .file-field:focus-within { border-color: var(--blue); }
        .file-field input[type="file"] { display: none; }
        .file-btn { padding: 9px 14px; background: rgba(255,255,255,0.08); border: none; border-right: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--text); cursor: pointer; white-space: nowrap; transition: background 0.15s; }
        .file-btn:hover { background: rgba(255,255,255,0.15); }
        .file-name { padding: 9px 12px; font-size: 13px; color: var(--text-muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-name.picked { color: var(--text); font-weight: 500; }
        
        /* radio group */
        .radio-group { display: flex; gap: 20px; flex-wrap: wrap; padding: 4px 0; }
        .radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--text); user-select: none; }
        .radio-label input[type="radio"] { display: none; }
        .radio-custom { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s; }
        .radio-label input[type="radio"]:checked ~ .radio-custom { border-color: var(--blue); background: var(--blue); }
        .radio-label input[type="radio"]:checked ~ .radio-custom::after { content: ''; width: 6px; height: 6px; background: #fff; border-radius: 50%; }
        
        /* section divider */
        .section-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--blue); padding-top: 14px; border-top: 1px solid var(--border); grid-column: 1 / -1; }
        .section-title:first-child { border-top: none; padding-top: 0; }
        
        .field textarea { resize: vertical; min-height: 96px; }

        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: 1; }
          .card { padding: 24px 18px; }
          .photo-section { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="page-wrap">
        <div className="form-header">
          <h1>{role === 'super_admin' ? 'Super Admin User Profile' : 'Admin User Profile'}</h1>
          <button className="btn btn-reset" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={16} /> Cancel
          </button>
        </div>
        
        <div className="card">
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}><AlertCircle size={18} /> {error}</div>}
          {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: 8, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}><CheckCircle size={18} /> {success}</div>}

          {/* Photo Section */}
          <div className="photo-section">
            <div className="avatar-wrap" onClick={() => document.getElementById('photoInput').click()}>
              <img src={avatarPreview} alt="User Avatar" />
              <div className="avatar-overlay">Change Photo</div>
            </div>
            <div className="photo-actions">
              <div className="btn-row">
                <button type="button" className="btn btn-primary" onClick={() => document.getElementById('photoInput').click()}>Upload new photo</button>
                <button type="button" className="btn btn-reset" onClick={resetPhoto}>Reset</button>
              </div>
              <p className="hint">Allowed JPG, GIF or PNG</p>
            </div>
            <input type="file" id="photoInput" accept="image/jpeg,image/gif,image/png" onChange={previewPhoto} style={{ display: 'none' }} />
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">

              {/* Personal Information */}
              <div className="section-title">Personal Information</div>

              <div className="field">
                <label>First Name</label>
                <input type="text" name="firstName" className={formErrors.firstName ? 'error' : ''} placeholder="First Name" value={form.firstName} onChange={handleChange} required />
              </div>

              <div className="field">
                <label>Last Name</label>
                <input type="text" name="lastName" className={formErrors.lastName ? 'error' : ''} placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
              </div>

              <div className="field">
                <label>User Name</label>
                <input type="text" name="username" className={formErrors.username ? 'error' : ''} placeholder="Enter User Name" value={form.username} onChange={handleChange} required />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input type={showPassword ? 'text' : 'password'} name="password" className={formErrors.password ? 'error' : ''} placeholder="••••••••••" value={form.password} onChange={handleChange} required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>E-mail</label>
                <input type="email" name="email" className={formErrors.email ? 'error' : ''} placeholder="john.doe@example.com" value={form.email} onChange={handleChange} required />
                {formErrors.email && <div className="err-msg">{formErrors.email}</div>}
              </div>

              <div className="field">
                <label>My Claim E-mail</label>
                <input type="email" name="myClaimEmail" className={formErrors.myClaimEmail ? 'error' : ''} placeholder="john.doe@myclaimindia.com" value={form.myClaimEmail} onChange={handleChange} />
                {formErrors.myClaimEmail && <div className="err-msg">{formErrors.myClaimEmail}</div>}
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input type="tel" name="phone" className={formErrors.phone ? 'error' : ''} placeholder="9876543210" value={form.phone} onChange={handleChange} required maxLength={10} />
                {formErrors.phone && <div className="err-msg">{formErrors.phone}</div>}
              </div>

              <div className="field">
                <label>Alternate Phone Number</label>
                <input type="tel" name="alternatePhone" className={formErrors.alternatePhone ? 'error' : ''} placeholder="9876543210" value={form.alternatePhone} onChange={handleChange} maxLength={10} />
                {formErrors.alternatePhone && <div className="err-msg">{formErrors.alternatePhone}</div>}
              </div>

              <div className="field">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} />
              </div>

              {/* Identity Documents */}
              <div className="section-title">Identity Documents</div>

              <div className="field">
                <label>Aadhar Card No</label>
                <input type="text" name="aadharNo" className={formErrors.aadharNo ? 'error' : ''} placeholder="1234 5678 9012" value={form.aadharNo} onChange={handleChange} maxLength={14} />
                {formErrors.aadharNo && <div className="err-msg">{formErrors.aadharNo}</div>}
              </div>

              <div className="field">
                <label>Pan Card No</label>
                <input type="text" name="panNo" className={formErrors.panNo ? 'error' : ''} placeholder="Enter Pan No" value={form.panNo} onChange={handleChange} maxLength={10} style={{ textTransform: 'uppercase' }} />
                {formErrors.panNo && <div className="err-msg">{formErrors.panNo}</div>}
              </div>

              <div className="field">
                <label>Aadhar Card</label>
                <div className="file-field">
                  <button type="button" className="file-btn" onClick={() => document.getElementById('aadharFile').click()}>Choose File</button>
                  <span className={`file-name ${files.aadhar ? 'picked' : ''}`}>{files.aadhar ? files.aadhar.name : 'No file chosen'}</span>
                  <input type="file" id="aadharFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'aadhar')} />
                </div>
              </div>

              <div className="field">
                <label>Pan Card</label>
                <div className="file-field">
                  <button type="button" className="file-btn" onClick={() => document.getElementById('panFile').click()}>Choose File</button>
                  <span className={`file-name ${files.pan ? 'picked' : ''}`}>{files.pan ? files.pan.name : 'No file chosen'}</span>
                  <input type="file" id="panFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'pan')} />
                </div>
              </div>

              <div className="field">
                <label>Passport</label>
                <div className="file-field">
                  <button type="button" className="file-btn" onClick={() => document.getElementById('passportFile').click()}>Choose File</button>
                  <span className={`file-name ${files.passport ? 'picked' : ''}`}>{files.passport ? files.passport.name : 'No file chosen'}</span>
                  <input type="file" id="passportFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'passport')} />
                </div>
              </div>

              <div className="field">
                <label>Driving License</label>
                <div className="file-field">
                  <button type="button" className="file-btn" onClick={() => document.getElementById('licenseFile').click()}>Choose File</button>
                  <span className={`file-name ${files.license ? 'picked' : ''}`}>{files.license ? files.license.name : 'No file chosen'}</span>
                  <input type="file" id="licenseFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'license')} />
                </div>
              </div>

              <div className="field">
                <label>Other Docs</label>
                <div className="file-field">
                  <button type="button" className="file-btn" onClick={() => document.getElementById('otherFile').click()}>Choose File</button>
                  <span className={`file-name ${files.other ? 'picked' : ''}`}>{files.other ? files.other.name : 'No file chosen'}</span>
                  <input type="file" id="otherFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'other')} />
                </div>
              </div>

              <div className="field">
                <label>Other Docs Desc</label>
                <input type="text" name="otherDocsDesc" placeholder="Enter Other Docs Desc" value={form.otherDocsDesc} onChange={handleChange} />
              </div>

              {/* Additional Details */}
              <div className="section-title">Additional Details</div>

              <div className="field">
                <label>Gender</label>
                <div className="radio-group">
                  <label className="radio-label"><input type="radio" name="gender" value="Male" checked={form.gender === 'Male'} onChange={handleChange} /><span className="radio-custom"></span>Male</label>
                  <label className="radio-label"><input type="radio" name="gender" value="Female" checked={form.gender === 'Female'} onChange={handleChange} /><span className="radio-custom"></span>Female</label>
                  <label className="radio-label"><input type="radio" name="gender" value="Others" checked={form.gender === 'Others'} onChange={handleChange} /><span className="radio-custom"></span>Others</label>
                </div>
              </div>

              <div className="field">
                <label>Referred By Id</label>
                <input type="text" name="referredById" placeholder="Enter Referral ID" value={form.referredById} onChange={handleChange} />
              </div>

              {/* Address */}
              <div className="section-title">Address</div>

              <div className="field">
                <label>Country</label>
                <input type="text" name="country" placeholder="Enter Country" value={form.country} onChange={handleChange} />
              </div>

              <div className="field">
                <label>State</label>
                <input type="text" name="state" placeholder="Enter State" value={form.state} onChange={handleChange} />
              </div>

              <div className="field">
                <label>City</label>
                <input type="text" name="city" placeholder="Enter City" value={form.city} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Pincode</label>
                <input type="text" name="pincode" placeholder="Enter Pincode" value={form.pincode} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Marital Status</label>
                <div className="select-wrap">
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                    <option value="" disabled>Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Permanent Address</label>
                <input type="text" name="permanentAddress" placeholder="Permanent Address" value={form.permanentAddress} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Temporary Address</label>
                <input type="text" name="temporaryAddress" placeholder="Temporary Address" value={form.temporaryAddress} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Rent Agreement / Vera Bill</label>
                <div className="file-field">
                  <button type="button" className="file-btn" onClick={() => document.getElementById('rentFile').click()}>Choose File</button>
                  <span className={`file-name ${files.rent ? 'picked' : ''}`}>{files.rent ? files.rent.name : 'No file chosen'}</span>
                  <input type="file" id="rentFile" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'rent')} />
                </div>
              </div>

              {/* Admin Role Details */}
              {(form.role === 'admin' || form.role === 'super_admin') && (
                <>
                  <div className="section-title">Admin Role Details</div>
                  <div className="field full-width">
                    <label>Admin Type</label>
                    <div className="radio-group">
                      <label className="radio-label"><input type="radio" name="adminType" value="ClaimAdmin" checked={form.adminType === 'ClaimAdmin'} onChange={handleChange} /><span className="radio-custom"></span>Claim Admin</label>
                      <label className="radio-label"><input type="radio" name="adminType" value="ServiceAdmin" checked={form.adminType === 'ServiceAdmin'} onChange={handleChange} /><span className="radio-custom"></span>Service Admin</label>
                      <label className="radio-label"><input type="radio" name="adminType" value="StoreAdmin" checked={form.adminType === 'StoreAdmin'} onChange={handleChange} /><span className="radio-custom"></span>Store Admin</label>
                      <label className="radio-label"><input type="radio" name="adminType" value="SupportAdmin" checked={form.adminType === 'SupportAdmin'} onChange={handleChange} /><span className="radio-custom"></span>Support Admin</label>
                    </div>
                  </div>
                  
                  <div className="field">
                    <label>Department</label>
                    <input type="text" name="department" placeholder="Enter Department" value={form.department} onChange={handleChange} />
                  </div>
                </>
              )}

              {/* Notes */}
              <div className="section-title">Notes</div>
              <div className="field full-width">
                <label>Notes</label>
                <textarea name="notes" placeholder="Additional notes" value={form.notes} onChange={handleChange}></textarea>
              </div>

              {/* Submit */}
              <div className="full-width">
                <button type="submit" className="btn btn-submit" disabled={loading}>
                  {loading ? 'Saving Profile...' : 'Save Profile'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminForm;
