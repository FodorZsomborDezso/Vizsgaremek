import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoDark from '../Images/artisticeye.png';
import logoLight from '../Images/artisticeye_light.png';
import { 
  FaSun, FaMoon, 
  FaLightbulb, FaImages, FaUpload, 
  FaHome, FaUserCircle, FaShieldAlt,
  FaShare,
  FaBell,
  FaInfoCircle,
  FaEnvelope,
  FaSearch, FaTimes, FaSignOutAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Header.css';

// Navigációs gomb komponens
const NavButton = ({ to, icon, text, onClick, extraClass = "" }) => (
  <Link to={to} className={`nav-link-btn ${extraClass}`} onClick={onClick}>
    <span>{icon} {text}</span>
  </Link>
);

// Fejléc komponens
const Header = ({ theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: null
  });

  // Kijelentkezést megerősítő ablak bezárása
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  // Bejelentkezési állapot ellenőrzése
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    checkAuthStatus();
    window.addEventListener('authChange', checkAuthStatus);
    return () => window.removeEventListener('authChange', checkAuthStatus);
  }, []);

  // Értesítések lekérése a szerverről
  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const res = await fetch('http://localhost:3000/api/notifications', { 
            headers: { 'Authorization': `Bearer ${token}` } 
          });
          if (res.ok) setNotifications(await res.json());
        } catch(e) {
          console.error("Hiba az értesítések lekérésekor:", e);
        }
      };
      
      fetchNotifs(); 
      const interval = setInterval(fetchNotifs, 5000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  // Külső kattintások figyelése
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
        setIsSearchOpen(false);
        setSearchQuery('');
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keresés végrehajtása
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error("Keresési hiba:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Mobil menü állapotának átváltása
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  // Mobil menü és kereső bezárása
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Értesítések csoportosítása
  const getGroupedNotifications = () => {
    const groups = {};
    const others = [];

    notifications.forEach(n => {
      let key = null;
      if (n.type === 'like') key = `like-${n.target_id}`;
      else if (n.type === 'comment') key = `comment-${n.target_id}`;
      else if (n.type === 'implementation') key = `impl-${n.target_id}`;
      else if (n.type === 'follow') key = `follow`; 
      else if (n.type === 'message') key = `msg-${n.sender_id}`;

      if (key) {
        if (!groups[key]) {
          groups[key] = { ...n, count: 1 };
        } else {
          groups[key].count += 1;
          if (!n.is_read) groups[key].is_read = false; 
        }
      } else {
        others.push(n);
      }
    });

    const groupedArray = Object.values(groups);
    return [...groupedArray, ...others].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const groupedNotifications = getGroupedNotifications();
  const unreadCount = groupedNotifications.filter(n => !n.is_read).length;

  // Értesítések megnyitása és olvasottnak jelölése
  const handleNotifClick = async () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadCount > 0) {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/notifications/read', { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  // Kijelentkezés elindítása
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Kijelentkezés',
      message: 'Biztosan ki szeretnél lépni?',
      confirmBtnText: 'Kijelentkezés',
      onConfirm: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setNotifications([]);
        closeMobileMenu();
        closeConfirmModal();
        navigate('/login');
        toast.info("Sikeres kijelentkezés!");
      }
    });
  };

  // Navigáció az értesítés típusa alapján
  const handleNotificationItemClick = (notif) => {
    setIsNotifOpen(false);
    
    if (['like', 'comment'].includes(notif.type) && notif.target_id) {
      navigate(`/gallery?postId=${notif.target_id}`);
    } else if (notif.type === 'follow') {
      navigate(`/user/${notif.username}`);
    } else if (notif.type === 'message') {
      navigate('/messages');
    } else if (notif.target_id) {
      navigate(`/user/${notif.username}`); 
    }
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <img 
            src={theme === 'dark' ? logoLight : logoDark} 
            alt="Artistic Eye Logo" 
            className="logo-img" 
          />
        </Link>

        <div className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}>
          <div className="bar bar1"></div>
          <div className="bar bar2"></div>
          <div className="bar bar3"></div>
        </div>        

        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <NavButton to="/" icon={<FaHome style={{ marginRight: '5px' }} />} text="Főoldal" onClick={closeMobileMenu} />
            </li>
            <li className="nav-item">
              <NavButton to="/gallery" icon={<FaImages style={{ marginRight: '5px' }} />} text="Galéria" onClick={closeMobileMenu} />
            </li>
            <li className="nav-item">
              <NavButton to="/ideas" icon={<FaLightbulb style={{ marginRight: '5px' }} />} text="Ötletbörze" onClick={closeMobileMenu} />
            </li>
            <li className="nav-item">
              <NavButton to="/about" icon={<FaInfoCircle style={{ marginRight: '5px' }} />} text="Rólunk" onClick={closeMobileMenu} />
            </li>
            <li className="nav-item">
              <NavButton to="/feedback" icon={<FaShare style={{ marginRight: '5px' }} />} text="Visszajelzés" onClick={closeMobileMenu} />
            </li>

            {user && (
              <li className="nav-item">
                <NavButton to="/upload" icon={<FaUpload style={{ marginRight: '5px' }} />} text="Feltöltés" onClick={closeMobileMenu} />
              </li>
            )}

            {user && user.role === 'admin' && (
              <li className="nav-item">
                <NavButton 
                  to="/admin" 
                  icon={<FaShieldAlt style={{ marginRight: '5px' }} />} 
                  text="Admin" 
                  onClick={closeMobileMenu} 
                  extraClass={theme === 'dark' ? "admin-btn" : "admin-btn light-mode"}
                />
              </li>
            )}

            <li className="nav-item theme-toggle-item">
              <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Témaváltás">
                {theme === 'dark' ? <FaSun className="icon-sun" /> : <FaMoon className="icon-moon" />}
              </button>
            </li>

            <li className="nav-item desktop-only-separator">|</li>

            <li className="nav-item search-container" ref={searchRef}>
              <div className={`search-wrapper ${isSearchOpen ? 'open' : ''}`}>
                <button 
                  className="search-toggle-btn" 
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (isSearchOpen) setSearchQuery(''); 
                  }}
                  title="Felhasználók keresése"
                >
                  {isSearchOpen ? <FaTimes /> : <FaSearch />}
                </button>
                
                <input 
                  type="text" 
                  className="global-search-input" 
                  placeholder="Keresés (@név)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus={isSearchOpen}
                />
              </div>

              {isSearchOpen && searchQuery.trim() !== '' && (
                <div className="search-dropdown">
                  {isSearching ? (
                    <div className="search-loading">Keresés...</div>
                  ) : searchResults.length > 0 ? (
                    <ul className="search-results-list">
                      {searchResults.map(resultUser => (
                        <li key={resultUser.id}>
                          <Link 
                            to={`/user/${resultUser.username}`} 
                            className="search-result-item"
                            onClick={() => {
                              closeMobileMenu();
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                          >
                            {resultUser.avatar_url ? (
                              <img src={resultUser.avatar_url} alt="avatar" className="search-avatar" />
                            ) : (
                              <FaUserCircle className="search-avatar-placeholder" />
                            )}
                            <div className="search-user-info">
                              <span className="search-username">@{resultUser.username}</span>
                              <span className="search-fullname">{resultUser.full_name || ''}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="search-no-results">Nincs találat: "{searchQuery}"</div>
                  )}
                </div>
              )}
            </li>

            {!user ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link login-link" onClick={closeMobileMenu}>Belépés</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-cta-button" onClick={closeMobileMenu}>Regisztráció</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item notif-container" ref={notifRef}>
                  <button className="nav-link notif-btn" onClick={handleNotifClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1.3rem', position: 'relative', color: 'var(--text-primary)' }}>
                    <FaBell />
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>

                  {isNotifOpen && (
                    <div className="notif-dropdown">
                      <h4>Értesítések</h4>
                      <div className="notif-list">
                        {groupedNotifications.length === 0 ? (
                          <p className="no-notifs">Nincsenek új értesítéseid.</p>
                        ) : (
                          groupedNotifications.map(n => (
                            <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`} onClick={() => handleNotificationItemClick(n)} style={{ cursor: 'pointer' }}>
                              <img src={n.avatar_url || 'https://ui-avatars.com/api/?name=User'} alt="avatar" />
                              <div className="notif-text">
                                <strong>@{n.username}</strong> 
                                {n.type === 'message' ? (
                                  ` ${n.count > 1 ? n.count : ''} üzenetet küldött neked.`
                                ) : (
                                  <>
                                    {n.count > 1 && ` és további ${n.count - 1} ember`}
                                    {n.type === 'like' && ' kedvelte a posztodat.'}
                                    {n.type === 'comment' && ' kommentált a képedhez.'}
                                    {n.type === 'follow' && ' elkezdett követni téged.'}
                                    {n.type === 'implementation' && ' megvalósította az ötletedet!'}
                                  </>
                                )}
                                <span className="notif-time">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </li>

                <li className="nav-item">
                  <Link to="/messages" className="nav-link" onClick={closeMobileMenu} title="Üzenetek" style={{ display: 'flex', alignItems: 'center', fontSize: '1.4rem', color: '#00d2ff' }}>
                    <FaEnvelope />
                  </Link>
                </li>

                <li className="nav-item user-profile-link" style={{ flexShrink: 0 }}>
                  <Link to="/profile" className="nav-link" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                    {user.avatar_url && user.avatar_url.includes('http') ? (
                      <img src={user.avatar_url} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <FaUserCircle style={{ fontSize: '1.5rem', flexShrink: 0 }} />
                    )}
                    <span>{user.username}</span>
                  </Link>
                </li>

                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link" title="Kijelentkezés" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1.4rem', color: 'var(--text-secondary)' }}>
                    <FaSignOutAlt />
                  </button>
                </li>
              </>
            )}

          </ul>
        </nav>
      </div>

      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={closeConfirmModal} style={{ zIndex: 9999 }}>
          <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="confirm-actions">
              <button onClick={closeConfirmModal} className="confirm-btn-cancel">Mégse</button>
              <button onClick={confirmModal.onConfirm} className="confirm-btn-danger">{confirmModal.confirmBtnText || 'Igen, törlöm'}</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;