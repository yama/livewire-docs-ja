---
title: wire:cloak ディレクティブ
---

`wire:cloak` は、Livewireが完全に初期化されるまで要素を非表示にするディレクティブです。ページ読み込み時に「ちらつき」や未スタイルのコンテンツが表示されるのを防ぐのに役立ちます。

## 基本的な使い方

`wire:cloak` を使うには、ページロード中に非表示にしたい要素にこのディレクティブを追加します。

```blade
<div wire:cloak>
    Livewireの読み込みが完了するまで、この内容は非表示になります
</div>
```

### 動的コンテンツへの利用

`wire:cloak` は、`wire:show` などで表示・非表示が切り替わる動的なコンテンツの初期状態を隠したい場合にも特に便利です。

```blade
<div>
    <div wire:show="starred" wire:cloak>
        <!-- 黄色の星アイコン... -->
    </div>

    <div wire:show="!starred" wire:cloak>
        <!-- グレーの星アイコン... -->
    </div>
</div>
```

上記の例では、`wire:cloak` を使わない場合、Livewireの初期化前に両方のアイコンが表示されてしまいます。しかし、`wire:cloak` を付与することで、初期化が完了するまで両方の要素が非表示になります。
