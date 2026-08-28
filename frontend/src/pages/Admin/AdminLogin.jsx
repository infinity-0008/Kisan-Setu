import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { adminLogin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('kisan2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setLoading(true);
      setError('');
      const res = await adminLogin(username, password);
      if (res.data?.token && res.data?.admin) {
        loginAdmin(res.data.token, res.data.admin);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div className={styles.logoBox}>ADMIN</div>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Kisan Setu Console</span>
        </div>

        <h1 className={styles.loginTitle}>System Administrator Login</h1>
        <p className={styles.loginSubtitle}>Access control and operations portal</p>

        {error && (
          <div style={{
            backgroundColor: '#450a0a',
            border: '1px solid #7f1d1d',
            color: '#fca5a5',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Username</label>
            <input 
              type="text" 
              className={styles.darkInput}
              style={{ width: '100%', boxSizing: 'border-box' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Password</label>
            <input 
              type="password" 
              className={styles.darkInput}
              style={{ width: '100%', boxSizing: 'border-box' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ margin: '12px 0 20px 0', fontSize: '11px', color: '#64748b' }}>
            <span>Default Dev Credentials: <code>admin</code> / <code>kisan2026</code></span>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Console →'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1f2937', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>
            ← Return to Farmer Mobile Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
