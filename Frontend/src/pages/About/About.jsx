// React es routing fuggosegek importalasa
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Ikonok importalasa a felulethez
import { FaRocket, FaHeart, FaPaintBrush, FaUserCircle, FaBook } from 'react-icons/fa';

// Komponens stiluslapjanak beemelese
import './About.css';

// About fuggvenykomponens definialasa
const About = () => {
  // Fejlesztok statikus azonositoinak tarolasa
  const CREATOR_1_ID = 7;
  const CREATOR_2_ID = 19;

  // Allapotvaltozok deklaralasa
  const [creator1, setCreator1] = useState(null);
  const [creator2, setCreator2] = useState(null);
  const [loading, setLoading] = useState(true);

  // Eletciklus metodus az adatok lekeresehez
  useEffect(() => {
    // Aszinkron lekerdezo fuggveny definialasa
    const fetchCreators = async () => {
      try {
        // API hivasok parhuzamos inditasa
        const [res1, res2] = await Promise.all([
          fetch(`http://localhost:3000/api/users/id/${CREATOR_1_ID}`),
          fetch(`http://localhost:3000/api/users/id/${CREATOR_2_ID}`)
        ]);

        // Elso felhasznalo adatainak feldolgozasa
        if (res1.ok) {
          const data1 = await res1.json();
          setCreator1(data1.user);
        }

        // Masodik felhasznalo adatainak feldolgozasa
        if (res2.ok) {
          const data2 = await res2.json();
          setCreator2(data2.user);
        }
      } catch (error) {
        // Esetleges hibak naplozasa a konzolon
        console.error("Hiba a keszitok adatainak betoltesekor:", error);
      } finally {
        // Toltesi allapot kikapcsolasa
        setLoading(false);
      }
    };

    // Fuggveny meghivasa a komponens betoltesekor
    fetchCreators();
  }, []);

  // JSX szerkezet renderelese
  return (
    <div className="about-container">
      
      {/* Fejlec es bemutatkozo szoveg */}
      <div className="about-hero">
        <h1>Rólunk <span>&amp; A Projektről</span></h1>
        <p>Egy hely, ahol a kreativitás és a közösség találkozik.</p>
      </div>

      {/* Kuldeteseket bemutato informacios kartyak */}
      <div className="about-mission">
        {/* Inspiracio szekcio */}
        <div className="mission-card">
          <FaPaintBrush className="mission-icon" />
          <h3>Inspiráció</h3>
          <p>Célunk, hogy a művészek egy helyen találják meg a következő ötletüket, és osszák meg elképzeléseiket.</p>
        </div>
        {/* Megvalositas szekcio */}
        <div className="mission-card">
          <FaRocket className="mission-icon" />
          <h3>Megvalósítás</h3>
          <p>Az Ötletbörze segítségével a gondolatokból valóság lesz. Alkosd meg, amit mások elképzeltek!</p>
        </div>
        {/* Kozosseg szekcio */}
        <div className="mission-card">
          <FaHeart className="mission-icon" />
          <h3>Közösség</h3>
          <p>Hisszük, hogy a legjobb dolgok közösen születnek. Építs kapcsolatokat és támogasd a többi alkotót!</p>
        </div>
      </div>

      {/* Fejlesztoket listazo blokk */}
      <div className="about-developer">
        <h2>A Készítőkről</h2>

        {/* Felteteles rendereles toltes alatt */}
        {loading ? (
          <p className="loading-text">Készítők adatainak betöltése...</p>
        ) : (
          <>
            {/* Elso fejleszto profiljanak megjelenitese */}
            {creator1 && (
              <div className="dev-profile">
                <Link to={`/user/${creator1.username}`}>
                  {creator1.avatar_url && creator1.avatar_url.includes('http') ? (
                    <img src={creator1.avatar_url} alt={creator1.username} className="dev-avatar" />
                  ) : (
                    <FaUserCircle className="dev-avatar-placeholder" />
                  )}
                </Link>
                <div className="dev-info">
                  <h3>
                    <Link to={`/user/${creator1.username}`} className="dev-name-link">
                      Szia, én {creator1.full_name || creator1.username} vagyok
                    </Link>
                  </h3>
                  <p>{creator1.bio || "Ez a projekt vizsgaremekként készült a modern közösségi platformok mintájára."}</p>
                  <p>Technológiák: <strong>React, Node.js, Express, MySQL, JWT, CSS Flexbox.</strong></p>
                </div>
              </div>
            )}

            {/* Masodik fejleszto profiljanak megjelenitese */}
            {creator2 && (
              <div className="dev-profile">
                <Link to={`/user/${creator2.username}`}>
                  {creator2.avatar_url && creator2.avatar_url.includes('http') ? (
                    <img src={creator2.avatar_url} alt={creator2.username} className="dev-avatar" />
                  ) : (
                     <FaUserCircle className="dev-avatar-placeholder" />
                  )}
                </Link>
                <div className="dev-info">
                  <h3>
                    <Link to={`/user/${creator2.username}`} className="dev-name-link">
                      Én pedig {creator2.full_name || creator2.username}
                    </Link>
                  </h3>
                  <p>{creator2.bio || "Közösen dolgoztunk a projekten, hogy a dizájn és funkcionalitás tökéletes legyen."}</p>
                  <p>Szerepkör: <strong>Frontend & Backend Fejlesztő, UI/UX Design.</strong></p>
                </div>
              </div>
            )}

            {/* Dokumentacios hivatkozas blokkja */}
            <div className="documentation-section">
              <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="documentation-btn">
                <FaBook className="doc-icon" /> Projekt Dokumentáció
              </a>
              <p>Ismerd meg a projekt felépítését és működését részletesen.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default About;