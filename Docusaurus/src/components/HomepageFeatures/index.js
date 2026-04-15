import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Dinamikus Galéria és Képkezelés',
    description: (
      <>
        Pinterest-stílusú (Masonry) elrendezés letisztult képnézegetővel. A szerver 
        automatikusan optimalizálja a feltöltött képeket a villámgyors betöltés érdekében.
      </>
    ),
  },
  {
    title: 'Közösség és Kommunikáció',
    description: (
      <>
        Építs kapcsolatokat, kedveld és kommenteld mások munkáit. A beépített 
        privát chat rendszer valós idejű gépelésjelzéssel és értesítésekkel vár.
      </>
    ),
  },
  {
    title: 'Biztonság és Testreszabás',
    description: (
      <>
        Biztonságos JWT alapú hitelesítés és profi adminisztráció. Szabd testre 
        a profilodat avatarral, bemutatkozással és kövesd nyomon a statisztikáidat.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4', styles.featureColumn)}>
      <div className="feature-card">
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
