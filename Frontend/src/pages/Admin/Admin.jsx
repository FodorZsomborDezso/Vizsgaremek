// React es routing fuggosegek importalasa
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Ikonok importalasa a felulethez
import { FaTrash, FaUsers, FaImages, FaShieldAlt, FaExclamationTriangle, FaHeart, FaEye, FaTimes, FaCommentDots, FaUserShield, FaEnvelope, FaLightbulb } from 'react-icons/fa';

// Ertesitesek kezelesehez szukseges fuggoseg
import { toast } from 'react-toastify';

// Komponens stiluslapjanak beemelese
import './Admin.css';

// Admin fuggvenykomponens definialasa
const Admin = () => {
  // Navigacio es fobb allapotvaltozok deklaralasa
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hirlevelhez tartozo allapotvaltozok
  const [newsletterText, setNewsletterText] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkContent, setBulkContent] = useState('');
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // UI reszletekhez tartozo allapotvaltozok
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [viewingIdea, setViewingIdea] = useState(null);

  // Megerosito ablak allapotanak kezelese
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Megerosito ablak bezarasa
  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  // Jogosultsag ellenorzese es adatok betoltese betolteskor
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) { navigate('/login'); return; }
    if (JSON.parse(userStr).role !== 'admin') { navigate('/'); return; }
    
    fetchData(token);
  }, [navigate]);

  // Admin adatok lekerese a szerverrol
  const fetchData = async (token) => {
    setLoading(true);
    try {
      const usersRes = await fetch('http://localhost:3000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (usersRes.ok) setUsers(await usersRes.json());

      const postsRes = await fetch('http://localhost:3000/api/admin/posts', { headers: { 'Authorization': `Bearer ${token}` } });
      if (postsRes.ok) setPosts(await postsRes.json());

      const reportsRes = await fetch('http://localhost:3000/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } });
      if (reportsRes.ok) setReports(await reportsRes.json());

      const feedbackRes = await fetch('http://localhost:3000/api/admin/feedbacks', { headers: { 'Authorization': `Bearer ${token}` } });
      if (feedbackRes.ok) setFeedbacks(await feedbackRes.json());

      const ideasRes = await fetch('http://localhost:3000/api/admin/ideas', { headers: { 'Authorization': `Bearer ${token}` } });
      if (ideasRes.ok) setIdeas(await ideasRes.json());

      const newsRes = await fetch('http://localhost:3000/api/admin/newsletter-content', { headers: { 'Authorization': `Bearer ${token}` } });
      if (newsRes.ok) setNewsletterText((await newsRes.json()).content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Felhasznalo torlesenek megerositse es vegrehajtasa
  const handleDeleteUser = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Felhasználó törlése',
      message: 'Biztosan törlöd ezt a felhasználót? Minden posztja és kommentje is végleg törlődni fog!',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { 
          setUsers(users.filter(u => u.id !== id)); 
          fetchData(token); 
          toast.success("Felhasználó törölve."); 
        }
      }
    });
  };

  // Admin jogosultsag kiosztasanak megerositse es vegrehajtasa
  const handleMakeAdmin = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Admin jogosultság adása',
      message: 'Biztosan ADMIN jogosultságot adsz ennek a felhasználónak? Innentől ő is törölhet bármit!',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`http://localhost:3000/api/admin/users/${id}/role`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'admin' })
          });
          if (res.ok) {
            setUsers(users.map(u => u.id === id ? { ...u, role: 'admin' } : u));
            toast.success("Sikeresen kinevezted adminná!");
          } else { 
            toast.error("Hiba a módosításkor."); 
          }
        } catch (e) { 
          toast.error("Szerver hiba."); 
        }
      }
    });
  };

  // Poszt torlesenek megerositse es vegrehajtasa
  const handleDeletePost = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Poszt törlése',
      message: 'Biztosan törlöd ezt a posztot?',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/admin/posts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { 
          setPosts(posts.filter(p => p.id !== id)); 
          toast.success("Poszt törölve."); 
        }
      }
    });
  };

  // Otlet torlesenek megerositse es vegrehajtasa
  const handleDeleteIdea = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ötlet törlése',
      message: 'Biztosan törlöd ezt az ötletet?',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/admin/ideas/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { 
          setIdeas(ideas.filter(i => i.id !== id)); 
          toast.success("Ötlet törölve."); 
        }
      }
    });
  };

  // Visszajelzes torlesenek megerositse es vegrehajtasa
  const handleDeleteFeedback = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Visszajelzés törlése',
      message: 'Biztosan törlöd ezt a visszajelzést? (Pl. mert már megoldottad)',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/admin/feedbacks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setFeedbacks(feedbacks.filter(f => f.id !== id));
      }
    });
  };

  // Jelentes elutasitasa es eltavolitasa a listarol
  const handleDismissReport = async (reportId) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3000/api/admin/reports/${reportId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setReports(reports.filter(r => r.id !== reportId));
    setSelectedReport(null);
    toast.info("Jelentés elutasítva.");
  };

  // Jelentett tartalom torlesenek megerositse es vegrehajtasa
  const handleDeleteContent = (report) => {
    setConfirmModal({
      isOpen: true,
      title: 'Jelentett tartalom törlése',
      message: 'Biztosan törlöd a jelentett tartalmat? Ezt nem lehet visszavonni!',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        try {
          if (report.target_type === 'post') {
            await fetch(`http://localhost:3000/api/admin/posts/${report.target_id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });
          } else if (report.target_type === 'comment') {
            await fetch(`http://localhost:3000/api/admin/comments/${report.target_id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });
          } else if (report.target_type === 'idea') {
            await fetch(`http://localhost:3000/api/admin/ideas/${report.target_id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });
          }
          await fetch(`http://localhost:3000/api/admin/reports/${report.id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });

          setReports(reports.filter(r => r.id !== report.id));
          setSelectedReport(null);
          fetchData(token);
          toast.success("Tartalom és jelentés törölve.");
        } catch(e) { 
          console.error("Hiba a moderáció során:", e); 
        }
      }
    });
  };

  // Hirlevel szovegenek mentese a szerverre
  const handleSaveNewsletter = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/admin/newsletter-content', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newsletterText })
      });
      if (res.ok) toast.success("Hírlevél szövege sikeresen frissítve!");
      else toast.error("Hiba a hírlevél mentése során.");
    } catch (e) { 
      toast.error("Szerver hiba."); 
    }
  };

  // Tomeges hirlevel kuldesenek megerositse es vegrehajtasa
  const handleSendBulkNewsletter = async () => {
    if (!bulkSubject.trim() || !bulkContent.trim()) {
      toast.warning("A tárgy és a tartalom megadása is kötelező!");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Hírlevél kiküldése mindenkinek',
      message: 'Biztosan kiküldöd ezt az e-mailt MINDEN aktív feliratkozónak? Ezt a műveletet utólag nem lehet visszavonni!',
      onConfirm: async () => {
        closeConfirmModal();
        setIsSendingBulk(true);
        const token = localStorage.getItem('token');
        try {
          const res = await fetch('http://localhost:3000/api/admin/send-newsletter', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject: bulkSubject, content: bulkContent })
          });
          const data = await res.json();
          if (res.ok) {
            toast.success(data.message);
            setBulkSubject('');
            setBulkContent('');
          } else {
            toast.error(data.error || "Hiba a kiküldés során.");
          }
        } catch (e) { 
          toast.error("Szerver hiba."); 
        } finally { 
          setIsSendingBulk(false); 
        }
      }
    });
  };

  // Tolto kepernyo megjelenitese amig az adatok megerkeznek
  if (loading) return <div className="loading-screen">Adatok betöltése folyamatban...</div>;

  // Fo felulet renderelese
  return (
    <div className="admin-container">
      
      {/* Admin fejlec */}
      <div className="admin-header">
        <h1><FaShieldAlt className="icon-danger" /> Adminisztrációs Központ</h1>
      </div>

      {/* Navigacios fulek */}
      <div className="admin-tabs">
        <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}><FaExclamationTriangle /> Jelentések ({reports.length})</button>
        <button className={activeTab === 'feedbacks' ? 'active' : ''} onClick={() => setActiveTab('feedbacks')}><FaCommentDots /> Visszajelzések ({feedbacks.length})</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><FaUsers /> Felhasználók ({users.length})</button>
        <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}><FaImages /> Posztok ({posts.length})</button>
        <button className={activeTab === 'ideas' ? 'active' : ''} onClick={() => setActiveTab('ideas')}><FaLightbulb /> Ötletek ({ideas.length})</button>
        <button className={activeTab === 'newsletter' ? 'active' : ''} onClick={() => setActiveTab('newsletter')}><FaEnvelope /> Hírlevél</button>
      </div>

      {/* Tartalmi resz fulek szerint */}
      <div className="admin-content">
        
        {/* Jelentesek fule */}
        {activeTab === 'reports' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Bejelentő</th><th>Típus</th><th>Indoklás</th><th>Dátum</th><th>Művelet</th></tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map(r => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>
                        <Link to={`/user/${r.username || r.reporter_name || r.reporter_username}`} className="admin-link">
                          @{r.username || r.reporter_name || r.reporter_username || "Ismeretlen"}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${r.target_type === 'post' ? 'badge-post' : r.target_type === 'comment' ? 'badge-comment' : 'badge-info'}`}>
                          {r.target_type.toUpperCase()}
                        </span>
                      </td>
                      <td>{r.reason}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-action btn-warning" onClick={() => setSelectedReport(r)}>
                          <FaEye /> Megtekintés
                        </button>
                      </td>
                    </tr>
                  ))
                ) : ( <tr><td colSpan="6" className="table-empty">Nincs új bejelentés. Minden rendben van!</td></tr> )}
              </tbody>
            </table>
          </div>
        )}

        {/* Hirlevel fule */}
        {activeTab === 'newsletter' && (
          <div className="newsletter-container">
            
            {/* Udvözlö uzenet szerkesztese */}
            <div className="newsletter-card">
              <h2>Hírlevél Üdvözlő Üzenet Szerkesztése</h2>
              <p className="newsletter-desc">
                Ez a kiemelt szöveg fog megjelenni abban az e-mailben, amit a felhasználók kapnak, amikor feliratkoznak a hírlevélre.
              </p>
              <textarea
                value={newsletterText}
                onChange={(e) => setNewsletterText(e.target.value)}
                rows="6"
                className="form-textarea"
                placeholder="Írd ide az aktuális híreket, újdonságokat, amiket az új feliratkozók látni fognak..."
              ></textarea>
              <div className="newsletter-actions">
                <button className="btn-safe" onClick={handleSaveNewsletter}>
                  Szöveg Mentése
                </button>
              </div>
            </div>

            {/* Tomeges hirlevel kuldese */}
            <div className="newsletter-card">
              <h2>Új Hírlevél Kiküldése (Mindenkinek)</h2>
              <p className="newsletter-desc">
                Ezzel az opcióval azonnali e-mailt küldhetsz az összes aktív hírlevél-feliratkozónak.
              </p>
              <input 
                type="text" 
                value={bulkSubject} 
                onChange={(e) => setBulkSubject(e.target.value)} 
                placeholder="Hírlevél tárgya (pl.: Heti összefoglaló, Új funkciók!)" 
                className="form-input"
              />
              <textarea
                value={bulkContent}
                onChange={(e) => setBulkContent(e.target.value)}
                rows="8"
                className="form-textarea"
                placeholder="Írd ide a hírlevél részletes tartalmát..."
              ></textarea>
              <div className="newsletter-actions">
                <button 
                  className={`btn-safe ${isSendingBulk ? 'btn-disabled' : ''}`} 
                  onClick={handleSendBulkNewsletter} 
                  disabled={isSendingBulk}
                >
                  {isSendingBulk ? 'Kiküldés folyamatban...' : 'Küldés Mindenkinek'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visszajelzesek fule */}
        {activeTab === 'feedbacks' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Felhasználó</th><th>Típus</th><th>Üzenet</th><th>Dátum</th><th>Művelet</th></tr>
              </thead>
              <tbody>
                {feedbacks.length > 0 ? (
                  feedbacks.map(f => (
                    <tr key={f.id}>
                      <td>#{f.id}</td>
                      <td>
                        {f.username || f.name ? (
                          <Link to={`/user/${f.username || f.name}`} className="admin-link">
                            @{f.username || f.name}
                          </Link>
                        ) : (
                          <span className="text-muted">Nincs név megadva</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${f.type === 'Hiba' ? 'badge-error' : f.type === 'Javaslat' ? 'badge-success' : 'badge-info'}`}>
                          {f.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="table-message">{f.message}</td>
                      <td>{new Date(f.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-action btn-danger-action" onClick={() => handleDeleteFeedback(f.id)}>
                          <FaTrash /> Törlés
                        </button>
                      </td>
                    </tr>
                  ))
                ) : ( <tr><td colSpan="6" className="table-empty">Nincs új visszajelzés.</td></tr> )}
              </tbody>
            </table>
          </div>
        )}

        {/* Felhasznalok fule */}
        {activeTab === 'users' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Név</th><th>Email</th><th>Szerepkör</th><th>Művelet</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>
                      <Link to={`/user/${u.username}`} className="admin-link">
                        @{u.username}
                      </Link>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role.toUpperCase()}</span></td>
                    <td>
                      {u.role !== 'admin' && (
                        <div className="action-group">
                          <button className="btn-action btn-success" onClick={() => handleMakeAdmin(u.id)} title="Adminná tétel">
                            <FaUserShield /> Admin
                          </button>
                          <button className="btn-action btn-danger-action" onClick={() => handleDeleteUser(u.id)}>
                            <FaTrash /> Törlés
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Posztok fule */}
        {activeTab === 'posts' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
              <tr><th>ID</th><th>Feltöltő</th><th>Kép</th><th>Cím</th><th>Leírás</th><th>Lájkok</th><th>Művelet</th></tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <Link to={`/user/${p.username}`} className="admin-link">
                        @{p.username}
                      </Link>
                    </td>
                    <td>
                      <img 
                        src={p.image_url} 
                        alt="thumbnail" 
                        className="admin-thumbnail interactive" 
                      onClick={() => setViewingPost(p)} 
                      />
                    </td>
                    <td><strong>{p.title}</strong></td>
                  <td className="table-message">
                    {p.description ? (p.description.length > 50 ? `${p.description.substring(0, 50)}...` : p.description) : <span className="text-muted">Nincs leírás</span>}
                  </td>
                    <td><FaHeart className="icon-danger"/> {p.like_count || 0}</td>
                    <td>
                      <div className="action-group">
                      <button className="btn-action btn-info" onClick={() => setViewingPost(p)}>
                          <FaEye /> Megtekintés
                        </button>
                        <button className="btn-action btn-danger-action" onClick={() => handleDeletePost(p.id)}>
                          <FaTrash /> Törlés
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

    {/* Otletek fule */}
    {activeTab === 'ideas' && (
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Feltöltő</th><th>Kategória</th><th>Cím</th><th>Leírás</th><th>Dátum</th><th>Művelet</th></tr>
          </thead>
          <tbody>
            {ideas.map(i => (
              <tr key={i.id}>
                <td>#{i.id}</td>
                <td>
                  <Link to={`/user/${i.username}`} className="admin-link">
                    @{i.username}
                  </Link>
                </td>
                <td><span className="badge badge-info">{i.category_name}</span></td>
                <td><strong>{i.title}</strong></td>
                <td className="table-message">
                  {i.description.length > 50 ? `${i.description.substring(0, 50)}...` : i.description}
                </td>
                <td>{new Date(i.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-group">
                    <button className="btn-action btn-info" onClick={() => setViewingIdea(i)}>
                      <FaEye /> Megtekintés
                    </button>
                    <button className="btn-action btn-danger-action" onClick={() => handleDeleteIdea(i.id)}>
                      <FaTrash /> Törlés
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
      </div>

      {/* Admin specifikus Poszt megtekinto modal */}
      {viewingPost && (
        <div className="admin-modal-overlay" onClick={() => setViewingPost(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>Poszt Részletei</h2>
              <button onClick={() => setViewingPost(null)} className="modal-close-btn"><FaTimes /></button>
            </div>

            <p><strong>Feltöltő:</strong> <Link to={`/user/${viewingPost.username}`} className="admin-link" onClick={() => setViewingPost(null)}>@{viewingPost.username}</Link></p>
            <p><strong>Dátum:</strong> {new Date(viewingPost.created_at).toLocaleDateString()}</p>
            <p><strong>Kedvelések száma:</strong> <FaHeart className="icon-danger" /> {viewingPost.like_count || 0}</p>
            
            <h3 className="modal-subtitle">Cím: {viewingPost.title}</h3>
            
            {viewingPost.description && (
              <blockquote className="modal-quote" style={{ borderLeftColor: '#3498db' }}>
                {viewingPost.description}
              </blockquote>
            )}

            <div className="modal-preview-container">
              <div className="modal-preview-bg" style={{ backgroundImage: `url(${viewingPost.image_url})` }} />
              <img src={viewingPost.image_url} alt="Poszt kép" className="modal-preview-img" />
            </div>

            <div className="admin-modal-actions">
              <button onClick={() => setViewingPost(null)} className="btn-safe">
                Bezárás
              </button>
              <button onClick={() => { setViewingPost(null); handleDeletePost(viewingPost.id); }} className="btn-danger">
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderacios felugro ablak jelentesekhez */}
      {selectedReport && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>Jelentés Ellenőrzése</h2>
              <button onClick={() => setSelectedReport(null)} className="modal-close-btn"><FaTimes /></button>
            </div>

            <p><strong>Bejelentő:</strong> <Link to={`/user/${selectedReport.username || selectedReport.reporter_name || selectedReport.reporter_username}`} className="admin-link">@{selectedReport.username || selectedReport.reporter_name || selectedReport.reporter_username || "Ismeretlen"}</Link></p>
            <p><strong>Indok:</strong> {selectedReport.reason}</p>

            <div className="reported-content-preview">
              {/* Poszt jelentesenek elonezete */}
              {selectedReport.target_type === 'post' && (
                selectedReport.post_image ? (
                  <>
                    <h3 className="modal-subtitle">Jelentett Poszt: {selectedReport.post_title}</h3>
                    <div className="modal-preview-container">
                      <div className="modal-preview-bg" style={{ backgroundImage: `url(${selectedReport.post_image})` }} />
                      <img src={selectedReport.post_image} alt="Reported" className="modal-preview-img" />
                    </div>
                  </>
                ) : (<p className="text-danger">Ezt a posztot már törölték az adatbázisból!</p>)
              )}

              {/* Komment jelentesenek elonezete */}
              {selectedReport.target_type === 'comment' && (
                selectedReport.comment_text ? (
                  <>
                    <h3 className="modal-subtitle">Jelentett Komment:</h3>
                    <blockquote className="modal-quote">
                      "{selectedReport.comment_text}"
                    </blockquote>
                  </>
                ) : (<p className="text-danger">Ezt a kommentet már törölték az adatbázisból!</p>)
              )}

              {/* Otlet jelentesenek elonezete */}
              {selectedReport.target_type === 'idea' && (
                selectedReport.idea_title ? (
                  <>
                    <h3 className="modal-subtitle">Jelentett Ötlet: {selectedReport.idea_title}</h3>
                    <blockquote className="modal-quote" style={{ borderLeftColor: '#f39c12' }}>
                      {selectedReport.idea_description}
                    </blockquote>
                  </>
                ) : (<p className="text-danger">Ezt az ötletet már törölték az adatbázisból!</p>)
              )}
            </div>

            <div className="admin-modal-actions">
              <button onClick={() => handleDismissReport(selectedReport.id)} className="btn-safe">
                Jelentés Elutasítása
              </button>
              <button onClick={() => handleDeleteContent(selectedReport)} className="btn-danger">
                Tartalom Törlése!
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Otlet megtekinto felugro ablak */}
      {viewingIdea && (
        <div className="admin-modal-overlay" onClick={() => setViewingIdea(null)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>Ötlet Részletei</h2>
              <button onClick={() => setViewingIdea(null)} className="modal-close-btn"><FaTimes /></button>
            </div>

            <p><strong>Feltöltő:</strong> <Link to={`/user/${viewingIdea.username}`} className="admin-link" onClick={() => setViewingIdea(null)}>@{viewingIdea.username}</Link></p>
            <p><strong>Kategória:</strong> <span className="badge badge-info">{viewingIdea.category_name}</span></p>
            <p><strong>Dátum:</strong> {new Date(viewingIdea.created_at).toLocaleDateString()}</p>
            
            <h3 className="modal-subtitle">Cím: {viewingIdea.title}</h3>
            
            <blockquote className="modal-quote" style={{ borderLeftColor: '#f39c12' }}>
              {viewingIdea.description}
            </blockquote>

            <div className="admin-modal-actions">
              <button onClick={() => setViewingIdea(null)} className="btn-safe">
                Bezárás
              </button>
              <button onClick={() => { setViewingIdea(null); handleDeleteIdea(viewingIdea.id); }} className="btn-danger">
                Törlés
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin specifikus Megerosito modal */}
      {confirmModal.isOpen && (
        <div className="admin-confirm-overlay" onClick={closeConfirmModal}>
          <div className="admin-confirm-content" onClick={e => e.stopPropagation()}>
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="admin-confirm-actions">
              <button onClick={closeConfirmModal} className="admin-confirm-cancel">Mégse</button>
              <button onClick={confirmModal.onConfirm} className="admin-confirm-danger">Igen, folytatom</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;