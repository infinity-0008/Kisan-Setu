import React from 'react';
import styles from './Input.module.css';

const Input = React.forwardRef(({ label, error, className = '', icon, rightIcon, ...props }, ref) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.leftIcon}>{icon}</span>}
        <input 
          ref={ref}
          className={`${styles.input} ${error ? styles.errorInput : ''} ${icon ? styles.hasLeftIcon : ''} ${rightIcon ? styles.hasRightIcon : ''}`} 
          {...props} 
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
