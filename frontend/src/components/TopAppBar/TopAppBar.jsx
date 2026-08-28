import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './TopAppBar.module.css';

const TopAppBar = ({ title, showBack = true, showNotification = false, onBack, rightAction }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={styles.appBar}>
      <div className={styles.left}>
        {showBack && (
          <button onClick={handleBack} className={styles.iconButton} aria-label="Go back">
            <ArrowLeft size={24} />
          </button>
        )}
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>
      
      <div className={styles.right}>
        {rightAction && rightAction}
        {showNotification && (
          <button className={styles.iconButton}>
            <Bell size={24} />
            <span className={styles.badge}></span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopAppBar;
