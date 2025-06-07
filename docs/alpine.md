---
title: Alpine.js 連携
---

[AlpineJS](https://alpinejs.dev/) は、Webページにクライアントサイドのインタラクティブな機能を簡単に追加できる軽量なJavaScriptライブラリです。もともとLivewireのようなツールと組み合わせて使うことを想定して作られており、アプリに手軽にインタラクションを加えたい場合に便利です。

LivewireにはAlpineが最初から組み込まれているため、別途インストールする必要はありません。

AlpineJSの使い方については、[公式ドキュメント](https://alpinejs.dev) を参照してください。

## 基本的なAlpineコンポーネント

このドキュメントの基礎として、最もシンプルかつ分かりやすいAlpineコンポーネントの例を紹介します。ページ上に数値を表示し、ボタンをクリックするとその数値が増える「カウンター」です。

```html
<!-- JavaScriptのデータオブジェクトを宣言... -->
<div x-data="{ count: 0 }">
    <!-- 現在の「count」値を要素内に表示... -->
    <h2 x-text="count"></h2>

    <!-- クリックイベントが発生したときに「count」値を「1」増やす... -->
    <button x-on:click="count++">+</button>
</div>
```

上記のAlpineコンポーネントは、アプリケーション内のどのLivewireコンポーネントでもそのまま利用できます。LivewireがAlpineの状態をLivewireコンポーネントの更新時にも維持してくれるため、特別な対応は不要です。つまり、Alpineを通常の（非Livewire）環境と同じように、Livewire内でも自由に使うことができます。

## Livewire内でAlpineを使う

Livewireコンポーネント内でAlpineコンポーネントを使用する、より実践的な例を見てみましょう。

以下は、データベースからポストモデルの詳細を表示するシンプルなLivewireコンポーネントです。デフォルトでは、ポストのタイトルのみが表示されます。

```html
<div>
    <h1>{{ $post->title }}</h1>

    <div x-data="{ expanded: false }">
        <button type="button" x-on:click="expanded = ! expanded">
            <span x-show="! expanded">ポストの内容を表示...</span>
            <span x-show="expanded">ポストの内容を隠す...</span>
        </button>

        <div x-show="expanded">
            {{ $post->content }}
        </div>
    </div>
</div>
```

Alpineを使用することで、ユーザーが「ポストの内容を表示...」ボタンを押すまでポストの内容を隠すことができます。この時点で、Alpineの`expanded`プロパティは`true`に設定され、`x-show="expanded"`がポストの内容の表示/非表示を制御するため、ページ上に内容が表示されます。

これは、Alpineの真価を発揮する例です：アプリケーションにインタラクティブ性を追加する際に、Livewireのサーバー往復を引き起こすことなく実現できます。

## `$wire`を使ったAlpineからLivewireの制御

Livewire開発者にとって非常に強力な機能の一つが`$wire`です。`$wire`オブジェクトは、Livewire内で使用されるすべてのAlpineコンポーネントで利用可能なマジックオブジェクトです。

`$wire`は、JavaScriptからPHPへのゲートウェイのように考えることができます。これを使用すると、Livewireコンポーネントのプロパティにアクセスしたり、Livewireコンポーネントのメソッドを呼び出したりすることができます。さらに多くのことが、すべてAlpineJS内から実行可能です。

### Livewireプロパティへのアクセス

以下は、投稿の内容に含まれる文字数をユーザーに即座に示す、投稿作成フォーム内のシンプルな「文字カウント」ユーティリティの例です。ユーザーが入力するたびに、ポストの内容に何文字含まれているかを即座に示します。

```html
<form wire:submit="save">
    <!-- ... -->

    <input wire:model="content" type="text">

    <small>
        文字数: <span x-text="$wire.content.length"></span> <!-- [tl! highlight] -->
    </small>

    <button type="submit">保存</button>
</form>
```

上記の例では、`x-text`が`<span>`要素のテキストコンテンツを制御するために使用されています。`x-text`は、任意のJavaScript式を受け入れ、依存関係が更新されると自動的に反応します。ここでは、`$wire.content`を使用して`$content`の値にアクセスしているため、Livewireから`wire:model="content"`によって`$wire.content`が更新されるたびに、Alpineがテキストコンテンツを自動的に更新します。

### Livewireプロパティの変更

以下は、Alpine内で`$wire`を使用して、投稿作成フォームの「タイトル」フィールドをクリアする例です。

```html
<form wire:submit="save">
    <input wire:model="title" type="text">

    <button type="button" x-on:click="$wire.title = ''">クリア</button> <!-- [tl! highlight] -->

    <!-- ... -->

    <button type="submit">保存</button>
</form>
```

ユーザーが上記のLivewireフォームに入力しているとき、「クリア」ボタンを押すとタイトルフィールドがクリアされ、Livewireからネットワークリクエストを送信することなく即座に反応します。

これを実現するために何が行われているのか、簡単に説明します：

* `x-on:click`は、Alpineにボタン要素のクリックをリッスンするよう指示します
* クリックされると、Alpineは提供されたJS式`$wire.title = ''`を実行します
* `$wire`はLivewireコンポーネントを表すマジックオブジェクトであるため、コンポーネントのすべてのプロパティにJavaScriptから直接アクセスまたは変更できます
* `$wire.title = ''`は、Livewireコンポーネント内の`$title`の値を空の文字列に設定します
* `wire:model`のようなLivewireユーティリティは、この変更に即座に反応し、すべてサーバー往復を送信することなく行われます
* 次回のLivewireネットワークリクエストで、バックエンドの`$title`プロパティは空の文字列に更新されます

### Livewireメソッドの呼び出し

Alpineは、`$wire`上で直接メソッドを呼び出すことで、Livewireメソッド/アクションを簡単に呼び出すこともできます。

以下は、Alpineを使用して入力フィールドの「blur」イベントをリッスンし、フォームの保存をトリガーする例です。「blur」イベントは、ユーザーが「tab」キーを押して現在の要素からフォーカスを外し、ページ上の次の要素にフォーカスを移動させると、ブラウザによって発火されます。

```html
<form wire:submit="save">
    <input wire:model="title" type="text" x-on:blur="$wire.save()">  <!-- [tl! highlight] -->

    <!-- ... -->

    <button type="submit">保存</button>
</form>
```

通常、この状況では`wire:model.blur="title"`を使用しますが、これはAlpineを使用してどのように実現できるかを示すために役立ちます。

#### パラメータの渡し方

`$wire`メソッド呼び出しにパラメータを渡すこともできます。

以下のような`deletePost()`メソッドを持つコンポーネントを考えてみてください。

```php
public function deletePost($postId)
{
    $post = Post::find($postId);

    // 認可されたユーザーのみが削除可能...
    auth()->user()->can('update', $post);

    $post->delete();
}
```

次のように、Alpineから`deletePost()`メソッドに`$postId`パラメータを渡すことができます。

```html
<button type="button" x-on:click="$wire.deletePost(1)">
```

一般的に、`$postId`のようなものはBladeで生成されます。以下は、Bladeを使用してどのように異なる`$postId`を`deletePost()`に渡すかの例です。

```html
@foreach ($posts as $post)
    <button type="button" x-on:click="$wire.deletePost({{ $post->id }})">
        「{{ $post->title }}」を削除
    </button>
@endforeach
```

ページ上に3つのポストがある場合、上記のBladeテンプレートはブラウザ上で次のようにレンダリングされます。

```html
<button type="button" x-on:click="$wire.deletePost(1)">
    「歩行の力」を削除
</button>

<button type="button" x-on:click="$wire.deletePost(2)">
    「曲を録音する方法」を削除
</button>

<button type="button" x-on:click="$wire.deletePost(3)">
    「学んだことを教える」を削除
</button>
```

このように、Bladeを使用して異なるポストIDをAlpineの`x-on:click`式にレンダリングしています。

#### Bladeパラメータの「落とし穴」

これは非常に強力なテクニックですが、Bladeテンプレートを読むときに混乱を招くことがあります。一見してどの部分がBladeでどの部分がAlpineなのかを把握するのが難しい場合があります。そのため、期待通りにレンダリングされているかを確認するために、ページ上でレンダリングされたHTMLを検査することが役立ちます。

以下は、人々を混乱させる一般的な例です：

ポストモデルがUUIDをIDとして使用しているとしましょう（IDは整数で、UUIDは長い文字列のキャラクターです）。

IDの代わりに次のようにレンダリングすると、問題が発生します。

```html
<!-- 警告：これは問題のあるコードの例です... -->
<button
    type="button"
    x-on:click="$wire.deletePost({{ $post->uuid }})"
>
```

上記のBladeテンプレートは、HTML内で次のようにレンダリングされます。

```html
<!-- 警告：これは問題のあるコードの例です... -->
<button
    type="button"
    x-on:click="$wire.deletePost(93c7b04c-c9a4-4524-aa7d-39196011b81a)"
>
```

UUID文字列の周りに引用符がないことに注意してください。Alpineがこの式を評価しようとすると、JavaScriptはエラーをスローします：「Uncaught SyntaxError: Invalid or unexpected token」。

これを修正するには、次のようにBlade式の周りに引用符を追加する必要があります。

```html
<button
    type="button"
    x-on:click="$wire.deletePost('{{ $post->uuid }}')"
>
```

これで、上記のテンプレートは正しくレンダリングされ、すべてが期待通りに機能します。

```html
<button
    type="button"
    x-on:click="$wire.deletePost('93c7b04c-c9a4-4524-aa7d-39196011b81a')"
>
```

### コンポーネントのリフレッシュ

`$wire.$refresh()`を使用すると、Livewireコンポーネントを簡単にリフレッシュ（ネットワーク往復をトリガーしてコンポーネントのBladeビューを再レンダリング）できます。

```html
<button type="button" x-on:click="$wire.$refresh()">
```

## `$wire.entangle`を使った状態の共有

ほとんどの場合、AlpineからLivewireの状態にアクセスするためには`$wire`だけで十分ですが、Livewireは追加のユーティリティ`$wire.entangle()`も提供しており、これを使用するとLivewireの値とAlpineの値を同期させることができます。

これを示すために、以下のように`showDropdown`プロパティがLivewireとAlpineの間で絡められたドロップダウンの例を考えてみましょう。絡めることによって、AlpineとLivewireの両方からドロップダウンの状態を制御できるようになります。


```php
use Livewire\Component;

class PostDropdown extends Component
{
    public $showDropdown = false;

    public function archive()
    {
        // ...

        $this->showDropdown = false;
    }

    public function delete()
    {
        // ...

        $this->showDropdown = false;
    }
}
```

```blade
<div x-data="{ open: $wire.entangle('showDropdown') }">
    <button x-on:click="open = true">もっと表示...</button>

    <ul x-show="open" x-on:click.outside="open = false">
        <li><button wire:click="archive">アーカイブ</button></li>

        <li><button wire:click="delete">削除</button></li>
    </ul>
</div>
```

ユーザーはAlpineを使ってドロップダウンを即座にトグルできますが、「アーカイブ」のようなLivewireアクションをクリックすると、Livewireからドロップダウンを閉じるように指示されます。AlpineとLivewireの両方がそれぞれのプロパティを操作でき、もう一方は自動的に更新されます。

デフォルトでは、状態の更新は遅延されます（クライアント上の変更は即座に反映されますが、サーバー上の変更は次回のLivewireリクエストまで反映されません）。ユーザーがクリックしたときに状態をサーバー側で即座に更新する必要がある場合は、次のように`.live`修飾子をチェーンします。

```blade
<div x-data="{ open: $wire.entangle('showDropdown').live }">
    ...
</div>
```

> [!tip] `$wire.entangle`は必ずしも必要ではありません
> ほとんどの場合、AlpineからLivewireのプロパティに直接アクセスするために`$wire`を使用することで、望んでいることを達成できます。2つのプロパティを絡めるよりも、1つのプロパティに依存する方が、深くネストされたオブジェクトを使用する際の予測可能性やパフォーマンスの問題を引き起こす可能性があるため、`$wire.entangle`はLivewireのドキュメントでの強調表示が減少しています（バージョン3から）。

> [!warning] @@entangleディレクティブの使用は避けてください
> Livewireバージョン2では、Bladeの`@@entangle`ディレクティブを使用することが推奨されていました。しかし、v3ではそうではなくなりました。`$wire.entangle()`が推奨されており、これはより堅牢なユーティリティであり、特定の[DOM要素を削除する際の問題](https://github.com/livewire/livewire/pull/6833#issuecomment-1902260844)を回避します。

## JavaScriptビルドへのAlpineの手動バンドル

デフォルトでは、LivewireとAlpineのJavaScriptは各Livewireページに自動的に挿入されます。

これはシンプルなセットアップには理想的ですが、独自のAlpineコンポーネント、ストア、プラグインをプロジェクトに含めたい場合もあるでしょう。

ページにLivewireとAlpineを独自のJavaScriptバンドル経由で含めるのは簡単です。

まず、次のようにレイアウトファイルに`@livewireScriptConfig`ディレクティブを含める必要があります。

```blade
<html>
<head>
    <!-- ... -->
    @livewireStyles
    @vite(['resources/js/app.js'])
</head>
<body>
    {{ $slot }}

    @livewireScriptConfig <!-- [tl! highlight] -->
</body>
</html>
```

これにより、Livewireはバンドルにアプリが正しく動作するために必要な特定の設定を提供できるようになります。

これで、次のように`resources/js/app.js`ファイルにLivewireとAlpineをインポートできます。

```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';

// ここに任意のAlpineディレクティブ、コンポーネント、プラグインを登録...

Livewire.start()
```

ここでは、アプリケーションに「x-clipboard」というカスタムAlpineディレクティブを登録する例を示します。

```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';

Alpine.directive('clipboard', (el) => {
    let text = el.textContent

    el.addEventListener('click', () => {
        navigator.clipboard.writeText(text)
    })
})

Livewire.start()
```

これで、`x-clipboard`ディレクティブはLivewireアプリケーション内のすべてのAlpineコンポーネントで利用可能になります。
