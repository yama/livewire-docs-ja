---
title: wire:init ディレクティブ
---

<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/wire-init.md -->
Livewireには、コンポーネントの描画直後にアクションを実行できる `wire:init` ディレクティブがあります。ページ全体の読み込みを待たず、ページ表示後すぐにデータを取得したい場合などに便利です。

```blade
<div wire:init="loadPosts">
    <!-- ... -->
</div>
```

この例では、Livewireコンポーネントの描画直後に `loadPosts` アクションが実行されます。

ただし、ほとんどの場合は [Livewireの遅延読み込み機能](/docs/lazy) の利用が推奨されます。
