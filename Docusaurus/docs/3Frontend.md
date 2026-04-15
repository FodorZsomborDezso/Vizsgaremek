# Frontend Felépítés és Stílus

Az **ArtisticEye** frontendje egy modern, letisztult és kifejezetten felhasználóközpontú vizuális élményt nyújt. A keretrendszer alapját a **React.js (Vite)** adja, amely villámgyors fejlesztői élményt és optimalizált produkciós buildet biztosít.

## Tartalomjegyzék
- [Stílusjegyek és Dizájn](#stílusjegyek-és-dizájn)
- [Architekturális Alapelvek](#architekturális-alapelvek)
- [Fontosabb Importok és Könyvtárak](#fontosabb-importok-és-könyvtárak)
- [Kódrészletek](#kódrészletek)

---

## Stílusjegyek és Dizájn

A dizájn központi eleme a sötét és világos módokat támogató, kontrasztos megjelenés. Az alkalmazás vizuális identitását az alábbi stílusjegyek határozzák meg:

- **Glassmorphism (Üveghatás):** A kártyák, menük és felugró ablakok gyakran használnak félig átlátszó hátteret (`rgba`), amit a `backdrop-filter: blur()` tulajdonság tesz teljessé. Ez mélységet és modernitást ad a felületnek.
- **Neon Akcentusok:** A főbb interaktív elemek (Call-To-Action gombok, linkek, aktív menüpontok) világító, ciánkék (`#00d2ff`) árnyékokat és kereteket kapnak, ha a felhasználó föléjük viszi az egeret (hover).
- **Masonry Galéria:** A képek megjelenítése Pinterest-stílusú "téglafal" (Masonry) rácsszerkezetben történik, amely dinamikusan alkalmazkodik a feltöltött képek eltérő képarányaihoz.
- **Sima Animációk:** A `transition` és `@keyframes` CSS tulajdonságok segítségével minden állapotváltozás (pl. gombok megnyomása, kártyák felemelkedése) zökkenőmentes és reszponzív.

---

## Architekturális Alapelvek

A frontend fejlesztése során a karbantarthatóságot és skálázhatóságot szem előtt tartva az alábbi architekturális elveket követtük.

### 1. Komponens Struktúra
A projekt egy jól bevált, funkciók szerint szervezett mappastruktúrát követ:
- **`pages/`**: Az egyes útvonalakhoz tartozó fő komponensek (pl. `HomePage`, `ProfilePage`, `LoginPage`).
- **`components/`**: Újrafelhasználható, általános UI elemek (pl. `Button`, `Card`, `Modal`, `Input`).
- **`hooks/`**: Egyedi, üzleti logikát tartalmazó React hook-ok (pl. `useAuth` a hitelesítés kezelésére, `useFetch` az adatok lekérdezésére).
- **`contexts/`**: A globális állapotot kezelő React Context-ek (pl. `AuthContext`, ami a felhasználói adatokat és a JWT tokent tárolja).
- **`services/`**: Az API hívásokat és egyéb külső szolgáltatásokat kezelő modulok (pl. `authService.js`, `postService.js`).

### 2. Állapotkezelés (State Management)
Az alkalmazás állapotkezelése a React beépített eszközeire, a **Hook-okra** (`useState`, `useReducer`) és a **Context API**-ra épül.
- **Lokális állapot:** Az egyszerű, egy komponenst érintő állapotokat (pl. egy űrlap mezőinek értéke) `useState`-tel kezeljük.
- **Globális állapot:** A több komponenst érintő, globális állapotokat (pl. a bejelentkezett felhasználó adatai) a Context API segítségével tesszük elérhetővé az alkalmazás egészében. Ez elkerüli a "prop drilling"-ot és tiszta adatfolyamot biztosít.

### 3. API Kommunikáció
A backend szerverrel való kommunikációt az `axios` könyvtár segítségével, egy dedikált **service rétegen** keresztül valósítjuk meg. Minden API erőforráshoz (pl. `auth`, `posts`) saját service fájl tartozik, ami egységbe zárja a hálózati kéréseket. A komponensek így csak ezeket a service függvényeket hívják meg, és nem tartalmaznak nyers `axios` hívásokat, ami nagyban növeli a kód tisztaságát és tesztelhetőségét.

### 4. Valós Idejű Kommunikáció (WebSockets)
A privát chat és az azonnali értesítések funkciók a **Socket.IO** könyvtár segítségével valósulnak meg. A kliensoldal a megfelelő komponensekben feliratkozik a szerver által küldött eseményekre (pl. `newMessage`, `typingIndicator`, `newNotification`), és valós időben frissíti a felhasználói felületet anélkül, hogy a felhasználónak újra kellene töltenie az oldalt.

---

## Fontosabb Importok és Könyvtárak

A fejlesztés során számos népszerű React könyvtárat használtunk a funkcionalitás és a felhasználói élmény növelése érdekében:

```javascript
// Navigáció és kliensoldali útválasztás
import { Link, useNavigate, useParams } from 'react-router-dom';

// Felhasználói értesítések (sikeres mentés, hibaüzenetek)
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Vizuális ikonok az UI-hoz
import { FaHeart, FaComment, FaShare, FaTimes } from 'react-icons/fa';

// API hívások lebonyolítása (opcionális, ha axios-t használtok)
import axios from 'axios';

// Dinamikus osztálynevek kezelése (nagyon hasznos feltételes CSS-hez)
import clsx from 'clsx';
```

---

## Kódrészletek

### 1. Modern Gomb (CTA) Komponens
Egy tipikus gomb a felületen, amely egyesíti a React eseménykezelését és a modern CSS osztályokat:

```jsx
import React from 'react';
import { FaHeart } from 'react-icons/fa';

export default function LikeButton({ isLiked, onToggleLike, likeCount }) {
  return (
    <button 
      onClick={onToggleLike}
      className={`action-btn ${isLiked ? 'liked' : ''}`}
      aria-label="Poszt kedvelése"
    >
      <FaHeart className="icon" />
      <span>{likeCount} Kedvelés</span>
    </button>
  );
}
```

### 2. Glassmorphism CSS Példa
Így érjük el a felületen megjelenő jellegzetes áttetsző "üveg" kártya hatást:

```css
.glass-card {
  background: rgba(30, 41, 59, 0.5); /* Félig átlátszó sötét háttér */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Finom fehér keret */
  border-radius: 15px;
  padding: 2rem;
  backdrop-filter: blur(10px); /* Háttér elmosása */
  -webkit-backdrop-filter: blur(10px); /* Safari támogatás */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 210, 255, 0.2); /* Neon árnyék */
  
}

```