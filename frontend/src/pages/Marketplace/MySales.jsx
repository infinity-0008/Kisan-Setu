import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Store, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import Button from '../../components/Button/Button';
import { getMyListings, getCropListings } from '../../services/api';
import styles from './Marketplace.module.css';

const MySales = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-listings');
  const [myListings, setMyListings] = useState([]);
  const [publicListings, setPublicListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      if (activeTab === 'my-listings') {
        const res = await getMyListings();
        if (res.data?.listings) {
          setMyListings(res.data.listings);
        }
      } else {
        const res = await getCropListings();
        if (res.data?.listings) {
          setPublicListings(res.data.listings);
        }
      }
    } catch (err) {
      console.error('Failed to load online listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayList = activeTab === 'my-listings' ? myListings : publicListings;

  return (
    <div className={styles.container}>
      <TopAppBar 
        title="Online Mandi Listings 🛒" 
        rightAction={
          <button onClick={fetchListings} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <RefreshCw size={20} color="var(--text-primary)" />
          </button>
        }
      />

      <div className={styles.content}>
        {/* Quick Stats Header */}
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Online Status</span>
            <span className={styles.statValueGreen}>Live 🟢</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Aapki Listings</span>
            <span className={styles.statValue}>{myListings.length} Listed</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Market Total</span>
            <span className={styles.statValue}>{publicListings.length || '12+'} Active</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsRow} style={{ marginBottom: '16px' }}>
          <button 
            className={`${styles.salesTab} ${activeTab === 'my-listings' ? styles.salesTabActive : ''}`}
            onClick={() => setActiveTab('my-listings')}
          >
            Meri Online Listings ({myListings.length})
          </button>
          <button 
            className={`${styles.salesTab} ${activeTab === 'all-market' ? styles.salesTabActive : ''}`}
            onClick={() => setActiveTab('all-market')}
          >
            Public Mandi Market
          </button>
        </div>

        {/* Add New Online Listing Banner Button */}
        <div style={{ marginBottom: '16px' }}>
          <Button fullWidth onClick={() => navigate('/sell')}>
            <Plus size={18} /> Nayi Fasal Online List Karein
          </Button>
        </div>

        {/* Listings Data Feed */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <p>Online Mandi data loading...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Store size={36} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Koi Online Listing Nahi Hai</h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              {activeTab === 'my-listings' 
                ? 'Aapne abhi tak koi fasal online bechne ke liye submit nahi ki hai.' 
                : 'Abhi mandi bazaar mein koi active listing nahi mili.'}
            </p>
            <Button onClick={() => navigate('/sell')}>
              Abhi Fasal Becho +
            </Button>
          </div>
        ) : (
          <div className={styles.salesList}>
            {displayList.map((item, idx) => (
              <div key={item._id || idx} className={styles.saleCard}>
                <div className={styles.saleHeader}>
                  <div className={styles.saleTitleGroup}>
                    <span className={styles.saleIcon}>
                      {item.cropType?.toLowerCase().includes('rice') ? '🌾' : item.cropType?.toLowerCase().includes('maize') ? '🌽' : '🌾'}
                    </span>
                    <div>
                      <h4 className={styles.saleCrop} style={{ textTransform: 'capitalize' }}>
                        {item.cropType} {item.quality ? `(${item.quality} Grade)` : ''}
                      </h4>
                      <p className={styles.saleDetail}>
                        {item.quantity} {item.unit || 'Quintal'} • {item.mandiName || item.district || 'Local Mandi'}
                      </p>
                      <p className={styles.salePrice} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                        ₹{item.pricePerQuintal || item.expectedPrice || '2400'} / Quintal
                      </p>
                    </div>
                  </div>

                  <div className={styles.saleStatusGroup}>
                    <span 
                      className={styles.saleStatusBadge}
                      style={{ color: '#10b981', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}
                    >
                      ONLINE LISTED ✓
                    </span>
                    <span className={styles.saleTime} style={{ fontSize: '11px', color: '#64748b' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                </div>

                {item.farmerId?.name && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Seller: <strong>{item.farmerId.name}</strong></span>
                    <span>📍 {item.district}, {item.state}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySales;
