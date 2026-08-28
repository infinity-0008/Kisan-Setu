import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import Button from '../../components/Button/Button';
import { sendOTP, verifyOTP } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { loginFarmer } = useAuth();

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      setError('Kripya 10-digit mobile number darj karein');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendOTP(mobile);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP bhejne mein samasya aayi. Mobile number check karein.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Kripya 6-digit OTP darj karein');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await verifyOTP(mobile, otpValue);
      if (res.data?.token && res.data?.farmer) {
        loginFarmer(res.data.token, res.data.farmer);
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Galat OTP darj kiya gaya hai');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ marginTop: '20px' }}>
        <h1 className={styles.title}>Kisan Setu mein Aapka Swagat! 🙏</h1>
        <p className={styles.subtitle}>Apne mobile number se login karke aage badhein</p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.formContainer}>
        {step === 1 ? (
          <div className={styles.step}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Mobile Number Daalo</label>
              <div className={styles.mobileInputWrapper}>
                <span className={styles.countryCode}>+91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={styles.mobileInput}
                  autoFocus
                />
              </div>
            </div>

            <Button 
              fullWidth 
              onClick={handleSendOtp} 
              disabled={loading || mobile.length !== 10}
            >
              {loading ? 'OTP Bhej Rahe Hain...' : <>OTP Bhejo <ArrowRight size={20} /></>}
            </Button>

          </div>
        ) : (
          <div className={styles.step}>
             <div className={styles.inputGroup}>
              <label className={styles.label}>Enter 6-Digit OTP</label>
              <div className={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="tel"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={styles.otpInput}
                  />
                ))}
              </div>
            </div>

            <Button 
              fullWidth 
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? 'Verification Chalu Hai...' : <>OTP Verify Karo <Check size={20} /></>}
            </Button>
            
            <p className={styles.resendText}>
              <span onClick={() => setStep(1)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Mobile number badlein
              </span>
            </p>
          </div>
        )}
      </div>

      <div className={styles.termsFooter}>
        <p>Aage badhakar aap hamare niyam v sharton ko sweekar karte hain</p>
      </div>
    </div>
  );
};

export default Login;
