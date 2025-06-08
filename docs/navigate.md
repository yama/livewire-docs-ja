---
title: ナビゲート
---

多くの最新Webアプリケーションは「シングルページアプリケーション（SPA）」として構築されています。これらのアプリケーションでは、各ページの表示時にブラウザ全体のリロードが不要となり、JavaScriptやCSSアセットを毎回再ダウンロードする手間を省くことができます。

*シングルページアプリケーション*の対義語は*マルチページアプリケーション*です。マルチページアプリケーションでは、ユーザーがリンクをクリックするたびに新しいHTMLページがリクエストされ、ブラウザで再描画されます。

従来のPHPアプリケーションの多くはマルチページアプリケーションでしたが、Livewireを使えば、アプリケーション内のリンクに`wire:navigate`属性を追加するだけで、シングルページアプリケーションのような体験を簡単に実現できます。

## 基本的な使い方

`wire:navigate`の使い方を例で見てみましょう。以下は、3つのLivewireコンポーネントをルートとして定義した、一般的なLaravelのルートファイル（`routes/web.php`）です：

```php
use App\Livewire\Dashboard;
use App\Livewire\ShowPosts;
use App\Livewire\ShowUsers;

Route::get('/', Dashboard::class);

Route::get('/posts', ShowPosts::class);

Route::get('/users', ShowUsers::class);
```

各ページのナビゲーションメニュー内のリンクに`wire:navigate`を追加すると、Livewireが通常のリンククリックの挙動を上書きし、より高速な独自の処理に置き換えます：

```blade
<nav>
    <a href="/" wire:navigate>Dashboard</a>
    <a href="/posts" wire:navigate>Posts</a>
    <a href="/users" wire:navigate>Users</a>
</nav>
```

`wire:navigate`リンクがクリックされると、以下のような処理が行われます：

* ユーザーがリンクをクリック
* Livewireがブラウザによる新しいページ訪問を防止
* 代わりに、Livewireがバックグラウンドでページをリクエストし、ページ上部にロードバーを表示
* 新しいページのHTMLが受信されると、Livewireが現在のページのURL、`<title>`タグ、および`<body>`の内容を新しいページの要素と置き換え

この手法により、ページのロード時間が大幅に短縮されるため、アプリケーションがJavaScriptで動作するシングルページアプリケーションのように「感じられる」ようになります。

## リダイレクト

Livewireコンポーネントのひとつがユーザーをアプリケーション内の別のURLにリダイレクトする場合、Livewireに`wire:navigate`機能を使用して新しいページをロードするよう指示することもできます。これを実現するには、`redirect()`メソッドに`navigate`引数を指定します：

```php
return $this->redirect('/posts', navigate: true);
```

これにより、ユーザーを新しいURLにリダイレクトするためにフルページリクエストが使用されるのではなく、Livewireが現在のページの内容とURLを新しいものに置き換えます。

## リンクのプリフェッチ

デフォルトでは、Livewireはユーザーがリンクをクリックする前にページをプリフェッチするための穏やかな戦略を含んでいます：

* ユーザーがマウスボタンを押す
* Livewireがページのリクエストを開始
* ユーザーがマウスボタンを離してクリックを完了
* Livewireがリクエストを完了し、新しいページにナビゲート

驚くべきことに、ユーザーがマウスボタンを押してから離すまでの間の時間は、サーバーから半分またはまるごと1ページ分のデータをロードするのに十分な場合がよくあります。

より積極的なプリフェッチアプローチを希望する場合は、リンクに`.hover`修飾子を使用できます：

```blade
<a href="/posts" wire:navigate.hover>Posts</a>
```

`.hover`修飾子は、ユーザーがリンクの上に`60`ミリ秒間ホバーした後にページをプリフェッチするようLivewireに指示します。

:::warning ホバー時のプリフェッチはサーバーの使用量を増加させます
すべてのユーザーがホバーしたリンクをクリックするわけではないため、`.hover`を追加すると、必要ないかもしれないページがリクエストされることになります。ただし、Livewireはページをプリフェッチする前に`60`ミリ秒待機することで、このオーバーヘッドの一部を軽減しようとします。
:::

## ページ訪問間での要素の永続化

