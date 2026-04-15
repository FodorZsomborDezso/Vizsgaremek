# Tesztelés (Backend és Frontend)

Az **ArtisticEye** alkalmazás backendjének stabilitását, adatbiztonságát és hibamentes működését automatizált tesztek biztosítják. A teszteléshez a **Jest** keretrendszert és a **Supertest** könyvtárat használjuk, amelyek lehetővé teszik az Express.js API végpontok szimulált meghívását, anélkül, hogy a teljes szervert el kellene indítani.
A frontend felhasználói élményének (UI/UX) ellenőrzését pedig **Selenium** alapú End-to-End (E2E) tesztekkel végezzük.

## Tartalomjegyzék
- **Backend Tesztelés (Jest)**
  - [Tesztelési Környezet és Mockolás (Mocking)](#tesztelési-környezet-és-mockolás-mocking)
  - [Tesztelt Funkciók (Content API)](#tesztelt-funkciók-content-api)
- **Frontend Tesztelés (Selenium)**
  - [Környezet és Beállítások](#környezet-és-beállítások)
  - [Tesztelt Felhasználói Folyamatok (E2E)](#tesztelt-felhasználói-folyamatok-e2e)

---

## Tesztelési Környezet és Mockolás (Mocking)

A tesztek izoláltan (unit és integrációs teszt jelleggel) futnak. Annak érdekében, hogy a tesztelés gyors legyen, és ne módosítsa a valós éles vagy fejlesztői adatbázist, az alábbi külső függőségeket "mockoljuk" (szimuláljuk):

- **Adatbázis (`db`):** A MySQL hívásokat felülírjuk, így a lekérdezések (SELECT, INSERT, UPDATE, DELETE) előre definiált, fix adatokat adnak vissza. Ezzel tesztelhető az üzleti logika anélkül, hogy valódi adatokhoz nyúlnánk.
- **Fájlrendszer (`fs`) és Képfeldolgozás (`sharp`):** A fájlok lemezre írását, törlését és a memóriaszintű képoptimalizálást szimuláljuk.
- **Hitelesítés (Auth Middleware):** A védett végpontok hívásakor egy virtuális tesztfelhasználót (pl. `id: 1`, `username: testuser`) fecskendezünk be, kikerülve a valós JWT token generálást és ellenőrzést.
- **Segédfüggvények (Helpers):** A Multer fájlfeltöltést egy memóriába töltött kamu fájllal szimuláljuk, a rendszerértesítések (notification) küldését pedig némítjuk, de figyeljük a hívásukat.

---

## Tesztelt Funkciók (Content API)

A tartalomkezeléshez (`Content.js` route-ok) tartozó tesztek az alábbi főbb felhasználói eseteket fedik le:

### 1. Posztok és Galéria Lekérdezése (GET)
- **Sikeres listázások:** Ellenőrizzük, hogy a galéria lapozó funkciója, a saját posztok, a kedvelt posztok és a legújabb posztok sikeres (200 OK) státuszkóddal és a megfelelő JSON struktúrával térnek-e vissza.
- **Hibakezelés 404:** Ha egy felhasználó egy nem létező posztot próbál megnyitni (pl. `/api/posts/999`), a rendszer megfelelően lekezeli, és 404-es hibát dob.

### 2. Tartalom Létrehozása, Módosítása és Törlése
- **Létrehozás:** Új poszt feltöltésekor ellenőrizzük, hogy a megfelelő adatbázis INSERT és a fájlmentés (szimulálva) megtörténik-e. Hiányzó kötelező mezők (pl. cím) esetén a rendszer 400-as validációs hibát ad.
- **Jogosultság-ellenőrzés (Biztonság):** Kiemelten fontos biztonsági teszt: a módosítás (PUT) és törlés (DELETE) végpontok ellenőrzik, hogy **csak a poszt tulajdonosa** végezhet-e módosítást. Ha egy felhasználó idegen poszttal próbálkozik, 403-as (Forbidden) hibát kap. Törléskor a teszt ellenőrzi, hogy a képfájl is törlődik-e a szerverről.

### 3. Közösségi Interakciók
- **Kommentelés:** Sikeres komment írása 201-es státuszkódot eredményez, üres (csak szóköz) komment esetén pedig validációs hibát kapunk.
- **Kedvelés (Like Toggle):** A végpont "kapcsoló" elven működik. A teszt ellenőrzi:
  1. Ha még nem kedvelte a posztot, akkor a like rögzítésre kerül, és a poszt tulajdonosa (szimulált) értesítést kap.
  2. Ha már kedvelte korábban, akkor az ismételt hívás visszavonja (törli) a kedvelést mind a `likes`, mind a `notifications` táblákból.

### 4. Képkiszolgálás
- A `/api/posts/:id/image` végpont teszteli, hogy az adatbázisban található (`image_data`) bináris formátumból megfelelően állítja-e elő és küldi el a képet a kliensnek (`image/jpeg` vagy `image/png` fejléccel), illetve ad-e 404-et, ha sehol sem találja a képet.

### 5. Gyűjtemények (Collections) és Ötletek (Ideas)
- **Gyűjtemények:** Teljeskörűen tesztelve van új mappák létrehozása, a kedvenc posztok mappához adása, listázása, valamint a mappa (és tartalmának) törlése.
- **Ötletek:** Új ötletek/tervek rögzítése és a meglévők sikeres kilistázása.

### 6. Moderáció és Visszajelzés
- **Jelentések (Reports):** A felhasználók általi hibajelentések és moderációs reportok (pl. nem megfelelő tartalom) sikeres rögzítése, valamint a kötelező indoklás (reason) ellenőrzése.

---

## Frontend Tesztelés (Selenium)

A frontend alkalmazás felhasználói élményének (UI/UX) és teljes funkcionalitásának automatizált ellenőrzését **Selenium WebDriver** (End-to-End, E2E) tesztekkel biztosítjuk. Ezek a tesztek valós böngészőkörnyezetet (pl. Google Chrome) használnak, és a felhasználó szemszögéből hajtják végre a műveleteket az oldalon, valós interakciókat szimulálva.

### Környezet és Beállítások
- **Böngészővezérlés:** A tesztek a böngésző driverek (pl. `chromedriver`) segítségével közvetlenül kommunikálnak az aktuális böngészővel, automatizálva az egérkattintásokat, a görgetést és a billentyűzet-beviteleket.
- **Várakozások (Waits):** Mivel a React egy Single Page Application (SPA), a DOM elemek dinamikusan töltődnek be és frissülnek (pl. aszinkron API kérések után). A tesztekben *Explicit Wait* (kifejezett várakozás) stratégiát alkalmazunk (pl. várakozás egy gomb kattinthatóságára, vagy a Toastify hibaüzenet megjelenésére). Ezzel stabil, fals hibáktól mentes (flake-free) tesztfutást érünk el.
- **Izolált tesztfiókok:** Az E2E tesztek dedikált tesztfelhasználókkal futnak, így az automatikusan létrehozott és törölt adatok nem zavarják a valós alkalmazás működését.

### Tesztelt Felhasználói Folyamatok (E2E)

A Selenium tesztek a legkritikusabb felhasználói "utakat" (User Journeys) fedik le a felületen:

#### 1. Hitelesítés és Navigáció
- **Bejelentkezés (Login):** Helyes hitelesítő adatok megadása után ellenőrizzük, hogy a rendszer a főoldalra irányít-e, és megjelenik-e a profil ikon. Hibás adat esetén a `"Hibás jelszó vagy felhasználónév"` típusú Toast üzenet meglétét teszteljük.
- **Kijelentkezés:** A navigációs sávban a kijelentkezés gombra kattintva a JWT session törlődik, a felhasználó visszakerül a bejelentkező képernyőre, és a védett útvonalak (pl. profil megtekintése) elérhetetlenné válnak.

#### 2. Tartalomkezelés a Felületen
- **Új poszt feltöltése:** A teszt megnyitja a feltöltés modált, automatikusan kitölti a címet és leírást, legördülő menüből kategóriát választ, majd becsatol egy lokális tesztképet. A mentés gombra kattintás után verifikáljuk a sikeres visszajelzést, és azt, hogy a poszt kártyája megjelent a Masonry galériában.
- **Validációs hibák kezelése:** Üres űrlap beküldésekor ellenőrizzük, hogy a kötelező mezők mellett megjelennek-e a kliensoldali figyelmeztetések.

#### 3. Interakciók Szimulálása
- **Kedvelés (Like Toggle):** A böngészőben rákattintunk egy poszt kedvelés (szív) ikonjára. A teszt ellenőrzi a CSS osztályok változását (pl. bekapcsol-e a `.liked` neon effekt az ArtisticEye stílusjegyek alapján) és a számláló értékének azonnali frissülését.
- **Kommentelés:** Megnyitjuk egy konkrét poszt részletes nézetét, teszt szöveget írunk a komment beviteli mezőbe és beküldjük. Ezt követően validáljuk, hogy a hozzászólás azonnal, újratöltés nélkül bekerült a kommentek listájába.
- **Gyűjtemények (Mappák):** Leteszteljük, ahogy a felhasználó megnyitja egy poszt mentési opcióit, létrehoz egy új mappát, és sikeresen beleteszi a kiválasztott képet.
