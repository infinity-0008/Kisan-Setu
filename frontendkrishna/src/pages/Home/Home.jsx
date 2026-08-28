import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, FileText, Store, TrendingUp, Cpu, CloudLightning, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { farmer, syncProfile } = useAuth();

  const handleSync = async () => {
    try {
      await syncProfile();
      alert('AgriStack Profile data updated!');
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = farmer?.name ? `${farmer.name}` : 'Kisan Ji';
  const displayLocation = farmer?.district && farmer?.state 
    ? `${farmer.district}, ${farmer.state}` 
    : 'India';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
              {displayName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className={styles.greeting}>Namaste, {displayName}! 🙏</h1>
            <p className={styles.location}>📍 {displayLocation}</p>
          </div>
        </div>
        <div>
          <button 
            className={styles.notificationBtn} 
            title="AgriStack Sync"
            onClick={handleSync}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* AI Assistant Banner */}
        <button 
          className={styles.aiBanner}
          onClick={() => navigate('/chat')}
        >
          <div className={styles.aiContent}>
            <h2 className={styles.aiTitle}>Bolkar Pucho! 🤖</h2>
            <p className={styles.aiSubtitle}>Ask Kisan Setu AI anything about farming, crops, or loans.</p>
          </div>
          <div className={styles.micIconWrapper}>
            <Mic size={24} color="var(--primary)" />
          </div>
        </button>

        {/* Quick Actions Grid */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Zaruri Kaam</h3>
          <div className={styles.grid}>
            <button className={styles.gridItem} onClick={() => navigate('/schemes')}>
              <FileText size={24} className={styles.iconGreen} />
              <span>Yojnayein Dekho</span>
            </button>
            <button className={styles.gridItem} onClick={() => navigate('/sell')}>
              <Store size={24} className={styles.iconGreen} />
              <span>Fasal Becho</span>
            </button>
            <button className={styles.gridItem} onClick={() => navigate('/mandi-bhav')}>
              <TrendingUp size={24} className={styles.iconGreen} />
              <span>Mandi Bhav</span>
            </button>
            <button className={styles.gridItem} onClick={() => navigate('/chat')}>
              <Cpu size={24} className={styles.iconGreen} />
              <span>AI Saathi</span>
            </button>
          </div>
        </div>

        {/* Personalized Updates */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Aapke Khet Ke Liye</h3>
          <div className={styles.cardsScroll}>
            <div className={styles.updateCard}>
              <div className={styles.cardHeader}>
                <CloudLightning size={24} className={styles.iconWarning} />
                <span className={styles.cardTagWarning}>Mausam Alert</span>
              </div>
              <h4 className={styles.cardTitle}>Kal Tez Baarish 🌧️</h4>
              <p className={styles.cardDesc}>Gehun sukhane mein deri karein.</p>
            </div>
            
            <div className={styles.updateCard}>
              <div className={styles.cardHeader}>
                <ShieldCheck size={24} className={styles.iconPrimary} />
                <span className={styles.cardTagPrimary}>PM Scheme</span>
              </div>
              <h4 className={styles.cardTitle}>PM-KISAN Status</h4>
              <p className={styles.cardDesc}>
                {farmer?.beneficiaryStatus?.pmKisan ? 'Beneficiary Verified ✓' : 'Kist status check karein.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
