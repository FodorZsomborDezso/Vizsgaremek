// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ArtisticEye',
  tagline: 'Modern, interaktív képmegosztó és közösségi platform alkotóknak.',
  favicon: 'img/Doc_logo.png', // Ide írd az új fájl pontos nevét és kiterjesztését

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'FodorZsomborDezso', // Usually your GitHub org/user name.
  projectName: 'Vizsgaremek', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
      title: '',
        logo: {
          alt: 'ArtisticEye Logo',
          src: 'img/artisticeye.png',
          srcDark: 'img/artisticeye_light.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Dokumentáció',
          },
          {
            href: 'https://github.com/FodorZsomborDezso/Vizsgaremek',
            label: 'GitHub',
            position: 'right',
          },
          { 
            href: 'http://localhost:5173/', 
            label: 'Vissza az alkalmazásba', 
            position: 'right',
            className: 'nav-cta-button',
          },
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'ArtisticEye Logo',
          src: 'img/artisticeye.png',
          srcDark: 'img/artisticeye_light.png',
          href: '/',
        },
        links: [
          {
          title: 'Projekt',
            items: [
              {
                label: 'Összegzés',
                to: '/docs/osszegzes',
              },
              {
                label: 'Tesztelés',
                to: '/docs/teszteles',
              },
            ],
          },
          {
          title: 'Felépítés',
            items: [
              {
              label: 'Frontend',
              to: '/docs/3Frontend',
              },
              {
              label: 'Backend',
              to: '/docs/2Backend',
            },
            {
              label: 'Adatbázis',
              to: '/docs/5Adatbazis',
              },
            ],
          },
          {
          title: 'Közösség és Linkek',
            items: [
              {
                label: 'ArtisticEye Főoldal',
                href: 'http://localhost:5173/',
              },
            {
              label: 'GitHub Repozitórium',
              href: 'https://github.com/FodorZsomborDezso/Vizsgaremek',
            },
            ],
          },
          {
            title: 'Készítők',
            items: [
              {
                html: '<b>Fodor Zsombor Dezső</b><br/><span style="font-size: 0.85em; opacity: 0.8;">Szoftverfejlesztő</span>',
              },
              {
                html: '<div style="margin-top: 10px;"><b>Gerencsér Ákos</b><br/><span style="font-size: 0.85em; opacity: 0.8;">Szoftverfejlesztő</span></div>',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ArtisticEye Vizsgaremek.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