時には、オーディオやビデオプレーヤーなど、ページロード間で永続化する必要があるユーザーインターフェイスの部分があります。たとえば、ポッドキャスティングアプリケーションでは、ユーザーが他のページをブラウジングしている間もエピソードのリスニングを続けたいと考えるかもしれません。

Livewireでは、`@persist`ディレクティブを使用してこれを実現できます。

要素を`@persist`でラップし、名前を指定すると、新しいページが`wire:navigate`を使用してリクエストされると、Livewireは新しいページ上の要素を探します。一致する`@persist`がある場合、Livewireは通常の置き換えの代わりに、新しいページの既存のDOM要素を使用して、要素内の状態を保持します。

以下は、`@persist`を使用してページ間で永続化される`<audio>`プレーヤー要素の例です：

```blade
@persist('player')
    <audio src="{{ $episode->file }}" controls></audio>
@endpersist
```

上記のHTMLが現在のページと次のページの両方に表示される場合、元の要素は新しいページで再利用されます。オーディオプレーヤーの場合、ページ間を移動してもオーディオの再生が中断されることはありません。

永続化された要素はLivewireコンポーネントの外部に配置する必要があることに注意してください。一般的なプラクティスは、永続化された要素をメインレイアウトに配置することです。たとえば、`resources/views/components/layouts/app.blade.php`のように。

```html
<!-- resources/views/components/layouts/app.blade.php -->

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>{{ $title ?? 'Page Title' }}</title>
    </head>
    <body>
        <main>
            {{ $slot }}
        </main>

        @persist('player') <!-- [tl! highlight:2] -->
            <audio src="{{ $episode->file }}" controls></audio>
        @endpersist
    </body>
</html>
```

### アクティブリンクのハイライト

サーバーサイドのBladeを使用して、ナビゲーションバー内の現在のアクティブページリンクをハイライト表示することに慣れているかもしれません：

```blade
<nav>
    <a href="/" class="@if (request->is('/')) font-bold text-zinc-800 @endif">Dashboard</a>
    <a href="/posts" class="@if (request->is('/posts')) font-bold text-zinc-800 @endif">Posts</a>
    <a href="/users" class="@if (request->is('/users')) font-bold text-zinc-800 @endif">Users</a>
</nav>
```

しかし、これは永続化された要素内では機能しません。なぜなら、それらはページ間で再利用されるからです。代わりに、Livewireの`wire:current`ディレクティブを使用して、現在のアクティブリンクをハイライト表示する必要があります。

`wire:current`に適用したいCSSクラスを渡すだけで済みます：

```blade
<nav>
    <a href="/dashboard" ... wire:current="font-bold text-zinc-800">Dashboard</a>
    <a href="/posts" ... wire:current="font-bold text-zinc-800">Posts</a>
    <a href="/users" ... wire:current="font-bold text-zinc-800">Users</a>
</nav>
```

これで、`/posts`ページが訪問されると、「Posts」リンクは他のリンクよりも強調表示されます。

詳細は[`wire:current`ドキュメント](/docs/wire-current)を参照してください。

### スクロール位置の保持

デフォルトでは、Livewireはページ間を前後に移動する際にページのスクロール位置を保持します。ただし、時にはページロード間で永続化している個々の要素のスクロール位置を保持したい場合もあるでしょう。

これを行うには、次のようにスクロールバーを含む要素に`wire:scroll`を追加する必要があります：

```html
@persist('scrollbar')
<!-- highlight-next-line -->
<div class="overflow-y-scroll" wire:scroll>
    <!-- ... -->
</div>
@endpersist
```

## JavaScriptフック

各ページナビゲーションは、次の3つのライフサイクルフックをトリガーします：

* `livewire:navigate`
* `livewire:navigating`
* `livewire:navigated`

これらの3つのフックイベントは、すべてのタイプのナビゲーションで発火することに注意してください。これには、`Livewire.navigate()`を使用した手動ナビゲーション、ナビゲーションが有効なリダイレクト、ブラウザの戻るボタンと進むボタンを使用したナビゲーションが含まれます。

これらのイベントのリスナーを登録する例を以下に示します：

