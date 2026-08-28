import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import { getAllSchemes } from '../../services/api';
import styles from './Schemes.module.css';

const SchemesList = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await getAllSchemes();
      if (res.data?.schemes) {
        setSchemes(res.data.schemes);
      }
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(s => {
    if (activeTab === 'eligible') return s.isEligible !== false;
    if (activeTab === 'loan') return s.category === 'credit' || s.schemeCode?.toLowerCase().includes('kcc');
    return true;
  });

  return (
    <div className={styles.container}>
      <TopAppBar title="Sarkari Yojnayein 📋" />
      
      <div className={styles.tabsContainer}>
        <div className={styles.tabsScroll}>
          <button 
            className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Sabhi (All)
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'eligible' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('eligible')}
          >
            Eligible ✓
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'loan' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('loan')}
          >
            Loan
          </button>
        </div>
      </div>

      <div className={styles.listContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" style={{ marginBottom: '8px' }} />
            <p>Loading schemes from backend...</p>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            Koi scheme nahi mili.
          </div>
        ) : (
          filteredSchemes.map(scheme => (
            <div 
              key={scheme._id || scheme.schemeCode} 
              className={styles.schemeCard}
              onClick={() => navigate(`/schemes/${scheme.schemeCode}`)}
            >
              <div className={styles.cardIcon}>
                <FileText size={24} color="var(--primary)" />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{scheme.title || scheme.name}</h3>
                <p className={styles.cardDesc}>{scheme.description}</p>
                <p className={styles.cardHighlight}>{scheme.benefitDetails || scheme.benefits}</p>
              </div>
              <div className={styles.cardRight}>
                <span className={`${styles.tag} ${styles[`tag-${scheme.isEligible ? 'success' : 'warning'}`]}`}>
                  {scheme.isEligible ? 'Eligible ✓' : 'Aavedan Karein'}
                </span>
                <ChevronRight size={20} color="var(--text-tertiary)" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SchemesList;
