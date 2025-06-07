---
title: トラブルシューティング
---

Livewire HQ では、みなさんが問題に直面する前にできる限り障害を取り除くよう努めています。しかし、時には新たな問題を生み出さずに解決できないケースや、予期できない問題も発生します。

ここでは、Livewire アプリでよく遭遇するエラーやシナリオを紹介します。

:::tip
キャッシュクリアの推奨
問題が発生した場合は、まずキャッシュをクリアしてみてください。
:::

:::info
バージョン互換性
Livewireのバージョンによっては一部の機能が異なる場合があります。
:::

## コンポーネントの不一致

ページ上で Livewire コンポーネントを操作していると、次のような予期しない挙動やエラーメッセージが表示されることがあります。

```
Error: Component already initialized
```

```
Error: Snapshot missing on Livewire component with id: ...
```

これらのメッセージが表示される理由はさまざまですが、最も多い原因は `@foreach` ループ内の要素やコンポーネントに `wire:key` を付け忘れていることです。

### `wire:key` の追加

Blade テンプレートで `@foreach` などのループを使う場合は、ループ内の最初の要素の開始タグに必ず `wire:key` を追加してください。

```blade
@foreach($posts as $post)
    <div wire:key="{{ $post->id }}"> <!-- [tl! highlight] -->
        ...
    </div>
@endforeach
```

この指定によって、ループの内容が変化したときも Livewire が各要素を正しく追跡できます。

ループ内に Livewire コンポーネントがある場合も同様です。

```blade
@foreach($posts as $post)
    <livewire:show-post :$post :key="$post->id" /> <!-- [tl! highlight] -->
@endforeach
```

しかし、あなたが想像していないかもしれないトリッキーなシナリオがあります。

`@foreach` ループの中に Livewire コンポーネントが深くネストされている場合、そこにもキーを追加する必要があります。例えば：

```blade
@foreach($posts as $post)
    <div wire:key="{{ $post->id }}">
        ...
        <livewire:show-post :$post :key="$post->id" /> <!-- [tl! highlight] -->
        ...
    </div>
@endforeach
```

ネストされた Livewire コンポーネントにキーがないと、Livewire はネットワークリクエスト間でループされたコンポーネントを照合できなくなります。

#### プレフィックス付きキー

同じコンポーネント内で重複したキーが発生する別のトリッキーなシナリオもあります。これは、モデル ID をキーとして使用しているときに、衝突が発生することがあります。

次の例では、各キーのセットを一意に指定するために `post-` と `author-` のプレフィックスを追加する必要があります。さもなければ、同じ ID を持つ `$post` と `$author` モデルがあると、ID が衝突してしまいます。

```blade
<div>
    @foreach($posts as $post)
        <div wire:key="post-{{ $post->id }}">...</div> <!-- [tl! highlight] -->
    @endforeach

    @foreach($authors as $author)
        <div wire:key="author-{{ $author->id }}">...</div> <!-- [tl! highlight] -->
    @endforeach
</div>
```

## 複数の Alpine インスタンス

Livewire をインストールすると、次のようなエラーメッセージが表示されることがあります。

```
Error: Detected multiple instances of Alpine running
```

```
Alpine Expression Error: $wire is not defined
```

この場合、同じページに 2 つのバージョンの Alpine が実行されている可能性が高いです。Livewire は内部で独自の Alpine バンドルを含んでいるため、アプリケーションの Livewire ページに他の Alpine バージョンを削除する必要があります。

これが発生する一般的なシナリオの 1 つは、既存のアプリケーションに Livewire を追加する際に、すでに Alpine が含まれている場合です。例えば、Laravel Breeze スターターキットをインストールした後に Livewire を追加すると、これが発生します。

修正は簡単です：余分な Alpine インスタンスを削除します。

### Laravel Breeze の Alpine の削除

既存の Laravel Breeze (Blade + Alpine バージョン) に Livewire をインストールする場合は、`resources/js/app.js` から次の行を削除する必要があります。

```js
import './bootstrap';

import Alpine from 'alpinejs'; // [tl! remove:4]

window.Alpine = Alpine;

Alpine.start();
```

### CDN バージョンの Alpine の削除

Livewire バージョン 2 以前はデフォルトで Alpine を含んでいなかったため、レイアウトの head に Alpine CDN をスクリプトタグとして追加していたかもしれません。Livewire v3 では、この CDN を完全に削除でき、Livewire が自動的に Alpine を提供します。

```html
    ...
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script> <!-- [tl! remove] -->
</head>
```

注意：Livewire は `@alpinejs/ui` を除くすべての Alpine プラグインを含んでいるため、追加の Alpine プラグインも削除できます。

## `@alpinejs/ui` が見つからない

Livewire にバンドルされている Alpine は、`@alpinejs/ui` を除くすべての Alpine プラグインを含んでいます。このプラグインに依存している [Alpine Components](https://alpinejs.dev/components) のヘッドレスコンポーネントを使用している場合、次のようなエラーが発生することがあります。

```
Uncaught Alpine: no element provided to x-anchor
```

これを修正するには、次のようにレイアウトファイルに `@alpinejs/ui` プラグインを CDN として含めるだけです。

```html
    ...
    <script defer src="https://unpkg.com/@alpinejs/ui@3.13.7-beta.0/dist/cdn.min.js"></script> <!-- [tl! add] -->
</head>
```

注意：このプラグインの最新バージョンは、[任意のコンポーネントのドキュメントページ](https://alpinejs.dev/component/headless-dialog/docs) で確認できます。
