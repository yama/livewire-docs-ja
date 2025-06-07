// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  livewireSidebar: [
    {
      type: 'category',
      label: 'はじめに',
      items: [
        'quickstart',
        'installation',
        'upgrading',
      ],
    },
    {
      type: 'category',
      label: '基本事項',
      items: [
        'components',
        'properties',
        'actions',
        'forms',
        'events',
        'lifecycle-hooks',
        'nesting',
        'testing',
      ],
    },
    {
      type: 'category',
      label: '機能',
      items: [
        'alpine',
        'navigate',
        'lazy',
        'validation',
        'uploads',
        'pagination',
        'url',
        'computed-properties',
        'session-properties',
        'redirecting',
        'downloads',
        'locked',
        'bundling',
        'offline',
        'teleport',
      ],
    },
    {
      type: 'category',
      label: 'HTMLディレクティブ',
      items: [
        'wire-click',
        'wire-submit',
        'wire-model',
        'wire-loading',
        'wire-navigate',
        'wire-current',
        'wire-cloak',
        'wire-dirty',
        'wire-confirm',
        'wire-transition',
        'wire-init',
        'wire-poll',
        'wire-offline',
        'wire-ignore',
        'wire-replace',
        'wire-show',
        'wire-stream',
        'wire-text',
      ],
    },
    {
      type: 'category',
      label: '概念',
      items: [
        'morph',
        'hydration',
        'understanding-nesting',
      ],
    },
    {
      type: 'category',
      label: '上級',
      items: [
        'troubleshooting',
        'security',
        'javascript',
        'synthesizers',
        'contribution-guide',
      ],
    },
    {
      type: 'category',
      label: 'パッケージ',
      items: [
        'volt',
      ],
    },
  ],
};

export default sidebars;
