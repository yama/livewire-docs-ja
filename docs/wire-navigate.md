---
title: wire:navigate ディレクティブ
---

Livewireの `wire:navigate` 機能を使うと、ページ遷移が非常に高速になり、SPAのような体験をユーザーに提供できます。

このページは `wire:navigate` ディレクティブの簡単なリファレンスです。より詳しい解説は [LivewireのNavigate機能のページ](/docs/navigate) をご覧ください。

以下は、ナビゲーションバーのリンクに `wire:navigate` を追加するシンプルな例です。

```blade
<nav>
    <a href="/" wire:navigate>Dashboard</a>
    <a href="/posts" wire:navigate>Posts</a>
    <a href="/users" wire:navigate>Users</a>
</nav>
```

これらのリンクがクリックされると、Livewireがクリックを検知し、ブラウザの通常のページ遷移を行わず、バックグラウンドでページを取得して現在のページと入れ替えます（これにより、非常に高速かつスムーズなページ遷移が実現します）。

## ホバー時のプリフェッチ

`.hover` モディファイアを付与すると、リンクにマウスオーバーした時点でページを事前取得できます。これにより、クリック時にはすでにサーバーからページがダウンロード済みとなります。

```blade
<a href="/" wire:navigate.hover>Dashboard</a>
```

## さらに詳しく

この機能の詳細は [Livewireのnavigateドキュメント](/docs/navigate) をご覧ください。
