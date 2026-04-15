import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaPalette, FaLightbulb, FaUsers, FaHeart, FaUserCircle, FaMedal, FaSearch } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  // Navigacio es allapotok inicializalasa
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [latestPosts, setLatestPosts] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adatok lekerese a szerverrol a komponens betoltesekor
  useEffect(() => {
    // Legujabb posztok lekerese
    fetch('http://localhost:3000/api/latest-posts')
      .then(res => res.json())
      .then(data => {
        setLatestPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Hiba a legujabb posztok betoltesekor:", err);
        setLoading(false);
      });

    // Top 10 felhasznalo lekerese a ranglistahoz
    fetch('http://localhost:3000/api/top-users')
      .then(res => res.json())
      .then(data => setTopUsers(data))
      .catch(err => console.error("Hiba a ranglista betoltesekor:", err));
  }, []);

  // Keresesi urlap bekuldesenek kezelese
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Komponens renderelese
  return (
    <div className="home-container">
      
      {/* Hero szekcio */}
      <section className="home-hero">
        <div className="hero-text-content">
          <h1 className="hero-title">Oszd meg a <span>vizuális</span> világod.</h1>
          <p className="hero-subtitle">
            Fedezz fel inspiráló alkotásokat, töltsd fel a sajátjaidat, és valósítsd meg a közösség legjobb ötleteit! Egy hely, ahol a kreativitás életre kel.
          </p>
          
          {/* Keresomezo */}
          <form onSubmit={handleSearch} className="hero-search-form">
            <input 
              type="text" 
              placeholder="Keresés inspiráció után..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="hero-search-btn">
              <FaSearch />
            </button>
          </form>

          {/* Akciogombok */}
          <div className="hero-buttons">
            <Link to="/gallery" className="btn-primary">
              Felfedezés <FaArrowRight className="icon-right-margin" />
            </Link>
            <Link to="/upload" className="btn-secondary">
              Új kép feltöltése
            </Link>
          </div>
        </div>

        {/* Dinamikus fotokollazs */}
        <div className="hero-image-collage">
          {loading ? (
            <div className="collage-loading">Képek betöltése...</div>
          ) : latestPosts.length >= 3 ? (
            <>
              <div className="collage-img img-main">
                <img src={latestPosts[0].image_url} alt="Legújabb poszt 1" />
                <div className="img-credit">@{latestPosts[0].username}</div>
              </div>
              <div className="collage-img img-sub-top">
                <img src={latestPosts[1].image_url} alt="Legújabb poszt 2" />
                <div className="img-credit">@{latestPosts[1].username}</div>
              </div>
              <div className="collage-img img-sub-bottom">
                <img src={latestPosts[2].image_url} alt="Legújabb poszt 3" />
                <div className="img-credit">@{latestPosts[2].username}</div>
              </div>
            </>
          ) : (
            <div className="collage-empty">
              <h3>Üdv a platformon!</h3>
              <p>Tölts fel legalább 3 képet a Galériába, hogy itt megjelenjen a dinamikus kollázs!</p>
            </div>
          )}
        </div>
      </section>

      {/* Jellemzok szekcio */}
      <section className="home-features">
        <div className="feature-card">
          <div className="feature-icon-wrapper icon-gallery">
            <FaPalette />
          </div>
          <h3>Galéria</h3>
          <p>Böngéssz lenyűgöző képek, festmények és digitális művek között. Találd meg a stílusodhoz illő inspirációt, és mentsd el a kedvenceidet.</p>
          <Link to="/gallery" className="feature-link link-gallery">Ugrás a Galériába <FaArrowRight /></Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper icon-ideas">
            <FaLightbulb />
          </div>
          <h3>Ötletbörze</h3>
          <p>Van egy jó koncepciód, de nincs időd megcsinálni? Írd meg szövegesen, és nézd meg, ahogy a közösség tehetségei életre keltik!</p>
          <Link to="/ideas" className="feature-link link-ideas">Ötletek felfedezése <FaArrowRight /></Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon-wrapper icon-community">
            <FaUsers />
          </div>
          <h3>Közösség</h3>
          <p>Lájkold a legjobb alkotásokat, szólj hozzá a posztokhoz, kövess más alkotókat, és építsd a saját portfóliódat a platformon.</p>
          <Link to="/about" className="feature-link link-community">Tudj meg többet rólunk <FaArrowRight /></Link>
        </div>
      </section>

      {/* Ranglista szekcio */}
      <section className="home-leaderboard">
        <div className="leaderboard-header">
          <h2><FaMedal className="icon-medal" /> Top 10 Alkotó</h2>
          <p>A közösség kedvencei, akik a legtöbb kedvelést gyűjtötték az alkotásaikra.</p>
        </div>

        <div className="leaderboard-grid">
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <Link to={`/user/${user.username}`} key={user.id} className="leaderboard-card">
                <div className={`rank-badge rank-${index + 1}`}>
                  #{index + 1}
                </div>
                
                <div className="leaderboard-avatar-wrapper">
                  {user.avatar_url && user.avatar_url.includes('http') ? (
                    <img src={user.avatar_url} alt={user.username} className="leaderboard-avatar" />
                  ) : (
                    <FaUserCircle className="leaderboard-avatar-placeholder" />
                  )}
                </div>
                
                <div className="leaderboard-info">
                  <h4 className="leaderboard-name">{user.full_name || user.username}</h4>
                  <span className="leaderboard-username">@{user.username}</span>
                </div>
                
                <div className="leaderboard-likes">
                  <FaHeart className="heart-icon" />
                  <span>{user.total_likes}</span>
                </div>
              </Link>
            ))
          ) : (
            <p className="empty-leaderboard">Még nincsenek adatok a ranglistához.</p>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;