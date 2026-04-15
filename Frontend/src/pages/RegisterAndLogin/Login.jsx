import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  
  // URL parameter ellenorzese email megerosites utan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      toast.success('A fiókodat sikeresen megerősítetted! Most már bejelentkezhetsz.');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Urlap allapotok
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Megerosites allapotok
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showResendButton, setShowResendButton] = useState(false);

  // Beviteli mezok valtozasanak kezelese
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (showResendButton) setShowResendButton(false);
  };

  // Megerosito email ujrakuldese
  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowResendButton(false);
      } else {
        toast.error(data.error || 'Hiba történt.');
      }
    } catch (err) {
      toast.error('Szerverhiba történt az újraküldés során.');
    } finally {
      setLoading(false);
    }
  };

  // Megerosito kod ellenorzese
  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return toast.warning("A kódnak pontosan 6 számjegyből kell állnia!");
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: verificationCode })
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Sikeres megerősítés! Most már bejelentkezhetsz.");
        setIsVerifying(false);
        setVerificationCode('');
      } else {
        toast.error(data.error || "Helytelen vagy lejárt kód!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Szerver hiba történt a megerősítés során.");
    } finally {
      setLoading(false);
    }
  };

  // Bejelentkezes bekuldese
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResendButton(false);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, rememberMe })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        window.dispatchEvent(new Event('authChange'));
        toast.success(`Üdv újra, ${data.user.username}! 👋`);
        navigate('/profile'); 
      } else {
        if (data.errorCode === 'ACCOUNT_NOT_VERIFIED') {
          setIsVerifying(true);
          setShowResendButton(true);
        } else {
          setError(data.error || 'Hibás adatok.');
        }
      }
    } catch (err) {
      setError('Nem sikerült elérni a szervert.');
    } finally {
      setLoading(false);
    }
  };

  // Komponens renderelese
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isVerifying ? 'Fiók megerősítése' : 'Bejelentkezés'}</h2>
        
        {error && !isVerifying && <div className="error-msg">{error}</div>}

        {isVerifying ? (
          <form onSubmit={handleVerify} className="auth-form">
            <p className="auth-subtitle">
              A fiókod még nincs megerősítve. Kérjük, add meg a(z) <strong>{formData.email}</strong> címre küldött 6 jegyű kódot.
            </p>
            
            <div className="form-group">
              <label className="verify-label">Megerősítő kód</label>
              <input 
                type="text" 
                value={verificationCode} 
                onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} 
                required 
                maxLength="6"
                placeholder="123456"
                className="verify-input"
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Ellenőrzés...' : 'Megerősítés'}
            </button>
            
            {showResendButton && (
              <div className="resend-container">
                <button type="button" onClick={handleResendVerification} disabled={loading} className="resend-btn">
                  {loading ? 'Küldés...' : 'Nincs meg a kód? Küldés újra'}
                </button>
              </div>
            )}
            
            <div className="auth-footer verify-footer">
              <span onClick={() => setIsVerifying(false)} className="back-to-register-link">Vissza a bejelentkezéshez</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email cím</label>
              <input type="email" name="email" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Jelszó</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  onChange={handleChange} 
                  required 
                  className="password-input"
                />
                <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
      
            <div className="login-options-row">
              <div className="remember-me-group">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  className="remember-me-checkbox"
                />
                <label htmlFor="rememberMe" className="remember-me-label">Emlékezz rám</label>
              </div>
              <Link to="/forgot-password" className="forgot-password-link">
                Elfelejtetted a jelszavad?
              </Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Belépés...' : 'Belépés'}
            </button>
          </form>
        )}

        {!isVerifying && (
          <div className="auth-footer">
            <p>Még nincs fiókod? <Link to="/register">Regisztrálj itt!</Link></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;