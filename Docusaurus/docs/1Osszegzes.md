# Szoftverfejlesztő és tesztelő záróvizsga

<div class="text--center">
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

A projekt fejlesztése közös munkavégzésben, egymást kiegészítve, átfogó frontend és backend tervezéssel készült:
* **Fodor Zsombor Dezső**
* **Gerencsér Ákos**

---

## Telepítés és Futtatás (Docker környezetben)

Ez a projekt a `Docker` és `Docker Compose` segítségével egyetlen paranccsal elindítható. A rendszer automatikusan felépíti az adatbázist, és elindítja a frontend, backend, valamint a dokumentációs szervereket.

### Előfeltételek
- Docker Desktop telepítve
- Node.js telepítve (az `npm` parancsok futtatásához)

### Indítás
1.  Nyiss egy terminált a projekt gyökérkönyvtárában (ahol a `docker-compose.yml` fájl található).
2.  Futtasd a telepítőt, ami minden alprojekt (`Frontend`, `Backend`, `Docusaurus`) függőségeit is telepíti:
    ```bash
    npm install
    ```
3.  Indítsd el a teljes alkalmazást a következő paranccsal:
    ```bash
    npm start
    ```

Ez a parancs leállítja és törli a korábbi adatbázis konténert, újraépíti azt, majd párhuzamosan elindítja a Backend, Frontend és Docusaurus szervereket.

Az alkalmazás részei az alábbi alapértelmezett címeken lesznek elérhetőek:
- **Frontend (ArtisticEye):** `http://localhost:5173`
- **Backend API:** `http://localhost:3000`
- **Dokumentáció (Docusaurus):** `http://localhost:3001`
- **Adatbázis-kezelő (phpMyAdmin):** `http://localhost:8080`

---
*Készült vizsgamunkaként / Portfólió projektként - 2026*
