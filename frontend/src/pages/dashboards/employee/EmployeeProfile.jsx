import { useState, useEffect, useRef, useCallback } from 'react';
import {
  User, Mail, Phone, Briefcase, Key, Shield, Calendar, Activity,
  Camera, Loader2, CheckCircle2, AlertTriangle, Ticket, CheckSquare, Clock
} from 'lucide-react';
import api from '../../../services/api';

const CSS = `
  .ep-page { display: block; padding-bottom: 40px; }
  .ep-topbar { padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--card);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }
  .ep-body { padding: 32px; max-width: 1200px; margin: 0 auto; display: grid; gap: 24px;
    grid-template-columns: 350px 1fr; }
    
  @media (max-width: 900px) {
    .ep-body { grid-template-columns: 1fr; }
  }

  .ep-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
  
  .ep-section-title { font-size: 15px; font-weight: 800; color: var(--text);
    display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding-bottom: 12px;
    border-bottom: 1px solid var(--border); }
    
  .ep-avatar-container { position: relative; width: 120px; height: 120px; margin: 0 auto 20px; }
  .ep-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
    border: 4px solid var(--bg); box-shadow: 0 4px 16px rgba(0,0,0,0.1); background: var(--bg-secondary); }
  .ep-avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s; cursor: pointer; color: #fff; flex-direction: column; gap: 4px; }
  .ep-avatar-container:hover .ep-avatar-overlay { opacity: 1; }
  
  .ep-input-group { margin-bottom: 16px; }
  .ep-label { display: block; font-size: 12.5px; font-weight: 700; color: var(--text-muted);
    margin-bottom: 6px; letter-spacing: 0.3px; }
  .ep-input { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text); font-size: 14px; transition: all 0.2s; font-family: inherit; }
  .ep-input:focus { border-color: var(--accent-green); outline: none; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
  .ep-input:disabled { opacity: 0.7; cursor: not-allowed; background: var(--bg-secondary); }
  
  .ep-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer;
    font-family: inherit; border: none; transition: all 0.2s; width: 100%; }
  .ep-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
  .ep-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ep-btn-green { background: linear-gradient(135deg,#059669,#10b981); color: #fff; }
  
  .ep-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .ep-stat-box { background: var(--bg); border: 1px solid var(--border); border-radius: 12px;
    padding: 16px; text-align: center; }
  
  .ep-alert { padding: 12px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 600;
    display: flex; align-items: center; gap: 10px; margin-bottom: 20px; animation: slideDown 0.3s ease; }
  .ep-alert.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #16a34a; }
  .ep-alert.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #dc2626; }
  
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfileAndStats = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        api.get('/users/employee/profile'),
        api.get('/dashboard/employee')
      ]);
      
      const p = profileRes.data;
      setProfile(p);
      setStats(statsRes.data);
      setFormData(prev => ({ ...prev, email: p.email || '', phone: p.phone || '' }));
      if (p.profilePicture) {
        setAvatarPreview(`https://myclaimportal.onrender.com${p.profilePicture}`);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showNotification('error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndStats();
  }, [fetchProfileAndStats]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        return showNotification('error', 'Current password is required to set a new password.');
      }
      if (formData.newPassword !== formData.confirmPassword) {
        return showNotification('error', 'New passwords do not match.');
      }
      if (formData.newPassword.length < 6) {
        return showNotification('error', 'Password must be at least 6 characters.');
      }
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      if (formData.newPassword) {
        form.append('currentPassword', formData.currentPassword);
        form.append('newPassword', formData.newPassword);
      }
      if (avatarFile) {
        form.append('avatar', avatarFile);
      }

      const { data } = await api.patch('/users/employee/profile', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(data);
      if (data.profilePicture) {
        setAvatarPreview(`https://myclaimportal.onrender.com${data.profilePicture}`);
      }
      
      // Clear password fields on success
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      showNotification('success', 'Profile updated successfully!');
      setAvatarFile(null);
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page active" style={{ padding: 60, textAlign: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-green)', margin: '0 auto' }} />
        <div style={{ marginTop: 12, color: 'var(--text-muted)' }}>Loading your profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const totalAssigned = stats?.assignedTickets || 0;
  const completed = stats?.completedTasks || 0;
  const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

  return (
    <div className="page active ep-page">
      <style>{CSS}</style>

      {/* Topbar */}
      <div className="ep-topbar">
        <div>
          <div style={{ fontSize: 22, fontWeight: 850, color: 'var(--text)', letterSpacing: '-0.5px' }}>My Profile</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Manage your personal information and security settings
          </div>
        </div>
      </div>

      <div className="ep-body">
        
        {/* Left Column: Summary & Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="ep-card" style={{ textAlign: 'center' }}>
            <div className="ep-avatar-container" onClick={() => fileInputRef.current?.click()}>
              <img src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=22c55e&color=fff&size=150`} alt="Profile" className="ep-avatar" />
              <div className="ep-avatar-overlay">
                <Camera size={24} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Change</span>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} />
            </div>
            
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>{profile.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12 }}>
              {profile.designation || 'Employee'} &bull; {profile.department || 'Operations'}
            </div>
            
            <span style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)', borderRadius: 20, fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
              {profile.role.replace('_', ' ')}
            </span>
          </div>

          {/* Work Summary Stats */}
          <div className="ep-card">
            <h3 className="ep-section-title"><Activity size={18} color="var(--blue)" /> Work Summary</h3>
            <div className="ep-stat-grid">
              <div className="ep-stat-box">
                <Ticket size={18} color="var(--blue)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--text)', lineHeight: 1 }}>{totalAssigned}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>Assigned</div>
              </div>
              <div className="ep-stat-box">
                <CheckSquare size={18} color="var(--green)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--text)', lineHeight: 1 }}>{completed}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>Completed</div>
              </div>
              <div className="ep-stat-box">
                <Clock size={18} color="var(--orange)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--text)', lineHeight: 1 }}>{stats?.pendingTasks || 0}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>Pending</div>
              </div>
              <div className="ep-stat-box">
                <Activity size={18} color="#8b5cf6" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 24, fontWeight: 850, color: 'var(--text)', lineHeight: 1 }}>{completionRate}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase' }}>Win Rate</div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Right Column: Edit Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {notification.show && (
            <div className={`ep-alert ${notification.type}`}>
              {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Personal Information */}
            <div className="ep-card">
              <h3 className="ep-section-title"><User size={18} color="var(--green)" /> Personal Information</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="ep-input-group">
                  <label className="ep-label">Full Name (Read Only)</label>
                  <input className="ep-input" type="text" value={profile.name} disabled />
                </div>
                <div className="ep-input-group">
                  <label className="ep-label">Employee ID (Read Only)</label>
                  <input className="ep-input" type="text" value={profile.username || '—'} disabled />
                </div>
                <div className="ep-input-group">
                  <label className="ep-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }}/> Email Address</label>
                  <input className="ep-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="ep-input-group">
                  <label className="ep-label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }}/> Phone Number</label>
                  <input className="ep-input" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div className="ep-input-group">
                  <label className="ep-label"><Briefcase size={12} style={{ display: 'inline', marginRight: 4 }}/> Department (Read Only)</label>
                  <input className="ep-input" type="text" value={profile.department || '—'} disabled />
                </div>
                <div className="ep-input-group">
                  <label className="ep-label"><Calendar size={12} style={{ display: 'inline', marginRight: 4 }}/> Joining Date (Read Only)</label>
                  <input className="ep-input" type="text" value={new Date(profile.createdAt).toLocaleDateString()} disabled />
                </div>
              </div>
            </div>

            {/* Account & Security */}
            <div className="ep-card">
              <h3 className="ep-section-title"><Shield size={18} color="var(--orange)" /> Security & Password</h3>
              
              <div className="ep-input-group" style={{ marginBottom: 24 }}>
                <label className="ep-label">Account Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, color: 'var(--accent-green)', fontWeight: 700, fontSize: 13 }}>
                  <CheckCircle2 size={16} /> Active & Verified
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <div className="ep-input-group">
                  <label className="ep-label"><Key size={12} style={{ display: 'inline', marginRight: 4 }}/> Current Password (Required to change)</label>
                  <input className="ep-input" type="password" placeholder="Enter current password" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="ep-input-group">
                    <label className="ep-label">New Password</label>
                    <input className="ep-input" type="password" placeholder="New password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                  </div>
                  <div className="ep-input-group">
                    <label className="ep-label">Confirm New Password</label>
                    <input className="ep-input" type="password" placeholder="Confirm new password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="ep-btn ep-btn-green" disabled={saving} style={{ width: 'auto', padding: '14px 32px' }}>
                {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving Changes...</> : 'Save Profile Updates'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
