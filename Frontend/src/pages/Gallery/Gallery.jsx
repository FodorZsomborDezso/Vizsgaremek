import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaDownload, FaShareAlt, FaSearch, FaFilter, FaSortAmountDown, FaTimes, FaPaperPlane, FaUserCircle, FaFlag, FaCloudUploadAlt, FaBookmark, FaHistory, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Gallery.css';

const Gallery = () => {
  // Navigacio es alapveto allapotok
  const navigate = useNavigate();
  const location = useLocation(); 

  const [reportModal, setReportModal] = useState({ isOpen: false, targetType: '', targetId: null, reason: '' });
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Szuro allapotok
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  // Lightbox, lajk es komment allapotok
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [myLikedPosts, setMyLikedPosts] = useState([]);

  // Gyujtemeny allapotok
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState(null);
  const [myCollections, setMyCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Kategoriak csoportositasa a szuro menuhoz
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

  // Sajat lajkok letoltese az elso betolteskor
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/my-likes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMyLikedPosts(data);
      })
      .catch(err => console.error(err));
    }
  }, []);

  // Keresesi elozmenyek betoltese inditaskor
  useEffect(() => {
    const savedHistory = localStorage.getItem('gallerySearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Kereses url parameterekbol
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQ = params.get('search');
    if (searchQ) {
      setSearchTerm(searchQ.replace('#', ''));
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate, location.pathname]);

  // Megnyitas ertesitesbol
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const postId = params.get('postId');
    
    if (postId) {
      fetch(`http://localhost:3000/api/posts/${postId}`)
        .then(res => res.json())
        .then(post => {
            if (post && !post.error) {
                openLightbox(post);
                navigate(location.pathname, { replace: true });
            }
        })
        .catch(err => console.error("Hiba a poszt betöltésekor:", err));
    }
  }, [location.search, navigate]);

  // Keresoszo kesleltetese
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm.trim().length >= 3) {
        setSearchHistory(prev => {
          const newHistory = [searchTerm, ...prev.filter(h => h !== searchTerm)].slice(0, 5);
          localStorage.setItem('gallerySearchHistory', JSON.stringify(newHistory));
          return newHistory;
        });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Posztok letoltese a szerverrol
  const fetchPosts = async (pageNumber, currentSearch, currentCategory, currentSort, reset = false, controller = null) => {
    setLoading(true);
    try {
      const fetchOptions = controller ? { signal: controller.signal } : {};
      
      const res = await fetch(
        `http://localhost:3000/api/gallery?page=${pageNumber}&limit=12&search=${encodeURIComponent(currentSearch)}&category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`,
        fetchOptions
      );
      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
        if (reset) setPosts([]);
      } else {
        setPosts(prevPosts => reset ? data : [...prevPosts, ...data]);
      }
    } catch (error) {
      if (error.name === 'AbortError') return; 
      console.error("Hiba:", error);
      toast.error("Hiba a képek betöltésekor!");
    } finally {
      setLoading(false);
    }
  };

  // Automatikus frissites figyelo
  useEffect(() => {
    const controller = new AbortController(); 
    
    setPage(1);
    setHasMore(true);
    setPosts([]);
    
    fetchPosts(1, debouncedSearchTerm, selectedCategory, sortBy, true, controller);

    return () => controller.abort(); 
  }, [debouncedSearchTerm, selectedCategory, sortBy]);

  // Vege-gorgetes figyelo logika
  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Uj adag betoltese gorgetesnel
  useEffect(() => {
    if (page > 1) fetchPosts(page, debouncedSearchTerm, selectedCategory, sortBy, false);
  }, [page]);

  // Lajkolas kezelese
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

        setPosts(posts.map(post => 
          post.id === postId ? { ...post, like_count: data.liked ? post.like_count + 1 : post.like_count - 1 } : post
        ));

        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({
            ...selectedPost,
            like_count: data.liked ? selectedPost.like_count + 1 : selectedPost.like_count - 1
          });
        }
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  // Mentes modal megnyitasa
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

  // Mentes a gyujtemenybe
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

  // Jelentes elkuldese
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

  // Kep letoltese
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
    } catch (error) {
      toast.error("Hiba a letöltés során.");
    }
  };

  // Escape gomb figyelese ablakok bezarasahoz
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPost(null);
        setComments([]);
        setShowSaveModal(false);
        setReportModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Kep megosztasa
  const handleShare = (e, image_url) => {
    e.stopPropagation();
    navigator.clipboard.writeText(image_url);
    toast.info("Kép linkje másolva a vágólapra!");
  };

  // Cimkere kattintas kezelese
  const handleTagClick = (tag) => {
    setSearchTerm(tag);
    closeLightbox();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Elozmeny elemre kattintas
  const handleHistoryClick = (term) => {
    setSearchTerm(term);
  };

  // Elozmenyek torlese
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('gallerySearchHistory');
    toast.info("Keresési előzmények törölve.");
  };

  // Lightbox megnyitasa es kommentek betoltese
  const openLightbox = async (post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Lightbox bezarasa
  const closeLightbox = () => {
    setSelectedPost(null);
    setComments([]);
    setNewComment('');
  };

  // Komment elkuldese
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return toast.warning("A kommenteléshez be kell jelentkezned!");

    setIsCommentLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        setNewComment('');
        const commentsRes = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      } else {
        toast.error("Hiba a komment elküldésekor.");
      }
    } catch (err) {
      toast.error("Szerver hiba.");
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Komponens renderelese
  return (
    <div className="gallery-page-layout">
      
      {/* Bal oldali szurosav */}
      <aside className="gallery-sidebar">
        <div className="sidebar-sticky-content">
          <h2 className="sidebar-title"><FaFilter /> Szűrők</h2>

          <div className="filter-group">
            <label>Keresés</label>
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Cím vagy #címke..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {searchHistory.length > 0 && (
              <div className="search-history">
                <div className="history-header">
                  <span><FaHistory className="history-icon" /> Előzmények</span>
                  <button onClick={clearHistory} className="clear-history-btn" title="Előzmények törlése"><FaTrash /></button>
                </div>
                <div className="history-tags">
                  {searchHistory.map((term, index) => (
                    <span key={index} className="history-tag" onClick={() => handleHistoryClick(term)}>
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="filter-group">
            <label><FaSortAmountDown /> Rendezés</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="styled-select">
              <option value="latest">Legújabbak elöl</option>
              <option value="popular">Legnépszerűbbek (Lájkok)</option>
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

      {/* Jobb oldali tartalom rács */}
      <main className="gallery-main">
        <div className="gallery-header-row">
          <h1 className="gallery-title">Felfedezés</h1>
          
          <Link to="/upload" className="upload-action-btn">
            <FaCloudUploadAlt className="upload-icon" /> 
            Új kép feltöltése
          </Link>
        </div>

        <div className="masonry-grid">
          {posts.map((post, index) => {
            const isLiked = myLikedPosts.includes(post.id);
            const isLastElement = posts.length === index + 1;
            
            return (
              <div 
                key={post.id} 
                className="gallery-card" 
                onClick={() => openLightbox(post)}
                ref={isLastElement ? lastPostElementRef : null}
              >
                <div className="card-image-wrapper">
                  <span className="card-badge">{post.category_name}</span>
                  <img src={post.image_url} alt={post.title} loading="lazy" onLoad={(e) => e.target.classList.add('loaded')} />
                  
                  <div className="quick-actions-container">
                    <button 
                      className="quick-save-btn"
                      onClick={(e) => openSaveModal(e, post)}
                      title="Mentés gyűjteménybe"
                    >
                      <FaBookmark />
                    </button>
                    
                    <button 
                      className={`quick-like-btn ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => handleLike(e, post.id)}
                      title={isLiked ? "Nincs már a kedvencek közt" : "Kedvelés"}
                    >
                      <FaHeart />
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="card-title" title={post.title}>{post.title}</h3>
                  
                  <p className="card-author">
                    Készítette: <Link to={`/user/${post.username}`} onClick={e => e.stopPropagation()} className="author-link">@{post.username}</Link>
                  </p>
                  
                  <div className="card-footer">
                    <span 
                      className={`card-likes-btn ${isLiked ? 'liked' : ''}`} 
                      onClick={(e) => handleLike(e, post.id)}
                    >
                      <FaHeart /> {post.like_count}
                    </span>
                    
                    <div className="card-actions">
                      <button onClick={(e) => handleShare(e, post.image_url)} title="Link másolása"><FaShareAlt /></button>
                      <button onClick={(e) => handleDownload(e, post.id, post.title)} title="Letöltés"><FaDownload /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Betoltesi csontvaz */}
        {loading && (
          <div className="masonry-grid">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="gallery-card skeleton-card">
                <div className="card-image-wrapper skeleton-image"></div>
                <div className="card-content">
                  <div className="skeleton-line title-line"></div>
                  <div className="skeleton-line author-line"></div>
                  <div className="card-footer skeleton-footer">
                     <div className="skeleton-circle"></div>
                     <div className="skeleton-circle"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && <div className="empty-state">Nincs a szűrőknek megfelelő kép. 😢</div>}
        {!hasMore && posts.length > 0 && <div className="end-message">Elértél a galéria végére! 🏁</div>}
      </main>

      {/* Mentes modal */}
      {showSaveModal && postToSave && (
        <div className="save-modal-overlay" onClick={() => setShowSaveModal(false)}>
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
                    <button key={col.id} className="collection-item-btn" onClick={() => saveToCollection(col.id)}>
                      <FaBookmark className="modal-bookmark-icon" />
                      {col.name}
                    </button>
                  ))
                )}
              </div>

              <form className="create-collection-form" onSubmit={handleCreateCollection}>
                <input 
                  type="text" 
                  placeholder="Új mappa neve..." 
                  value={newCollectionName} 
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <button type="submit" disabled={!newCollectionName.trim()}>Létrehozás</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox nezet */}
      {selectedPost && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closeLightbox}><FaTimes /></button>
            
            <div className="lightbox-left">
              <div 
                className="lightbox-blur-bg" 
                style={{ backgroundImage: `url(${selectedPost.image_url})` }}
              ></div>
              <img src={selectedPost.image_url} alt={selectedPost.title} className="lightbox-main-img" />
            </div>

            <div className="lightbox-right">
              
              <div className="lightbox-header">
                <div className="lightbox-header-top">
                  <Link to={`/user/${selectedPost.username}`} onClick={closeLightbox} className="lightbox-author lightbox-author-link">
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
                {comments.length === 0 ? (
                  <div className="no-comments">Legyél te az első, aki hozzászól! ✨</div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-bubble">
                      <div className="comment-header">
                        <Link to={`/user/${comment.username}`} onClick={closeLightbox} className="comment-user comment-user-link">
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
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <input 
                    type="text" 
                    placeholder="Írj egy kommentet..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button type="submit" disabled={!newComment.trim() || isCommentLoading}>
                    <FaPaperPlane />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Jelentes modal */}
      {reportModal.isOpen && (
        <div className="confirm-modal-overlay report-modal-index" onClick={closeReportModal}>
          <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Jelentés beküldése</h3>
            <p className="report-modal-text">Kérlek indokold meg, miért jelented ezt a tartalmat (pl. spam, sértő tartalom):</p>
            
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

export default Gallery;