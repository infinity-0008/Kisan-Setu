import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', fullWidth = false, className = '', ...props }) => {
  const btnClass = `${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`;
  
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
};

export default Button;
