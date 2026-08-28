import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, ShoppingBag, Activity, ShieldCheck, 
  Search, RefreshCw, Trash2, CheckCircle, XCircle, LogOut, Plus, Server
} from 'lucide-react';
import { 
  getAdminStats, getSystemHealth, listAdminFarmers, createAdminFarmer, verifyFarmerById, 
  deleteFarmerById, listAdminSchemes, createAdminScheme, deleteAdminScheme, listAdminListings 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Admin.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [farmerSearch, setFarmerSearch] = useState('');
  
  // Modals
  const [newFarmerModal, setNewFarmerModal] = useState(false);
  const [newFarmerData, setNewFarmerData] = useState({
    kisanId: '',
    name: '',
    mobile: '',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    landHolding: '3.5',
    cropsGrown: 'wheat, mustard'
  });

  const [newSchemeModal, setNewSchemeModal] = useState(false);
  const [newSchemeData, setNewSchemeData] = useState({ schemeCode: '', title: '', description: '', benefitDetails: '' });

  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [statsRes, healthRes] = await Promise.all([getAdminStats(), getSystemHealth()]);
        setStats(statsRes.data?.stats);
        setHealth(healthRes.data);
      } else if (activeTab === 'farmers') {
        const farmersRes = await listAdminFarmers({ search: farmerSearch });
        setFarmers(farmersRes.data?.farmers || []);
      } else if (activeTab === 'schemes') {
        const schemesRes = await listAdminSchemes();
        setSchemes(schemesRes.data?.schemes || []);
      } else if (activeTab === 'listings') {
        const listingsRes = await listAdminListings();
        setListings(listingsRes.data?.listings || []);
      } else if (activeTab === 'telemetry') {
        const healthRes = await getSystemHealth();
        setHealth(healthRes.data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerVerify = async (id, currentStatus) => {
    try {
      await verifyFarmerById(id, !currentStatus);
      loadAllData();
    } catch (err) {
      alert('Verification update failed.');
    }
  };

  const handleFarmerDelete = async (id) => {
    if (!window.confirm('Delete farmer record permanently?')) return;
    try {
      await deleteFarmerById(id);
      loadAllData();
    } catch (err) {
      alert('Failed to delete farmer.');
    }
  };

  const handleCreateFarmer = async (e) => {
    e.preventDefault();
    try {
      await createAdminFarmer(newFarmerData);
      setNewFarmerModal(false);
      setNewFarmerData({
        kisanId: '', name: '', mobile: '', state: 'Uttar Pradesh', district: 'Lucknow', landHolding: '3.5', cropsGrown: 'wheat, mustard'
      });
      loadAllData();
      alert(`Kisan ID ${newFarmerData.kisanId} successfully registered in Admin Portal!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register Kisan ID.');
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try {
      await createAdminScheme(newSchemeData);
      setNewSchemeModal(false);
      setNewSchemeData({ schemeCode: '', title: '', description: '', benefitDetails: '' });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create scheme.');
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Delete scheme record?')) return;
    try {
      await deleteAdminScheme(id);
      loadAllData();
    } catch (err) {
      alert('Failed to delete scheme.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={styles.adminWrapper}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoBox}>ADMIN</div>
          <h1 className={styles.title}>Kisan Setu</h1>
        </div>

        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} /> System Overview
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'farmers' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('farmers')}
          >
            <Users size={16} /> Farmers Directory
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'schemes' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('schemes')}
          >
            <FileText size={16} /> Government Schemes
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'listings' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <ShoppingBag size={16} /> Crop Listings
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'telemetry' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('telemetry')}
          >
            <Server size={16} /> Health Telemetry
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <span>Operator: {admin?.name || 'Admin'}</span>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className={styles.mainContent}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <div className={styles.breadcrumb}>
            <span>Console</span> / <strong style={{ color: '#f8fafc' }}>{activeTab.toUpperCase()}</strong>
          </div>
          <div className={styles.topActions}>
            <div className={styles.statusIndicator}>
              <span className={styles.dot}></span>
              <span>API ONLINE (Port 5000)</span>
            </div>
            <button className={styles.actionBtn} onClick={loadAllData}>
              <RefreshCw size={13} /> Sync
            </button>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <div className={styles.bodyArea}>
          {activeTab === 'overview' && (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Total Farmers</p>
                  <h3 className={styles.statValue}>{stats?.totalFarmers ?? '—'}</h3>
                  <p className={styles.statMeta}>Registered on AgriStack</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Verified Farmers</p>
                  <h3 className={styles.statValue}>{stats?.verifiedFarmers ?? '—'}</h3>
                  <p className={styles.statMeta}>{stats?.unverifiedFarmers ?? 0} Pending Verification</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Active Schemes</p>
                  <h3 className={styles.statValue}>{stats?.totalSchemes ?? '—'}</h3>
                  <p className={styles.statMeta}>Government Registry</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Crop Listings</p>
                  <h3 className={styles.statValue}>{stats?.totalListings ?? '—'}</h3>
                  <p className={styles.statMeta}>Marketplace Activity</p>
                </div>
              </div>

              {/* Recent Farmers Panel */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>Recently Registered Farmers</h2>
                </div>
                <div className={styles.tableContainer}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Kisan ID</th>
                        <th>Name</th>
                        <th>State</th>
                        <th>District</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentFarmers?.map(f => (
                        <tr key={f._id}>
                          <td style={{ fontFamily: 'monospace' }}>{f.kisanId}</td>
                          <td>{f.name}</td>
                          <td>{f.state}</td>
                          <td>{f.district}</td>
                          <td>
                            <span className={f.profileVerified ? styles.badgeSuccess : styles.badgeWarning}>
                              {f.profileVerified ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!stats?.recentFarmers || stats.recentFarmers.length === 0) && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No recent records</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'farmers' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Farmer Database Management</h2>
                <button 
                  className={styles.primaryBtn} 
                  style={{ width: 'auto', padding: '4px 12px' }} 
                  onClick={() => setNewFarmerModal(true)}
                >
                  <Plus size={14} /> Register Kisan ID +
                </button>
              </div>

              {/* Add Kisan ID / Farmer Modal Form */}
              {newFarmerModal && (
                <div style={{ padding: '16px', backgroundColor: '#0d1322', borderBottom: '1px solid #1f2937' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#f8fafc' }}>Register New Kisan ID & Farmer Record</h3>
                  <form onSubmit={handleCreateFarmer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <input 
                      type="text" placeholder="Kisan ID (e.g. KISAN777)" className={styles.darkInput} required
                      value={newFarmerData.kisanId} onChange={(e) => setNewFarmerData({...newFarmerData, kisanId: e.target.value.toUpperCase()})}
                    />
                    <input 
                      type="text" placeholder="Farmer Full Name" className={styles.darkInput} required
                      value={newFarmerData.name} onChange={(e) => setNewFarmerData({...newFarmerData, name: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Mobile Number (10-digit)" className={styles.darkInput} required
                      value={newFarmerData.mobile} onChange={(e) => setNewFarmerData({...newFarmerData, mobile: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="State" className={styles.darkInput} required
                      value={newFarmerData.state} onChange={(e) => setNewFarmerData({...newFarmerData, state: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="District" className={styles.darkInput} required
                      value={newFarmerData.district} onChange={(e) => setNewFarmerData({...newFarmerData, district: e.target.value})}
                    />
                    <input 
                      type="number" step="0.1" placeholder="Land Holding (Ha)" className={styles.darkInput} required
                      value={newFarmerData.landHolding} onChange={(e) => setNewFarmerData({...newFarmerData, landHolding: e.target.value})}
                    />
                    <div style={{ gridColumn: 'span 3', display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>Save Kisan ID Record</button>
                      <button type="button" className={styles.actionBtn} onClick={() => setNewFarmerModal(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className={styles.filterRow}>
                <input 
                  type="text"
                  placeholder="Search by Kisan ID, Name, or Mobile..."
                  className={styles.darkInput}
                  style={{ width: '300px' }}
                  value={farmerSearch}
                  onChange={(e) => setFarmerSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadAllData()}
                />
                <button className={styles.actionBtn} onClick={loadAllData}>
                  <Search size={13} /> Filter
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Kisan ID</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Location</th>
                      <th>Land Holding</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmers.map(f => (
                      <tr key={f._id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{f.kisanId}</td>
                        <td>{f.name}</td>
                        <td>{f.mobile}</td>
                        <td>{f.district}, {f.state}</td>
                        <td>{f.landHolding ? `${f.landHolding} Ha` : '—'}</td>
                        <td>
                          <span className={f.profileVerified ? styles.badgeSuccess : styles.badgeWarning}>
                            {f.profileVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              className={styles.actionBtn} 
                              onClick={() => handleFarmerVerify(f._id, f.profileVerified)}
                            >
                              {f.profileVerified ? <XCircle size={12} /> : <CheckCircle size={12} />}
                              {f.profileVerified ? 'Unverify' : 'Verify'}
                            </button>
                            <button 
                              className={styles.actionBtnDanger}
                              onClick={() => handleFarmerDelete(f._id)}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {farmers.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#64748b' }}>No farmers found matching query</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'schemes' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Government Schemes Registry</h2>
                <button className={styles.primaryBtn} style={{ width: 'auto', padding: '4px 12px' }} onClick={() => setNewSchemeModal(true)}>
                  <Plus size={14} /> Add Scheme
                </button>
              </div>

              {newSchemeModal && (
                <div style={{ padding: '16px', backgroundColor: '#0d1322', borderBottom: '1px solid #1f2937' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#f8fafc' }}>Create New Scheme</h3>
                  <form onSubmit={handleCreateScheme} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input 
                      type="text" placeholder="Scheme Code (e.g. PM-KISAN)" className={styles.darkInput} required
                      value={newSchemeData.schemeCode} onChange={(e) => setNewSchemeData({...newSchemeData, schemeCode: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Title" className={styles.darkInput} required
                      value={newSchemeData.title} onChange={(e) => setNewSchemeData({...newSchemeData, title: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Description" className={styles.darkInput} required
                      value={newSchemeData.description} onChange={(e) => setNewSchemeData({...newSchemeData, description: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Benefits (e.g. ₹6000/yr)" className={styles.darkInput} required
                      value={newSchemeData.benefitDetails} onChange={(e) => setNewSchemeData({...newSchemeData, benefitDetails: e.target.value})}
                    />
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px' }}>
                      <button type="submit" className={styles.primaryBtn} style={{ width: 'auto' }}>Save Scheme</button>
                      <button type="button" className={styles.actionBtn} onClick={() => setNewSchemeModal(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Benefits</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map(s => (
                      <tr key={s._id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{s.schemeCode}</td>
                        <td>{s.title || s.name}</td>
                        <td>{s.description}</td>
                        <td>{s.benefitDetails || s.benefits}</td>
                        <td>
                          <button className={styles.actionBtnDanger} onClick={() => handleDeleteScheme(s._id)}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {schemes.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>No schemes registered</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Marketplace Crop Listings</h2>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Crop Type</th>
                      <th>Farmer Name</th>
                      <th>Quantity</th>
                      <th>Price / Qtl</th>
                      <th>Mandi</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(l => (
                      <tr key={l._id}>
                        <td style={{ fontWeight: '600', textTransform: 'capitalize' }}>{l.cropType}</td>
                        <td>{l.farmerId?.name || 'Farmer'}</td>
                        <td>{l.quantity} Qtl</td>
                        <td>₹{l.pricePerQuintal}</td>
                        <td>{l.mandiName}</td>
                        <td>{l.district}, {l.state}</td>
                      </tr>
                    ))}
                    {listings.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b' }}>No marketplace listings</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Backend System Telemetry & Health</h2>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Database Status</p>
                  <h3 className={styles.statValue} style={{ color: health?.db === 'connected' ? '#10b981' : '#f59e0b' }}>
                    {health?.db?.toUpperCase() || 'UNKNOWN'}
                  </h3>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Process Uptime</p>
                  <h3 className={styles.statValue}>{health?.uptime ? `${Math.floor(health.uptime)} sec` : '—'}</h3>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Node Version</p>
                  <h3 className={styles.statValue}>{health?.nodeVersion || 'v20'}</h3>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Platform OS</p>
                  <h3 className={styles.statValue}>{health?.platform?.toUpperCase() || 'WIN32'}</h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
