import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import Button from '../../components/Button/Button';
import { getMandiPrices } from '../../services/api';
import styles from './Marketplace.module.css';

const MandiBhav = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cropType = searchParams.get('crop') || 'wheat';

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mspInfo, setMspInfo] = useState(null);

  useEffect(() => {
    fetchPrices();
  }, [cropType]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await getMandiPrices(cropType);
      if (res.data?.mandiPrices) {
        setRates(res.data.mandiPrices);
      }
      if (res.data?.msp) {
        setMspInfo(res.data.msp);
      }
    } catch (err) {
      console.error(err);
      // Fallback display
      setRates([
        { mandiName: 'Lucknow Mandi', distanceKm: 12, modalPrice: 2520, trend: 'up', isBest: true },
        { mandiName: 'Sitapur Mandi', distanceKm: 24, modalPrice: 2490, trend: 'down', isBest: false },
        { mandiName: 'Hardoi Mandi', distanceKm: 8, modalPrice: 2450, trend: 'up', isBest: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <TopAppBar title="Mandi Bhav Comparison 📊" showBack={true} />
      
      <div className={styles.content}>
        <div className={styles.maalDetail}>
          <span className={styles.maalLabel}>Selected Crop:</span>
          <span className={styles.maalValue}>{cropType.toUpperCase()} {mspInfo ? `(MSP: ₹${mspInfo}/qtl)` : ''}</span>
        </div>

        <h3 className={styles.sectionTitle}>Aapke Aas-Paas Ki Mandi Rate</h3>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <p>Mandi rates loading...</p>
          </div>
        ) : (
          <div className={styles.rateList}>
            {rates.map((rate, i) => (
              <div key={i} className={`${styles.rateCard} ${rate.isBest ? styles.rateCardBest : ''}`}>
                {rate.isBest && (
                  <div className={styles.bestDealBadge}>
                    ⭐ Best Deal! {rate.mandiName} — ₹{rate.modalPrice || rate.price}/quintal
                  </div>
                )}
                <div className={styles.rateContent}>
                  <div className={styles.rateLeft}>
                    <h4 className={styles.mandiName}>{rate.mandiName || rate.name} 🏢</h4>
                    <p className={styles.mandiDistance}>🚗 {rate.distanceKm || rate.distance || '10'} km</p>
                  </div>
                  <div className={styles.rateRight}>
                    <span className={styles.price}>₹{rate.modalPrice || rate.price}</span>
                    {rate.trend === 'up' ? 
                      <ArrowUp size={20} className={styles.trendUp} /> : 
                      <ArrowDown size={20} className={styles.trendDown} />
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.fixedBottom}>
        <Button fullWidth onClick={() => navigate('/sell')}>
          Is Mandi Mein Becho →
        </Button>
      </div>
    </div>
  );
};

export default MandiBhav;
