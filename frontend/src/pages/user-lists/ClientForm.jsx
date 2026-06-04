import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, AlertCircle, CheckCircle,
  ChevronRight, ChevronLeft, X,
  User, Shield, Users, Calendar, MapPin, FileText, Upload, Link as LinkIcon
} from 'lucide-react';
import api from '../../services/api';

const ClientForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

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
    relation: 'Direct', relationWithHolder: '',
    // Step 6
    reference: 'Indirect', referenceName: '', referenceMobileNo: '', referredById: '',
    // Step 7
    nomineeName: '', nomineeAge: '', nomineeDob: '', nomineeRelation: '',
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
    const { name, value } = e.target;
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
        .cf-input { padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13.5px; color: var(--text); background: var(--bg); outline: none; transition: 0.2s; width: 100%; box-sizing: border-box; font-family: inherit; }
        .cf-input:focus { border-color: var(--blue, #10b981); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.07); background: var(--card); }
        .cf-select { padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13.5px; color: var(--text); background: var(--bg); outline: none; width: 100%; font-family: inherit; cursor: pointer; }
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
                  </div>
                </>
              )}

              {/* STEP 4 — Identification */}
              {stepId === 4 && (
                <>
                  <div className="cf-section">STEP 4: IDENTIFICATION DOCUMENTS</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">Aadhar Number</label><input name="aadharNo" className="cf-input" placeholder="1234 5678 9012" value={form.aadharNo} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">PAN Number</label><input name="panNo" className="cf-input" placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} value={form.panNo} onChange={handleChange} /></div>
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
                    <div className="cf-group"><label className="cf-label">Relationship Type</label><select name="relation" className="cf-select" value={form.relation} onChange={handleChange}><option value="Direct">Direct</option><option value="Indirect">Indirect</option></select></div>
                    <div className="cf-group"><label className="cf-label">Relation with Holder</label><input name="relationWithHolder" className="cf-input" placeholder="Son, Daughter, Self…" value={form.relationWithHolder} onChange={handleChange} /></div>
                  </div>
                </>
              )}

              {/* STEP 6 — Reference */}
              {stepId === 6 && (
                <>
                  <div className="cf-section">STEP 6: REFERENCE DETAILS</div>
                  <div className="cf-grid">
                    <div className="cf-group"><label className="cf-label">Reference Type</label><select name="reference" className="cf-select" value={form.reference} onChange={handleChange}><option value="Indirect">Indirect</option><option value="Direct">Direct</option></select></div>
                    <div className="cf-group"><label className="cf-label">Reference Name</label><input name="referenceName" className="cf-input" value={form.referenceName} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Reference Mobile</label><input name="referenceMobileNo" className="cf-input" value={form.referenceMobileNo} onChange={handleChange} /></div>
                    <div className="cf-group"><label className="cf-label">Internal Referral ID</label><input name="referredById" className="cf-input" placeholder="MC1234" value={form.referredById} onChange={handleChange} /></div>
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
                    <div className="cf-group"><label className="cf-label">Nominee Relation</label><input name="nomineeRelation" className="cf-input" placeholder="Spouse, Child…" value={form.nomineeRelation} onChange={handleChange} /></div>
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
