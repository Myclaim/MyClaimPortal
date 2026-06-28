import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const SuperPartnerForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Combined state
  const [formData, setFormData] = useState({
    // Account Details
    companyName: '', logo: null,
    businessType: '', username: '',
    password: '', dateOfCommencement: '',
    deadline: '', partnerAgreement: null,
    website: '',

    // Company Info
    directorDetails: '', cin: '',
    llpin: '', gstin: '',
    urn: '', frn: '',
    pan: '', tan: '',
    gstinCert: null, panCard: null,
    tanCert: null, govLicense: null,
    otherDoc: null, otherDocDesc: '',
    country: 'India', state: '',
    hqCity: '', hqAddress: '',
    pinCode: '', landline: '',
    mobile: '', email: '',
    myClaimEmail: '', branches: '',

    // Responsible Person Details
    personName: '', dob: '',
    gender: 'Male', aadharCard: null,
    aadharNumber: '', companyIdCard: null,
    designation: '', personEmail: '',
    personMobile: '', mobileAlt: '',
    notes: '', status: 'Active',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(p => ({ ...p, [name]: files ? files[0] : value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      if (!formData.username || !formData.password || !formData.companyName) {
        throw new Error('Company Name, Username and Password are required.');
      }
      const payload = {
        role: 'super_partner',
        name: formData.personName || formData.companyName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.mobile,
        companyName: formData.companyName,
        businessType: formData.businessType,
        website: formData.website,
        deadline: formData.deadline,
        dateOfCommencement: formData.dateOfCommencement,
        gstin: formData.gstin,
        pan: formData.pan,
        tan: formData.tan,
        cin: formData.cin,
        llpin: formData.llpin,
        address: {
          country: formData.country,
          state: formData.state,
          city: formData.hqCity,
          pincode: formData.pinCode,
          permanentAddress: formData.hqAddress,
        },
        responsiblePerson: {
          name: formData.personName,
          dob: formData.dob,
          gender: formData.gender,
          aadharNumber: formData.aadharNumber,
          designation: formData.designation,
          email: formData.personEmail,
          mobile: formData.personMobile,
          mobileAlt: formData.mobileAlt,
          notes: formData.notes,
        },
        notes: formData.notes,
        status: formData.status.toLowerCase(),
      };
      await api.post('/users', payload);
      setSuccess('Super Partner registered successfully!');
<<<<<<< HEAD
      setTimeout(() => navigate(-1), 2000);
=======
      setTimeout(() => navigate(-1), 300);
>>>>>>> 9cb87025bea4640e9ef29ca9ba9501c3bb704586
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', background: 'var(--bg, #f8fafc)' }}>
      <style>{`
        .spf-wrap { max-width: 980px; margin: 0 auto; }
        .spf-card { background: var(--card, #fff); border-radius: 16px; box-shadow: 0 2px 12px rgba(91,110,245,0.08); padding: 36px 40px; border: 1px solid var(--border, #e2e8f0); }
        .spf-header-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: var(--text, #1e293b); margin-bottom: 6px; letter-spacing: -0.01em; }
        .spf-header-subtitle { font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text-muted, #64748b); margin-bottom: 24px; }
        .spf-divider { height: 1px; background: var(--border, #e2e8f0); margin: 24px -40px; }
        
        .spf-section-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--blue, #5b6ef5); margin-bottom: 16px; margin-top: 24px; }
        
        .spf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 28px; }
        .spf-full-width { grid-column: 1 / -1; }
        
        .spf-field { display: flex; flex-direction: column; gap: 6px; }
        .spf-field label { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--text-muted, #64748b); }
        .spf-req { color: #f43f5e; }
        
        .spf-input, .spf-select { width: 100%; padding: 10px 14px; border: 1.5px solid var(--border, #e2e8f0); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text, #1e293b); outline: none; transition: border-color 0.18s, box-shadow 0.18s, background 0.18s; background: var(--bg, #f8fafc); appearance: none; }
        .spf-input:focus, .spf-select:focus { border-color: var(--blue, #5b6ef5); box-shadow: 0 0 0 3px rgba(91,110,245,0.15); }
        .spf-input::placeholder { color: #b0b6cc; }
        
        .spf-pw-wrap { position: relative; }
        .spf-pw-wrap .spf-input { padding-right: 42px; }
        .spf-pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted, #64748b); padding: 2px; display: flex; align-items: center; }
        .spf-pw-toggle:hover { color: var(--blue, #5b6ef5); }
        
        .spf-select-wrap { position: relative; }
        .spf-select-wrap select { padding-right: 36px; cursor: pointer; }
        .spf-select-wrap::after { content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid var(--text-muted, #64748b); pointer-events: none; }
        
        .spf-file-wrapper { display: flex; align-items: center; border: 1.5px solid var(--border, #e2e8f0); border-radius: 10px; overflow: hidden; background: var(--bg, #f8fafc); transition: border-color 0.18s; min-height: 42px; }
        .spf-file-wrapper:focus-within { border-color: var(--blue, #5b6ef5); box-shadow: 0 0 0 3px rgba(91,110,245,0.15); }
        .spf-file-btn { background: #f1f5f9; border: none; border-right: 1.5px solid var(--border, #e2e8f0); padding: 9px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #000; cursor: pointer; white-space: nowrap; height: 100%; transition: background 0.15s; }
        .spf-file-btn:hover { background: #e2e8f0; }
        .spf-file-name { padding: 9px 12px; font-size: 13px; color: var(--text-muted, #64748b); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .spf-radio-group { display: flex; gap: 20px; flex-wrap: wrap; padding: 4px 0; }
        .spf-radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--text, #1e293b); user-select: none; }
        .spf-radio-label input[type="radio"] { display: none; }
        .spf-radio-dot { width: 18px; height: 18px; border: 2px solid var(--border, #e2e8f0); border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color 0.15s; }
        .spf-radio-label input[type="radio"]:checked ~ .spf-radio-dot { border-color: var(--blue, #5b6ef5); background: var(--blue, #5b6ef5); }
        .spf-radio-label input[type="radio"]:checked ~ .spf-radio-dot::after { content: ''; width: 6px; height: 6px; background: #fff; border-radius: 50%; }

        .spf-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; }
        .spf-step-indicator { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-muted, #64748b); }
        .spf-step-indicator span { color: var(--blue, #5b6ef5); }
        
        .spf-btn { padding: 10px 24px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.18s; border: none; letter-spacing: 0.01em; display: flex; align-items: center; gap: 8px; }
        .spf-btn-prev { background: #f8fafc; color: #cbd5e1; font-weight: 600; }
        .spf-btn-prev.active { background: #f1f5f9; color: #64748b; }
        .spf-btn-prev.active:hover { background: #e2e8f0; color: #475569; }
        
        .spf-btn-next { background: var(--blue, #5b6ef5); color: #fff; font-weight: 700; box-shadow: 0 4px 14px rgba(91,110,245,0.24); }
        .spf-btn-next:hover { background: #4f46e5; box-shadow: 0 6px 20px rgba(91,110,245,0.28); }
        
        .spf-alert { padding: 12px 16px; border-radius: 10px; margin-bottom: 24px; font-size: 14px; display: flex; gap: 10px; align-items: center; }
        .spf-alert-error { background: #fef2f2; color: #dc2626; }
        .spf-alert-success { background: #f0fdf4; color: #16a34a; }
      `}</style>

      <div className="spf-wrap">
        <div className="spf-card">
          {error && <div className="spf-alert spf-alert-error"><AlertCircle size={18} /> {error}</div>}
          {success && <div className="spf-alert spf-alert-success"><Check size={18} /> {success}</div>}

          {/* STEP 1: ACCOUNT DETAILS */}
          {step === 1 && (
            <div>
              <h2 className="spf-header-title">Account Details</h2>
              <p className="spf-header-subtitle">Set up your partner account credentials and agreement details.</p>

              <div className="spf-divider"></div>
              <div className="spf-section-title">BUSINESS INFORMATION</div>

              <div className="spf-grid">
                <div className="spf-field">
                  <label>Company Name <span className="spf-req">*</span></label>
                  <input name="companyName" className="spf-input" placeholder="Enter Company Name" value={formData.companyName} onChange={handleChange} />
                </div>

                <div className="spf-field">
                  <label>Logo</label>
                  <div className="spf-file-wrapper">
                    <button type="button" className="spf-file-btn" onClick={() => document.getElementById('logo').click()}>Choose File</button>
                    <span className="spf-file-name">{formData.logo?.name || 'No file chosen'}</span>
                    <input id="logo" type="file" name="logo" style={{ display: 'none' }} onChange={handleChange} />
                  </div>
                </div>

                <div className="spf-field">
                  <label>Business Type</label>
                  <div className="spf-select-wrap">
                    <select name="businessType" className="spf-select" value={formData.businessType} onChange={handleChange}>
                      <option value="">Select Business Type</option>
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">LLP</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                    </select>
                  </div>
                </div>

                <div className="spf-field">
                  <label>Username <span className="spf-req">*</span></label>
                  <input name="username" className="spf-input" placeholder="Enter Username" value={formData.username} onChange={handleChange} />
                </div>

                <div className="spf-field">
                  <label>Password <span className="spf-req">*</span></label>
                  <div className="spf-pw-wrap">
                    <input name="password" type={showPassword ? 'text' : 'password'} className="spf-input" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                    <button type="button" className="spf-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="spf-field">
                  <label>Date of Commencement</label>
                  <input name="dateOfCommencement" type="date" className="spf-input" value={formData.dateOfCommencement} onChange={handleChange} />
                </div>

                <div className="spf-field">
                  <label>Deadline</label>
                  <input name="deadline" type="date" className="spf-input" value={formData.deadline} onChange={handleChange} />
                </div>

                <div className="spf-field">
                  <label>Partner Agreement</label>
                  <div className="spf-file-wrapper">
                    <button type="button" className="spf-file-btn" onClick={() => document.getElementById('partnerAgreement').click()}>Choose File</button>
                    <span className="spf-file-name">{formData.partnerAgreement?.name || 'No file chosen'}</span>
                    <input id="partnerAgreement" type="file" name="partnerAgreement" style={{ display: 'none' }} onChange={handleChange} />
                  </div>
                </div>

                <div className="spf-field spf-full-width">
                  <label>Website</label>
                  <input name="website" className="spf-input" placeholder="www.example.com" value={formData.website} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COMPANY INFO */}
          {step === 2 && (
            <div>
              <h2 className="spf-header-title">Company Info</h2>
              <p className="spf-header-subtitle">Enter your company registration numbers, documents and contact details.</p>

              <div className="spf-divider"></div>
              <div className="spf-section-title">COMPANY CONTACT</div>

              <div className="spf-grid">
                <div className="spf-field">
                  <label>Company Email <span className="spf-req">*</span></label>
                  <input name="email" type="email" className="spf-input" placeholder="company@example.com" value={formData.email} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Company Phone <span className="spf-req">*</span></label>
                  <input name="mobile" className="spf-input" placeholder="Enter company phone number" value={formData.mobile} onChange={handleChange} />
                </div>
              </div>

              <div className="spf-divider"></div>
              <div className="spf-section-title">REGISTRATION NUMBERS</div>

              <div className="spf-grid">
                <div className="spf-field">
                  <label>Director Details</label>
                  <input name="directorDetails" className="spf-input" placeholder="Enter Director Details" value={formData.directorDetails} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>CIN</label>
                  <input name="cin" className="spf-input" placeholder="COMPANY IDENTIFICATION NUMBER" value={formData.cin} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>LLPIN</label>
                  <input name="llpin" className="spf-input" placeholder="LLP IDENTIFICATION NUMBER" value={formData.llpin} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>GSTIN</label>
                  <input name="gstin" className="spf-input" placeholder="GST IDENTIFICATION NUMBER" value={formData.gstin} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>URN</label>
                  <input name="urn" className="spf-input" placeholder="UNIQUE REFERENCE NUMBER" value={formData.urn} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>FRN</label>
                  <input name="frn" className="spf-input" placeholder="FIRM REGISTRATION NUMBER" value={formData.frn} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>PAN</label>
                  <input name="pan" className="spf-input" placeholder="PERMANENT ACCOUNT NUMBER" value={formData.pan} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>TAN</label>
                  <input name="tan" className="spf-input" placeholder="TAX DEDUCTION ACCOUNT NUMBER" value={formData.tan} onChange={handleChange} />
                </div>
              </div>

              <div className="spf-divider"></div>
              <div className="spf-section-title">DOCUMENT UPLOADS</div>

              <div className="spf-grid">
                {[
                  { id: 'gstinCert', label: 'GSTIN Certificate' },
                  { id: 'panCard', label: 'PAN Card' },
                  { id: 'tanCert', label: 'TAN Certificate' },
                  { id: 'govLicense', label: 'GOV License / Certificate' },
                  { id: 'otherDoc', label: 'Other Doc' },
                ].map(doc => (
                  <div className="spf-field" key={doc.id}>
                    <label>{doc.label}</label>
                    <div className="spf-file-wrapper">
                      <button type="button" className="spf-file-btn" onClick={() => document.getElementById(doc.id).click()}>Choose File</button>
                      <span className="spf-file-name">{formData[doc.id]?.name || 'No file chosen'}</span>
                      <input id={doc.id} type="file" name={doc.id} style={{ display: 'none' }} onChange={handleChange} />
                    </div>
                  </div>
                ))}

                <div className="spf-field">
                  <label>Other Doc Description</label>
                  <input name="otherDocDesc" className="spf-input" placeholder="Description for other documents" value={formData.otherDocDesc} onChange={handleChange} />
                </div>
              </div>

              <div className="spf-divider"></div>
              <div className="spf-section-title">LOCATION & CONTACT</div>

              <div className="spf-grid">
                <div className="spf-field">
                  <label>Country</label>
                  <input name="country" className="spf-input" placeholder="Enter Country" value={formData.country} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>State</label>
                  <input name="state" className="spf-input" placeholder="Enter State" value={formData.state} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Headquarter City</label>
                  <input name="hqCity" className="spf-input" placeholder="Enter City" value={formData.hqCity} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Headquarter Address</label>
                  <input name="hqAddress" className="spf-input" placeholder="Enter Address" value={formData.hqAddress} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Pin Code</label>
                  <input name="pinCode" className="spf-input" placeholder="Enter Pin Code" value={formData.pinCode} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Landline Contact</label>
                  <input name="landline" className="spf-input" placeholder="Enter Landline Number" value={formData.landline} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Mobile Contact <span className="spf-req">*</span></label>
                  <input name="personMobile" className="spf-input" placeholder="Enter Mobile Number" value={formData.personMobile} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Email <span className="spf-req">*</span></label>
                  <input name="personEmail" type="email" className="spf-input" placeholder="john.doe@email.com" value={formData.personEmail} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>MyClaim Email</label>
                  <input name="myClaimEmail" type="email" className="spf-input" placeholder="" value={formData.myClaimEmail} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>No. of Branches</label>
                  <input name="branches" type="number" className="spf-input" placeholder="" value={formData.branches} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESPONSIBLE PERSON DETAILS */}
          {step === 3 && (
            <div>
              <h2 className="spf-header-title">Responsible Person</h2>
              <p className="spf-header-subtitle">Details of the primary contact person.</p>

              <div className="spf-divider"></div>
              <div className="spf-section-title">PERSONAL INFO</div>

              <div className="spf-grid">
                <div className="spf-field">
                  <label>Name</label>
                  <input name="personName" className="spf-input" placeholder="Enter Name" value={formData.personName} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Date of Birth</label>
                  <input name="dob" type="date" className="spf-input" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Gender</label>
                  <div className="spf-radio-group">
                    {['Male', 'Female', 'Others'].map(g => (
                      <label key={g} className="spf-radio-label">
                        <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} />
                        <span className="spf-radio-dot"></span>{g}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="spf-field">
                  <label>Aadhaar Card</label>
                  <div className="spf-file-wrapper">
                    <button type="button" className="spf-file-btn" onClick={() => document.getElementById('aadharCard').click()}>Choose File</button>
                    <span className="spf-file-name">{formData.aadharCard?.name || 'No file chosen'}</span>
                    <input id="aadharCard" type="file" name="aadharCard" style={{ display: 'none' }} onChange={handleChange} />
                  </div>
                </div>
                <div className="spf-field">
                  <label>Aadhaar No.</label>
                  <input name="aadharNumber" className="spf-input" placeholder="XXXX XXXX XXXX" value={formData.aadharNumber} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Company ID Card</label>
                  <div className="spf-file-wrapper">
                    <button type="button" className="spf-file-btn" onClick={() => document.getElementById('companyIdCard').click()}>Choose File</button>
                    <span className="spf-file-name">{formData.companyIdCard?.name || 'No file chosen'}</span>
                    <input id="companyIdCard" type="file" name="companyIdCard" style={{ display: 'none' }} onChange={handleChange} />
                  </div>
                </div>
                <div className="spf-field">
                  <label>Designation / Department</label>
                  <input name="designation" className="spf-input" placeholder="e.g. MD / Operations" value={formData.designation} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Email</label>
                  <input name="personEmail" type="email" className="spf-input" placeholder="person@company.com" value={formData.personEmail} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Mobile Contact</label>
                  <input name="personMobile" className="spf-input" placeholder="+91 98765 43210" value={formData.personMobile} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Mobile Alt Contact</label>
                  <input name="mobileAlt" className="spf-input" placeholder="+91 98765 43210" value={formData.mobileAlt} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Notes</label>
                  <input name="notes" className="spf-input" placeholder="Additional notes" value={formData.notes} onChange={handleChange} />
                </div>
                <div className="spf-field">
                  <label>Status</label>
                  <div className="spf-select-wrap">
                    <select name="status" className="spf-select" value={formData.status} onChange={handleChange}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="spf-divider"></div>
          <div className="spf-footer">
            <button className={`spf-btn spf-btn-prev ${step > 1 ? 'active' : ''}`} onClick={step > 1 ? handlePrev : () => navigate(-1)}>
              &larr; {step > 1 ? 'Previous' : 'Cancel'}
            </button>

            <div className="spf-step-indicator">
              Step <span>{step}</span> of 3
            </div>

            {step < 3 ? (
              <button className="spf-btn spf-btn-next" onClick={handleNext}>
                Next &rarr;
              </button>
            ) : (
              <button className="spf-btn spf-btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Save & Submit'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperPartnerForm;
