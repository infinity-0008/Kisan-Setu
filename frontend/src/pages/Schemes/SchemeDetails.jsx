import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import Button from '../../components/Button/Button';
import { getSchemeByCode, applyForScheme } from '../../services/api';
import styles from './Schemes.module.css';

const SchemeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await getSchemeByCode(id);
      if (res.data?.scheme) {
        setScheme(res.data.scheme);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await applyForScheme(id);
      setApplied(true);
      alert('Scheme aavedan safaltapoorvak jama kar diya gaya hai!');
    } catch (err) {
      alert(err.response?.data?.message || 'Aavedan mein truti aayi.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.detailsContainer}>
        <TopAppBar showBack={true} />
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p>Scheme details loading...</p>
        </div>
      </div>
    );
  }

  const title = scheme?.title || scheme?.name || id;
  const benefits = Array.isArray(scheme?.benefits) ? scheme.benefits : [scheme?.benefitDetails || 'Sarkari labh aur sasti vyaj dar.'];
  const eligibility = Array.isArray(scheme?.eligibilityCriteria) ? scheme.eligibilityCriteria : ['AgriStack Verified Kisan Profile', 'Zameen Khet Dastaavez'];

  return (
    <div className={styles.detailsContainer}>
      <TopAppBar showBack={true} />
      
      <div className={styles.detailsContent}>
        <div className={styles.headerSection}>
          <h1 className={styles.detailsTitle}>{title}</h1>
          <p className={styles.detailsSubtitle}>{scheme?.department || 'Sarkari Yojna • Ministry of Agriculture'}</p>
          
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>Sthiti (Status):</span>
            <span className={styles.statusBadge}>{applied ? 'Applied ✓' : 'Aavedan Hetu Upyukt'}</span>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2 className={styles.sectionHeading}>Fayde (Benefits) 💰</h2>
          <ul className={styles.bulletList}>
            {benefits.map((b, i) => (
              <li key={i}>{typeof b === 'string' ? b : JSON.stringify(b)}</li>
            ))}
          </ul>
        </div>

        <div className={styles.infoSection}>
          <h2 className={styles.sectionHeading}>Kriteriya (Eligibility) ✓</h2>
          <ul className={styles.checkList}>
            {eligibility.map((item, i) => (
              <li key={i}>
                <Check size={16} color="var(--primary)" className={styles.checkIcon} />
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.fixedBottom}>
        <Button fullWidth onClick={handleApply} disabled={applying || applied}>
          {applying ? 'Aavedan Ho Raha Hai...' : applied ? 'Aavedan Jama Ho Gaya ✓' : <>Abhi Apply Karo <ArrowRight size={20} /></>}
        </Button>
      </div>
    </div>
  );
};

export default SchemeDetails;
