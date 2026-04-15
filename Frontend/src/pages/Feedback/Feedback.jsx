// React hookok es routing komponensek importalasa
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Szukseges ikonok beemelese a felulethez
import { FaPaperPlane, FaCommentDots, FaLock } from 'react-icons/fa';

// Ertesitesek kezelesehez szukseges fuggoseg
import { toast } from 'react-toastify';

// Komponens stiluslapjanak beemelese
import './Feedback.css';

// Feedback fuggvenykomponens definialasa
const Feedback = () => {
  // Urlap adatainak tarolasa az allapotban
  const [formData, setFormData] = useState({ type: 'Javaslat', message: '' });
  
  // Toltesi es bejelentkezesi allapotok kezelese
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Bejelentkezesi allapot ellenorzese a komponens betoltesekor
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Visszajelzes bekuldesenek kezelese
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Token ellenorzese a kuldes elott
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("A küldéshez be kell jelentkezned!");
      return;
    }

    // Uzenet hosszanak validalasa
    if (formData.message.trim().length < 10) {
      toast.warning("Kérlek, írj legalább 10 karaktert, hogy érdemben tudjunk segíteni!");
      return;
    }

    // Toltesi allapot aktivalasa
    setLoading(true);

    try {
      // API hivas a visszajelzes elkuldesehez
      const res = await fetch('http://localhost:3000/api/feedbacks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      // Valasz feldolgozasa es felhasznalo ertesitese
      if (res.ok) {
        toast.success("Köszönjük a visszajelzést! Üzenetedet továbbítottuk az adminoknak.");
        setFormData({ type: 'Javaslat', message: '' });
      } else {
        toast.error("Hiba történt a küldés során.");
      }
    } catch (err) {
      // Halozati hibak lekezelese
      toast.error("Szerver hiba.");
    } finally {
      // Toltesi allapot kikapcsolasa minden esetben
      setLoading(false);
    }
  };

  // Kijelentkezett felhasznaloknak szolo figyelemfelkelto nezet
  if (!isLoggedIn) {
    return (
      <div className="feedback-container">
        <div className="feedback-content locked-content">
          <FaLock className="locked-icon" />
          <h2>Jelentkezz be a visszajelzéshez!</h2>
          <p className="locked-desc">
            A spamek elkerülése és a gyorsabb ügyintézés érdekében csak regisztrált és bejelentkezett felhasználók küldhetnek üzenetet.
          </p>
          <Link to="/login" className="feedback-submit-btn login-link-btn">
            Irány a bejelentkezés
          </Link>
        </div>
      </div>
    );
  }

  // Bejelentkezett felhasznaloknak szolo urlap nezet
  return (
    <div className="feedback-container">
      <div className="feedback-content">
        
        {/* Oldal fejlece */}
        <div className="feedback-header">
          <FaCommentDots className="feedback-icon" />
          <h1>Visszajelzés & Kapcsolat</h1>
          <p>Találtál egy hibát? Van egy jó fejlesztési ötleted? Vagy csak beköszönnél? Írd meg nekünk!</p>
        </div>

        {/* Visszajelzo urlap */}
        <form onSubmit={handleSubmit} className="feedback-form">
          
          {/* Uzenet tipusanak kivalasztasa */}
          <div className="form-group">
            <label>Milyen jellegű az üzenet?</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="Javaslat">- Fejlesztési javaslat / Ötlet</option>
              <option value="Hiba">- Hiba bejelentése (Bug)</option>
              <option value="Kérdés">- Kérdés</option>
              <option value="Egyéb">- Egyéb</option>
            </select>
          </div>

          {/* Szoveges uzenet mezoje es karakterszamlaloja */}
          <div className="form-group">
            <label>Üzeneted</label>
            <textarea 
              rows="6" 
              placeholder="Írd le részletesen... (min. 10 karakter)" 
              required 
              value={formData.message} 
              onChange={e => setFormData({...formData, message: e.target.value})} 
              className="feedback-textarea"
              maxLength={2000}
            ></textarea>
            
            {/* Dinamikus stilusozas a hatarertek eleresehez */}
            <div className={`char-counter ${formData.message.length >= 2000 ? 'limit-reached' : ''}`}>
              {formData.message.length} / 2000
            </div>
          </div>

          {/* Bekuldo gomb dinamikus allapottal */}
          <button type="submit" className="feedback-submit-btn" disabled={loading || formData.message.trim().length < 10}>
            {loading ? 'Küldés folyamatban...' : <><FaPaperPlane className="submit-icon" /> Üzenet elküldése</>}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Feedback;