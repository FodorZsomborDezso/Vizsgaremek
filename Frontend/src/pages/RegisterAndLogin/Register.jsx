import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCloudUploadAlt, FaCrop, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../../Backend/Utils/cropImage';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();

  // Urlap allapotok
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  // Email megerosites allapotok
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Kepvago (Cropper) allapotok
  const [file, setFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Fajl kivalasztasa es vago megnyitasa
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setTempImageUrl(URL.createObjectURL(selectedFile));
      setIsCropping(true); 
    }
  };

  // Vagas vegrehajtasa
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedFile = await getCroppedImg(tempImageUrl, croppedAreaPixels);
      setFile(croppedFile); 
      setPreviewUrl(URL.createObjectURL(croppedFile)); 
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

  // Jelszo erossegenek ellenorzese
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (pass.length >= 6) score += 20; 
    if (pass.length >= 10) score += 20; 
    if (/[A-Z]/.test(pass)) score += 20; 
    if (/[0-9]/.test(pass)) score += 20; 
    if (/[^A-Za-z0-9]/.test(pass)) score += 20; 

    if (score === 0 && pass.length > 0) score = 10; 

    let label = 'Gyenge';
    let color = '#ff4757'; 

    if (score >= 80) { label = 'Erős'; color = '#2ecc71'; } 
    else if (score >= 40) { label = 'Közepes'; color = '#f1c40f'; }

    if (pass.length < 6) { label = 'Túl rövid'; color = '#ff4757'; }

    return { score, label, color };
  };
  const strength = getPasswordStrength(password);

  // Regisztracios adatok elkuldese
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.warning("Kérlek, adj meg egy érvényes email címet!");
    if (password.length < 6) return toast.warning("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
    if (password !== passwordConfirm) return toast.warning("A jelszavak nem egyeznek!");
    if (!termsAccepted) return toast.warning("A regisztrációhoz el kell fogadnod a feltételeket!");

    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('full_name', fullName);
    formData.append('bio', bio);
    formData.append('location', location);
    if (file) formData.append('profileImage', file);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Sikeres regisztráció! Kérjük, add meg az e-mailben kapott 6 jegyű kódot.");
        setIsVerifying(true);
      } else {
        toast.error(data.error || "Hiba a regisztráció során!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Szerver hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  // Megerosito kod elkuldese
  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return toast.warning("A kódnak pontosan 6 számjegyből kell állnia!");
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Sikeres megerősítés! Most már bejelentkezhetsz.");
        navigate('/login');
      } else {
        toast.error(data.error || "Helytelen vagy lejárt kód!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Szerver hiba történt a megerősítés során.");
    } finally {
      setLoading(false);
    }
  };

  // Komponens renderelese
  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2 className="auth-title">{isVerifying ? 'E-mail Megerősítése' : 'Csatlakozz'}</h2>
        
        {isVerifying && (
          <form onSubmit={handleVerify} className="auth-form">
            <p className="verify-text">
              Elküldtük a 6 jegyű kódot a(z) <strong>{email}</strong> címre.
            </p>
            <div className="form-group">
              <label className="verify-label">Megerősítő kód</label>
              <input 
                type="text" 
                value={verificationCode} 
                onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} 
                required 
                maxLength="6"
                placeholder="123456"
                className="verify-input"
              />
            </div>
            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Ellenőrzés...' : 'Megerősítés'}
            </button>
            <div className="auth-footer verify-footer">
              <span onClick={() => setIsVerifying(false)} className="back-to-register-link">Vissza a regisztrációhoz</span>
            </div>
          </form>
        )}
        
        {!isVerifying && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Felhasználónév *</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Email cím *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Teljes Név (Opcionális)</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Pl: Kovács Anna" />
            </div>

            <div className="form-group">
              <label>Rövid Bemutatkozás (Opcionális)</label>
              <input type="text" value={bio} onChange={e => setBio(e.target.value)} placeholder="Írj magadról pár sort..." />
            </div>

            <div className="form-group">
              <label>Helyszín (Opcionális)</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Pl: Budapest, Magyarország" />
            </div>

            <div className="form-group">
              <label>Profilkép (Opcionális)</label>
              <div className="avatar-upload-container">
                <div className="avatar-preview-circle">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="avatar-preview-img" />
                  ) : (
                    <FaUserCircle className="avatar-placeholder-icon" />
                  )}
                </div>
                <label className="avatar-upload-label">
                  <FaCloudUploadAlt /> Kép kiválasztása
                  <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden-input" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Jelszó * (min. 6 karakter)</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="password-input"
                />
                <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              
              {password && (
                <div className="password-strength-container">
                  <div className="strength-bar-bg">
                    <div className="strength-bar-fill" style={{ width: `${strength.score}%`, backgroundColor: strength.color }}></div>
                  </div>
                  <div className="strength-label" style={{ color: strength.color }}>{strength.label}</div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Jelszó megerősítése *</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={passwordConfirm} 
                  onChange={e => setPasswordConfirm(e.target.value)} 
                  required 
                  className="password-input"
                />
                <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle-icon">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="form-group terms-group">
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="terms-checkbox" />
              <label htmlFor="terms" className="terms-label">Elfogadom az <span className="terms-link">Adatvédelmi nyilatkozatot</span>.</label>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Regisztráció...' : 'Regisztráció'}
            </button>
          </form>
        )}
        
        {!isVerifying && (
          <div className="auth-footer">
            <p>Már van fiókod? <Link to="/login">Jelentkezz be!</Link></p>
          </div>
        )}
      </div>

      {/* Profilkep vago modal */}
      {isCropping && tempImageUrl && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <h2 className="crop-modal-title"><FaCrop /> Profilkép beállítása</h2>
            
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
                onChange={(e) => setZoom(e.target.value)} className="zoom-slider"
              />
            </div>

            <div className="crop-modal-actions">
              <button type="button" onClick={cancelCrop} className="crop-cancel-btn">
                Mégse
              </button>
              <button type="button" onClick={showCroppedImage} className="crop-save-btn">
                Kész
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Register;