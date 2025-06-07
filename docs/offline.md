---
title: オフライン
---

リアルタイムアプリケーションでは、ユーザーのデバイスがインターネットに接続されていないことを視覚的に示すと便利です。

Livewire には、そのような場合に使える `wire:offline` ディレクティブが用意されています。

Livewire コンポーネント内の要素に `wire:offline` を追加すると、その要素はデフォルトで非表示になり、ユーザーがオフラインになると表示されます。

```blade
<div wire:offline>
    This device is currently offline.
</div>
```

## クラスの切り替え

`class` モディファイアを追加すると、ユーザーがオフラインになったときに要素へクラスを追加できます。ユーザーが再びオンラインになると、そのクラスは自動的に削除されます。

```blade
<div wire:offline.class="bg-red-300">
```

また、`.remove` モディファイアを使えば、ユーザーがオフラインになったときにクラスを削除できます。次の例では、ユーザーがオフラインの間、`<div>` から `bg-green-300` クラスが削除されます。

```blade
<div class="bg-green-300" wire:offline.class.remove="bg-green-300">
```

## 属性の切り替え

`.attr` モディファイアを使うと、ユーザーがオフラインになったときに要素へ属性を追加できます。次の例では、「Save」ボタンはユーザーがオフラインの間だけ無効化されます：

```blade
<button wire:offline.attr="disabled">Save</button>
```

