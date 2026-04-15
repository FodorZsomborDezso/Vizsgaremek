import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaGithub, FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import logoDark from '../Images/artisticeye.png';
import logoLight from '../Images/artisticeye_light.png';
import './Footer.css';

// Alapértelmezett backend API útvonal
const API_BASE_URL = 'http://localhost:3000';

const Footer = ({ theme }) => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [useCustomEmail, setUseCustomEmail] = useState(false);
  const location = useLocation();

  // Aktuális felhasználó állapotának frissítése útvonalváltáskor
  useEffect(() => {
    const loggedInUserStr = localStorage.getItem('user');
    if (loggedInUserStr) {
      setUser(JSON.parse(loggedInUserStr));
    } else {
      setUser(null);
      setIsSubscribed(false); 
      setUseCustomEmail(false);
    }
  }, [location.pathname]);

  // Felhasználó feliratkozási státuszának ellenőrzése a backend szerveren
  useEffect(() => {
    const checkSubscriptionStatus = async (emailToCheck) => {
      if (!emailToCheck) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/newsletter/status/${encodeURIComponent(emailToCheck)}`);
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            setIsSubscribed(data.isSubscribed);
          }
        }
      } catch (error) {
        console.error("Hiba a feliratkozás állapotának ellenőrzésekor:", error);
      }
    };

    if (user) {
      checkSubscriptionStatus(user.email);
    }
  }, [user]);

  // Feliratkozási folyamat inicializálása és adatok validálása
  const handleSubscribeRequest = (e) => {
    e.preventDefault();
    const targetEmail = (user && !useCustomEmail) ? user.email : email;
    
    if (!targetEmail || isSubscribed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      toast.error("Kérlek, adj meg egy érvényes e-mail címet!");
      return;
    }

    setPendingEmail(targetEmail);
    setShowConfirmModal(true);
  };

  // Feliratkozás megerősítése és elküldése a szervernek
  const confirmSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: pendingEmail,
          userId: user ? user.id : null,
        }),
      });

      const text = await response.text();
      let data = {};
      
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error("Szerver válasza nem JSON formátumú:", text);
        throw new Error(`Szerver kommunikációs hiba (Státusz: ${response.status}). Nézd meg a böngésző konzolját!`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'A feliratkozás sikertelen.');
      }

      toast.success(data.message || `Sikeresen feliratkoztál a hírlevélre: ${pendingEmail}`);
      setIsSubscribed(true);
      if (!user) setEmail('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowConfirmModal(false);
      setPendingEmail('');
    }
  };

  // Feliratkozási folyamat megszakítása és az űrlap alaphelyzetbe állítása
  const cancelSubscription = () => {
    setShowConfirmModal(false);
    setPendingEmail('');
  };

  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        <div className="footer-section brand-section">
          <Link to="/" className="footer-logo-link">
            <img 
              src={theme === 'dark' ? logoLight : logoDark} 
              alt="Artistic Eye Logo" 
              className="footer-logo-img" 
            />
          </Link>
          <p className="footer-desc">
            Egy modern közösségi platform, ahol a kreativitás találkozik a technológiával.
            Lásd meg a szépséget a részletekben!
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '15px 0 10px' }}>
            Iratkozz fel, és értesülj elsőként a legújabb funkciókról, valamint a közösség legjobb alkotásairól!
          </p>

          <form className={`newsletter-form ${(user && !useCustomEmail) ? 'logged-in' : ''}`} onSubmit={handleSubscribeRequest}>
            {(!user || useCustomEmail) ? (
              <>
                <input 
                  type="email" 
                  placeholder={isSubscribed ? "Már feliratkoztál!" : "Iratkozz fel a hírlevélre..."} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribed}
                />
                <button 
                  type="submit" 
                  className="newsletter-submit-btn" 
                  title="Feliratkozás" 
                  disabled={isSubscribed} 
                  style={isSubscribed ? { cursor: 'not-allowed', opacity: 0.8 } : {}}
                >
                  {isSubscribed ? <FaCheckCircle /> : <FaPaperPlane />}
                </button>
              </>
            ) : (
              <button 
                type="submit" 
                className="newsletter-1click-btn" 
                title={`Feliratkozás: ${user.email}`} 
                disabled={isSubscribed} 
                style={isSubscribed ? { cursor: 'not-allowed', opacity: 0.8 } : {}}
              >
                {isSubscribed ? <><FaCheckCircle /> Sikeresen feliratkozva!</> : <><FaPaperPlane /> 1 kattintásos feliratkozás</>}
              </button>
            )}
          </form>
          
          {user && !isSubscribed && (
            <div style={{ marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setUseCustomEmail(!useCustomEmail)}
                style={{ background: 'none', border: 'none', color: '#00d2ff', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
              >
                {useCustomEmail ? "Inkább a fiókom e-mail címét használom" : "Másik e-mail címet adnék meg"}
              </button>
            </div>
          )}
        </div>

        <div className="footer-section links-section">
          <h3 className="footer-heading-effect"><span>Felfedezés</span></h3>
          <ul className="footer-links">
            <li><Link to="/">Főoldal</Link></li>
            <li><Link to="/gallery">Galéria Böngészése</Link></li>
            <li><Link to="/ideas">Ötletbörze & Inspiráció</Link></li>
            <li><Link to="/upload">Új kép feltöltése</Link></li>
            <li><Link to="/profile">Saját Profil</Link></li>
            <li><Link to="/about">Rólunk</Link></li>
            <li><a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">Projekt Dokumentáció</a></li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h3 className="footer-heading-effect"><span>Fejlesztők</span></h3>
          <p>Készítette: Fodor Zsombor & Gerencsér Ákos</p>
          <div className="contact-info">
            <p><FaEnvelope style={{ marginRight: '5px' }} /> artistic.eye.support@gmail.com</p>
            <p><FaMapMarkerAlt style={{ marginRight: '5px' }} /> Magyarország</p>
          </div>
          <div className="social-links">
            <a href="https://github.com/FodorZsomborDezso" target="_blank" rel="noreferrer" className="social-icon"><FaGithub /> Fodor Zsombor</a>
            <a href="https://github.com/akos060316" target="_blank" rel="noreferrer" className="social-icon"><FaGithub /> Gerencsér Ákos</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ArtisticEye Projekt. Minden jog fenntartva.</p>
        <div className="footer-legal-links">
          <Link to="/adatvedelem">Adatvédelmi Tájékoztató</Link>
          <Link to="/aszf">Általános Szerződési Feltételek</Link>
          <Link to="/impresszum">Impresszum</Link>
        </div>
      </div>

      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={cancelSubscription} style={{ zIndex: 9999 }}>
          <div className="confirm-modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Hírlevél feliratkozás</h3>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Biztosan fel szeretnél iratkozni a hírlevélre az alábbi e-mail címmel?<br/><br/>
              <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{pendingEmail}</strong>
            </p>
            <div className="confirm-actions" style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button onClick={cancelSubscription} className="confirm-btn-cancel">Mégse</button>
              <button 
                onClick={confirmSubscription} 
                className="confirm-btn-danger" 
                style={{ background: 'linear-gradient(45deg, #00d2ff, #3a7bd5)', color: 'white', border: 'none' }}
              >
                Feliratkozás
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;