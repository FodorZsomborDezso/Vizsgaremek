<div align="center">
  <h1>ArtisticEye</h1>
  <p><b>Modern, interaktív képmegosztó és közösségi platform alkotóknak.</b></p>
</div>

---

# ArtisticEye

Modern, interaktív képmegosztó és közösségi platform digitális alkotóknak.

## Tartalomjegyzék
- [Projekt bemutatása](#projekt-bemutatása)
- [Főbb funkciók és Architektúra](#főbb-funkciók-és-architektúra)
- [Alkalmazott technológiák](#alkalmazott-technológiák)
- [Fejlesztők és Felelősségi körök](#fejlesztők-és-felelősségi-körök)
- [Telepítés és Futtatás (Docker)](#telepítés-és-futtatás-docker)

## Projekt bemutatása

Az **ArtisticEye** egy komplex, vizsgaremekként (és portfólióként) készült Single Page Application (SPA) alapú közösségi képmegosztó platform. A rendszer ötvözi a vizuális galériák (pl. Pinterest, ArtStation) letisztult élményét a modern közösségi média funkcióival (követési hálózatok, privát chat, valós idejű interakciók). 

A projekt elsődleges célja egy olyan aktív, kreatív ökoszisztéma kialakítása, ahol a felhasználók (ötletgazdák és megvalósítók) magas minőségű vizuális felületen oszthatják meg alkotásaikat, inspirációt meríthetnek egymás munkáiból, szakmai visszajelzéseket adhatnak és kapcsolatokat építhetnek.

## Főbb funkciók és Architektúra

### Dinamikus Galéria és Képkezelés
* **Pinterest-stílusú (Masonry) Grid:** A Főoldal és a Galéria egy egyedi, reszponzív aszimmetrikus rácsrendszert használ, amely a képek képarányához igazodva jeleníti meg a tartalmakat, maximalizálva a vizuális élményt.
* **Intelligens Szerveroldali Képoptimalizálás:** A feltöltött fájlokat a Node.js szerver a `multer` és a `sharp` könyvtárak segítségével memóriaszinten (buffer) dolgozza fel. A képeket automatikusan tömöríti, optimalizálja és a megfelelő formátumba konvertálja a sávszélesség kímélése és a gyorsabb betöltés (Lazy Loading) érdekében.
* **Komplex Keresőmotor:** A rendszer lehetővé teszi a keresést dinamikus címkék (tagek), kategóriák, valamint specifikus felhasználónevek (@username) alapján.

### Közösségi Interakciók és Kommunikáció
* **Kölcsönös Követési Rendszer:** A felhasználók felépíthetik saját ismerősi hálózatukat, amely alapján a rendszer személyre szabott tartalmi feedet (idővonalat) generál.
* **Azonnali Interakciók:** A posztok aszinkron módon kedvelhetők és kommentelhetők, anélkül, hogy az oldal újratöltődne. 
* **Privát Chat és Gépelés Jelzése:** Beépített, végpontok közötti üzenetküldő rendszer. A UI valós időben (Typing indicator) jelzi, ha a beszélgetőpartner éppen válaszol, emellett a profiloknál megjelenik az olvasatlan üzenetek pontos száma is.

### Biztonság és Jogosultságkezelés
* **JWT Hitelesítés és Route Protection:** A teljes rendszer biztonságos JSON Web Token alapú bejelentkezést használ. A React kliensoldalon Higher-Order Componentek (HOC) védik a privát útvonalakat.
* **Titkosítás:** A jelszavak nyílt szöveg helyett `bcrypt.js` segítségével, sózva (salted hash) kerülnek a MySQL adatbázisba.
* **Adminisztrációs Vezérlőpult:** Egy dedikált, csak megfelelő szerepkörrel (Role-Based Access Control) elérhető felület a platform moderálására. Lehetőséget ad a jelentett tartalmak (Reports) eltávolítására, a szabályszegő felhasználók tiltására és a globális statisztikák áttekintésére.

## Alkalmazott technológiák

**Kliensoldal (Frontend):**
* **React.js (Vite)** – Gyors, optimalizált fejlesztői környezet és kliensoldali renderelés
* **React Router DOM** – Kliensoldali dinamikus navigáció
* **Tiszta CSS3 / CSS Változók** – Teljesen egyedi, modern "Glassmorphism" sötét téma (Dark Mode)
* **React Icons & React Toastify** – Ikonográfia és eseményvezérelt vizuális visszajelzések

**Szerveroldal és Adatbázis (Backend):**
* **Node.js & Express.js** – Robusztus, aszinkron RESTful API szerver
* **MySQL** – Relációs adatbázis a stabil, normalizált adattároláshoz és a komplex kapcsolatok kezeléséhez
* **Bcrypt.js & JWT** – Biztonsági réteg és munkamenet-kezelés
* **Multer & Sharp** – Multipart/form-data kérések kezelése és képfeldolgozás

## Fejlesztők és Felelősségi körök

A projektet a modern agilis szoftverfejlesztési módszertanoknak megfelelően építettük fel. Mindketten **Full-Stack Fejlesztőként** vettünk részt a munkában, így a kliensoldali (Frontend) és a szerveroldali (Backend) architektúra kialakításában is teljeskörűen dolgoztunk. 

A kód minőségének biztosítása, a határidők betartása és a hatékony projektmenedzsment érdekében a funkciókat és a technikai felelősségi köröket az alábbiak szerint osztottuk fel:

### Fodor Zsombor Dezső (Full-Stack Fejlesztő)
* **Kliensoldali Architektúra és Állapotkezelés:** A teljes React.js (Vite) frontend alapjainak lefektetése. A komponens-hierarchia és a dinamikus útvonalválasztás (React Router DOM) megtervezése. A komplex kliensoldali állapotkezelés (State Management) felépítése, beleértve a bejelentkezett felhasználó adatainak globális elérését a rendszerben.
* **UX/UI Design és Reszponzivitás:** A Főoldal, a "Felfedezés" (Galéria) és a Profil felületek teljes körű vizuális kialakítása. A Pinterest-stílusú (Masonry) aszimmetrikus kártyás elrendezés egyedi CSS és JavaScript logikájának megírása. A "Glassmorphism" (üveghatású) sötét téma (Dark Mode) színpalettájának finomhangolása, figyelve a mobil-első (Mobile-First) és reszponzív megjelenésre minden kijelzőméreten.
* **Hitelesítés és Kriptográfia (Backend):** A teljes autentikációs végpont-rendszer (Auth API) felépítése a Node.js szerveren. A JSON Web Token (JWT) generálásának, aláírásának és érvényesítésének leprogramozása. A biztonságos jelszókezelés integrálása a `bcrypt.js` könyvtár segítségével (sózás és hashelés), valamint a felhasználói adatok (profilképek, bio) frissítését biztosító szerveroldali logika megírása.
* **API Integráció és Rendszertesztelés:** A kliens és a szerver közötti aszinkron adatkommunikáció optimalizálása. A betöltési állapotok (Loading states) és a globális hibakezelési logika (Error Handling) megírása, biztosítva, hogy a frontend minden HTTP hibaüzenetet megfelelően, felhasználóbarát módon reagáljon le. A backend végpontok megbízhatóságának és biztonságának tesztelése.

### Gerencsér Ákos (Full-Stack Fejlesztő)
* **Adatbázis-tervezés és Backend Logika:** A MySQL relációs adatbázis sémájának megtervezése a kezdeti ER (Entity-Relationship) diagramoktól a fizikai megvalósításig. A táblák normalizálása és az összetett SQL relációk (N:M kapcsolatok a kedvelésekhez, kommentekhez és a kölcsönös követési hálózatokhoz) optimalizált, alacsony késleltetésű lekérdezéseinek megírása.
* **Szerveroldali Képfeldolgozás:** A képmegosztó platform legkritikusabb részének, a fájlkezelésnek a leprogramozása. A `multer` könyvtár integrálása a multipart/form-data kérések fogadására, valamint a `sharp` modul beépítése az intelligens, memóriaszintű (buffer) képfeldolgozáshoz (automatikus átméretezés, tömörítés és formátum-konverzió).
* **Dinamikus Frontend Komponensek és Moderáció:** A biztonságos Adminisztrációs Központ (Vezérlőpult) felépítése a kliensoldalon. A dinamikus adatokat megjelenítő, szerveroldalról vezérelt táblázatok, az interaktív tartalomfeltöltő űrlapok (kliensoldali validációkkal), és a rendszer-visszajelzéseket biztosító Toastify értesítési felületek implementálása.
* **Infrastruktúra és Konténerizáció (DevOps):** A teljes alkalmazás architektúrájának konténerizálása a hordozhatóság érdekében. A `Dockerfile` és `docker-compose.yml` konfigurációk megírása a frontend, a backend, az adatbázis és a dokumentációs szerver párhuzamos, elszigetelt futtatásához. A fejlesztői (.env) környezeti változók és a belső hálózati kommunikáció biztonságos beállítása a konténerek között.

## Telepítés és Futtatás (Docker környezetben)

Ez a projekt a **Docker** és **Docker Compose** segítségével egyetlen paranccsal elindítható. A rendszer automatikusan felépíti az adatbázist, és elindítja a frontend, backend, valamint a dokumentációs szervereket.

### Előfeltételek
* [Docker Desktop](https://www.docker.com/products/docker-desktop) telepítve és fut.
* **Node.js** telepítve (kizárólag az `npm` parancsok futtatásához).

### Indítás

1. Nyiss egy terminált a projekt gyökérkönyvtárában (ahol a `docker-compose.yml` fájl található).
2. Futtasd az inicializáló parancsot, ami minden alprojekt (Frontend, Backend, Docusaurus) függőségeit letölti és telepíti:
   ```bash
   npm install
3. Indítsd el a teljes alkalmazást a következő paranccsal:

   ```bash
   npm start

Megjegyzés: Ez a parancs leállítja és törli a korábbi adatbázis konténert, újraépíti azt, majd párhuzamosan elindítja a Backend, Frontend és Docusaurus szervereket.

Elérhetőségek indítás után
A sikeres indítást követően az alkalmazás részei az alábbi alapértelmezett címeken lesznek elérhetőek a böngésződből:

Frontend (ArtisticEye): http://localhost:5173

Backend API: http://localhost:3000

Dokumentáció (Docusaurus): http://localhost:3001

Adatbázis-kezelő (phpMyAdmin): http://localhost:8080

---
*Készült vizsgamunkaként / Portfólió projektként - 2026*
