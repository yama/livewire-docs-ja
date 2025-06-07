---
title: wire:offline ディレクティブ
---

<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/wire-offline.md -->
状況によっては、ユーザーが現在インターネットに接続されているかどうかを知らせることが重要です。

例えば、Livewireでブログプラットフォームを構築している場合、オフライン状態で記事を書き続けてしまい、保存できないリスクをユーザーに通知したいことがあります。

Livewireでは、`wire:offline` ディレクティブを使うことで簡単にこの機能を実現できます。Livewireコンポーネント内の要素に `wire:offline` を付与すると、デフォルトで非表示になり、ネットワーク接続が切断されたときだけ表示されます。再接続されると自動的に非表示に戻ります。

例：

```blade
<p class="alert alert-warning" wire:offline>
    お使いのデバイスがオフラインになりました。このページは現在オフラインです。
</p>
```
