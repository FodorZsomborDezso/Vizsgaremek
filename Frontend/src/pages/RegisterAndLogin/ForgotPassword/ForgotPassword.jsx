import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Urlap allapotok
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Jelszo visszaallito kod kerese
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "A kódot elküldtük az e-mail címedre.");
        setIsVerifying(true);
      } else {
        setError(data.error || 'Valami hiba történt.');
      }
    } catch (err) {
      setError('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setIsLoading(false);
    }
  };

  // Visszaallito kod ellenorzese
  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return setError("A kódnak pontosan 6 számjegyből kell állnia!");
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      
      const data = await response.json();
      if (response.ok) {
        navigate('/reset-password/' + verificationCode);
      } else {
        setError(data.error || "Helytelen vagy lejárt kód!");
      }
    } catch (error) {
      setError("Szerver hiba történt az ellenőrzés során.");
    } finally {
      setIsLoading(false);
    }
  };

  // Komponens renderelese
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Elfelejtett Jelszó</h2>
        
        <p className="auth-subtitle">
          {isVerifying ? 'Add meg az e-mailben kapott 6 jegyű kódot!' : 'Add meg az email címed, és küldünk egy visszaállító kódot!'}
        </p>

        {error && <div className="error-msg">{error}</div>}

        {isVerifying ? (
          <form onSubmit={handleVerify} className="auth-form">
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
            
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Ellenőrzés...' : 'Tovább'}
            </button>
            <div className="auth-footer verify-footer">
              <span onClick={() => { setIsVerifying(false); setError(''); }} className="back-to-register-link">Vissza</span>
            </div>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email cím</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="pelda@email.hu"
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Küldés...' : 'Kód Küldése'}
          </button>
        </form>
        )}

        <div className="auth-footer">
          <p>Eszébe jutott? <Link to="/login">Jelentkezz be!</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;