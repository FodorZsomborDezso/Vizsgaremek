<div align="center">
  <h1>ArtisticEye</h1>
  <p><b>Modern, interaktív képmegosztó és közösségi platform alkotóknak.</b></p>
</div>

---

## Tartalomjegyzék
- [Projekt bemutatása](#projekt-bemutatása)
- [Főbb funkciók](#főbb-funkciók)
- [Alkalmazott technológiák](#alkalmazott-technológiák)
- [Fejlesztők](#fejlesztők)
- [Telepítés és Futtatás](#telepítés-és-futtatás-docker-környezetben)

## Projekt bemutatása
Az **ArtisticEye** egy vizsgaremekként készült teljes értékű közösségi képmegosztó és platform. Ötvözi a vizuális galériák (pl. Pinterest) élményét a közösségi média funkcióival (követés, privát chat, valós idejű értesítések). A cél egy olyan aktív, kreatív közösség kialakítása, ahol a felhasználók inspirációt meríthetnek egymás munkáiból, visszajelzéseket adhatnak és kapcsolatokat építhetnek.

## Főbb funkciók

### Dinamikus Galéria és Képkezelés
* **Dinamikus Galéria:** Pinterest-stílusú (Masonry) elrendezés letisztult képnézegetővel.
* **Intelligens képoptimalizálás:** A feltöltött képeket a szerver a `sharp` könyvtár segítségével automatikusan formázza és optimalizálja, drasztikusan csökkentve a betöltési időt.
* **Keresés:** Keresés felhasználókra (@username vagy teljes név) és tartalmakra.

### Közösségi Interakciók
* **Követési rendszer:** Kölcsönös követés alapján felépülő ismerősi hálózat.
* **Interakciók:** Tartalmak kedvelése, kommentelése, valamint Top 10 ranglista a legnépszerűbb alkotókból.
* **Okos Értesítések:** Azonnali rendszerértesítések új követőkről, üzenetekről vagy ha valaki interakcióba lép a posztoddal.

### Kommunikáció
* **Privát Chat:** Beépített üzenetküldő rendszer az ismerősök közötti kommunikációhoz.
* **Gépelés jelzése:** Valós időben láthatod, ha a partnered éppen üzenetet ír (Typing indicator).
* **Olvasottsági státusz:** Megtekintheted a profiloknál az olvasatlan üzenetek számát.

### Biztonság és Profilkezelés
* **JWT Hitelesítés:** Biztonságos JSON Web Token alapú bejelentkezés és session kezelés.
* **Elfelejtett jelszó:** Token alapú, e-mailben történő biztonságos jelszó-visszaállítás.
* **Testreszabható Profilok:** Avatar feltöltés, bemutatkozás (bio), és tartózkodási hely megadása statisztikákkal (követők száma, like-ok).
* **Profi Adminisztráció:** Dedikált felület és szerepkör a felhasználók, posztok, kommentek moderálására és jelentések (reports) kezelésére.

## Alkalmazott technológiák

**Frontend:**
* **React.js (Vite)** – Gyors és modern kliensoldali renderelés
* **React Router DOM** – Kliensoldali navigáció
* **Tiszta CSS3** – Reszponzív, modern UI, CSS változók és animációk
* **React Icons & React Toastify** – Felhasználói élmény növelése

**Backend & Adatbázis:**
* **Node.js & Express.js** – Robusztus REST API szerver
* **MySQL** – Relációs adatbázis a stabil adattároláshoz
* **Bcrypt.js & JWT** – Biztonságos jelszó titkosítás és azonosítás
* **Multer & Sharp** – Fájlfeltöltés és hatékony memóriaszintű képfeldolgozás

## Fejlesztők

A projektet szoros együttműködésben, közös munkában fejlesztettük. Mindketten egyenlő mértékben, közösen vettünk részt a teljes Full-Stack alkalmazás – a frontend, a backend és az infrastruktúra – kialakításában.

Fejlesztőkként (**Fodor Zsombor Dezső** és **Gerencsér Ákos**) a közös feladataink a következők voltak:
*   Közösen terveztük és kiviteleztük a React.js alapú kliensoldali architektúrát, a komponens-struktúrát és a teljes UI/UX dizájnt (Glassmorphism, Masonry grid).
*   Implementáltuk a Node.js/Express.js alapú REST API szerverarchitektúrát és a végpontokat.
*   Kialakítottuk az adatbázis-tervet (MySQL), a relációs sémát és az adatintegritási szabályokat.
*   Implementáltuk a biztonsági réteget: JWT alapú hitelesítést, jelszavak titkosítását (Bcrypt.js), és az SQL Injection elleni védelmet.
*   Integráltuk a kliensoldali állapotkezelést és a szerveroldali, intelligens képfeldolgozó modult (Multer, Sharp).
*   Kifejlesztettük a valós idejű kommunikációs réteget (Socket.IO) a chat és értesítési rendszerhez.
*   Konténerizáltuk a teljes alkalmazást (Docker, Docker Compose) és közösen alakítottuk ki a DevOps folyamatokat.
*   Beállítottuk az automatizált tesztelési környezeteket (Cypress, Selenium) és megírtuk a teszteseteket.

---

## Telepítés és Futtatás (Helyi környezetben)

### 1. Adatbázis beállítása
1. Telepíts egy lokális webszervert (pl. XAMPP).
2. Hozz létre egy új MySQL adatbázist.
3. Importáld be a projektben található SQL fájlt a táblák létrehozásához.
4. Módosítsd a `Backend/db.js` fájlban az adatbázis kapcsolati adatait.

### 2. Backend indítása
Nyiss egy terminált a backend mappában:
\`\`\`bash
npm install
node server.js
\`\`\`
*(A backend alapértelmezetten a `http://localhost:3000` porton indul el.)*

### 3. Frontend indítása
Nyiss egy új terminált a frontend mappában:
\`\`\`bash
npm install
npm run dev
\`\`\`
*(A frontend a Vite segítségével indul el, általában a `http://localhost:5173` címen.)*

---
*Készült vizsgamunkaként / Portfólió projektként - 2026*
