import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, Check, Camera, Trash2, ShoppingBag } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useAuth } from '../../context/AuthContext';
import { createCropListing } from '../../services/api';
import styles from './Marketplace.module.css';

const SellCrop = () => {
  const navigate = useNavigate();
  const { farmer } = useAuth();

  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [selectedGrade, setSelectedGrade] = useState('A');
  const [quantity, setQuantity] = useState('10');
  const [pricePerQuintal, setPricePerQuintal] = useState('2300');
  const [mandiName, setMandiName] = useState('Lucknow Mandi');
  const [cropImage, setCropImage] = useState(null);
  const [cropImagePreview, setCropImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const crops = [
    { id: 'wheat', name: 'Gehun', emoji: '🌾' },
    { id: 'rice', name: 'Dhaan', emoji: '🌾' },
    { id: 'maize', name: 'Makka', emoji: '🌽' },
    { id: 'mustard', name: 'Sarson', emoji: '🌼' },
    { id: 'sugarcane', name: 'Ganna', emoji: '🎋' },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCropImage(file);
      setCropImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setCropImage(null);
    setCropImagePreview(null);
  };

  const handleCreateListing = async () => {
    try {
      setLoading(true);
      await createCropListing({
        cropType: selectedCrop,
        quantity: Number(quantity),
        pricePerQuintal: Number(pricePerQuintal),
        quality: selectedGrade,
        mandiName,
        district: farmer?.district || 'Hardoi',
        state: farmer?.state || 'Uttar Pradesh',
      });
      alert('Fasal Listing Photo ke saath Online Mandi market mein publish ho gayi!');
      navigate('/sales');
    } catch (err) {
      alert(err.response?.data?.message || 'Listing banane mein truti aayi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <TopAppBar 
        title="Fasal Becho 🛒" 
        showBack={true}
      />
      
      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <span className={styles.profileTitle}>Kisan Details (AgriStack)</span>
            <span className={styles.verifiedBadge}>Verified ✓</span>
          </div>
          <div className={styles.profileDetails}>
            <p><strong>Naam:</strong> {farmer?.name || 'Ramlal Ji'}</p>
            <p><strong>Location:</strong> {farmer?.district || 'Hardoi'}, {farmer?.state || 'UP'}</p>
            <p><strong>Kisan ID:</strong> {farmer?.kisanId || 'KISAN123456'}</p>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Kaun si fasal bechni hai?</h3>
          <div className={styles.chipGroup}>
            {crops.map(crop => (
              <button 
                key={crop.id}
                className={`${styles.chip} ${selectedCrop === crop.id ? styles.chipActive : ''}`}
                onClick={() => setSelectedCrop(crop.id)}
              >
                {crop.name} {crop.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Fasal Upload Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Fasal Ki Photo Upload Karein 📸</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Apni kheti ya fasal ki photo daalein taaki vyapari (buyers) achhe daam laga sakein.
          </p>

          {cropImagePreview ? (
            <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <img src={cropImagePreview} alt="Fasal Preview" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <button 
                onClick={removeImage}
                style={{
                  position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444',
                  color: '#fff', padding: '6px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '24px', border: '2px dashed var(--primary)', borderRadius: '12px', backgroundColor: 'var(--secondary)',
              cursor: 'pointer', textAlign: 'center', gap: '8px'
            }}>
              <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '50%' }}>
                <Camera size={28} color="var(--primary)" />
              </div>
              <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>
                Fasal Ki Photo Khinchein ya Upload Karein
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                JPEG, PNG format (Max 5MB)
              </span>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Selected Crop Specs</h3>
          <Input 
            label="Kitna maal hai? (quintal mein)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
          />

          <Input 
            label="Mandi Daam / Price (₹ per quintal)"
            value={pricePerQuintal}
            onChange={(e) => setPricePerQuintal(e.target.value)}
            type="number"
          />

          <Input 
            label="Pasandida Mandi (Target Mandi)"
            value={mandiName}
            onChange={(e) => setMandiName(e.target.value)}
          />
          
          <div className={styles.gradeSection}>
            <label className={styles.gradeLabel}>Quality Grade kya hai?</label>
            <div className={styles.gradeGroup}>
              {['A', 'B', 'C'].map(grade => (
                <button
                  key={grade}
                  className={`${styles.gradeBtn} ${selectedGrade === grade ? styles.gradeActive : ''}`}
                  onClick={() => setSelectedGrade(grade)}
                >
                  {grade} Grade
                </button>
              ))}
            </div>
          </div>

          {/* Inline Action Submit Button inside Form */}
          <div style={{ marginTop: '28px' }}>
            <Button fullWidth onClick={handleCreateListing} disabled={loading} style={{ padding: '14px', fontSize: '15px' }}>
              {loading ? 'Fasal List Ho Rahi Hai...' : <>Fasal Online Market Mein List Karein <ShoppingBag size={20} /></>}
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar Above Navigation Bar */}
      <div className={styles.fixedBottom} style={{ display: 'flex', gap: '8px' }}>
        <Button fullWidth onClick={() => navigate(`/mandi-bhav?crop=${selectedCrop}`)} variant="outline">
          Rate Dekho 📊
        </Button>
        <Button fullWidth onClick={handleCreateListing} disabled={loading}>
          {loading ? 'Listing...' : <>Becho <Check size={20} /></>}
        </Button>
      </div>
    </div>
  );
};

export default SellCrop;
