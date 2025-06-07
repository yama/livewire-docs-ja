---
title: JavaScript 連携
---

## LivewireコンポーネントでJavaScriptを使う

LivewireやAlpineには、HTML内で動的なコンポーネントを構築するための多くのユーティリティが用意されていますが、時にはHTMLから離れて、コンポーネント用に純粋なJavaScriptを実行したい場面もあります。Livewireの`@script`および`@assets`ディレクティブを使えば、こうした処理を予測可能かつ保守しやすい方法で実現できます。

### スクリプトの実行

Livewireコンポーネント内で独自のJavaScriptを実行したい場合は、`<script>`要素を`@script`と`@endscript`で囲むだけです。これにより、LivewireがこのJavaScriptの実行を管理します。

`@script`内のスクリプトはLivewireによって処理されるため、ページの読み込み後、Livewireコンポーネントがレンダリングされる前の最適なタイミングで実行されます。これにより、従来のように`document.addEventListener('...')`でラップする必要がなくなります。

また、遅延読み込みや条件付きで読み込まれるLivewireコンポーネントでも、ページの初期化後にJavaScriptを実行できます。

```blade
<div>
    ...
</div>

@script
<script>
    // このJavaScriptは、コンポーネントがページに読み込まれるたびに実行されます...
</script>
@endscript
```

Livewireコンポーネント内で使うJavaScriptアクションを登録するような、もう少し実践的な例も紹介します。

```blade
<div>
    <button wire:click="$js.increment">+</button>
</div>

@script
<script>
    $js('increment', () => {
        console.log('increment')
    })
</script>
@endscript
```