```js
document.addEventListener('livewire:navigate', (event) => {
    // ナビゲーションがトリガーされたときに発火します。

    // 「キャンセル」できます（実際にナビゲートが行われるのを防ぐ）：
    event.preventDefault()

    // ナビゲーショントリガーに関する便利なコンテキストが含まれています：
    let context = event.detail

    // ナビゲーションの意図された宛先のURLオブジェクト...
    context.url

    // このナビゲーションが履歴の前後（履歴状態）ナビゲーションによってトリガーされたかどうかを示す真偽値[true/false]...
    context.history

    // このページのキャッシュバージョンがあり、新しいネットワーク往復を介して新しいものを取得する代わりに使用されるかどうかを示す真偽値[true/false]...
    context.cached
})

document.addEventListener('livewire:navigating', () => {
    // 新しいHTMLがページにスワップされる直前にトリガーされます...

    // これは、ページから遷移する前にHTMLを変更するのに適した場所です...
})

document.addEventListener('livewire:navigated', () => {
    // すべてのページナビゲーションの最終ステップとしてトリガーされます...

    // また、「DOMContentLoaded」ではなくページロード時にもトリガーされます...
})
```

:::warning イベントリスナーはページ間で永続化されます
ドキュメントにイベントリスナーを添付すると、それは別のページにナビゲートしても削除されません。これにより、特定のページにナビゲートした後にのみコードを実行する必要がある場合や、各ページに同じイベントリスナーを追加した場合に予期しない動作が発生する可能性があります。イベントリスナーを削除しないと、存在しない要素を探しているときに他のページで例外が発生したり、ナビゲーションごとにイベントリスナーが複数回実行されたりする可能性があります。

イベントリスナーが実行された後に削除されるようにする簡単な方法は、`addEventListener`関数の3番目のパラメータとして`{once: true}`オプションを渡すことです。
```js
document.addEventListener('livewire:navigated', () => {
    // ...
}, { once: true })
```
:::

## 新しいページへの手動訪問

`wire:navigate`に加えて、JavaScriptを使用して新しいページへの訪問をトリガーするために`Livewire.navigate()`メソッドを手動で呼び出すこともできます：

```html
<script>
    // ...

    Livewire.navigate('/new/url')
</script>
```

## アナリティクスソフトウェアとの併用

アプリ内で`wire:navigate`を使用してページをナビゲートする際、`<head>`内の`<script>`タグはページが最初にロードされたときにのみ評価されます。

