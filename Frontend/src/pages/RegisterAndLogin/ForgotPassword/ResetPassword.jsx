import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  
  // Urlap allapotok
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Uj jelszo bekuldese
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('A két jelszó nem egyezik!');
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || 'Valami hiba történt.');
      }
    } catch (err) {
      setError('Nem sikerült csatlakozni a szerverhez.');
    } finally {
      setIsLoading(false);
    }
  };

  // Komponens renderelese
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Új Jelszó</h2>
        
        <p className="auth-subtitle">
          A kód sikeresen megerősítve. Kérlek, adj meg egy erős új jelszót!
        </p>

        {message ? (
          <div className="success-msg">
            <p>{message}</p>
            <Link to="/login">
              <button className="auth-btn continue-btn">Tovább a Belépéshez</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-msg">{error}</div>}
            
            <div className="form-group">
              <label>Új Jelszó</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
                placeholder="******"
              />
            </div>
            
            <div className="form-group">
              <label>Új Jelszó Megerősítése</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                placeholder="******"
              />
            </div>
            
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Mentés...' : 'Jelszó Frissítése'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;