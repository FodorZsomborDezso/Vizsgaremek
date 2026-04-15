import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import NotFound from './pages/NotFound/NotFound'; 

import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';


import Home from './pages/Home/Home';
import Gallery from './pages/Gallery/Gallery';
import Messages from './pages/Messages/Messages';
import Upload from './pages/Upload/Upload';
import Ideas from './pages/Ideas/Ideas';
import Admin from './pages/Admin/Admin';
import PublicProfile from './pages/Profile/PublicProfile';
import About from './pages/About/About';
import Feedback from './pages/Feedback/Feedback';

import Login from './pages/RegisterAndLogin/Login';
import Register from './pages/RegisterAndLogin/Register';
import Profile from './pages/Profile/Profile';

import ForgotPassword from './pages/RegisterAndLogin/ForgotPassword/ForgotPassword'; 
import ResetPassword from './pages/RegisterAndLogin/ForgotPassword/ResetPassword';
import VerificationFailed from './pages/RegisterAndLogin/VerificationFailed';

import Privacy from './pages/Privacy/Privacy';
import Terms from './pages/Privacy/Terms';
import Imprint from './pages/Privacy/Imprint';

import './App.css';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (

    <div className="app-container">
      <ScrollToTop />
      <Header theme={theme} toggleTheme={toggleTheme} />

      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      
      <main className="main-content">
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} /> 
          <Route path="/messages" element={<Messages />} />
          <Route path="/upload" element={<Upload />} />  
          <Route path="/ideas" element={<Ideas />} /> 
          <Route path="/admin" element={<Admin />} />
          <Route path="/user/:username" element={<PublicProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verification-failed" element={<VerificationFailed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/adatvedelem" element={<Privacy />} />
          <Route path="/aszf" element={<Terms />} />
          <Route path="/impresszum" element={<Imprint />} />
        </Routes>
      </main>

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}

export default App;