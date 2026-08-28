import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to login after 2 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.centerContent}>
        <div className={styles.logoCircle}>
          <span className={styles.logoIcon}>🌾</span>
        </div>
        <h1 className={styles.titleHindi}>किसान सेतु</h1>
        <h2 className={styles.titleEnglish}>KISAN SETU</h2>
      </div>
      
      <div className={styles.footer}>
        <p>हर किसान का AI साथी 🌾</p>
        <div className={styles.loader}></div>
      </div>
    </div>
  );
};

export default Splash;