これは、[Fathom Analytics](https://usefathom.com/)などのアナリティクスソフトウェアに問題を引き起こします。これらのツールは、最初だけでなく、ページ変更ごとに`<script>`スニペットが評価されることに依存しています。

[Google Analytics](https://marketingplatform.google.com/about/analytics/)のようなツールは、これを自動的に処理するのに十分賢いですが、Fathom Analyticsを使用している場合は、各ページ訪問が適切に追跡されるように、スクリプトタグに`data-spa="auto"`を追加する必要があります：

```blade
<head>
    <!-- ... -->

    <!-- Fathom Analytics -->
    @if (! config('app.debug'))
        <script src="https://cdn.usefathom.com/script.js" data-site="ABCDEFG" 
        <!-- highlight-next-line -->
        data-spa="auto" defer></script>
    @endif
</head>
```

## スクリプトの評価

`wire:navigate`を使用して新しいページに移動すると、ブラウザにはページが変更されたように「感じられ」ます。ただし、ブラウザの観点から見ると、技術的には元のページにまだいることになります。

このため、最初のページではスタイルとスクリプトは通常どおり実行されますが、後のページでは、通常のJavaScriptの記述方法を調整する必要がある場合があります。

`wire:navigate`を使用する際に注意すべきいくつかの注意点とシナリオを以下に示します。

### `DOMContentLoaded`に依存しない

JavaScriptを`DOMContentLoaded`イベントリスナー内に配置することは一般的なプラクティスです。これにより、ページが完全にロードされた後にのみコードが実行されるようになります。

`wire:navigate`を使用していると、`DOMContentLoaded`は最初のページ訪問時にのみ発火し、後の訪問時には発火しません。

すべてのページ訪問時にコードを実行するには、`DOMContentLoaded`のすべてのインスタンスを`livewire:navigated`に置き換えます：

```js
document.addEventListener('DOMContentLoaded', () => { // [tl! remove]
document.addEventListener('livewire:navigated', () => { // [tl! add]
    // ...
})
```

これで、このリスナー内に配置されたコードは、初回のページ訪問時と、Livewireが後続のページにナビゲートした後の両方で実行されるようになります。

このイベントをリッスンすることは、サードパーティライブラリの初期化などに役立ちます。

### `<head>`内のスクリプトは一度だけ読み込まれる

同じ`<script>`タグが2つのページに含まれている場合、そのスクリプトは最初のページ訪問時にのみ実行され、後のページ訪問時には実行されません。

```blade
<!-- ページ1 -->
<head>
    <script src="/app.js"></script>
</head>

<!-- ページ2 -->
<head>
    <script src="/app.js"></script>
</head>
```

### 新しい`<head>`スクリプトは評価される

後のページに、最初のページ訪問時の`<head>`には存在しなかった新しい`<script>`タグが含まれている場合、Livewireは新しい`<script>`タグを実行します。

以下の例では、_ページ2_にサードパーティツール用の新しいJavaScriptライブラリが含まれています。ユーザーが_ページ2_に移動すると、そのライブラリが評価されます。

```blade
<!-- ページ1 -->
<head>
    <script src="/app.js"></script>
</head>

<!-- ページ2 -->
<head>
    <script src="/app.js"></script>
    <script src="/third-party.js"></script>
</head>
```

:::info ヘッドアセットはページ切り替え時に必ず読み込まれます
HEAD要素に`<script src="...">`のようなアセットを含む新しいページにナビゲートする場合、そのアセットは必ず先に読み込まれ、処理が終わってから新しいページが表示されます。意外に感じるかもしれませんが、これによりこれらのアセットに依存するスクリプトがすぐに利用できる状態になります。
:::

### アセット変更時のリロード

アプリケーションのメインJavaScriptファイル名にバージョンハッシュを含めることは一般的なプラクティスです。これにより、新しいバージョンのアプリケーションをデプロイした後、ユーザーはブラウザのキャッシュから提供される古いバージョンではなく、新しいJavaScriptアセットを受け取ることが保証されます。

しかし、現在`wire:navigate`を使用しており、各ページ訪問が新しいブラウザページのロードではなくなったため、ユーザーはデプロイ後も古いJavaScriptを受け取り続ける可能性があります。

これを防ぐために、`<script>`タグに`data-navigate-track`を追加できます：

```blade
<!-- ページ1 -->
<head>
    <script src="/app.js?id=123" data-navigate-track></script>
</head>

<!-- ページ2 -->
<head>
    <script src="/app.js?id=456" data-navigate-track></script>
</head>
```

ユーザーが_ページ2_に訪問すると、Livewireは新しいJavaScriptアセットを検出し、ブラウザページをフルリロードします。

[LaravelのViteプラグイン](https://laravel.com/docs/vite#loading-your-scripts-and-styles)を使用してアセットをバンドルおよび提供している場合、Livewireは自動的にレンダリングされたHTMLアセットタグに`data-navigate-track`を追加します。通常通りアセットやスクリプトを参照し続けることができます：

```blade
<head>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
```

Livewireは自動的にレンダリングされたHTMLタグに`data-navigate-track`を挿入します。

:::warning クエリ文字列の変更のみが追跡されます
Livewireは、`data-navigate-track`要素のクエリ文字列（`?id="456"`）が変更された場合にのみページをリロードします。URI自体（`/app.js`）の変更は追跡されません。
:::

### `<body>`内のスクリプトは再評価される

Livewireは新しいページの`<body>`の内容を毎回置き換えるため、新しいページのすべての`<script>`タグが実行されます：

```blade
<!-- ページ1 -->
<body>
    <script>
        console.log('ページ1で実行')
    </script>
</body>

<!-- ページ2 -->
<body>
    <script>
        console.log('ページ2で実行')
    </script>
</body>
```

1回だけ実行したい`<script>`タグがボディ内にある場合、その`<script>`タグに`data-navigate-once`属性を追加すると、Livewireは初回のページ訪問時にのみそれを実行します：

```blade
<script data-navigate-once>
    console.log('ページ1でのみ実行')
</script>
```

## プログレスバーのカスタマイズ

ページのロードに150ミリ秒以上かかると、Livewireはページ上部にプログレスバーを表示します。

このバーの色をカスタマイズしたり、Livewireの設定ファイル（`config/livewire.php`）内で完全に無効にしたりできます：

```php
'navigate' => [
    'show_progress_bar' => false,
    'progress_bar_color' => '#2299dd',
],
```
