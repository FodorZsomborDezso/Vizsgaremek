import { useEffect } from 'react';
import './Privacy.css'; // Újrahasználjuk az eddigi stílusokat

const Imprint = () => {
  // Amikor betölt az oldal, ugorjon a tetejére (ha a footerből kattintottak)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page-container">
      <div className="privacy-content-wrapper">
        
        <div className="privacy-header">
          <h1>Impresszum</h1>
          <p className="last-updated">Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}</p>
        </div>

        <div className="privacy-alert-box">
          <strong>Megjegyzés:</strong> Ez a weboldal (ArtisticEye) egy iskolai vizsgaremek / portfólió munka keretében jött létre. Az alábbi adatok bemutató jellegűek.
        </div>

        <div className="privacy-section">
          <h2>1. A Szolgáltató (Fejlesztők) adatai</h2>
          <p><strong>A weboldal készítői:</strong> Fodor Zsombor és Gerencsér Ákos</p>
          <p><strong>Projekt neve:</strong> ArtisticEye (Vizsgaremek)</p>
          <p><strong>Kapcsolattartási e-mail cím:</strong> info@artisticeye.hu</p>
        </div>

        <div className="privacy-section">
          <h2>2. Tárhelyszolgáltató</h2>
          <p>Mivel ez egy vizsgaprojekt, jelenleg a weboldal és a hozzá tartozó adatbázis lokálisan (localhost) vagy egy demonstrációs szerveren fut. Éles üzemeltetés esetén itt a hivatalos szerverpark/tárhelyszolgáltató adatai (név, székhely, e-mail) szerepelnének.</p>
        </div>

        <div className="privacy-section">
          <h2>3. Szerzői jogok</h2>
          <p>
            A weboldal dizájnja, a forráskód és a platform egyedi grafikai elemei a fejlesztők szellemi tulajdonát képezik. A felhasználók által feltöltött képek (Galéria, Ötletbörze) az azokat feltöltő felhasználók szerzői jogi oltalma alatt állnak. Tilos az oldal forráskódjának vagy elemeinek engedély nélküli másolása és üzleti célú felhasználása.
          </p>
        </div>

        <div className="privacy-section">
          <h2>4. Felelősségvállalás</h2>
          <p>Az oldalon megjelenő tartalmak pontosságáért a fejlesztők mindent megtesznek, de az esetleges elírásokért és a felhasználók által generált tartalmakért (UGC) jogi és anyagi felelősséget nem vállalnak.</p>
        </div>

      </div>
    </div>
  );
};

export default Imprint;