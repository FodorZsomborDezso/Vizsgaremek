import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import './Auth.css';

const VerificationFailed = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', color: '#e74c3c', marginBottom: '20px' }}>
          <FaExclamationTriangle size={50} />
        </div>
        <h2 className="auth-title" style={{ color: '#e74c3c' }}>A megerősítés sikertelen</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Sajnos a megerősítő link érvénytelen vagy lejárt. Ennek több oka is lehet:
        </p>
        <ul style={{ color: 'var(--text-secondary)', margin: '20px 0', paddingLeft: '20px', textAlign: 'left' }}>
          <li>A linket már felhasználtad.</li>
          <li>A link érvényességi ideje (24 óra) lejárt.</li>
          <li>A link hibásan lett másolva a böngészőbe.</li>
        </ul>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Kérjük, próbálj meg újra bejelentkezni. Ha a fiókod még nincs megerősítve, a bejelentkezési oldalon kérhetsz egy új megerősítő e-mailt.
        </p>
        <div className="auth-footer" style={{ marginTop: '30px' }}>
          <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
            Vissza a bejelentkezéshez
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationFailed;