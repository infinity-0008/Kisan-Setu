import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import styles from './ProfileCreation.module.css';

const ProfileCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    landSize: '',
    irrigation: '',
    mainCrop: 'Gehun (Wheat)'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    navigate('/home');
  };

  return (
    <div className={styles.container}>
      <TopAppBar title="Profile Banao 📝" showBack={true} />

      <div className={styles.form}>
        <Input 
          label="Apna Naam (Name)" 
          placeholder="Ramlal Singh"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        
        <Input 
          label="Gaon/Zila (Village/District)" 
          placeholder="Hardoi, Uttar Pradesh"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
        
        <Input 
          label="Zameen ka size (bigha mein)" 
          placeholder="5 Bigha"
          type="number"
          name="landSize"
          value={formData.landSize}
          onChange={handleChange}
        />
        
        <Input 
          label="Sinchai type (Irrigation)" 
          placeholder="Nahar / Tube-well"
          name="irrigation"
          value={formData.irrigation}
          onChange={handleChange}
        />
        
        <div className={styles.selectGroup}>
          <label className={styles.label}>Main Fasal (Crop)</label>
          <div className={styles.selectWrapper}>
            <select 
              name="mainCrop" 
              value={formData.mainCrop} 
              onChange={handleChange}
              className={styles.select}
            >
              <option value="Gehun (Wheat)">🌾 Gehun (Wheat)</option>
              <option value="Dhaan (Rice)">🌾 Dhaan (Rice)</option>
              <option value="Makka (Maize)">🌽 Makka (Maize)</option>
              <option value="Ganna (Sugarcane)">🎋 Ganna (Sugarcane)</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button fullWidth onClick={handleSave}>
          Profile Save Karo <Check size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ProfileCreation;
