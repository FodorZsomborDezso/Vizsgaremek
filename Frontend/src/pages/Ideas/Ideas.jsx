// React es routing fuggosegek importalasa
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Ikonok importalasa a felulethez
import { FaSearch, FaFilter, FaSortAmountDown, FaLightbulb, FaUserCircle, FaPlus, FaTimes, FaHeart, FaPaperPlane, FaFlag, FaDownload, FaShareAlt, FaBookmark, FaHistory, FaTrash } from 'react-icons/fa';

// Ertesitesek kezelesehez szukseges fuggoseg
import { toast } from 'react-toastify';

// Komponens stiluslapjanak beemelese
import './Ideas.css'; 

// Ideas fuggvenykomponens definialasa
const Ideas = () => {
  // Navigacios hook inicializalasa
  const navigate = useNavigate();

  // Jelentes modal allapotanak kezelese
  const [reportModal, setReportModal] = useState({ isOpen: false, targetType: '', targetId: null, reason: '' });

  // Otletek es toltesi allapot kezelese
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kereseshez es szureshez tartozo allapotok
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest'); 

  // Felhasznalo sajat kedveleseinek tarolasa
  const [myLikedPosts, setMyLikedPosts] = useState([]);

  // Otlet reszleteit megjeleno modal allapotai
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [implementations, setImplementations] = useState([]);
  const [isImplLoading, setIsImplLoading] = useState(false);

  // Uj otlet letrehozasanak modal allapotai
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category_id: '1' });

  // Kep lightbox es kommentek allapotai
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [newPostComment, setNewPostComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  // Mentes (gyujtemenyek) modal allapotai
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState(null);
  const [myCollections, setMyCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Kategoriak csoportositott listaja
  const categoryGroups = [
    {
      label: 'Fotózás',
      items: ['Természet', 'Város / Építészet', 'Portré', 'Makró Fotózás', 'Éjszakai Fotózás']
    },
    {
      label: 'Digitális Művészet',
      items: ['Digitális Art', '3D Render', 'Illusztráció', 'Koncepciórajz', 'AI Művészet']
    },
    {
      label: 'Klasszikus Művészet',
      items: ['Festmény', 'Rajz / Grafika', 'Szobrászat']
    },
    {
      label: 'Tervezés & Design',
      items: ['Design', 'Web / UI Design', 'Logó / Arculat', 'Tipográfia', 'Tech']
    }
  ];

  // Kategoria nevek es azonositoik lekepezese
  const categoryMap = {
    'Természet': 1, 'Város / Építészet': 2, 'Tech': 3, 'Digitális Art': 4,
    'Design': 5, 'Portré': 6, 'Makró Fotózás': 7, 'Éjszakai Fotózás': 8,
    '3D Render': 9, 'Illusztráció': 10, 'Koncepciórajz': 11, 'AI Művészet': 12,
    'Festmény': 13, 'Rajz / Grafika': 14, 'Szobrászat': 15, 'Web / UI Design': 16,
    'Logó / Arculat': 17, 'Tipográfia': 18
  };

  // Alapadatok betoltese a komponens indulaskor
  useEffect(() => {
    fetch('http://localhost:3000/api/ideas')
      .then(res => res.json())
      .then(data => { setIdeas(data); setLoading(false); })
      .catch(err => { console.error(err); toast.error("Hiba az ötletek betöltésekor!"); setLoading(false); });

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/my-likes', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setMyLikedPosts(data); })
        .catch(err => console.error(err));
    }
  }, []);

  // Keresesi elozmenyek betoltese a helyi tarolobol
  useEffect(() => {
    const savedHistory = localStorage.getItem('ideasSearchHistory');
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, []);

  // Kereso debounce logikaja es elozmenyek mentese
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm.trim().length >= 3) {
        setSearchHistory(prev => {
          const newHistory = [searchTerm, ...prev.filter(h => h !== searchTerm)].slice(0, 5);
          localStorage.setItem('ideasSearchHistory', JSON.stringify(newHistory));
          return newHistory;
        });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Otletek szurese es rendezese a felhasznaloi beallitasok alapjan
  const filteredIdeas = ideas
    .filter(idea => {
      const searchLower = debouncedSearchTerm.toLowerCase().replace('#', '');
      const matchesSearch = 
        idea.title.toLowerCase().includes(searchLower) || 
        idea.description.toLowerCase().includes(searchLower) ||
        (idea.tags && idea.tags.toLowerCase().includes(searchLower)); 
      
      const matchesCategory = selectedCategory === '' || idea.category_name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Uj otlet letrehozasanak engedelyezese bejelentkezes utan
  const handleOpenCreateModal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info("Új ötlet megosztásához kérlek jelentkezz be!");
      navigate('/login');
    } else {
      setIsCreateModalOpen(true);
    }
  };

  // Uj otlet bekuldese a szerverre
  const handleCreateIdeaSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newIdea)
      });
      if (res.ok) {
        toast.success("Ötlet sikeresen közzétéve!");
        setIsCreateModalOpen(false);
        setNewIdea({ title: '', description: '', category_id: '1' });
        const refresh = await fetch('http://localhost:3000/api/ideas');
        setIdeas(await refresh.json());
      } else {
        toast.error("Hiba az ötlet létrehozásakor.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    }
  };

  // Otlet reszleteinek es megvalositasainak megnyitasa
  const openIdeaModal = async (idea) => {
    setSelectedIdea(idea);
    setIsImplLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/ideas/${idea.id}/implementations`);
      const data = await res.json();
      setImplementations(data);
    } catch (err) {
      toast.error("Hiba a megvalósítások betöltésekor.");
    } finally {
      setIsImplLoading(false);
    }
  };

  // Otlet modal bezarasa
  const closeIdeaModal = () => {
    setSelectedIdea(null);
    setImplementations([]);
  };

  // Kedveles kezelese
  const handleLike = async (e, postId) => {
    e.stopPropagation(); 
    const token = localStorage.getItem('token');
    if (!token) return toast.info("Kérlek, jelentkezz be a kedveléshez!");

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        if (data.liked) setMyLikedPosts([...myLikedPosts, postId]);
        else setMyLikedPosts(myLikedPosts.filter(id => id !== postId));

        setImplementations(implementations.map(impl => 
          impl.id === postId ? { ...impl, like_count: data.liked ? impl.like_count + 1 : impl.like_count - 1 } : impl
        ));

        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({ ...selectedPost, like_count: data.liked ? selectedPost.like_count + 1 : selectedPost.like_count - 1 });
        }
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  // Cimkere kattintas kezelese kereseshez
  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    closePostLightbox(); 
    closeIdeaModal();    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keresesi elozmeny kivalasztasa
  const handleHistoryClick = (term) => {
    setSearchTerm(term);
  };

  // Keresesi elozmenyek torlese
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('ideasSearchHistory');
    toast.info("Keresési előzmények törölve.");
  };

  // Kep letoltesenek kezelese
  const handleDownload = async (e, postId, title) => {
    e.stopPropagation(); 
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/image`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'alkotas'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Kép letöltve!");
    } catch (error) { toast.error("Hiba a letöltés során."); }
  };

  // Kep linkjenek vagolapra masolasa
  const handleShare = (e, image_url) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image_url);
    toast.info("Kép linkje másolva a vágólapra!");
  };

  // Jelentes modal megnyitasa
  const handleReport = (type, id) => {
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A jelentéshez be kell jelentkezned!");
    setReportModal({ isOpen: true, targetType: type, targetId: id, reason: '' });
  };

  // Jelentes modal bezarasa
  const closeReportModal = () => {
    setReportModal({ isOpen: false, targetType: '', targetId: null, reason: '' });
  };

  // Jelentes bekuldese a szerverre
  const submitReport = async () => {
    if (!reportModal.reason.trim()) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ target_type: reportModal.targetType, target_id: reportModal.targetId, reason: reportModal.reason })
      });
      if (response.ok) {
        toast.success("Köszönjük! A jelentést továbbítottuk az adminisztrátoroknak.");
        closeReportModal();
      } else {
        toast.error("Hiba történt a jelentés küldésekor.");
      }
    } catch (error) { 
      console.error(error); 
      toast.error("Szerver hiba."); 
    }
  };

  // Mentes modal megnyitasa es gyujtemenyek lekerese
  const openSaveModal = async (e, post) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A mentéshez be kell jelentkezned!");

    setPostToSave(post);
    setShowSaveModal(true);

    try {
      const res = await fetch('http://localhost:3000/api/collections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMyCollections(await res.json());
    } catch (err) { console.error(err); }
  };

  // Uj gyujtemeny letrehozasa
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newCollectionName })
      });
      if (res.ok) {
        const newCol = await res.json();
        setMyCollections([newCol, ...myCollections]); 
        setNewCollectionName('');
        toast.success("Új mappa létrehozva!");
      }
    } catch (err) { toast.error("Hiba történt."); }
  };

  // Kep mentese kivalasztott gyujtemenybe
  const saveToCollection = async (collectionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/collections/${collectionId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ postId: postToSave.id })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Kép elmentve a mappába!`);
        setShowSaveModal(false);
      } else {
        toast.error(data.error || "Hiba a mentéskor.");
      }
    } catch (err) { toast.error("Hiba a mentéskor."); }
  };

  // Lightbox megnyitasa adott kephez
  const openPostLightbox = async (post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
      setPostComments(await res.json());
    } catch (err) { console.error(err); }
  };

  // Lightbox bezarasa
  const closePostLightbox = () => {
    setSelectedPost(null);
    setPostComments([]);
    setNewPostComment('');
  };

  // Uj hozzaszolas kuldese a kepez
  const handlePostCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newPostComment.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return toast.warning("A kommenteléshez be kell jelentkezned!");

    setIsCommentLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newPostComment })
      });

      if (res.ok) {
        setNewPostComment('');
        const commentsRes = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`);
        setPostComments(await commentsRes.json());
      } else {
        toast.error("Hiba a komment elküldésekor.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Fo UI renderelese
  return (
    <div className="ideas-page-layout">
      
      {/* Bal oldali sav a szurokkel */}
      <aside className="ideas-sidebar">
        <div className="sidebar-sticky-content">
          <h2 className="sidebar-title"><FaFilter /> Szűrők</h2>
          
          <div className="filter-group">
            <label>Keresés</label>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Ötlet vagy #címke..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          
          {/* Keresesi elozmenyek listazasa */}
          {searchHistory.length > 0 && (
            <div className="search-history-container">
              <div className="search-history-header">
                <span><FaHistory className="icon-margin-right" /> Előzmények</span>
                <button onClick={clearHistory} className="btn-icon-only"><FaTrash /></button>
              </div>
              <div className="search-history-tags">
                {searchHistory.map((term, index) => (
                  <span key={index} onClick={() => handleHistoryClick(term)} className="search-history-tag">{term}</span>
                ))}
              </div>
            </div>
          )}

          <div className="filter-group">
            <label><FaSortAmountDown /> Rendezés</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select styled-select">
              <option value="latest">Legújabbak elöl</option>
              <option value="oldest">Legrégebbiek elöl</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Kategóriák</label>
            <div className="category-list">
              <button 
                className={`category-list-item ${selectedCategory === '' ? 'active' : ''}`} 
                onClick={() => setSelectedCategory('')}
                data-text="Minden kategória"
              >
                Minden kategória
              </button>
              
              {categoryGroups.map((group) => (
                <div key={group.label} className="category-group-section">
                  <div className="category-group-title">
                    {group.label}
                  </div>
                  
                  {group.items.map(cat => (
                    <button 
                      key={cat} 
                      className={`category-list-item ${selectedCategory === cat ? 'active' : ''}`} 
                      onClick={() => setSelectedCategory(cat)}
                      data-text={cat}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Jobb oldali fo tartalom */}
      <main className="ideas-main">
        <div className="ideas-header-row">
          <h1 className="ideas-title">Ötletbörze <FaLightbulb className="icon-yellow" /></h1>
          <button onClick={handleOpenCreateModal} className="new-idea-btn">
            <FaPlus className="icon-margin-right" /> Új Ötlet
          </button>
        </div>

        {loading ? (
          <div className="ideas-grid">
            {/* Tolto kepernyohoz skeleton vazak */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="idea-skeleton-card">
                <div className="idea-skeleton-header"><div className="idea-skeleton-badge"></div><div className="idea-skeleton-date"></div></div>
                <div className="idea-skeleton-title"></div><div className="idea-skeleton-desc"></div>
                <div className="idea-skeleton-footer"><div className="idea-skeleton-author"></div></div>
              </div>
            ))}
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="empty-state">Nincs a szűrőknek megfelelő ötlet.</div>
        ) : (
          <div className="ideas-grid">
            {/* Otlet kartyak listazasa */}
            {filteredIdeas.map(idea => (
              <div key={idea.id} className="idea-card cursor-pointer" onClick={() => openIdeaModal(idea)}>
                <div className="idea-card-header">
                  <span className="idea-badge">{idea.category_name}</span>
                  <span className="idea-date">{new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
                <div className="idea-card-body">
                  <h3 className="idea-card-title">{idea.title}</h3>
                  <p className="idea-card-desc">{idea.description}</p>
                </div>
                <div className="idea-card-footer">
                  <Link to={`/user/${idea.username}`} className="idea-author" onClick={e => e.stopPropagation()}>
                    {idea.avatar_url && idea.avatar_url.includes('http') ? <img src={idea.avatar_url} alt="avatar" className="author-avatar" /> : <FaUserCircle className="author-placeholder" />}
                    <span>@{idea.username}</span>
                  </Link>
                  <button className="implement-btn" onClick={(e) => { e.stopPropagation(); navigate(`/upload?idea_id=${idea.id}`); }}>
                    Megvalósítom!
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Uj otlet letrehozasa modal */}
      {isCreateModalOpen && (
        <div className="lightbox-overlay overlay-z-4000" onClick={() => setIsCreateModalOpen(false)}>
          <div className="create-idea-modal" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setIsCreateModalOpen(false)}><FaTimes /></button>
            <h2>Oszd meg az ötleted! </h2>
            <p className="modal-subtitle">Inspirálj másokat egy jó koncepcióval, és nézd meg, hogyan valósítják meg!</p>
            
            <form onSubmit={handleCreateIdeaSubmit} className="create-idea-form">
              <label>Kategória</label>
              <select 
                value={newIdea.category_id} 
                onChange={(e) => setNewIdea({...newIdea, category_id: e.target.value})}
                className="form-select"
              > 
                {categoryGroups.map(group => (
                  <optgroup key={group.label} label={`- ${group.label}`}>
                    {group.items.map(cat => (
                      <option key={cat} value={categoryMap[cat]}>{cat}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <label>Ötlet címe</label>
              <input type="text" placeholder="Pl. Cyberpunk esős utca..." required value={newIdea.title} onChange={(e) => setNewIdea({...newIdea, title: e.target.value})} className="form-input" />

              <label>Leírás és részletek</label>
              <textarea placeholder="Írd le részletesen, milyen hangulatot, színeket, formákat képzelsz el..." required rows="5" value={newIdea.description} onChange={(e) => setNewIdea({...newIdea, description: e.target.value})} className="form-textarea"></textarea>

              <button type="submit" className="new-idea-btn btn-full-width">Közzététel</button>
            </form>
          </div>
        </div>
      )}

      {/* Mentes gyujtemenybe modal */}
      {showSaveModal && postToSave && (
        <div className="lightbox-overlay overlay-z-6000" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal-content" onClick={e => e.stopPropagation()}>
            <div className="save-modal-header">
              <h3>Mentés ide:</h3>
              <button className="close-btn" onClick={() => setShowSaveModal(false)}><FaTimes /></button>
            </div>
            <div className="save-modal-body">
              <img src={postToSave.image_url} alt="Kép" className="save-preview-img" />
              <div className="collections-list">
                {myCollections.length === 0 ? (
                  <p className="no-collections">Még nincs egyetlen mappád sem.</p>
                ) : (
                  myCollections.map(col => (
                    <button key={col.id} className="collection-btn" onClick={() => saveToCollection(col.id)}>
                      <FaBookmark className="icon-blue-margin" />
                      {col.name}
                    </button>
                  ))
                )}
              </div>
              <form className="create-collection-form" onSubmit={handleCreateCollection}>
                <input type="text" placeholder="Új mappa neve..." value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} className="create-collection-input" />
                <button type="submit" disabled={!newCollectionName.trim()} className="create-collection-submit">Létrehozás</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Otlet reszletei es megvalositasai modal */}
      {selectedIdea && !selectedPost && (
        <div className="lightbox-overlay" onClick={closeIdeaModal}>
          <div className="idea-modal-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closeIdeaModal}><FaTimes /></button>
            
            <div className="idea-modal-header-section">
              <span className="idea-badge">{selectedIdea.category_name}</span>
              <h2>{selectedIdea.title}</h2>
              <p>{selectedIdea.description}</p>
              <div className="idea-modal-author" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Ötletgazda: <Link to={`/user/${selectedIdea.username}`} onClick={closeIdeaModal} className="link-no-decor" style={{ color: 'var(--text-primary)' }}><strong>@{selectedIdea.username}</strong></Link></span>
                <button onClick={() => handleReport('idea', selectedIdea.id)} className="btn-icon-only" title="Ötlet jelentése" style={{ color: '#e74c3c', fontSize: '1rem' }}>
                  <FaFlag />
                </button>
              </div>
            </div>

            <div className="implementations-section">
              <div className="impl-section-header">
                <h3>Közösségi megvalósítások ({implementations.length})</h3>
                <button className="implement-btn" onClick={() => navigate(`/upload?idea_id=${selectedIdea.id}`)}>
                  Én is megvalósítom!
                </button>
              </div>

              {isImplLoading ? (
                <div className="loading-spinner">Képek betöltése...</div>
              ) : implementations.length === 0 ? (
                <div className="empty-state">Még senki sem valósította meg ezt az ötletet. Légy te az első!</div>
              ) : (
                <div className="impl-grid">
                  {implementations.map(impl => {
                    const isLiked = myLikedPosts.includes(impl.id);
                    return (
                      <div key={impl.id} className="impl-card cursor-pointer" onClick={() => openPostLightbox(impl)}>
                        <div className="impl-image-wrapper">
                          <img src={impl.image_url} alt={impl.title} />
                        </div>
                        <div className="impl-info">
                          <span className="impl-author">@{impl.username}</span>
                          <span 
                            className={`impl-likes ${isLiked ? 'liked' : ''}`} 
                            onClick={(e) => handleLike(e, impl.id)}
                          >
                            <FaHeart /> {impl.like_count}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Galeria stilusu kep lightbox modal */}
      {selectedPost && (
        <div className="lightbox-overlay overlay-z-5000" onClick={closePostLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closePostLightbox}><FaTimes /></button>
            
            <div className="lightbox-left">
              <div className="lightbox-blur-bg" style={{ backgroundImage: `url(${selectedPost.image_url})` }}></div>
              <img src={selectedPost.image_url} alt={selectedPost.title} className="lightbox-main-img" />
            </div>

            <div className="lightbox-right">
              <div className="lightbox-header">
                <div className="lightbox-header-top">
                  <Link to={`/user/${selectedPost.username}`} onClick={closePostLightbox} className="lightbox-author link-no-decor">
                    {selectedPost.avatar_url && selectedPost.avatar_url.includes('http') ? (
                      <img src={selectedPost.avatar_url} alt="avatar" className="author-avatar" />
                    ) : (
                      <FaUserCircle className="author-placeholder" />
                    )}
                    <div>
                      <span className="author-name">@{selectedPost.username}</span>
                      <span className="post-date">{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </div>
                
                <h2 className="lightbox-title">{selectedPost.title}</h2>
                {selectedPost.description && <p className="lightbox-description">{selectedPost.description}</p>}
                
                {selectedPost.tags && (
                  <div className="lightbox-tags">
                    {selectedPost.tags.split(',').map(tag => (
                      <span key={tag} className="lightbox-tag" onClick={() => handleTagClick(tag.trim())}>
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="lightbox-actions-bar">
                <button 
                  onClick={(e) => handleLike(e, selectedPost.id)} 
                  className={`lb-action-btn ${myLikedPosts.includes(selectedPost.id) ? 'liked' : ''}`}
                >
                  <FaHeart /> {selectedPost.like_count}
                </button>
                <button onClick={(e) => openSaveModal(e, selectedPost)} className="lb-action-btn">
                  <FaBookmark /> Mentés
                </button>
                <button onClick={(e) => handleDownload(e, selectedPost.id, selectedPost.title)} className="lb-action-btn">
                  <FaDownload /> Letöltés
                </button>
                <button onClick={(e) => handleShare(e, selectedPost.image_url)} className="lb-action-btn">
                  <FaShareAlt />
                </button>
                <button onClick={() => handleReport('post', selectedPost.id)} className="lb-action-btn report-btn" title="Jelentés">
                  <FaFlag />
                </button>
              </div>

              <div className="lightbox-comments">
                {postComments.length === 0 ? (
                  <div className="no-comments">Legyél te az első, aki hozzászól!</div>
                ) : (
                  postComments.map(comment => (
                    <div key={comment.id} className="comment-bubble">
                      <div className="comment-header">
                        <Link to={`/user/${comment.username}`} onClick={closePostLightbox} className="comment-user link-no-decor">
                          @{comment.username}
                        </Link>
                        <button onClick={() => handleReport('comment', comment.id)} className="comment-report-btn">
                          Jelentés
                        </button>
                      </div>
                      <div className="comment-text">{comment.content}</div>
                      <div className="comment-time">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="lightbox-footer">
                <form onSubmit={handlePostCommentSubmit} className="comment-form">
                  <input type="text" placeholder="Írj egy kommentet..." value={newPostComment} onChange={(e) => setNewPostComment(e.target.value)} className="form-input" />
                  <button type="submit" disabled={!newPostComment.trim() || isCommentLoading}><FaPaperPlane /></button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Egyedi jelentes modal */}
      {reportModal.isOpen && (
        <div className="confirm-modal-overlay overlay-z-9999" onClick={closeReportModal}>
          <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Jelentés beküldése</h3>
            <p className="modal-text">Kérlek indokold meg, miért jelented ezt a tartalmat (pl. spam, sértő tartalom):</p>
            
            <textarea 
              value={reportModal.reason} 
              onChange={(e) => setReportModal({...reportModal, reason: e.target.value})}
              rows="4"
              className="report-textarea"
              placeholder="Ide írd az indoklást..."
              autoFocus
            />
            
            <div className="confirm-actions">
              <button onClick={closeReportModal} className="confirm-btn-cancel">Mégse</button>
              <button onClick={submitReport} className="confirm-btn-danger" disabled={!reportModal.reason.trim()}>Beküldés</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Ideas;