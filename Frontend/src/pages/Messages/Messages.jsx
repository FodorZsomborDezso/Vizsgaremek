import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPaperPlane, FaUserCircle, FaEnvelope, FaChevronLeft, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import './Messages.css';

const Messages = () => {
  // Navigacio es hivatkozasok inicializalasa
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedUser = location.state?.preselectedUser;

  // Allapotok inicializalasa
  const [friends, setFriends] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  
  // Referenciak letrehozasa a dom elemekhez es idoziteshez
  const lastTypingTimeRef = useRef(0);
  const chatContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  
  // Bejelentkezett felhasznalo adatainak kinyerese
  const loggedInUserStr = localStorage.getItem('user');
  const myUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;

  // Ismerosok lekerese es frissitese idokozonkent
  useEffect(() => {
    if (!myUser) { navigate('/login'); return; }

    const fetchFriends = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3000/api/friends', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const friendsData = await res.json();
          setFriends(prev => JSON.stringify(prev) !== JSON.stringify(friendsData) ? friendsData : prev);

          if (preselectedUser) {
            const targetFriend = friendsData.find(f => f.id === preselectedUser.id);
            if (targetFriend) {
              setActiveChatUser(targetFriend);
              navigate(location.pathname, { replace: true, state: {} });
            }
          }
        } else {
          toast.error("Hiba az ismerősök betöltésekor.");
        }
      } catch (err) { 
        toast.error("Szerverhiba történt az ismerősök betöltésekor."); 
        console.error(err); 
      }
    };
    
    fetchFriends();
    const interval = setInterval(fetchFriends, 5000);
    return () => clearInterval(interval);
  }, [navigate, location.pathname, myUser, preselectedUser]);

  // Aktiv beszelgetes uzeneteinek lekerese
  useEffect(() => {
    if (!activeChatUser) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:3000/api/messages/${activeChatUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const newMessages = await res.json();
            setMessages(currentMessages => JSON.stringify(currentMessages) !== JSON.stringify(newMessages) ? newMessages : currentMessages);
        }
      } catch (err) { console.error(err); }
    };

    fetchMessages(); 
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval); 
  }, [activeChatUser]);

  // Partner gepelesi statuszanak ellenorzese
  useEffect(() => {
    if (!activeChatUser) return;
    
    const checkTypingStatus = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:3000/api/typing/${activeChatUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsPartnerTyping(data.isTyping);
        }
      } catch (err) { console.error(err); }
    };

    const interval = setInterval(checkTypingStatus, 1000);
    return () => clearInterval(interval);
  }, [activeChatUser]);

  // Automatikus gorgetes az uzenetek aljara
  useEffect(() => {
    const chat = chatContainerRef.current;
    if (chat) {
      const isScrolledToBottom = chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 100;
      if (isScrolledToBottom) {
        chat.scrollTop = chat.scrollHeight;
      }
    }
  }, [messages]);

  // Kattintas figyelese az emoji valaszton kivul
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Uj uzenet kuldesenek kezelese
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !activeChatUser) return;

    const token = localStorage.getItem('token');
    setIsSending(true);
    setNewMessage('');

    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      sender_id: myUser.id,
      content: content,
      created_at: new Date().toISOString(),
      sender_avatar: myUser.avatar_url,
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const res = await fetch(`http://localhost:3000/api/messages/${activeChatUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: content })
      });

      if (!res.ok) {
        toast.error("Hiba a küldés során.");
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
      }
    } catch (err) { 
      toast.error("Szerver hiba."); 
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempId));
    } finally { 
      setIsSending(false); 
    }
  };

  // Emoji hozzaadasa a szoveghez
  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  // Utolso aktivitas szoveges formazasa
  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Régen';
    const diff = new Date() - new Date(lastSeen);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 5) return 'Elérhető';
    if (minutes < 60) return `${minutes} perce volt elérhető`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} órája volt elérhető`;
    return `Utoljára itt: ${new Date(lastSeen).toLocaleDateString()}`;
  };

  // Linkek formazasa kattinthato formara
  const formatMessageContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="message-link">{part}</a>;
      }
      return part;
    });
  };

  // Gepeles esemeny kezelese es kuldese a szervernek
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    const now = Date.now();
    if (activeChatUser && now - lastTypingTimeRef.current > 1000) {
        lastTypingTimeRef.current = now;
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3000/api/typing/${activeChatUser.id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => console.error(err));
    }
  };

  // Megszakitjuk a renderelest ha nincs bejelentkezett felhasznalo
  if (!myUser) return null;

  // Aktualis chat partner adatainak kinyerese
  const currentChatData = activeChatUser ? (friends.find(f => f.id === activeChatUser.id) || activeChatUser) : null;

  // Komponens renderelese
  return (
    <div className="messages-layout-container">
      <div className="messages-wrapper">
        
        {/* Bal oldal: Ismerosok listaja */}
        <div className={`messages-sidebar ${activeChatUser ? 'hidden-on-mobile' : ''}`}>
          <div className="sidebar-header">
            <h2><FaEnvelope className="sidebar-header-icon" /> Üzenetek</h2>
          </div>
          
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="empty-friends">Még nincsenek ismerőseid. Kövessetek be egymást valakivel a csevegéshez!</div>
            ) : (
              friends.map(friend => (
                <div 
                  key={friend.id} 
                  className={`friend-item ${activeChatUser?.id === friend.id ? 'active' : ''}`}
                  onClick={() => setActiveChatUser(friend)}
                >
                  {friend.avatar_url && friend.avatar_url.includes('http') ? (
                    <img src={friend.avatar_url} alt="avatar" className="friend-avatar" />
                  ) : (
                    <FaUserCircle className="friend-avatar-placeholder" />
                  )}
                  
                  <div className="friend-info">
                    <span className="friend-name">{friend.full_name || friend.username}</span>
                    <span className="friend-username">@{friend.username}</span>
                  </div>
                  
                  {friend.unread_count > 0 && activeChatUser?.id !== friend.id && (
                    <div className="unread-badge">{friend.unread_count}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Jobb oldal: Aktiv chat */}
        <div className={`messages-chat-area ${!activeChatUser ? 'hidden-on-mobile' : ''}`}>
          {!activeChatUser ? (
            <div className="no-chat-selected">
              <FaEnvelope className="no-chat-icon" />
              <h3>Válaszd ki, kivel szeretnél beszélgetni!</h3>
              <p>Bal oldalon láthatod az ismerőseidet (kölcsönös követés).</p>
            </div>
          ) : (
            <div className="active-chat-container">
              
              <div className="chat-header">
                <button className="mobile-back-btn" onClick={() => setActiveChatUser(null)}>
                  <FaChevronLeft /> Vissza
                </button>
                <div className="chat-header-user">
                  {currentChatData.avatar_url && currentChatData.avatar_url.includes('http') ? (
                    <img src={currentChatData.avatar_url} alt="avatar" className="chat-header-avatar" />
                  ) : (
                    <FaUserCircle className="chat-header-avatar-placeholder" />
                  )}
                  <div>
                    <h3 className="chat-header-name">{currentChatData.full_name || currentChatData.username}</h3>
                    <span className="chat-header-status">
                      {isPartnerTyping ? (
                        <span className="status-typing">Gépel...</span>
                      ) : getLastSeenText(currentChatData.last_seen) === 'Elérhető' ? (
                        <span className="status-online">● Elérhető</span>
                      ) : (
                        getLastSeenText(currentChatData.last_seen)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="chat-messages" ref={chatContainerRef}>
                {messages.length === 0 ? (
                  <div className="chat-empty-state">Még nem váltottatok üzenetet. Írj neki először! 👋</div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === myUser.id;
                    return (
                      <div key={msg.id} className={`chat-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                        {!isMine && (
                          <img src={msg.sender_avatar || 'https://ui-avatars.com/api/?name=User'} alt="avatar" className="chat-bubble-avatar" />
                        )}
                        <div className={`chat-bubble ${isMine ? 'my-bubble' : 'their-bubble'}`}>
                          <p>{formatMessageContent(msg.content)}</p>
                          <span className="chat-timestamp">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                {showEmojiPicker && (
                  <div className="emoji-picker-popover" ref={emojiPickerRef}>
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" width={320} height={420} />
                  </div>
                )}

                <button 
                  type="button" 
                  className="emoji-toggle-btn"
                  ref={emojiButtonRef}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                >
                  <FaSmile />
                </button>

                <input 
                  type="text" 
                  className="chat-message-input"
                  placeholder="Írj egy üzenetet..." 
                  value={newMessage}
                  onChange={handleInputChange} 
                  disabled={isSending}
                />
                
                <button 
                  type="submit" 
                  className="chat-send-btn"
                  disabled={!newMessage.trim() || isSending}
                >
                  <FaPaperPlane />
                </button>
              </form>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;