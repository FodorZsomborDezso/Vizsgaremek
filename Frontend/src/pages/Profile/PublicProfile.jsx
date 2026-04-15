import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, FaUserPlus, FaUserCheck, FaEnvelope, 
  FaUserCircle, FaHeart, FaTimes, FaPaperPlane, FaLock, 
  FaUserFriends, FaCamera, FaBookmark, FaArrowLeft,
  FaDownload, FaShareAlt, FaFlag, FaLightbulb
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './PublicProfile.css'; 

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  // Alapveto allapotok
  const [reportModal, setReportModal] = useState({ isOpen: false, targetType: '', targetId: null, reason: '' });
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kovetes es baratsag allapotok
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingMe, setIsFollowingMe] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Fulek es gyujtemenyek allapotai
  const [activeTab, setActiveTab] = useState('posts'); 
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [collectionPosts, setCollectionPosts] = useState([]);

  // Otletek allapotai
  const [userIdeas, setUserIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [implementations, setImplementations] = useState([]);
  const [isImplLoading, setIsImplLoading] = useState(false);

  // Lightbox es kep funkciok allapotai
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [newPostComment, setNewPostComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [myLikedPostIds, setMyLikedPostIds] = useState([]); 

  // Mentes allapotai
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState(null);
  const [mySaveCollections, setMySaveCollections] = useState([]); 
  const [newCollectionName, setNewCollectionName] = useState('');

  const loggedInUserStr = localStorage.getItem('user');
  const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;

  const isFriend = isFollowing && isFollowingMe;

  // Profil adatainak betoltese
  useEffect(() => {
    if (loggedInUser && loggedInUser.username === username) {
      navigate('/profile');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${username}`);
        if (!res.ok) {
          toast.error("Felhasználó nem található!");
          navigate('/');
          return;
        }
        const data = await res.json();
        setProfileUser(data.user);
        setPosts(data.posts);
        setFollowersCount(data.user.followers_count);

        const token = localStorage.getItem('token');
        
        try {
          const colRes = await fetch(`http://localhost:3000/api/users/${data.user.username}/collections`);
          if (colRes.ok) {
            setCollections(await colRes.json());
          }
        } catch (e) { console.error("Hiba a gyűjtemények lekérésekor", e); }

        try {
          const ideaRes = await fetch(`http://localhost:3000/api/users/${data.user.username}/ideas`);
          if (ideaRes.ok) {
            setUserIdeas(await ideaRes.json());
          }
        } catch (e) { console.error("Hiba az ötletek lekérésekor", e); }

        if (token && data.user) {
          const followRes = await fetch(`http://localhost:3000/api/users/${data.user.id}/is-following`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (followRes.ok) {
            const followData = await followRes.json();
            setIsFollowing(followData.isFollowing);
            setIsFollowingMe(followData.isFollowingMe);
          }

          const likesRes = await fetch('http://localhost:3000/api/my-likes', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (likesRes.ok) {
            const likesData = await likesRes.json();
            if (Array.isArray(likesData)) setMyLikedPostIds(likesData);
          }
        }
      } catch (err) {
        console.error("Hiba a profil betöltésekor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate, loggedInUser]);

  // Kovetes kezelese
  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A követéshez be kell jelentkezned!");

    try {
      const res = await fetch(`http://localhost:3000/api/users/${profileUser.id}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.followed);
        setFollowersCount(prev => data.followed ? prev + 1 : prev - 1);
        
        if (data.followed && isFollowingMe) {
          toast.success(`Szuper! Mostantól ismerősök vagytok @${profileUser.username}-val!`);
        } else {
          toast.success(data.followed ? `Követed őt: @${profileUser.username}!` : "Követés leállítva.");
        }
      }
    } catch (err) { toast.error("Szerver hiba a követésnél."); }
  };

  // Gyujtemenyek bongeszese
  const openCollection = async (collection) => {
    setActiveCollection(collection); 
    try {
      const res = await fetch(`http://localhost:3000/api/collections/${collection.id}/posts`);
      if (res.ok) {
        setCollectionPosts(await res.json());
      }
    } catch (err) { toast.error("Hiba a gyűjtemény képeinek betöltésekor"); }
  };

  const closeCollection = () => { setActiveCollection(null); setCollectionPosts([]); };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    closeCollection(); 
  };

  // Otlet reszleteinek megnyitasa
  const openIdeaModal = async (idea) => {
    setSelectedIdea(idea);
    setIsImplLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/ideas/${idea.id}/implementations`);
      setImplementations(await res.json());
    } catch (err) { toast.error("Hiba a megvalósítások betöltésekor."); }
    finally { setIsImplLoading(false); }
  };

  const closeIdeaModal = () => {
    setSelectedIdea(null);
    setImplementations([]);
  };

  // Lightbox kezelese
  const openPostLightbox = async (post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
      setPostComments(await res.json());
    } catch (err) { console.error(err); }
  };

  const closePostLightbox = () => { setSelectedPost(null); setPostComments([]); setNewPostComment(''); };

  // Lajkolas
  const handleLike = async (e, postId) => {
    e.stopPropagation(); 
    const token = localStorage.getItem('token');
    if (!token) return toast.info("Kérlek, jelentkezz be a kedveléshez!");

    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();

      if (response.ok) {
        if (data.liked) setMyLikedPostIds([...myLikedPostIds, postId]);
        else setMyLikedPostIds(myLikedPostIds.filter(id => id !== postId));

        setPosts(posts.map(p => p.id === postId ? { ...p, like_count: (p.like_count || 0) + (data.liked ? 1 : -1) } : p));
        setCollectionPosts(collectionPosts.map(p => p.id === postId ? { ...p, like_count: (p.like_count || 0) + (data.liked ? 1 : -1) } : p));
        setImplementations(implementations.map(impl => impl.id === postId ? { ...impl, like_count: (impl.like_count || 0) + (data.liked ? 1 : -1) } : impl));

        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({ ...selectedPost, like_count: (selectedPost.like_count || 0) + (data.liked ? 1 : -1) });
        }
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  // Kep letoltese
  const handleDownload = async (e, postId, title) => {
    e.stopPropagation(); 
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${postId}/image`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${title || 'alkotas'}.jpg`; document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url);
      toast.success("Kép letöltve!");
    } catch (error) { toast.error("Hiba a letöltés során."); }
  };

  // Megosztas
  const handleShare = (e, image_url) => { e.stopPropagation(); navigator.clipboard.writeText(image_url); toast.info("Kép linkje másolva a vágólapra!"); };

  // Jelentes
  const handleReport = (type, id) => {
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A jelentéshez be kell jelentkezned!");
    setReportModal({ isOpen: true, targetType: type, targetId: id, reason: '' });
  };

  const closeReportModal = () => { setReportModal({ isOpen: false, targetType: '', targetId: null, reason: '' }); };

  const submitReport = async () => {
    if (!reportModal.reason.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ target_type: reportModal.targetType, target_id: reportModal.targetId, reason: reportModal.reason }) });
      if (response.ok) { toast.success("Köszönjük! A jelentést továbbítottuk az adminisztrátoroknak."); closeReportModal(); } else { toast.error("Hiba történt a jelentés küldésekor."); }
    } catch (error) { toast.error("Szerver hiba."); }
  };

  // Mentes modal megnyitasa
  const openSaveModal = async (e, post) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A mentéshez be kell jelentkezned!");
    setPostToSave(post); setShowSaveModal(true);
    try {
      const res = await fetch('http://localhost:3000/api/collections', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setMySaveCollections(await res.json());
    } catch (err) { console.error(err); }
  };

  // Uj mappa letrehozasa
  const handleCreateCollection = async (e) => {
    e.preventDefault(); if (!newCollectionName.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ name: newCollectionName }) });
      if (res.ok) { const newCol = await res.json(); setMySaveCollections([newCol, ...mySaveCollections]); setNewCollectionName(''); toast.success("Új mappa létrehozva!"); }
    } catch (err) { toast.error("Hiba történt."); }
  };

  // Mentes egy adott mappaba
  const saveToCollection = async (collectionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/collections/${collectionId}/add`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ postId: postToSave.id }) });
      const data = await res.json();
      if (res.ok) { toast.success(`Kép elmentve a mappába!`); setShowSaveModal(false); } else { toast.error(data.error || "Hiba a mentéskor."); }
    } catch (err) { toast.error("Hiba a mentéskor."); }
  };

  // Komment elkuldese
  const handlePostCommentSubmit = async (e) => {
    e.preventDefault(); if (!newPostComment.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A kommenteléshez be kell jelentkezned!");
    setIsCommentLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: newPostComment }) });
      if (res.ok) { setNewPostComment(''); const commentsRes = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`); setPostComments(await commentsRes.json()); } else { toast.error("Hiba a komment elküldésekor."); }
    } catch (err) { toast.error("Szerver hiba."); } finally { setIsCommentLoading(false); }
  };

  // Cimkere kattintas
  const handleTagClick = (tag) => {
    closePostLightbox();
    navigate(`/gallery?search=${encodeURIComponent(tag.trim())}`);
  };


  if (loading) return <div className="loading-spinner">Profil betöltése...</div>;
  if (!profileUser) return <div className="empty-state">Felhasználó nem található.</div>;

  const postAuthorName = selectedPost?.username || profileUser?.username || 'Ismeretlen';
  const postAuthorAvatar = selectedPost?.avatar_url || profileUser?.avatar_url;

  // Komponens renderelese
  return (
    <div className="public-profile-container">
      
      {/* Profil Kartya */}
      <div className="public-profile-card">
        <div className="public-cover-photo"></div>
        
        <div className="public-profile-content">
          <div className="public-avatar-wrapper">
            {profileUser.avatar_url && profileUser.avatar_url.includes('http') ? ( <img src={profileUser.avatar_url} alt="Avatar" className="public-avatar" /> ) : ( <div className="public-avatar avatar-placeholder"><FaUserCircle /></div> )}
          </div>
          
          <div className="public-name-section">
            <h1 className="public-name">{profileUser.full_name || profileUser.username}</h1>
            <p className="public-username">@{profileUser.username}</p>
            {isFollowingMe && !isFollowing && ( <div className="follows-you-badge">Visszaigazolásra vár (Követ téged)</div> )}
            {isFriend && ( <div className="friends-badge"><FaUserFriends /> Ismerősök vagytok</div> )}
          </div>

          <p className="public-bio">{profileUser.bio || "Ez a felhasználó még nem írt magáról."}</p>
          
          <div className="public-info-row">
            <span><FaMapMarkerAlt /> {profileUser.location || "Ismeretlen hely"}</span>
          </div>

          <div className="public-action-buttons">
            <button onClick={handleFollowToggle} className={`follow-btn ${isFollowing ? 'following' : ''}`}>
              {isFollowing ? <><FaUserCheck /> Követed</> : <><FaUserPlus /> Követés</>}
            </button>
            
            {isFriend ? (
              <button onClick={() => navigate('/messages', { state: { preselectedUser: profileUser } })} className="message-btn"><FaEnvelope /> Üzenet</button>
            ) : (
              <button className="message-btn locked" title="Csak ismerősöknek küldhetsz üzenetet!" disabled><FaLock /> Üzenet</button>
            )}
          </div>

          <div className="public-stats">
            <div className="stat-item"><span className="stat-value">{posts.length}</span><span className="stat-label">Poszt</span></div>
            <div className="stat-item"><span className="stat-value">{userIdeas.length}</span><span className="stat-label">Ötlet</span></div>
            <div className="stat-item"><span className="stat-value">{followersCount}</span><span className="stat-label">Követő</span></div>
            <div className="stat-item"><span className="stat-value">{profileUser.following_count}</span><span className="stat-label">Követett</span></div>
          </div>
        </div>
      </div>

      {/* Fulek Navigacio */}
      <div className="profile-tabs public-profile-tabs">
        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => handleTabChange('posts')}><FaCamera /> Alkotásai</button>
        <button className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`} onClick={() => handleTabChange('ideas')}><FaLightbulb /> Ötletei</button>
        <button className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`} onClick={() => handleTabChange('collections')}><FaBookmark /> Gyűjteményei</button>
      </div>

      {/* Tartalom: Alkotasok */}
      {activeTab === 'posts' && (
        <>
          <h3 className="public-gallery-title">@{profileUser.username} alkotásai</h3>
          <div className="public-gallery-grid">
            {posts.length > 0 ? (
              posts.map(post => (
                <div key={post.id} className="public-gallery-item" onClick={() => openPostLightbox(post)}>
                  <img src={post.image_url} alt={post.title} loading="lazy" />
                  <div className="overlay">
                    <span className="img-title">{post.title}</span>
                    <span className="img-likes"><FaHeart className="heart-icon-red"/> {post.like_count || 0}</span>
                  </div>
                </div>
              ))
            ) : ( <div className="empty-state">Még nem töltött fel képet.</div> )}
          </div>
        </>
      )}

      {/* Tartalom: Otletek */}
      {activeTab === 'ideas' && (
        <>
          <h3 className="public-gallery-title">@{profileUser.username} ötletei</h3>
          <div className="ideas-grid">
            {userIdeas.length > 0 ? (
              userIdeas.map(idea => (
                <div key={idea.id} className="idea-card" onClick={() => openIdeaModal(idea)}>
                  <div className="idea-card-header">
                    <span className="idea-badge">{idea.category_name}</span>
                    <span className="idea-date">{new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="idea-card-body">
                    <h3 className="idea-card-title">{idea.title}</h3>
                    <p className="idea-card-desc">{idea.description}</p>
                  </div>
                  <div className="idea-card-footer">
                    <button className="implement-btn" onClick={(e) => { e.stopPropagation(); navigate(`/upload?idea_id=${idea.id}`); }}>
                      Megvalósítom!
                    </button>
                  </div>
                </div>
              ))
            ) : ( <div className="empty-state">Ennek a felhasználónak még nincsenek ötletei.</div> )}
          </div>
        </>
      )}

      {/* Tartalom: Gyujtemenyek */}
      {activeTab === 'collections' && (
        !activeCollection ? (
          collections.length > 0 ? (
            <div className="collections-grid">
              {collections.map(col => (
                <div key={col.id} className="collection-card" onClick={() => openCollection(col)}>
                  <div className="collection-cover">
                    {col.cover_image ? ( <img src={col.cover_image} alt="Borító" /> ) : ( <div className="empty-cover"><FaBookmark /></div> )}
                    <div className="collection-count">{col.item_count} kép</div>
                  </div>
                  <h3 className="collection-title">{col.name}</h3>
                </div>
              ))}
            </div>
          ) : ( <div className="empty-state">Ennek a felhasználónak még nincsenek gyűjteményei.</div> )
        ) : (
          <div className="collection-view">
            <div className="collection-view-header">
              <button onClick={closeCollection} className="back-to-collections-btn"><FaArrowLeft /> Vissza a mappákhoz</button>
              <h2>{activeCollection.name}</h2>
            </div>
            
            <div className="public-gallery-grid">
              {collectionPosts.length > 0 ? (
                collectionPosts.map(post => (
                  <div key={post.id} className="public-gallery-item" onClick={() => openPostLightbox(post)}>
                    <img src={post.image_url} alt={post.title} loading="lazy" />
                    <div className="overlay">
                      <span className="img-title">{post.title}</span>
                      <span className="img-user">@{post.username}</span>
                    </div>
                  </div>
                ))
              ) : ( <div className="empty-state">Ez a mappa jelenleg üres.</div> )}
            </div>
          </div>
        )
      )}

      {/* Otlet reszletei modal */}
      {selectedIdea && !selectedPost && (
        <div className="lightbox-overlay idea-modal-overlay-zindex" onClick={closeIdeaModal}>
          <div className="idea-modal-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closeIdeaModal}><FaTimes /></button>
            
            <div className="idea-modal-header-section">
              <span className="idea-badge">{selectedIdea.category_name}</span>
              <h2>{selectedIdea.title}</h2>
              <p>{selectedIdea.description}</p>
              <div className="idea-modal-author">
                Ötletgazda: <strong>@{selectedIdea.username}</strong>
              </div>
            </div>

            <div className="implementations-section">
              <div className="implementations-header">
                <h3>Megvalósítások ({implementations.length})</h3>
                <button className="implement-btn" onClick={() => navigate(`/upload?idea_id=${selectedIdea.id}`)}>
                  Én is megvalósítom!
                </button>
              </div>

              {isImplLoading ? (
                <div className="loading-spinner">Képek betöltése...</div>
              ) : implementations.length === 0 ? (
                <div className="empty-state">Még senki sem valósította meg ezt az ötletet.</div>
              ) : (
                <div className="impl-grid">
                  {implementations.map(impl => {
                    const isLiked = myLikedPostIds.includes(impl.id);
                    return (
                      <div key={impl.id} className="impl-card" onClick={() => openPostLightbox(impl)}>
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

      {/* Mentes modal */}
      {showSaveModal && postToSave && (
        <div className="lightbox-overlay save-modal-zindex" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal-content" onClick={e => e.stopPropagation()}>
            <div className="save-modal-header">
              <h3>Mentés ide:</h3>
              <button className="close-btn" onClick={() => setShowSaveModal(false)}><FaTimes /></button>
            </div>
            <div className="save-modal-body">
              <img src={postToSave.image_url} alt="Kép" className="save-preview-img-modal" />
              <div className="collections-list">
                {mySaveCollections.length === 0 ? (
                  <p className="no-collections">Még nincs egyetlen mappád sem.</p>
                ) : (
                  mySaveCollections.map(col => (
                    <button key={col.id} className="collection-item-btn-full" onClick={() => saveToCollection(col.id)}>
                      <FaBookmark className="bookmark-icon-blue" />
                      {col.name}
                    </button>
                  ))
                )}
              </div>
              <form className="create-collection-form-flex" onSubmit={handleCreateCollection}>
                <input type="text" placeholder="Új mappa neve..." value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} className="create-collection-input" />
                <button type="submit" disabled={!newCollectionName.trim()} className="create-collection-submit">Létrehozás</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox modal */}
      {selectedPost && (
        <div className="lightbox-overlay lightbox-zindex" onClick={closePostLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closePostLightbox}><FaTimes /></button>
            
            <div className="lightbox-left">
              <div className="lightbox-blur-bg" style={{ backgroundImage: `url(${selectedPost.image_url})` }}></div>
              <img src={selectedPost.image_url} alt={selectedPost.title} className="lightbox-main-img" />
            </div>

            <div className="lightbox-right">
              <div className="lightbox-header">
                <div className="lightbox-header-top">
                  <Link to={`/user/${postAuthorName}`} onClick={closePostLightbox} className="lightbox-author lightbox-author-link">
                    {postAuthorAvatar && postAuthorAvatar.includes('http') ? ( <img src={postAuthorAvatar} alt="avatar" className="author-avatar" /> ) : ( <FaUserCircle className="author-placeholder" /> )}
                    <div>
                      <span className="author-name">@{postAuthorName}</span>
                      <span className="post-date">{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </div>
                
                <h2 className="lightbox-title">{selectedPost.title}</h2>
                {selectedPost.description && <p className="lightbox-description">{selectedPost.description}</p>}
                
                {selectedPost.tags && (
                  <div className="lightbox-tags">
                    {selectedPost.tags.split(',').map(tag => (
                      <span key={tag} className="lightbox-tag pointer-tag" onClick={() => handleTagClick(tag.trim())}>
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="lightbox-actions-bar">
                <button onClick={(e) => handleLike(e, selectedPost.id)} className={`lb-action-btn ${myLikedPostIds.includes(selectedPost.id) ? 'liked' : ''}`}>
                  <FaHeart /> {selectedPost.like_count || 0}
                </button>
                <button onClick={(e) => openSaveModal(e, selectedPost)} className="lb-action-btn"><FaBookmark /> Mentés</button>
                <button onClick={(e) => handleDownload(e, selectedPost.id, selectedPost.title)} className="lb-action-btn"><FaDownload /> Letöltés</button>
                <button onClick={(e) => handleShare(e, selectedPost.image_url)} className="lb-action-btn"><FaShareAlt /></button>
                <button onClick={() => handleReport('post', selectedPost.id)} className="lb-action-btn report-btn" title="Jelentés"><FaFlag /></button>
              </div>

              <div className="lightbox-comments">
                {postComments.length === 0 ? (
                  <div className="no-comments">Legyél te az első, aki hozzászól! ✨</div>
                ) : (
                  postComments.map(comment => (
                    <div key={comment.id} className="comment-bubble">
                      <div className="comment-header-row">
                        <Link to={`/user/${comment.username}`} onClick={closePostLightbox} className="comment-user lightbox-author-link">@{comment.username}</Link>
                        <button onClick={() => handleReport('comment', comment.id)} className="comment-report-btn">Jelentés</button>
                      </div>
                      <div className="comment-text">{comment.content}</div>
                      <div className="comment-time">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="lightbox-footer">
                <form onSubmit={handlePostCommentSubmit} className="comment-form">
                  <input type="text" placeholder="Írj egy kommentet..." value={newPostComment} onChange={(e) => setNewPostComment(e.target.value)} />
                  <button type="submit" disabled={!newPostComment.trim() || isCommentLoading}><FaPaperPlane /></button>
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

export default PublicProfile;