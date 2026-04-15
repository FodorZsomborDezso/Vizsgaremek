import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCloudUploadAlt, FaImage, FaTimes, FaCheckCircle, FaLightbulb, FaPlus, FaCopy, FaTrash, FaCrop } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../../Backend/Utils/cropImage';
import './Upload.css';

const Upload = () => {
  // Referenciak es navigacio beallitasa
  const toastShown = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // Urlap allapotok inicializalasa
  const [categoryId, setCategoryId] = useState('1');
  const [ideaId, setIdeaId] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Kepek es feltoltes allapotanak inicializalasa
  const [filesData, setFilesData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Képvágó állapotok
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCropIndex, setImageToCropIndex] = useState(null);
  const [aspect, setAspect] = useState(1); // Alapértelmezett képarány: 1:1
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Kategoriak lekepezese azonositokra
  const categoryMap = {
    'Természet': 1, 'Város / Építészet': 2, 'Tech': 3, 'Digitális Art': 4,
    'Design': 5, 'Portré': 6, 'Makró Fotózás': 7, 'Éjszakai Fotózás': 8,
    '3D Render': 9, 'Illusztráció': 10, 'Koncepciórajz': 11, 'AI Művészet': 12,
    'Festmény': 13, 'Rajz / Grafika': 14, 'Szobrászat': 15, 'Web / UI Design': 16,
    'Logó / Arculat': 17, 'Tipográfia': 18
  };

  // Jogosultsag es otlet azonosito ellenorzese betolteskor
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (!toastShown.current) {
        toast.info("A feltöltéshez kérlek jelentkezz be!");
        toastShown.current = true;
      }
      navigate('/login');
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const idea = searchParams.get('idea_id');
    
    if (idea && !toastShown.current) {
      toast.info("Egy létező ötletet valósítasz meg!");
      setIdeaId(idea);
      toastShown.current = true;
    }
  }, [location, navigate]);

  // Kivalasztott kepfajlok ellenorzese es allapotba mentese
  const handleFileProcess = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      return toast.error("Kérlek, csak érvényes képfájlokat (JPG, PNG) tölts fel!");
    }

    const newItems = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      title: '', 
      description: ''
    }));
    
    setFilesData(prev => [...prev, ...newItems]);
  };

  // File input valtozas esemenykezeloje
  const handleFileChange = (e) => handleFileProcess(e.target.files);
  
  // Ejtett fajlok esemenykezeloje
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileProcess(e.dataTransfer.files);
  };

  // Drag and drop vizualis esemenykezelok
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  // Adott kep eltavolitasa a listabol
  const removeImage = (index) => {
    setFilesData(prev => {
      const itemToRemove = prev[index];
      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
    
    if (index === activeIndex) setActiveIndex(0);
    else if (index < activeIndex) setActiveIndex(prev => Math.max(0, prev - 1));

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Osszes kivalasztott kep memoriabol valo torlese
  const clearAllImages = () => {
    setIsClearAllModalOpen(true);
  };

  const confirmClearAllImages = () => {
    filesData.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setFilesData([]);
    setActiveIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info("Minden kép eltávolítva.");
    setIsClearAllModalOpen(false);
  };

  // Aktiv kep adatainak (cim, leiras) frissitese
  const updateActiveFileData = (field, value) => {
    setFilesData(prev => {
      const newData = [...prev];
      if (newData[activeIndex]) {
        newData[activeIndex] = { ...newData[activeIndex], [field]: value };
      }
      return newData;
    });
  };

  // Aktiv kep cimenek es leirasanak masolasa az osszesre
  const applyToAll = () => {
    if (filesData.length <= 1) return;
    
    const currentData = filesData[activeIndex];
    if (!currentData?.title.trim()) return toast.warning("Előbb adj meg egy címet a másoláshoz!");

    setFilesData(prev => prev.map(item => ({
      ...item,
      title: currentData.title,
      description: currentData.description
    })));
    
    toast.success("Cím és leírás átmásolva az összes képre!");
  };

  // Képvágás befejezése (terület rögzítése)
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Vágófelület megnyitása
  const startCropping = (index) => {
    setImageToCropIndex(index);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsCropping(true);
  };

  // Vágott kép mentése az állapotba
  const handleCropConfirm = async () => {
    try {
      const croppedFile = await getCroppedImg(filesData[imageToCropIndex].previewUrl, croppedAreaPixels);
      const newPreviewUrl = URL.createObjectURL(croppedFile);
      
      setFilesData(prev => {
        const newData = [...prev];
        newData[imageToCropIndex] = {
          ...newData[imageToCropIndex],
          file: croppedFile,
          previewUrl: newPreviewUrl
        };
        return newData;
      });
      
      setIsCropping(false);
      setImageToCropIndex(null);
    } catch (e) {
      console.error(e);
      toast.error("Hiba történt a kép vágása során!");
    }
  };

  // Vágás megszakítása
  const handleCropCancel = () => {
    setIsCropping(false);
    setImageToCropIndex(null);
  };

  // Uj cimke hozzaadasa a listahoz
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9áéíóöőúüű]/g, ''); 
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagInput('');
      } else if (tags.length >= 5) {
        toast.warning("Maximum 5 címkét adhatsz meg!");
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  // Adott cimke torlese a listabol
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Urlap adatainak es kepeinek kuldese a szerverre
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (filesData.length === 0) return toast.warning("Kérlek, válassz ki legalább egy képet!");
    
    const missingTitles = filesData.some(f => !f.title.trim());
    if (missingTitles) return toast.warning("Minden képhez kötelező címet megadni!");

    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    setUploadProgress(0);
    let successCount = 0;

    for (let i = 0; i < filesData.length; i++) {
      const item = filesData[i];
      const formData = new FormData();
      formData.append('image', item.file); 
      formData.append('title', item.title);
      formData.append('description', item.description);
      formData.append('category_id', categoryId);
      if (tags.length > 0) formData.append('tags', tags.join(','));
      if (ideaId) formData.append('idea_id', ideaId);

      try {
        const res = await fetch('http://localhost:3000/api/posts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData 
        });

        if (res.ok) successCount++;
      } catch (err) { console.error(err); }
      
      setUploadProgress(Math.round(((i + 1) / filesData.length) * 100));
    }

    setLoading(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} db alkotás sikeresen feltöltve!`);
      navigate('/profile');
    } else {
      toast.error("Hiba történt a feltöltés során.");
    }
  };

  // Komponens renderelese
  return (
    <div className="upload-page-container">
      <div className="upload-content-wrapper">
        
        <div className="upload-header">
          <h1>Új alkotás feltöltése <FaImage className="title-icon" /></h1>
          <p>Oszd meg a legújabb munkádat a közösséggel!</p>
          {ideaId && <div className="idea-implementation-badge"><FaLightbulb /> Egy közösségi ötletet valósítasz meg</div>}
        </div>

        <form onSubmit={handleSubmit} className="upload-form-layout">
          
          <div className="upload-left-side">
            {filesData.length === 0 ? (
              <div 
                className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <FaCloudUploadAlt className="upload-icon-large" />
                <h3>Húzd ide a képet!</h3>
                <p>Vagy kattints a böngészéshez (Többet is választhatsz)</p>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden-input" />
              </div>
            ) : (
              <div className="preview-section">
                <div className="preview-header">
                  <span className="preview-count">{filesData.length} kép kiválasztva</span>
                  <button type="button" onClick={clearAllImages} className="btn-clear-all" title="Minden kép eltávolítása">
                    <FaTrash /> Összes törlése
                  </button>
                </div>

                <div className={`previews-grid-container count-${Math.min(filesData.length, 4)}`}>
                  {filesData.map((item, index) => (
                    <div 
                      key={index} 
                      onClick={() => setActiveIndex(index)}
                      className={`preview-item ${activeIndex === index ? 'active' : ''}`}
                    >
                      <div className="preview-blur-bg" style={{ backgroundImage: `url(${item.previewUrl})` }}></div>
                      <img src={item.previewUrl} alt={`preview ${index}`} className="preview-main-img" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); startCropping(index); }} className="btn-crop" title="Kép vágása">
                        <FaCrop size={16} />
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="btn-remove-item">
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                  
                  <div onClick={() => fileInputRef.current.click()} className={`btn-add-more ${filesData.length === 1 ? 'single' : ''}`}>
                    <FaPlus /> 
                    <span>Több</span>
                    <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden-input" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="upload-right-side">
            <div className="form-group">
              <label>Kategória</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="modern-input select-input">
                <optgroup label="- Fotózás">
                  <option value={categoryMap['Természet']}>Természet</option>
                  <option value={categoryMap['Város / Építészet']}>Város / Építészet</option>
                  <option value={categoryMap['Portré']}>Portré</option>
                  <option value={categoryMap['Makró Fotózás']}>Makró Fotózás</option>
                  <option value={categoryMap['Éjszakai Fotózás']}>Éjszakai Fotózás</option>
                </optgroup>
                <optgroup label="- Digitális Művészet">
                  <option value={categoryMap['Digitális Art']}>Digitális Art</option>
                  <option value={categoryMap['3D Render']}>3D Render</option>
                  <option value={categoryMap['Illusztráció']}>Illusztráció</option>
                  <option value={categoryMap['Koncepciórajz']}>Koncepciórajz</option>
                  <option value={categoryMap['AI Művészet']}>AI Művészet</option>
                </optgroup>
                <optgroup label="- Klasszikus Művészet">
                  <option value={categoryMap['Festmény']}>Festmény</option>
                  <option value={categoryMap['Rajz / Grafika']}>Rajz / Grafika</option>
                  <option value={categoryMap['Szobrászat']}>Szobrászat</option>
                </optgroup>
                <optgroup label="- Tervezés & Design">
                  <option value={categoryMap['Design']}>Design</option>
                  <option value={categoryMap['Web / UI Design']}>Web / UI Design</option>
                  <option value={categoryMap['Logó / Arculat']}>Logó / Arculat</option>
                  <option value={categoryMap['Tipográfia']}>Tipográfia</option>
                  <option value={categoryMap['Tech']}>Tech</option>
                </optgroup>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                Alkotás címe {filesData.length > 1 && <span className="active-item-indicator">(Kép {activeIndex + 1}/{filesData.length})</span>}
              </label>
              <input 
                type="text" 
                placeholder="Adj egy találó nevet az aktuális képnek..." 
                value={filesData[activeIndex]?.title || ''} 
                onChange={(e) => updateActiveFileData('title', e.target.value)} 
                disabled={filesData.length === 0}
                required 
                className="modern-input" 
              />
            </div>
            
            <div className="form-group">
              <label>Leírás (opcionális)</label>
              <textarea 
                rows="6" 
                placeholder="Meséld el az aktuális képről..." 
                value={filesData[activeIndex]?.description || ''} 
                onChange={(e) => updateActiveFileData('description', e.target.value)} 
                disabled={filesData.length === 0}
                className="modern-input textarea-no-resize"
              ></textarea>
              
              {filesData.length > 1 && (
                <button type="button" onClick={applyToAll} className="btn-copy-to-all" title="Jelenlegi cím és leírás alkalmazása az összes feltöltendő képre">
                  <FaCopy /> Adatok másolása az összes képre
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Címkék (nyomj Entert vagy Vesszőt)</label>
              <div className="tags-input-container">
                {tags.map(tag => (
                  <span key={tag} className="tag-pill">
                    #{tag} <FaTimes className="remove-tag-icon" onClick={() => removeTag(tag)} />
                  </span>
                ))}
                <input 
                  type="text" 
                  placeholder={tags.length < 5 ? "Pl. naplemente, portré..." : "Elérted a limitet (5)"} 
                  value={tagInput} 
                  onChange={(e) => setTagInput(e.target.value)} 
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 5}
                  className="tag-input-field"
                />
              </div>
            </div>

            <button type="submit" className="submit-upload-btn" disabled={loading || filesData.length === 0}>
              {loading ? (
                <div className="progress-wrapper">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              ) : (
                <><FaCheckCircle className="check-icon" /> Közzététel</>
              )}
            </button>
          </div>

        </form>
        
        {/* Képvágó Modal */}
        {isCropping && imageToCropIndex !== null && (
          <div className="crop-modal-overlay">
            <div className="crop-container">
              <Cropper
                image={filesData[imageToCropIndex].previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="crop-controls">
              <label style={{ color: 'white', fontWeight: 'bold' }}>Nagyítás:</label>
              <input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(e.target.value)} />
            </div>
            <div className="crop-aspect-controls">
              <label style={{ color: 'white', fontWeight: 'bold', marginRight: '10px' }}>Képarány:</label>
              <button onClick={() => setAspect(1)} className={`btn-aspect ${aspect === 1 ? 'active' : ''}`}>1:1</button>
              <button onClick={() => setAspect(4/3)} className={`btn-aspect ${aspect === 4/3 ? 'active' : ''}`}>4:3</button>
              <button onClick={() => setAspect(16/9)} className={`btn-aspect ${aspect === 16/9 ? 'active' : ''}`}>16:9</button>
              <button onClick={() => setAspect(3/1)} className={`btn-aspect ${aspect === 3/1 ? 'active' : ''}`}>3:1</button>
              <button onClick={() => setAspect(2/3)} className={`btn-aspect ${aspect === 2/3 ? 'active' : ''}`}>2:3</button>
            </div>
            <div className="crop-buttons">
              <button onClick={handleCropCancel} className="btn-crop-cancel">Mégse</button>
              <button onClick={handleCropConfirm} className="btn-crop-confirm">Vágás mentése</button>
            </div>
          </div>
        )}

        {/* Összes törlése megerősítő Modal */}
        {isClearAllModalOpen && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
              <h3>Képek törlése</h3>
              <p>Biztosan törölni szeretnéd az összes kiválasztott képet? Ez a művelet nem vonható vissza.</p>
              <div className="confirm-modal-buttons">
                <button type="button" onClick={() => setIsClearAllModalOpen(false)} className="btn-confirm-cancel">Mégse</button>
                <button type="button" onClick={confirmClearAllImages} className="btn-confirm-delete">Igen, törlés</button>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Upload;