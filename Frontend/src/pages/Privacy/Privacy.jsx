import { useEffect } from 'react';
import './Privacy.css';

const Privacy = () => {
  // Amikor betölt az oldal, ugorjon a tetejére (ha a footerből kattintottak)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page-container">
      <div className="privacy-content-wrapper">
        
        <div className="privacy-header">
          <h1>Adatvédelmi Tájékoztató</h1>
          <p className="last-updated">Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}</p>
        </div>

        <div className="privacy-alert-box">
          <strong>Megjegyzés:</strong> Ez a weboldal (ArtisticEye) egy iskolai vizsgaremek / portfólió munka keretében jött létre. A megadott adatok (pl. e-mail címek, feltöltött képek) kizárólag tesztelési és bemutatási célokat szolgálnak.
        </div>

        <div className="privacy-section">
          <h2>1. Bevezetés</h2>
          <p>
            Az ArtisticEye (továbbiakban: "Szolgáltató", "Adatkezelő") elkötelezett a felhasználók személyes adatainak védelme iránt. Jelen tájékoztató célja, hogy bemutassa, hogyan gyűjtjük, használjuk fel és védjük a platform használata során megadott adatokat.
          </p>
        </div>

        <div className="privacy-section">
          <h2>2. Az Adatkezelő adatai</h2>
          <p><strong>Készítők / Fejlesztők:</strong> Fodor Zsombor & Gerencsér Ákos</p>
          <p><strong>Kapcsolat:</strong> info@artisticeye.hu</p>
          <p><strong>Cél:</strong> Vizsgaremek projekt</p>
        </div>

        <div className="privacy-section">
          <h2>3. Milyen adatokat kezelünk?</h2>
          <ul>
            <li><strong>Regisztrációs adatok:</strong> Felhasználónév, e-mail cím, titkosított jelszó.</li>
            <li><strong>Profil adatok:</strong> Teljes név, bemutatkozás (bio), tartózkodási hely, profilkép (opcionális).</li>
            <li><strong>Tartalom:</strong> A felhasználó által feltöltött képek, megjegyzések, kedvelések és üzenetek.</li>
            <li><strong>Technikai adatok:</strong> Az utolsó bejelentkezés ideje (last_seen) a funkciók megfelelő működése érdekében.</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>4. Az adatkezelés célja</h2>
          <p>
            Az adatokat kizárólag a platform alapvető funkcióinak biztosítására használjuk fel:
          </p>
          <ul>
            <li>Felhasználói fiókok azonosítása és biztonságban tartása.</li>
            <li>A közösségi élmény (követések, üzenetküldés, kommentelés) biztosítása.</li>
            <li>A hírlevélre történő feliratkozás esetén tájékoztató e-mailek küldése (demonstrációs célból).</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>5. Adatbiztonság és tárolás</h2>
          <p>
            A felhasználói jelszavakat iparági standard (bcrypt) titkosítással tároljuk. A feltöltött adatokat biztonságos adatbázisban kezeljük, és harmadik félnek kereskedelmi célból nem adjuk ki.
          </p>
        </div>

        <div className="privacy-section">
          <h2>6. A Felhasználó jogai</h2>
          <p>
            A felhasználóknak joguk van kérelmezni a nálunk tárolt személyes adataikhoz való hozzáférést, azok helyesbítését, vagy a fiókjuk és minden hozzá tartozó adat teljes törlését az alkalmazás felületén, vagy az ügyfélszolgálati e-mail címen keresztül.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Privacy;