import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUserEdit, FaCamera, FaHeart, FaMapMarkerAlt, FaSignOutAlt, 
  FaUserCircle, FaTrash, FaTimes, FaCloudUploadAlt, FaPen, 
  FaBookmark, FaArrowLeft, FaDownload, FaShareAlt, FaFlag, FaPaperPlane, FaLightbulb, FaCrop
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../../Backend/Utils/cropImage';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  // Alapveto allapotok
  const [reportModal, setReportModal] = useState({ isOpen: false, targetType: '', targetId: null, reason: '' });
  const [user, setUser] = useState(null); 
  const [myPosts, setMyPosts] = useState([]); 
  const [likedPosts, setLikedPosts] = useState([]); 
  const [activeTab, setActiveTab] = useState('posts'); 
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Gyujtemeny allapotok
  const [collections, setCollections] = useState([]); 
  const [activeCollection, setActiveCollection] = useState(null); 
  const [collectionPosts, setCollectionPosts] = useState([]); 
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [postToSave, setPostToSave] = useState(null);
  const [myCollections, setMyCollections] = useState([]); 
  const [newCollectionName, setNewCollectionName] = useState('');

  // Otletek allapotai
  const [myIdeas, setMyIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [implementations, setImplementations] = useState([]);
  const [isImplLoading, setIsImplLoading] = useState(false);

  // Profil szerkesztes allapotok
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Profilkep vago allapotok
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Poszt szerkesztes allapotok
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [currentEditPost, setCurrentEditPost] = useState(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostDescription, setEditPostDescription] = useState('');
  const [isPostUpdating, setIsPostUpdating] = useState(false);

  // Lightbox allapotok
  const [selectedPost, setSelectedPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [newPostComment, setNewPostComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [myLikedPostIds, setMyLikedPostIds] = useState([]);

  // Megerosito modal allapot
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: null
  });

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
  };

  // Adatok lekerese a szerverrol
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    fetch('http://localhost:3000/api/my-posts', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMyPosts(data); })
      .catch(err => console.error(err));

    fetch('http://localhost:3000/api/my-liked-posts', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setLikedPosts(data); })
      .catch(err => console.error(err));

    fetch(`http://localhost:3000/api/users/${parsedUser.username}/collections`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCollections(data); })
      .catch(err => console.error(err));

    fetch(`http://localhost:3000/api/users/${parsedUser.username}/ideas`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMyIdeas(data); })
      .catch(err => console.error(err));

    fetch(`http://localhost:3000/api/users/${parsedUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setFollowersCount(data.user.followers_count);
          setFollowingCount(data.user.following_count);
        }
      })
      .catch(err => console.error(err));

    fetch('http://localhost:3000/api/my-likes', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMyLikedPostIds(data); })
      .catch(err => console.error(err));

  }, [navigate]);

  // Profilkep vagasanak logikaja
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setTempImageUrl(URL.createObjectURL(file));
      setIsCropping(true); 
    } else {
      toast.error("Kérlek, csak érvényes képfájlt (JPG, PNG) tölts fel!");
    }
    e.target.value = null; 
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedFile = await getCroppedImg(tempImageUrl, croppedAreaPixels);
      setEditAvatarFile(croppedFile);
      setEditAvatarPreview(URL.createObjectURL(croppedFile));
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      toast.error("Hiba történt a kép vágásakor!");
    }
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setTempImageUrl(null);
  };

  // Otlet modal megnyitasa es bezarasa
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

  // Otlet torlese
  const handleIdeaDelete = (e, ideaId) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true, title: 'Ötlet törlése',
      message: 'Biztosan törölni szeretnéd ezt az ötletet?',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`http://localhost:3000/api/ideas/${ideaId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            setMyIdeas(myIdeas.filter(i => i.id !== ideaId));
            toast.success("Ötlet törölve!");
          }
        } catch (err) { toast.error("Hiba az ötlet törlésekor"); }
      }
    });
  };

  // Gyujtemeny megnyitasa es bezarasa
  const openCollection = async (collection) => {
    setActiveCollection(collection); 
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/collections/${collection.id}/posts`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setCollectionPosts(data);
    } catch (err) { toast.error("Hiba a gyűjtemény betöltésekor"); }
  };

  const closeCollection = () => { setActiveCollection(null); setCollectionPosts([]); };

  // Gyujtemeny torlese
  const handleDeleteCollection = (collectionId) => {
    setConfirmModal({
      isOpen: true, title: 'Mappa törlése',
      message: 'Biztosan törölni szeretnéd ezt a teljes mappát?',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`http://localhost:3000/api/collections/${collectionId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            setCollections(collections.filter(c => c.id !== collectionId));
            closeCollection();
            toast.success("Mappa törölve!");
          }
        } catch (err) { toast.error("Hiba a mappa törlésekor"); }
      }
    });
  };

  // Kep eltavolitasa a gyujtemenybol
  const handleRemoveFromCollection = (e, postId) => {
    e.stopPropagation(); 
    setConfirmModal({
      isOpen: true, title: 'Kép eltávolítása',
      message: 'Biztosan ki szeretnéd venni ezt a képet ebből a mappából?',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`http://localhost:3000/api/collections/${activeCollection.id}/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) {
            setCollectionPosts(collectionPosts.filter(p => p.id !== postId)); 
            setCollections(collections.map(c => c.id === activeCollection.id ? {...c, item_count: c.item_count - 1} : c));
            toast.success("Kép eltávolítva a mappából!");
          }
        } catch (err) { toast.error("Hiba az eltávolításkor"); }
      }
    });
  };

  // Navigacio a fulek kozott
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    closeCollection(); 
  };

  // Profil szerkesztes modal megnyitasa
  const openEditModal = () => {
    setEditFullName(user.full_name || ''); setEditBio(user.bio || ''); setEditLocation(user.location || '');
    setEditAvatarFile(null); setEditAvatarPreview(user.avatar_url || null);
    setIsEditModalOpen(true);
  };

  // Profil adatok frissitese
  const handleProfileUpdate = async (e) => {
    e.preventDefault(); setIsUpdating(true);
    const formData = new FormData();
    formData.append('full_name', editFullName); formData.append('bio', editBio); formData.append('location', editLocation);
    if (editAvatarFile) formData.append('avatar', editAvatarFile);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/users/profile', { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user); 
        const oldStorage = JSON.parse(localStorage.getItem('user'));
        const newStorage = { ...oldStorage, ...data.user };
        localStorage.setItem('user', JSON.stringify(newStorage));
        window.dispatchEvent(new Event('authChange'));
        toast.success("Profil sikeresen frissítve!");
        setIsEditModalOpen(false); 
      } else { toast.error("Hiba történt a frissítéskor."); }
    } catch (error) { toast.error("Szerver hiba."); } finally { setIsUpdating(false); }
  };

  // Poszt szerkesztes modal megnyitasa
  const openEditPostModal = (e, post) => {
    e.stopPropagation(); setCurrentEditPost(post); setEditPostTitle(post.title); setEditPostDescription(post.description || ''); setIsEditPostModalOpen(true);
  };

  // Poszt adatainak frissitese
  const handlePostUpdate = async (e) => {
    e.preventDefault(); setIsPostUpdating(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${currentEditPost.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: editPostTitle, description: editPostDescription })
      });
      if (response.ok) {
        toast.success("Poszt sikeresen frissítve!");
        setMyPosts(myPosts.map(p => p.id === currentEditPost.id ? { ...p, title: editPostTitle, description: editPostDescription } : p));
        setIsEditPostModalOpen(false);
      } else { const data = await response.json(); toast.error(data.error || "Hiba a frissítéskor."); }
    } catch (error) { toast.error("Szerver hiba."); } finally { setIsPostUpdating(false); }
  };

  // Poszt torlese
  const handleDeletePost = (e, postId) => {
    e.stopPropagation(); 
    setConfirmModal({
      isOpen: true, title: 'Poszt végleges törlése', message: 'Biztosan törölni szeretnéd ezt a képet? Ezt a műveletet nem lehet visszavonni!',
      onConfirm: async () => {
        closeConfirmModal();
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`http://localhost:3000/api/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (response.ok) { setMyPosts(myPosts.filter(post => post.id !== postId)); toast.success("Poszt törölve!"); }
        } catch (error) { console.error("Hiba:", error); }
      }
    });
  };

  // Kijelentkezes
  const handleLogout = () => {
    setConfirmModal({
      isOpen: true, title: 'Kijelentkezés', message: 'Biztosan ki szeretnél lépni?',
      confirmBtnText: 'Kijelentkezés',
      onConfirm: () => {
        closeConfirmModal();
        localStorage.removeItem('token'); localStorage.removeItem('user'); window.dispatchEvent(new Event('authChange')); toast.info("Sikeresen kijelentkeztél!"); navigate('/login');
      }
    });
  };

  // Lightbox megnyitasa posztokhoz
  const openPostLightbox = async (post) => {
    setSelectedPost(post);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
      setPostComments(await res.json());
    } catch (err) { console.error(err); }
  };

  const closePostLightbox = () => {
    setSelectedPost(null); setPostComments([]); setNewPostComment('');
  };

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

        if (selectedPost && selectedPost.id === postId) {
          const currentLikes = selectedPost.like_count || 0;
          setSelectedPost({ ...selectedPost, like_count: data.liked ? currentLikes + 1 : currentLikes - 1 });
        }

        const updateGridLikes = (grid) => grid.map(p => 
          p.id === postId ? { ...p, like_count: (p.like_count || 0) + (data.liked ? 1 : -1) } : p
        );
        setMyPosts(updateGridLikes(myPosts));
        setLikedPosts(updateGridLikes(likedPosts));
        setCollectionPosts(updateGridLikes(collectionPosts));
        setImplementations(updateGridLikes(implementations)); 
      }
    } catch (error) { console.error("Hiba:", error); }
  };

  // Cimkere kattintas
  const handleTagClick = (tag) => {
    closePostLightbox();
    navigate(`/gallery?search=${encodeURIComponent(tag.trim())}`);
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
  const handleShare = (e, image_url) => {
    e.stopPropagation(); navigator.clipboard.writeText(image_url); toast.info("Kép linkje másolva a vágólapra!");
  };

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
      if (response.ok) { toast.success("Köszönjük! A jelentést továbbítottuk."); closeReportModal(); } else { toast.error("Hiba történt a jelentés küldésekor."); }
    } catch (error) { console.error(error); toast.error("Szerver hiba."); }
  };

  // Mentes modal
  const openSaveModal = async (e, post) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return toast.info("A mentéshez be kell jelentkezned!");
    setPostToSave(post); setShowSaveModal(true);
    try {
      const res = await fetch('http://localhost:3000/api/collections', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setMyCollections(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault(); if (!newCollectionName.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ name: newCollectionName }) });
      if (res.ok) { const newCol = await res.json(); setMyCollections([newCol, ...myCollections]); setNewCollectionName(''); toast.success("Új mappa létrehozva!"); }
    } catch (err) { toast.error("Hiba történt."); }
  };

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
    const token = localStorage.getItem('token'); setIsCommentLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: newPostComment }) });
      if (res.ok) { setNewPostComment(''); const commentsRes = await fetch(`http://localhost:3000/api/posts/${selectedPost.id}/comments`); setPostComments(await commentsRes.json()); } else { toast.error("Hiba a komment elküldésekor."); }
    } catch (err) { toast.error("Szerver hiba."); } finally { setIsCommentLoading(false); }
  };

  if (!user) return <div className="loading-spinner">Profil betöltése...</div>;

  const postAuthorName = selectedPost?.username || user?.username || 'Ismeretlen';
  const postAuthorAvatar = selectedPost?.avatar_url || user?.avatar_url;

  // Komponens renderelese
  return (
    <div className="profile-container">
      
      {/* Profil Kartya */}
      <div className="profile-card">
        <div className="cover-photo">
          <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> Kijelentkezés</button>
        </div>
        
        <div className="profile-content">
          <div className="avatar-wrapper">
            {user.avatar_url && user.avatar_url.includes('http') ? ( <img src={user.avatar_url} alt="Avatar" className="avatar" /> ) : ( <div className="avatar avatar-placeholder"><FaUserCircle /></div> )}
          </div>
          
          <div className="profile-name-section">
            <h1 className="profile-name">{user.full_name || user.username}</h1>
            <p className="profile-username">@{user.username}</p>
          </div>

          <p className="profile-bio">{user.bio || "Még nem írtál bemutatkozást."}</p>
          
          <div className="profile-info-row">
            <span><FaMapMarkerAlt /> {user.location || "Ismeretlen hely"}</span>
          </div>

          <button onClick={openEditModal} className="edit-profile-btn"><FaUserEdit /> Profil szerkesztése</button>

          <div className="profile-stats">
            <div className="stat-item"><span className="stat-value">{myPosts.length}</span><span className="stat-label">Poszt</span></div>
            <div className="stat-item"><span className="stat-value">{myIdeas.length}</span><span className="stat-label">Ötlet</span></div>
            <div className="stat-item"><span className="stat-value">{followersCount}</span><span className="stat-label">Követő</span></div>
            <div className="stat-item"><span className="stat-value">{followingCount}</span><span className="stat-label">Követett</span></div>
          </div>
        </div>
      </div>

      {/* Fulek */}
      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => handleTabChange('posts')}><FaCamera /> Saját képek</button>
        <button className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`} onClick={() => handleTabChange('ideas')}><FaLightbulb /> Ötletek</button>
        <button className={`tab-btn ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => handleTabChange('likes')}><FaHeart /> Kedvelések</button>
        <button className={`tab-btn ${activeTab === 'collections' ? 'active' : ''}`} onClick={() => handleTabChange('collections')}><FaBookmark /> Gyűjtemények</button>
      </div>

      {/* Sajat posztok es kedvelesek tab */}
      {(activeTab === 'posts' || activeTab === 'likes') && (
        <div className="profile-gallery-grid">
          {activeTab === 'posts' && (
            myPosts.length > 0 ? (
              myPosts.map(post => (
                <div key={post.id} className="profile-gallery-item" onClick={() => openPostLightbox(post)}>
                  <img src={post.image_url} alt={post.title} loading="lazy" />
                  <div className="overlay">
                    <span className="img-title">{post.title}</span>
                    <div className="post-actions-wrapper">
                      <button onClick={(e) => openEditPostModal(e, post)} className="action-btn edit-btn" title="Szerkesztés"><FaPen /></button>
                      <button onClick={(e) => handleDeletePost(e, post.id)} className="action-btn delete-btn" title="Törlés"><FaTrash /></button>
                    </div>
                  </div>
                </div>
              ))
            ) : ( <div className="empty-state">Még nem töltöttél fel képet.</div> )
          )}

          {activeTab === 'likes' && (
            likedPosts.length > 0 ? (
              likedPosts.map(post => (
                <div key={post.id} className="profile-gallery-item" onClick={() => openPostLightbox(post)}>
                  <img src={post.image_url} alt={post.title} loading="lazy" />
                  <div className="overlay">
                    <span className="img-title">{post.title}</span>
                    <span className="img-user">@{post.username}</span>
                  </div>
                </div>
              ))
            ) : ( <div className="empty-state">Még nem kedveltél egyetlen alkotást sem.</div> )
          )}
        </div>
      )}

      {/* Otletek tab */}
      {activeTab === 'ideas' && (
        <div className="ideas-grid">
          {myIdeas.length > 0 ? (
            myIdeas.map(idea => (
              <div key={idea.id} className="idea-card" onClick={() => openIdeaModal(idea)}>
                <div className="idea-card-header">
                  <span className="idea-badge">{idea.category_name}</span>
                  <span className="idea-date">{new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
                <div className="idea-card-body">
                  <h3 className="idea-card-title">{idea.title}</h3>
                  <p className="idea-card-desc">{idea.description}</p>
                </div>
                <div className="idea-card-footer idea-card-footer-right">
                   <button className="action-btn delete-btn inline-delete-btn" onClick={(e) => handleIdeaDelete(e, idea.id)} title="Ötlet törlése"><FaTrash /></button>
                </div>
              </div>
            ))
          ) : ( <div className="empty-state">Még nem osztottál meg ötletet. Ezt az Ötletbörze menüpontban teheted meg!</div> )}
        </div>
      )}

      {/* Gyujtemenyek tab */}
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
          ) : ( <div className="empty-state">Még nem hoztál létre gyűjteményt. Ezt a Galériában, a képeken lévő Mentés gombbal teheted meg!</div> )
        ) : (
          <div className="collection-view">
            <div className="collection-view-header">
              <button onClick={closeCollection} className="back-to-collections-btn"><FaArrowLeft /> Vissza a mappákhoz</button>
              <div className="collection-header-inner">
                <h2 className="collection-title-text">{activeCollection.name}</h2>
                <button onClick={() => handleDeleteCollection(activeCollection.id)} className="action-btn delete-btn inline-delete-btn" title="Mappa törlése"><FaTrash /></button>
              </div>
            </div>
            
            <div className="profile-gallery-grid">
              {collectionPosts.length > 0 ? (
                collectionPosts.map(post => (
                  <div key={post.id} className="profile-gallery-item" onClick={() => openPostLightbox(post)}>
                    <img src={post.image_url} alt={post.title} loading="lazy" />
                    <div className="overlay">
                        <span className="img-title">{post.title}</span>
                        <div className="post-actions-wrapper">
                          <button onClick={(e) => handleRemoveFromCollection(e, post.id)} className="action-btn delete-btn" title="Eltávolítás a mappából"><FaTimes /></button>
                        </div>
                      </div>
                  </div>
                ))
              ) : ( <div className="empty-state">Ez a mappa jelenleg üres.</div> )}
            </div>
          </div>
        )
      )}

      {/* Megerosito modal */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
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

      {/* Otlet modal */}
      {selectedIdea && !selectedPost && (
        <div className="idea-modal-overlay" onClick={closeIdeaModal}>
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
        <div className="save-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal-content" onClick={e => e.stopPropagation()}>
            <div className="save-modal-header">
              <h3>Mentés ide:</h3>
              <button className="close-btn" onClick={() => setShowSaveModal(false)}><FaTimes /></button>
            </div>
            <div className="save-modal-body">
              <img src={postToSave.image_url} alt="Kép" className="save-preview-img-modal" />
              <div className="collections-list">
                {myCollections.length === 0 ? (
                  <p className="no-collections">Még nincs egyetlen mappád sem.</p>
                ) : (
                  myCollections.map(col => (
                    <button key={col.id} className="collection-item-btn modal-collection-btn" onClick={() => saveToCollection(col.id)}>
                      <FaBookmark className="modal-bookmark-icon" />
                      {col.name}
                    </button>
                  ))
                )}
              </div>
              <form className="create-collection-form modal-create-form" onSubmit={handleCreateCollection}>
                <input type="text" placeholder="Új mappa neve..." value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} className="modal-create-input" />
                <button type="submit" disabled={!newCollectionName.trim()} className="modal-create-btn">Létrehozás</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profil szerkesztes modal */}
      {isEditModalOpen && (
        <div className="edit-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Profil Szerkesztése</h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="close-modal-btn"><FaTimes /></button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="edit-modal-form">
              <div className="form-group">
                <label>Teljes Név</label>
                <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="Pl: Kovács Anna" className="modern-input" />
              </div>

              <div className="form-group">
                <label>Rövid Bemutatkozás (Bio)</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Írj magadról pár sort..." rows="3" className="modern-input"></textarea>
              </div>

              <div className="form-group">
                <label>Helyszín</label>
                <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="Pl: Budapest, Magyarország" className="modern-input" />
              </div>

              <div className="form-group">
                <label>Új Profilkép</label>
                <div className="avatar-upload-row">
                  <div className="avatar-preview-box avatar-preview-round">
                    {editAvatarPreview ? <img src={editAvatarPreview} alt="Preview" className="avatar-preview-img" /> : <FaUserCircle className="avatar-placeholder-icon" />}
                  </div>
                  <label className="avatar-upload-label">
                    <FaCloudUploadAlt /> Kép kiválasztása
                    <input type="file" accept="image/*" className="hidden-input" onChange={handleAvatarFileChange} />
                  </label>
                </div>
              </div>

              <div className="edit-modal-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-cancel">Mégse</button>
                <button type="submit" disabled={isUpdating} className="btn-save">{isUpdating ? 'Mentés...' : 'Mentés'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crop modal profilkephez */}
      {isCropping && tempImageUrl && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h2><FaCrop /> Profilkép igazítása</h2>
            
            <div className="crop-container">
              <Cropper
                image={tempImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="crop-controls">
              <input 
                type="range" value={zoom} min={1} max={3} step={0.1}
                aria-labelledby="Zoom" onChange={(e) => setZoom(e.target.value)} className="zoom-slider"
              />
            </div>

            <div className="crop-modal-actions">
              <button type="button" onClick={cancelCrop} className="btn-cancel crop-cancel-btn">
                Mégse
              </button>
              <button type="button" onClick={showCroppedImage} className="btn-save crop-save-btn">
                Vágás és Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poszt szerkesztes modal */}
      {isEditPostModalOpen && (
        <div className="edit-modal-overlay edit-post-overlay">
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Poszt Szerkesztése</h2>
              <button type="button" onClick={() => setIsEditPostModalOpen(false)} className="close-modal-btn"><FaTimes /></button>
            </div>
            
            <form onSubmit={handlePostUpdate} className="edit-modal-form">
              <div className="form-group">
                <label>Alkotás címe *</label>
                <input type="text" value={editPostTitle} onChange={e => setEditPostTitle(e.target.value)} required className="modern-input" />
              </div>

              <div className="form-group">
                <label>Leírás</label>
                <textarea value={editPostDescription} onChange={e => setEditPostDescription(e.target.value)} rows="4" className="modern-input"></textarea>
              </div>

              <div className="edit-modal-actions">
                <button type="button" onClick={() => setIsEditPostModalOpen(false)} className="btn-cancel">Mégse</button>
                <button type="submit" disabled={isPostUpdating || !editPostTitle} className="btn-save">{isPostUpdating ? 'Mentés...' : 'Mentés'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox modal */}
      {selectedPost && (
        <div className="lightbox-overlay lightbox-zindex" onClick={closePostLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={closePostLightbox}><FaTimes /></button>
            
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
                  <Link to={`/user/${postAuthorName}`} onClick={closePostLightbox} className="lightbox-author lightbox-author-link">
                    {postAuthorAvatar && postAuthorAvatar.includes('http') ? (
                      <img src={postAuthorAvatar} alt="avatar" className="author-avatar" />
                    ) : (
                      <FaUserCircle className="author-placeholder" />
                    )}
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
                      <span key={tag} className="lightbox-tag pointer-tag" onClick={() => handleTagClick(tag)}>
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="lightbox-actions-bar">
                <button 
                  onClick={(e) => handleLike(e, selectedPost.id)} 
                  className={`lb-action-btn ${myLikedPostIds.includes(selectedPost.id) ? 'liked' : ''}`}
                >
                  <FaHeart /> {selectedPost.like_count || 0}
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
                  <div className="no-comments">Legyél te az első, aki hozzászól! ✨</div>
                ) : (
                  postComments.map(comment => (
                    <div key={comment.id} className="comment-bubble">
                      <div className="comment-header-row">
                        <Link to={`/user/${comment.username}`} onClick={closePostLightbox} className="comment-user comment-user-link">
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

export default Profile;