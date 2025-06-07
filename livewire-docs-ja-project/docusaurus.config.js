module.exports = {
  title: 'Livewire 日本語ドキュメント',
  tagline: 'Livewire公式ドキュメント日本語訳',
  url: 'https://your-site-url.com', // Replace with your site's URL
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'your-github-username', // Replace with your GitHub org/user name
  projectName: 'livewire-docs-ja', // Replace with your project name
  themeConfig: {
    navbar: {
      title: 'Livewire 日本語ドキュメント',
      items: [
        {to: 'docs/quickstart', label: 'ドキュメント', position: 'left'},
        {to: 'docs/api', label: 'API', position: 'left'},
        {to: 'blog', label: 'ブログ', position: 'left'},
        {
          href: 'https://github.com/your-github-username/livewire-docs-ja',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Quick Start',
              to: 'docs/quickstart',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/your-github-username/livewire-docs-ja',
            },
          ],
        },
      ],
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/your-github-username/livewire-docs-ja/edit/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/your-github-username/livewire-docs-ja/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};