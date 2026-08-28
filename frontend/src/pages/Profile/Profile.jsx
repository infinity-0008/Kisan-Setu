import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw, LogOut } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const { farmer, logout, syncProfile } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncProfile();
      alert('AgriStack registry data synced successfully!');
    } catch (err) {
      alert('AgriStack sync mein samasya aayi.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const name = farmer?.name || 'Ramlal Singh';
  const kisanId = farmer?.kisanId || 'KISAN123456';
  const mobile = farmer?.mobile || '+91 98765 43210';
  const landHolding = farmer?.landHolding ? `${farmer.landHolding} Hectare` : '5 Bigha';
  const crops = farmer?.cropsGrown ? farmer.cropsGrown.join(', ') : 'Gehun, Dhaan';

  return (
    <div className={styles.container}>
      <TopAppBar 
        title="Meri Profile 👤" 
        showBack={true}
      />

      <div className={styles.content}>
        <div className={styles.headerCard}>
          <div className={styles.avatarLarge}>
            <span className={styles.avatarInitials}>{name.slice(0, 2).toUpperCase()}</span>
            <div className={styles.verifiedIcon}>✓</div>
          </div>
          <h2 className={styles.userName}>{name}</h2>
          <p className={styles.userType}>AgriStack Verified Kisan ✓</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>AgriStack Registry Details</h3>
          <div className={styles.detailsCard}>
            <div className={styles.detailItem}>
              <div className={styles.detailLeft}>
                <p className={styles.detailLabel}>Kisan ID Number</p>
                <p className={styles.detailValue}>{kisanId}</p>
              </div>
              <span className={styles.statusVerified}>Verified ✓</span>
            </div>
            
            <div className={styles.detailItem}>
              <div className={styles.detailLeft}>
                <p className={styles.detailLabel}>Mobile Number</p>
                <p className={styles.detailValue}>{mobile}</p>
              </div>
              <span className={styles.statusVerified}>Verified ✓</span>
            </div>
            
            <div className={styles.detailItem}>
              <div className={styles.detailLeft}>
                <p className={styles.detailLabel}>Zameen Holding (Land)</p>
                <p className={styles.detailValue}>{landHolding}</p>
              </div>
              <span className={styles.statusVerified}>Verified ✓</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Fasal & Yojna Sthiti</h3>
          <div className={styles.detailsCard}>
            <div className={styles.simpleDetailItem}>
              <p className={styles.detailLabel}>Registered Crops</p>
              <p className={styles.detailValue}>{crops}</p>
            </div>
            <div className={styles.simpleDetailItem}>
              <p className={styles.detailLabel}>PM-KISAN Beneficiary</p>
              <p className={styles.detailValue}>
                {farmer?.beneficiaryStatus?.pmKisan ? 'Active (Eligible ✓)' : 'Check Required'}
              </p>
            </div>
            <div className={styles.simpleDetailItem}>
              <p className={styles.detailLabel}>KCC Account</p>
              <p className={styles.detailValue}>
                {farmer?.beneficiaryStatus?.kcc ? 'Linked (Eligible ✓)' : 'Not Linked'}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actions} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button fullWidth onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : <>AgriStack Data Sync Karo <RefreshCw size={18} /></>}
          </Button>
          <Button fullWidth onClick={handleLogout} variant="outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
            Logout <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
