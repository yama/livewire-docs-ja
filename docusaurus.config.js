// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Livewire 日本語ドキュメント',
  tagline: 'Livewire公式ドキュメント日本語訳',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://yama.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/livewire-docs-ja/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'yama', // Usually your GitHub org/user name.
  projectName: 'livewire-docs-ja', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          sidebarItemsGenerator: undefined, // 明示的なサイドバーを利用
        },
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
      navbar: {
        title: 'Livewire 日本語ドキュメント',
        logo: {
          alt: 'Livewire ロゴ',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'livewireSidebar',
            position: 'left',
            label: 'ドキュメント',
          },
          {
            href: 'https://github.com/livewire/docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'ドキュメント',
            items: [
            ],
          },
          {
            title: 'コミュニティ',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/livewire',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/livewire',
              },
              {
                label: 'X',
                href: 'https://x.com/livewire',
              },
            ],
          },
          {
            title: 'その他',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/livewire/docs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Livewire日本語訳プロジェクト`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['php', 'bash', 'javascript', 'json', 'css'],
        magicComments: [
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-next-line',
          },
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-start',
          },
          {
            className: 'theme-code-block-highlighted-line',
            line: 'highlight-end',
          },
        ],
      },
    }),
};

export default config;