JavaScriptアクションの詳細については、[アクションに関するドキュメント](/docs/actions#javascript-actions)を参照してください。

### スクリプトからの`$wire`の使用

JavaScriptに`@script`を使用するもう一つの利点は、Livewireコンポーネントの`$wire`オブジェクトに自動的にアクセスできることです。

例えば、シンプルな`setInterval`を使って2秒ごとにコンポーネントを更新する例を示します（これは[`wire:poll`](/docs/wire-poll)を使って簡単に実現できますが、ポイントを示す簡単な方法です）：

`$wire`の詳細については、[`$wire`ドキュメント](#the-wire-object)を参照してください。

```blade
@script
<script>
    setInterval(() => {
        $wire.$refresh()
    }, 2000)
</script>
@endscript
```

### 一時的なJavaScript式の評価

JavaScriptでの評価が必要な一時的な式を指定するために、`js()`メソッドを使用することもできます。

これは、サーバー側のアクションが実行された後にクライアント側で何らかのフォローアップを行うのに一般的に役立ちます。

例えば、以下は`CreatePost`コンポーネントの例で、データベースに投稿が保存された後にクライアント側のアラートダイアログをトリガーします：

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
    public $title = '';

    public function save()
    {
        // ...

        $this->js("alert('Post saved!')"); // [tl! highlight:6]
    }
}
```

JavaScript式`alert('Post saved!')`は、投稿がデータベースに保存された後にクライアント側で実行されます。

式の中で現在のコンポーネントの`$wire`オブジェクトにアクセスできます。

### アセットの読み込み

`@script`ディレクティブは、Livewireコンポーネントが読み込まれるたびに少しのJavaScriptを実行するのに便利ですが、コンポーネントと一緒にページ上に完全なスクリプトやスタイルアセットを読み込みたい場合もあります。

以下は、日付ピッカーライブラリ[Pikaday](https://github.com/Pikaday/Pikaday)を読み込み、`@script`を使用してコンポーネント内で初期化するための`@assets`の使用例です：

```blade
<div>
    <input type="text" data-picker>
</div>

@assets
<script src="https://cdn.jsdelivr.net/npm/pikaday/pikaday.js" defer></script>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/pikaday/css/pikaday.css">
@endassets

@script
<script>
    new Pikaday({ field: $wire.$el.querySelector('[data-picker]') });
</script>
@endscript
```

このコンポーネントが読み込まれると、Livewireはページ上で`@assets`が`@script`よりも先に読み込まれるようにし、さらに、このコンポーネントのインスタンスがページ上にいくつあっても、提供された`@assets`が一度だけ読み込まれることを保証します。

## グローバルLivewireイベント

Livewireは、外部スクリプトからのカスタム拡張ポイントを登録するための2つの便利なブラウザイベントを発火させます：

```html
<script>
    document.addEventListener('livewire:init', () => {
        // Livewireが読み込まれた後、しかしページ上で初期化される前に実行されます...
    })

    document.addEventListener('livewire:initialized', () => {
        // Livewireがページ上での初期化を完了した直後に実行されます...
    })
</script>
```

> [!info]
> `livewire:init`内でカスタム[ディレクティブ](#registering-custom-directives)や[lifecycle hooks](#javascript-hooks)を登録すると、Livewireがページ上で初期化を開始する前にそれらが利用可能になるため、しばしば有益です。

## `Livewire`グローバルオブジェクト

Livewireのグローバルオブジェクトは、外部スクリプトからLivewireと対話するための最良の出発点です。

クライアント側のコードのどこからでも、`window`上のグローバル`Livewire`JavaScriptオブジェクトにアクセスできます。

`window.Livewire`を`livewire:init`イベントリスナー内で使用すると便利です。

### コンポーネントへのアクセス

現在のページに読み込まれている特定のLivewireコンポーネントにアクセスするには、以下のメソッドを使用できます：

```js
// ページ上の最初のコンポーネントの$wireオブジェクトを取得...
let component = Livewire.first()

// IDによって特定のコンポーネントの`$wire`オブジェクトを取得...
let component = Livewire.find(id)

// 名前によってコンポーネントの`$wire`オブジェクトの配列を取得...
let components = Livewire.getByName(name)

// ページ上のすべてのコンポーネントの$wireオブジェクトを取得...
let components = Livewire.all()
```

> [!info]
> これらのメソッドのそれぞれは、コンポーネントのLivewire内での状態を表す`$wire`オブジェクトを返します。
> <br /><br />
> これらのオブジェクトの詳細については、[`$wire`ドキュメント](#the-wire-object)を参照してください。

### イベントとの対話

個々のコンポーネントからPHP経由でイベントを発火させたりリッスンしたりするだけでなく、グローバル`Livewire`オブジェクトを使用すると、アプリケーションのどこからでも[Livewireのイベントシステム](/docs/events)と対話できます：

```js
// リッスンしている任意のLivewireコンポーネントにイベントを発火させる...
Livewire.dispatch('post-created', { postId: 2 })

// 名前によって特定のLivewireコンポーネントにイベントを発火させる...
Livewire.dispatchTo('dashboard', 'post-created', { postId: 2 })

// Livewireコンポーネントから発火されたイベントをリッスンする...
Livewire.on('post-created', ({ postId }) => {
    // ...
})
```

特定のシナリオでは、グローバルLivewireイベントの登録を解除する必要があるかもしれません。例えば、Alpineコンポーネントと`wire:navigate`を使用しているとき、ページ間をナビゲートする際に`init`が呼び出されるため、複数のリスナーが登録される可能性があります。これに対処するために、Alpineによって自動的に呼び出される`destroy`関数を利用します。この関数内でリスナーをすべてループし、登録を解除して不要な蓄積を防ぎます。

```js
Alpine.data('MyComponent', () => ({
    listeners: [],
    init() {
        this.listeners.push(
            Livewire.on('post-created', (options) => {
                // 何かをする...
            })
        );
    },
    destroy() {
        this.listeners.forEach((listener) => {
            listener();
        });
    }
}));
```
### ライフサイクルフックの使用

Livewireは、`Livewire.hook()`を使用して、そのグローバルライフサイクルのさまざまな部分にフックすることを許可します：

```js
// 特定の内部Livewireフックで実行されるコールバックを登録...
Livewire.hook('component.init', ({ component, cleanup }) => {
    // ...
})
```

LivewireのJavaScriptフックの詳細については、[以下](#javascript-hooks)を参照してください。

### カスタムディレクティブの登録

Livewireは、`Livewire.directive()`を使用してカスタムディレクティブを登録することを許可します。

以下は、JavaScriptの`confirm()`ダイアログを使用してアクションの確認またはキャンセルを行うカスタム`wire:confirm`ディレクティブの例です：

```html
<button wire:confirm="Are you sure?" wire:click="delete">Delete post</button>
```

`Livewire.directive()`を使用した`wire:confirm`の実装は以下の通りです：

```js
Livewire.directive('confirm', ({ el, directive, component, cleanup }) => {
    let content =  directive.expression

    // "directive"オブジェクトは、解析されたディレクティブにアクセスするためのものです。
    // 例えば、ここにある値は： wire:click.prevent="deletePost(1)"
    //
    // directive.raw = wire:click.prevent
    // directive.value = "click"
    // directive.modifiers = ['prevent']
    // directive.expression = "deletePost(1)"

    let onClick = e => {
        if (! confirm(content)) {
            e.preventDefault()
            e.stopImmediatePropagation()
        }
    }

    el.addEventListener('click', onClick, { capture: true })

    // ページがまだアクティブな間にLivewireコンポーネントがDOMから削除された場合に備えて、
    // `cleanup()`内にクリーンアップコードを登録します。
    cleanup(() => {
        el.removeEventListener('click', onClick)
    })
})
```

## オブジェクトスキーマ

LivewireのJavaScriptシステムを拡張する際に遭遇する可能性のあるさまざまなオブジェクトを理解することは重要です。

以下は、Livewireの関連する内部プロパティの各オブジェクトの網羅的なリファレンスです。

一般的に、平均的なLivewireユーザーはこれらと対話する必要はありません。これらのオブジェクトのほとんどは、Livewireの内部システムまたは上級ユーザー向けに利用可能です。

### `$wire`オブジェクト

以下の一般的な`Counter`コンポーネントがあるとします：

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class Counter extends Component
{
    public $count = 1;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

Livewireは、一般に`$wire`と呼ばれるオブジェクトの形でサーバー側コンポーネントのJavaScript表現を公開します：

```js
let $wire = {
    // すべてのコンポーネントの公開プロパティに直接アクセス可能...
    count: 0,

    // すべての公開メソッドは$wire上で公開され、呼び出すことができる...
    increment() { ... },

    // 親コンポーネントの`$wire`オブジェクトにアクセス（存在する場合）...
    $parent,

    // LivewireコンポーネントのルートDOM要素にアクセス...
    $el,

    // 現在のLivewireコンポーネントのIDにアクセス...
    $id,

    // 名前によってプロパティの値を取得...
    // 使用法: $wire.$get('count')
    $get(name) { ... },

    // 名前によってコンポーネントにプロパティを設定...
    // 使用法: $wire.$set('count', 5)
    $set(name, value, live = true) { ... },

    // ブール値プロパティの値をトグル...
    $toggle(name, live = true) { ... },

    // メソッドを呼び出す...
    // 使用法: $wire.$call('increment')
    $call(method, ...params) { ... },

    // JavaScriptアクションを定義...
    // 使用法: $wire.$js('increment', () => { ... })
    $js(name, callback) { ... },

    // Livewireプロパティの値を異なるAlpineプロパティと結びつける...
    // 使用法: <div x-data="{ count: $wire.$entangle('count') }">
    $entangle(name, live = false) { ... },

    // プロパティの値の変化を監視...
    // 使用法: Alpine.$watch('count', (value, old) => { ... })
    $watch(name, callback) { ... },

    // コミットを送信してコンポーネントを更新し、HTMLを再レンダリングしてページにスワップ...
    $refresh() { ... },

    // 上記の`$refresh`と同一。より技術的な名前...
    $commit() { ... },

    // このコンポーネントまたはその子から発信されたイベントをリッスン...
    // 使用法: $wire.$on('post-created', () => { ... })
    $on(event, callback) { ... },

    // このコンポーネントまたはリクエストからトリガーされたライフサイクルフックをリッスン...
    // 使用法: $wire.$hook('commit', () => { ... })
    $hook(name, callback) { ... },

    // このコンポーネントからイベントを発火...
    // 使用法: $wire.$dispatch('post-created', { postId: 2 })
    $dispatch(event, params = {}) { ... },

    // 別のコンポーネントにイベントを発火...
    // 使用法: $wire.$dispatchTo('dashboard', 'post-created', { postId: 2 })
    $dispatchTo(otherComponentName, event, params = {}) { ... },

    // このコンポーネントにのみイベントを発火...
    $dispatchSelf(event, params = {}) { ... },

    // コンポーネントに直接ファイルをアップロードするためのJS API
    // `wire:model`を介してではなく...
    $upload(
        name, // プロパティ名
        file, // File JavaScriptオブジェクト
        finish = () => { ... }, // アップロードが完了したときに実行...
        error = () => { ... }, // アップロード中にエラーが発生した場合に実行...
        progress = (event) => { // アップロードが進行中に実行...
            event.detail.progress // 1-100の整数...
        },
    ) { ... },

    // 同時に複数のファイルをアップロードするためのAPI...
    $uploadMultiple(name, files, finish, error, progress) { },

    // 一時的にアップロードされたが保存されていないアップロードを削除...
    $removeUpload(name, tmpFilename, finish, error) { ... },

    // 基礎となる"component"オブジェクトを取得...
    __instance() { ... },
}
```

`$wire`の詳細については、[LivewireのJavaScriptからのプロパティへのアクセスに関するドキュメント](/docs/properties#accessing-properties-from-javascript)を参照してください。

### `snapshot`オブジェクト

各ネットワークリクエストの間、LivewireはPHPコンポーネントをJavaScriptで消費可能なオブジェクトにシリアライズします。このスナップショットは、コンポーネントをPHPオブジェクトに再シリアライズするために使用されるため、改ざんを防ぐメカニズムが組み込まれています：

```js
let snapshot = {
    // コンポーネントのシリアライズされた状態（公開プロパティ）...
    data: { count: 0 },

    // コンポーネントに関する長期的な情報...
    memo: {
        // コンポーネントの一意のID...
        id: '0qCY3ri9pzSSMIXPGg8F',

        // コンポーネントの名前。例： <livewire:[name] />
        name: 'counter',

        // コンポーネントが最初に読み込まれたウェブページのURI、メソッド、およびロケール。
        // これは、元のリクエストからのミドルウェアを再適用するために使用されます...
        path: '/',
        method: 'GET',
        locale: 'en',

        // ネストされた"子"コンポーネントのリスト。コンポーネントIDを値とする内部テンプレートIDによってキー付け...
        children: [],

        // このコンポーネントが"遅延読み込み"されたかどうか...
        lazyLoaded: false,

        // 最後のリクエスト中に発生した検証エラーのリスト...
        errors: [],
    },

    // このスナップショットの安全に暗号化されたハッシュ。
    // これにより、悪意のあるユーザーがスナップショットを改ざんして
    // サーバー上の所有していないリソースにアクセスしようとした場合に、
    // チェックサム検証が失敗し、エラーがスローされます...
    checksum: '1bc274eea17a434e33d26bcaba4a247a4a7768bd286456a83ea6e9be2d18c1e7',
}
```

### `component`オブジェクト

ページ上の各コンポーネントには、その状態を追跡し、基礎となる機能を公開する対応するコンポーネントオブジェクトがあります。これは`$wire`よりも一層深いレイヤーです。これは上級者向けの使用のみを意図しています。

以下は、上記の`Counter`コンポーネントの実際のコンポーネントオブジェクトで、JSコメントで関連プロパティの説明が付いています：

```js
let component = {
    // コンポーネントのルートHTML要素...
    el: HTMLElement,

    // コンポーネントの一意のID...
    id: '0qCY3ri9pzSSMIXPGg8F',

    // コンポーネントの"name"（<livewire:[name] />）...
    name: 'counter',

    // 最新の"effects"オブジェクト。エフェクトはサーバーとの
    // やり取りからの"副作用"です。これにはリダイレクトやファイルダウンロードなどが含まれます...
    effects: {},

    // コンポーネントの最後に知られているサーバー側の状態...
    canonical: { count: 0 },

    // コンポーネントの可変データオブジェクトで、ライブのクライアント側の状態を表します...
    ephemeral: { count: 0 },

    // `this.ephemeral`のリアクティブなバージョン。これに対する変更は
    // AlpineJSの式によって検出されます...
    reactive: Proxy,

    // 通常Alpineの式内で`$wire`として使用されるプロキシオブジェクト。
    // これはLivewireコンポーネントのフレンドリーなJSオブジェクトインターフェースを提供することを意図しています...
    $wire: Proxy,

    // ネストされた"子"コンポーネントのリスト。コンポーネントIDを値とする内部テンプレートIDによってキー付け...
    children: [],

    // このコンポーネントの最後に知られている"スナップショット"表現。
    // スナップショットはサーバー側のコンポーネントから取得され、PHPオブジェクトをバックエンドで再作成するために使用されます...
    snapshot: {...},

    // 上記スナップショットの未解析バージョン。これは次の往復でサーバーに送信するために使用されます。
    // JSの解析はPHPのエンコーディングを妨げるため、しばしばチェックサムの不一致を引き起こします。
    snapshotEncoded: '{"data":{"count":0},"memo":{"id":"0qCY3ri9pzSSMIXPGg8F","name":"counter","path":"\/","method":"GET","children":[],"lazyLoaded":true,"errors":[],"locale":"en"},"checksum":"1bc274eea17a434e33d26bcaba4a247a4a7768bd286456a83ea6e9be2d18c1e7"}',
}
```

### `commit`ペイロード

ブラウザでLivewireコンポーネントにアクションが実行されると、ネットワークリクエストがトリガーされます。そのネットワークリクエストには、1つまたは複数のコンポーネントとサーバーへのさまざまな指示が含まれています。内部的に、これらのコンポーネントネットワークペイロードは"コミット"と呼ばれます。

"commit"という用語は、フロントエンドとバックエンド間のLivewireの関係を考えるのに役立つ方法として選ばれました。コンポーネントはフロントエンドでレンダリングおよび操作され、アクションが実行されてバックエンドに"コミット"する必要がある状態と更新を要求します。

これらのスキーマは、ブラウザのDevToolsのネットワークタブや、LivewireのJavaScriptフック（#javascript-hooks）で認識することができます：

```js
let commit = {
    // スナップショットオブジェクト...
    snapshot: { ... },

    // サーバー上で更新するためのプロパティのキーと値のペアリスト...
    updates: {},

    // サーバー側で呼び出すメソッドの配列（パラメータ付き）...
    calls: [
        { method: 'increment', params: [] },
    ],
}
```

## JavaScriptフック

上級ユーザー向けに、Livewireは内部のクライアント側の"フック"システムを公開しています。これらのフックを使用して、Livewireの機能を拡張したり、Livewireアプリケーションに関する詳細情報を取得したりできます。

### コンポーネントの初期化

新しいコンポーネントがLivewireによって発見されるたびに（初期ページ読み込み時または後で）、`component.init`イベントがトリガーされます。このイベントにフックすることで、新しいコンポーネントに関連する何かを傍受または初期化することができます：

```js
Livewire.hook('component.init', ({ component, cleanup }) => {
    //
})
```

詳細については、[コンポーネントオブジェクトに関するドキュメント](#the-component-object)を参照してください。

### DOM要素の初期化

新しいコンポーネントが初期化されるときに、Livewireは各DOM要素に対してもイベントをトリガーします。

これは、アプリケーション内でカスタムLivewire HTML属性を提供するために使用できます：

```js
Livewire.hook('element.init', ({ component, el }) => {
    //
})
```

### DOMモーフィングフック

DOMのモーフィングフェーズ中（Livewireがネットワーク往復を完了した後）、Livewireは変更される各要素に対して一連のイベントをトリガーします。

```js
Livewire.hook('morph.updating',  ({ el, component, toEl, skip, childrenOnly }) => {
	//
})

Livewire.hook('morph.updated', ({ el, component }) => {
	//
})

Livewire.hook('morph.removing', ({ el, component, skip }) => {
	//
})

Livewire.hook('morph.removed', ({ el, component }) => {
	//
})

Livewire.hook('morph.adding',  ({ el, component }) => {
	//
})

Livewire.hook('morph.added',  ({ el }) => {
	//
})
```

要素ごとにトリガーされるイベントに加えて、各Livewireコンポーネントに対して`morph`および`morphed`イベントが発火します：

```js
Livewire.hook('morph',  ({ el, component }) => {
	// `component`内の子要素がモーフィングされる直前に実行されます
})

Livewire.hook('morphed',  ({ el, component }) => {
    // `component`内のすべての子要素がモーフィングされた後に実行されます
})
```

### コミットフック

Livewireリクエストには複数のコンポーネントが含まれるため、_リクエスト_という用語は、個々のコンポーネントのリクエストとレスポンスペイロードを指すには広すぎます。代わりに、内部的にLivewireはコンポーネントの更新を_コミット_と呼びます。これは、フロントエンドとバックエンド間のLivewireの関係を考えるのに役立ちます。

これらのフックは`commit`オブジェクトを公開します。これらのスキーマの詳細については、[commitオブジェクトのドキュメント](#the-commit-payload)を読むことで学ぶことができます。

#### コミットの準備

`commit.prepare`フックは、リクエストがサーバーに送信される直前にトリガーされます。これにより、外向きのリクエストに最後の更新やアクションを追加するチャンスが与えられます：

```js
Livewire.hook('commit.prepare', ({ component }) => {
    // コミットペイロードが収集され、サーバーに送信される前に実行されます...
})
```

#### コミットの傍受

Livewireコンポーネントがサーバーに送信されるたびに、_コミット_が行われます。ライフサイクルと個々のコミットの内容にフックするために、Livewireは`commit`フックを公開します。

このフックは非常に強力で、Livewireコミットのリクエストとレスポンスの両方にフックするためのメソッドを提供します：

```js
Livewire.hook('commit', ({ component, commit, respond, succeed, fail }) => {
    // コミットのペイロードがサーバーに送信される直前に実行されます...

    respond(() => {
        // レスポンスが受信された後、しかし処理される前に実行されます...
    })

    succeed(({ snapshot, effects }) => {
        // 新しいスナップショットとエフェクトのリストを持つ成功したレスポンスが受信され、処理された後に実行されます...
    })

    fail(() => {
        // リクエストの一部が失敗した場合に実行されます...
    })
})
```

## リクエストフック

サーバーへの全体のHTTPリクエストの送信および返送にフックしたい場合は、`request`フックを使用できます：

```js
Livewire.hook('request', ({ url, options, payload, respond, succeed, fail }) => {
    // コミットペイロードがコンパイルされた後、しかしネットワークリクエストが送信される前に実行されます...

    respond(({ status, response }) => {
        // レスポンスが受信されたときに実行されます...
        // "response"は生のHTTPレスポンスオブジェクトです
        // await response.text()が実行される前の状態...
    })

    succeed(({ status, json }) => {
        // レスポンスが受信されたときに実行されます...
        // "json"はJSONレスポンスオブジェクトです...
    })

    fail(({ status, content, preventDefault }) => {
        // レスポンスにエラーステータスコードがある場合に実行されます...
        // "preventDefault"は、Livewireのデフォルトのエラーハンドリングを無効にすることを可能にします...
        // "content"は生のレスポンスコンテンツです...
    })
})
```

### ページの有効期限切れ動作のカスタマイズ

デフォルトのページ期限切れダイアログがアプリケーションに適していない場合は、`request`フックを使用してカスタムソリューションを実装できます：

```html
<script>
    document.addEventListener('livewire:init', () => {
        Livewire.hook('request', ({ fail }) => {
            fail(({ status, preventDefault }) => {
                if (status === 419) {
                    confirm('カスタムページ期限切れ動作...')

                    preventDefault()
                }
            })
        })
    })
</script>
```

上記のコードをアプリケーションに追加すると、ユーザーはセッションが期限切れになったときにカスタムダイアログを受け取ります。
