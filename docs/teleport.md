---
title: テレポート
---

Livewireでは、テンプレートの一部をページ内の別のDOM位置へ「テレポート」できます。

これは、ネストしたダイアログのような場面で便利です。たとえば、ダイアログを入れ子にすると、親モーダルのz-indexが子モーダルにも適用され、バックドロップやオーバーレイのスタイルに問題が生じることがあります。こうした問題を避けるため、Livewireの`@teleport`ディレクティブを使えば、各モーダルをDOM上で兄弟要素としてレンダリングできます。

この機能は[Alpineの`x-teleport`ディレクティブ](https://alpinejs.dev/directives/teleport)によって実現されています。

## 基本的な使い方

テンプレートの一部を別のDOM位置へテレポートするには、Livewireの`@teleport`ディレクティブで囲みます。

以下は、`@teleport`を使ってモーダルダイアログの内容をページの`<body>`末尾にレンダリングする例です：

```blade
<div>
    <!-- モーダル -->
    <div x-data="{ open: false }">
        <button @click="open = ! open">モーダルを切り替え</button>

        @teleport('body')
            <div x-show="open">
                モーダルの内容...
            </div>
        @endteleport
    </div>
</div>
```

> [!info]
> `@teleport`のセレクタは、通常`document.querySelector()`に渡す任意の文字列を指定できます。
>
> `document.querySelector()`の詳細は[MDNドキュメント](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)をご覧ください。

上記のLivewireテンプレートをページでレンダリングすると、モーダルの「内容」部分が`<body>`末尾に出力されます：

```html
<body>
    <!-- ... -->

    <div x-show="open">
        モーダルの内容...
    </div>
</body>
```

> [!warning] コンポーネント外へのテレポートのみ対応
> Livewireは、コンポーネント外へのHTMLテレポートのみをサポートしています。たとえば、モーダルを`<body>`タグへテレポートするのはOKですが、同じコンポーネント内の別要素へのテレポートは動作しません。

> [!warning] テレポートはルート要素が1つのみ
> `@teleport`内には必ず1つのルート要素だけを含めてください。
