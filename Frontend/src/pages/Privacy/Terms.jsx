import { useEffect } from 'react';
import './Privacy.css'; // Újrahasználjuk az Adatvédelmi tájékoztató gyönyörű stílusait!

const Terms = () => {
  // Amikor betölt az oldal, ugorjon a tetejére (ha a footerből kattintottak)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page-container">
      <div className="privacy-content-wrapper">
        
        <div className="privacy-header">
          <h1>Általános Szerződési Feltételek (ÁSZF)</h1>
          <p className="last-updated">Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}</p>
        </div>

        <div className="privacy-alert-box">
          <strong>Megjegyzés:</strong> Ez a weboldal (ArtisticEye) egy iskolai vizsgaremek / portfólió munka keretében jött létre. A jelen ÁSZF kizárólag tesztelési és demonstrációs célokat szolgál, jogi kötőerővel nem bír.
        </div>

        <div className="privacy-section">
          <h2>1. Bevezetés</h2>
          <p>
            Jelen Általános Szerződési Feltételek (továbbiakban: ÁSZF) az ArtisticEye (továbbiakban: Szolgáltató) által üzemeltetett weboldal és az ahhoz kapcsolódó szolgáltatások használatának feltételeit tartalmazza. Az oldal használatával a Felhasználó elfogadja a jelen dokumentumban leírtakat.
          </p>
        </div>

        <div className="privacy-section">
          <h2>2. A Szolgáltatás célja</h2>
          <p>
            Az ArtisticEye egy modern közösségi platform, amely lehetőséget biztosít a felhasználóknak vizuális tartalmak (alkotások, fotók) feltöltésére, megosztására, értékelésére és gyűjteményekbe rendezésére. Az oldal non-profit, bemutató jellegű projekt.
          </p>
        </div>

        <div className="privacy-section">
          <h2>3. Felhasználói felelősség</h2>
          <ul>
            <li>A felhasználó köteles a regisztráció során valós, vagy másokat meg nem tévesztő, nem sértő adatokat megadni.</li>
            <li>Tilos olyan tartalmat feltölteni, amely jogszabályba ütközik, vagy uszító, gyűlöletkeltő, felkavaró jellegű.</li>
            <li>A platformon végzett tevékenységéért és az általa feltöltött tartalmakért kizárólag a Felhasználó felelős.</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>4. Szerzői jogok a tartalmakra</h2>
          <p>
            A feltöltött tartalmak (képek, grafikák, megjegyzések) szerzői joga a feltöltőt illeti meg. Az oldalra történő feltöltéssel azonban a Felhasználó hozzájárul ahhoz, hogy a Szolgáltató a tartalmat a platform működtetése céljából, a keresőmotorokban és a galériában megjelenítse. Kérjük, csak olyan képet tölts fel, aminek te vagy a szerzője, vagy rendelkezel a megfelelő felhasználási jogosultságokkal!
          </p>
        </div>

        <div className="privacy-section">
          <h2>5. Fiók felfüggesztése és moderáció</h2>
          <p>
            A Szolgáltató (Adminisztrátorok) fenntartja a jogot, hogy előzetes értesítés nélkül törölje vagy felfüggessze azon felhasználók fiókját, illetve törölje a tartalmaikat, akik megsértik az ÁSZF-ben foglaltakat (például spam, nem megfelelő tartalom feltöltése, vagy az oldal működésének szándékos akadályozása).
          </p>
        </div>

        <div className="privacy-section">
          <h2>6. Felelősségkizárás</h2>
          <p>
            Mivel a szolgáltatás egy vizsgaremek keretében üzemel, a Szolgáltató nem vállal garanciát az oldal 0-24 órás folyamatos elérhetőségéért, az adatok (pl. üzenetek, feltöltött képek) esetleges elvesztéséért, vagy a platform használatából eredő bármilyen közvetett kárért.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Terms;