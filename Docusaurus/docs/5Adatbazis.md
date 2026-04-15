# Adatbázis Architektúra

Az **ArtisticEye** alkalmazás adattárolásért egy relációs **MySQL 8.x** adatbázis felel (`artisticeye_db`). Az adatbázis tervezése során a legfőbb szempont az adatok konzisztenciája, a normalizálás, valamint a gyors lekérdezhetőség volt. 

A referenciális integritást szigorú külső kulcs (Foreign Key) megkötésekkel biztosítjuk. Számos helyen alkalmazzuk az `ON DELETE CASCADE` szabályt, amely gondoskodik róla, hogy például egy felhasználó törlésekor a hozzá tartozó posztok, kommentek és kedvelések is automatikusan törlődjenek, megelőzve az "árva" (orphan) rekordok kialakulását.

## Tartalomjegyzék
- [Főbb Adatbázistáblák és Funkcióik](#főbb-adatbázistáblák-és-funkcióik)
- [Adatbázis Kapcsolati Modell (Rövid Áttekintés)](#adatbázis-kapcsolati-modell-rövid-áttekintés)

---

## Főbb Adatbázistáblák és Funkcióik

A rendszer logikailag több modulra bontható, amelyeket az alábbi táblák szolgálnak ki:

### 1. Felhasználókezelés
* **`users`**: Az alkalmazás központi entitása. Itt tároljuk a felhasználók alapadatait (felhasználónév, email, profilkép URL). 
  * *Biztonság:* A jelszavakat egyirányú titkosítással (`password_hash`) mentjük. Tartalmazza a hitelesítési és jelszó-visszaállítási tokeneket is (`verification_token`, `reset_token`).
  * *Szerepkörök:* Az adminisztrátori és normál jogosultságokat a `role` ENUM mező (user/admin) szabályozza.

### 2. Tartalomkezelés
* **`posts`**: A felhasználók által feltöltött tartalmak (képek) tárolója. 
  * Kapcsolódik a feltöltő felhasználóhoz (`user_id`) és a kategóriához (`category_id`). 
  * A képek elérhetőségét az `image_url` mező biztosítja, de a rendszer fel van készítve közvetlen bináris képadatok (`image_data`) tárolására is. Címkéket (`tags`) is támogat a könnyebb kereshetőségért.
* **`categories`**: A posztokhoz választható kategóriák (pl. 3D Render, AI Művészet, Portré) szótártáblája.
* **`ideas`**: A felhasználók által mentett kreatív ötletek/tervek táblája, melyekből később posztok (`posts.idea_id`) születhetnek.
* **`collections` & `collection_items`**: Lehetőséget biztosít a felhasználóknak, hogy a kedvenc posztjaikat mappákba (gyűjteményekbe) rendezzék. A `collection_items` egy kapcsolótábla a posztok és a gyűjtemények között.

### 3. Közösségi Interakciók
Ezek a táblák jellemzően kapcsolótáblák, amelyek több-a-többhöz (N:M) vagy egy-a-többhöz (1:N) kapcsolatokat írnak le a felhasználók és a tartalmak között.
* **`likes`**: A posztok kedveléseit tárolja. Egy összetett elsődleges kulcsot használ (`user_id`, `post_id`), ami garantálja, hogy egy felhasználó csak egyszer tudjon kedvelni egy adott képet.
* **`comments`**: A posztokhoz fűzött felhasználói hozzászólásokat és azok időbélyegét (`created_at`) rögzíti.
* **`follows`**: A felhasználók közötti ismerősi/követői hálózatot reprezentálja. Két fő mezőből áll: `follower_id` (aki követ) és `following_id` (akit követnek).

### 4. Kommunikáció és Értesítések
* **`messages`**: A privát chat modul alapja. Nyilvántartja a feladót (`sender_id`), a címzettet (`receiver_id`), az üzenet tartalmát (`content`), valamint az olvasottsági státuszt (`is_read`).
* **`notifications`**: A rendszerértesítések tárolója. A `type` mező (pl. 'like', 'comment', 'follow', 'message') határozza meg az értesítés jellegét, míg a `target_id` az érintett tartalomra (pl. konkrét posztra) mutat.

### 5. Adminisztráció és Marketing
* **`reports`**: A tartalommoderációt támogató tábla. Ide kerülnek a felhasználók által jelentett (reportolt) bejegyzések, kommentek vagy más felhasználók. Nyomon követi a jelentés státuszát (`status`: pending/resolved).
* **`feedbacks`**: A rendszerrel kapcsolatos általános visszajelzések és hibajelentések tárolója.
* **`newsletter_subscribers` & `newsletter_content`**: A hírlevél feliratkozók adatait és a kiküldendő hírlevelek tartalmát kezelő táblák.

---

## Adatbázis Kapcsolati Modell (Rövid Áttekintés)

Az alábbi példa bemutatja, hogyan épül fel a kapcsolat a központi elemek között:

```sql
-- A hozzászólások tábla kapcsolatai:
ALTER TABLE `comments`
  -- 1. Egy komment mindig egy felhasználóhoz tartozik (ha a felhasználót törlik, a komment is törlődik)
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  -- 2. Egy komment mindig egy poszthoz tartozik (ha a posztot törlik, a komment is törlődik)
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;
```

Ez a struktúra egy rendkívül gyors és karbantartható adatbázist eredményez, amely megfelel a modern webes alkalmazások követelményeinek.