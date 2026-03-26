<div align="center">
  <h1>ArtisticEye</h1>
  <p><b>Modern, interaktív képmegosztó és közösségi platform alkotóknak.</b></p>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
  ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
</div>

---

## Tartalomjegyzék
- [Projekt bemutatása](#-projekt-bemutatása)
- [Főbb funkciók](#-főbb-funkciók)
- [Alkalmazott technológiák](#-alkalmazott-technológiák)
- [Fejlesztők](#-fejlesztők)
- [Telepítés és Futtatás](#-telepítés-és-futtatás)

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

A projekt fejlesztése közös munkavégzésben, egymást kiegészítve, átfogó frontend és backend tervezéssel készült:
* **Fodor Zsombor Dezső**
* **Gerencsér Ákos**

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
