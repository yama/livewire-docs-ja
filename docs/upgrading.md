---
title: アップグレード
---

## アップグレード自動化ツール

アップグレード作業の手間を省くため、できる限り多くのアップグレード作業を自動化するArtisanコマンドを用意しています。

[Livewireバージョン3のインストール](/docs/upgrading#update-livewire-to-version-3)後、以下のコマンドを実行すると、各ブレイキングチェンジごとに自動アップグレードのプロンプトが表示されます。

```shell
php artisan livewire:upgrade
```

上記コマンドで多くの部分を自動アップグレードできますが、完全なアップグレードを保証するには、このページの手順ガイドに従う必要があります。

## LivewireはPHP 8.1以上が必要です

Livewireは、アプリケーションがPHPバージョン8.1以上で動作している必要があります。


## Livewire 3へのアップデート

アプリケーションのLivewire依存バージョンを2から3へアップグレードするには、以下のcomposerコマンドを実行してください:

```shell
composer require livewire/livewire "^3.0"
```

:::warning Livewire 3対応パッケージについて
主要なサードパーティ製Livewireパッケージの多くは、すでにLivewire 3をサポートしているか、まもなく対応予定です。ただし、Livewire 3への対応に時間がかかるパッケージも一部存在する可能性があります。
:::

## ビューキャッシュのクリア

アプリケーションのルートディレクトリで以下のArtisanコマンドを実行し、キャッシュ・コンパイル済みBladeビューをクリアして、Livewire 3互換に再コンパイルさせてください:

```shell
php artisan view:clear
```

## 新しい設定のマージ

Livewire 3では複数の設定オプションが変更されています。アプリケーションで設定ファイル（`config/livewire.php`）を公開している場合は、以下の変更点を反映してください。

### 新しく追加された設定

バージョン3で以下の設定キーが追加されました:

```php
'legacy_model_binding' => false,

'inject_assets' => true,

'inject_morph_markers' => true,

'navigate' => false,

'pagination_theme' => 'tailwind',
```

追加のオプション説明やコピペ可能なコードについては、[Livewireの新しい設定ファイル（GitHub）](https://github.com/livewire/livewire/blob/master/config/livewire.php) を参照してください。

### 変更された設定

以下の設定項目は、新しいデフォルト値に更新されました。

#### 新しいクラスnamespace

Livewireのデフォルトの `class_namespace` は `App\Http\Livewire` から `App\Livewire` に変更されました。従来のnamespace設定値のままでも問題ありませんが、新しいnamespaceに変更する場合は、Livewireコンポーネントを `app/Livewire` ディレクトリに移動する必要があります。

```php
'class_namespace' => 'App\\Http\\Livewire', // [tl! remove]
'class_namespace' => 'App\\Livewire', // [tl! add]
```

#### 新しいレイアウトビューのパス

バージョン2では、Livewireはフルページコンポーネントをレンダリングする際、デフォルトで `resources/views/layouts/app.blade.php` をレイアウトBladeコンポーネントとして使用していました。

匿名Bladeコンポーネントへのコミュニティの支持が高まっているため、Livewire 3ではデフォルトの場所が `resources/views/components/layouts/app.blade.php` に変更されました。

```php
'layout' => 'layouts.app', // [tl! remove]
'layout' => 'components.layouts.app', // [tl! add]
```

### 削除された設定

Livewire 3では、以下の設定項目は認識されなくなりました。

#### `app_url`

アプリケーションがルート以外のURIで提供されている場合、Livewire 2では `app_url` 設定オプションを使ってLivewireがAJAXリクエストに使用するURLを設定できました。

しかし、このような文字列による設定は柔軟性に欠けるため、Livewire 3ではランタイム設定方式に変更されました。詳細は[Livewireのアップデートエンドポイントの設定](/docs/installation#configuring-livewires-update-endpoint)に関するドキュメントを参照してください。

#### `asset_url`

Livewire 2では、アプリケーションがルート以外のURIで提供されている場合、`asset_url` 設定オプションを使ってLivewireのJavaScriptアセットのベースURLを設定できました。

Livewire 3では、こちらもランタイム設定方式に変更されています。詳細は[Livewireのスクリプトアセットエンドポイントのカスタマイズ](/docs/installation#customizing-the-asset-url)に関するドキュメントを参照してください。

#### `middleware_group`

Livewireはアップデートエンドポイントのカスタマイズ方法がより柔軟になったため、`middleware_group` 設定オプションは削除されました。

Livewireリクエストにカスタムミドルウェアを適用する方法については、[Livewireのアップデートエンドポイントの設定](/docs/installation#configuring-livewires-update-endpoint)のドキュメントを参照してください。

#### `manifest_path`

Livewire 3では、コンポーネントのオートローディングにマニフェストファイルを使用しなくなりました。そのため、`manifest_path` 設定は不要となりました。

#### `back_button_cache`

Livewire 3では [`wire:navigate`](/docs/navigate) を利用したSPA体験が標準となったため、`back_button_cache` 設定も不要となりました。

## Livewireのアプリケーションnamespace

バージョン2では、Livewireコンポーネントは自動的に `App\\Http\\Livewire` namespaceで生成・認識されていました。

Livewire 3では、このデフォルトが `App\\Livewire` に変更されました。

すべてのコンポーネントを新しい場所に移動するか、アプリケーションの `config/livewire.php` 設定ファイルに以下の設定を追加してください:

```php
'class_namespace' => 'App\\Http\\Livewire',
```

### ディスカバリー（自動検出）

Livewire 3ではマニフェストが存在しないため、Livewireコンポーネントに関して「検出」するものはありません。ビルドスクリプトから livewire:discover の参照を安全に削除できます。

## ページコンポーネントのレイアウトビュー

次のような構文でLivewireコンポーネントをフルページとしてレンダリングする場合:

```php
Route::get('/posts', ShowPosts::class);
```

Livewireがコンポーネントをレンダリングする際に使用するBladeレイアウトファイルは、`resources/views/layouts/app.blade.php` から `resources/views/components/layouts/app.blade.php` に変更されました。

```shell
resources/views/layouts/app.blade.php #[tl! remove]
resources/views/components/layouts/app.blade.php #[tl! add]
```

あなたは、レイアウトファイルを新しい場所に移動するか、アプリケーションの `config/livewire.php` 設定ファイルに以下の設定を適用することができます:

```php
'layout' => 'layouts.app',
```

詳細については、[creating and using a page-component layout](/docs/components#layout-files) に関するドキュメントを参照してください。


## Eloquent model binding

Livewire 2では、`wire:model` を使ってEloquentモデルのプロパティに直接バインディングすることができました。例えば、以下のような使い方が一般的でした:

```php
public Post $post;

protected $rules = [
    'post.title' => 'required',
    'post.description' => 'required',
];
```

```html
<input wire:model="post.title">
<input wire:model="post.description">
```

Livewire 3では、Eloquentモデルへの直接バインディングは廃止され、個別プロパティの利用や[フォームオブジェクト](/docs/forms#extracting-a-form-object)への抽出が推奨されています。

ただし、この動作は多くのLivewireアプリケーションで広く利用されているため、バージョン3でも `config/livewire.php` の設定項目によって引き続きサポートされています。

```php
'legacy_model_binding' => true,
```

`legacy_model_binding` を `true` に設定することで、Livewireはバージョン2と同様にEloquentモデルプロパティを扱います。

## AlpineJS

Livewire 3はデフォルトで [AlpineJS](https://alpinejs.dev) を同梱しています。

もし手動でAlpineをLivewireアプリケーションに読み込んでいる場合は、Livewire内蔵バージョンと競合しないよう削除してください。

### scriptタグでAlpineを読み込む場合

以下のようなscriptタグでAlpineを読み込んでいる場合は、完全に削除しても問題ありません。Livewireが内部でAlpineを自動的に読み込みます。

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script> <!-- [tl! remove] -->
```

### プラグインをscriptタグ経由で読み込む場合

Livewire 3は、以下のAlpineプラグインを標準で同梱しています。

* [Anchor](https://alpinejs.dev/plugins/anchor)
* [Collapse](https://alpinejs.dev/plugins/collapse)
* [Focus](https://alpinejs.dev/plugins/focus)
* [Intersect](https://alpinejs.dev/plugins/intersect)
* [Mask](https://alpinejs.dev/plugins/mask)
* [Morph](https://alpinejs.dev/plugins/morph)
* [Persist](https://alpinejs.dev/plugins/persist)

新しいAlpineプラグインが追加される可能性があるため、[package.json](https://github.com/livewire/livewire/blob/main/package.json) ファイルの変更に注意を払う価値があります！

以前、以下のように `<script>` タグを介してこれらのプラグインのいずれかをアプリケーションに含めていた場合は、Alpineのコアと一緒に削除する必要があります。

```html
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js"></script> <!-- [tl! remove:1] -->
<!-- ... -->
```

### scriptタグ経由でAlpineグローバルにアクセスする場合

現在、以下のようにscriptタグから `Alpine` グローバルオブジェクトにアクセスしている場合:

```html
<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data(...)
    })
</script>
```

Livewireは内部的にAlpineのグローバルオブジェクトを以前と同様に含めて登録しているため、そのまま続行できます。

### JSバンドル経由で含める場合

Alpineや上記の人気のあるコアAlpineプラグインをNPMを介してアプリケーションのJavaScriptバンドルに次のように含めている場合:

```js
// Warning: this is a snippet of the Livewire 2 approach to including Alpine

import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'

Alpine.plugin(intersect)

Alpine.start()
```

LivewireはデフォルトでAlpineや多くの人気のあるAlpineプラグインを含んでいるため、完全に削除できます。

#### JSバンドル経由でAlpineにアクセスする場合

アプリケーションのJavaScriptバンドル内でカスタムAlpineプラグインやコンポーネントを次のように登録している場合:

```js
// Warning: this is a snippet of the Livewire 2 approach to including Alpine

import Alpine from 'alpinejs'
import customPlugin from './plugins/custom-plugin'

Alpine.plugin(customPlugin)

Alpine.start()
```

アプリケーションのバンドルにLivewireコアのESMモジュールをインポートし、そこから `Alpine` にアクセスすることで、引き続きこれを実現できます。

アプリケーションのバンドルにLivewireをインポートするには、まずLivewireの通常のJavaScriptインジェクションを無効にし、アプリケーションの主要なレイアウトで `@livewireScripts` を `@livewireScriptConfig` に置き換えて、Livewireに必要な設定を提供する必要があります。

```blade
    <!-- ... -->

    @livewireScripts <!-- [tl! remove] -->
    @livewireScriptConfig <!-- [tl! add] -->
</body>
```

これで、次のようにアプリケーションのバンドルに `Alpine` と `Livewire` をインポートできます。

```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import customPlugin from './plugins/custom-plugin'

Alpine.plugin(customPlugin)

Livewire.start()
```

もはや `Alpine.start()` を呼び出す必要はありません。Livewireが自動的にAlpineを開始します。

詳細については、[LivewireのJavaScriptを手動でバンドルする](/docs/installation#manually-bundling-livewire-and-alpine) に関するドキュメントを参照してください。

## `wire:model`

Livewire 3では、`wire:model` はデフォルトで「deferred」（遅延）になりました（従来の `wire:model.defer` の代わり）。Livewire 2の `wire:model` と同じ動作を実現するには、`wire:model.live` を使用してください。

アプリケーションの挙動を維持するために、テンプレート内で以下の置換が必要です:


```html
- <input wire:model="...">
+ <input wire:model.live="...">

- <input wire:model.defer="...">
+ <input wire:model="...">

- <input wire:model.lazy="...">
+ <input wire:model.blur="...">
```

## `@entangle`

`wire:model` の変更と同様に、Livewire 3ではすべてのデータバインディングがデフォルトで遅延されます。この挙動に合わせて、`@entangle` も更新されています。

アプリケーションの動作を維持するため、以下の `@entangle` の置換を行ってください:

```blade
- @entangle(...)
+ @entangle(...).live

- @entangle(...).defer
+ @entangle(...)
```

## イベント（Events）

Livewire 2では、イベントをトリガーするために2つの異なるPHPメソッドが用意されていました:

* `emit()`
* `dispatchBrowserEvent()`

Livewire 3では、これら2つのメソッドが1つのメソッドに統合されました:

* `dispatch()`

以下は、Livewire 3でイベントをディスパッチし、リッスンする基本的な例です:

```php
// ディスパッチ側...
class CreatePost extends Component
{
    public Post $post;

    public function save()
    {
        $this->dispatch('post-created', postId: $this->post->id);
    }
}

// リスナー側...
class Dashboard extends Component
{
    #[On('post-created')]
    public function postAdded($postId)
    {
        //
    }
}
```

Livewire 2からの主な変更点は次の3つです:

1. `emit()` は `dispatch()` に名称変更されました（同様に `emitTo()` と `emitSelf()` は `dispatchTo()` と `dispatchSelf()` になりました）
2. `dispatchBrowserEvent()` は `dispatch()` に名称変更されました
3. すべてのイベントパラメータは名前付きで指定する必要があります

詳細は新しい[イベントのドキュメント](/docs/events)をご覧ください。

アプリケーションに適用すべき「検索と置換」の例は以下の通りです:

```php
$this->emit('post-created'); // [tl! remove]
$this->dispatch('post-created'); // [tl! add]

$this->emitTo('foo', 'post-created'); // [tl! remove]
$this->dispatch('post-created')->to('foo'); // [tl! add]

$this->emitSelf('post-created'); // [tl! remove]
$this->dispatch('post-created')->self(); // [tl! add]

$this->emit('post-created', $post->id); // [tl! remove]
$this->dispatch('post-created', postId: $post->id); // [tl! add]

$this->dispatchBrowserEvent('post-created'); // [tl! remove]
$this->dispatch('post-created'); // [tl! add]

$this->dispatchBrowserEvent('post-created', ['postId' => $post->id]); // [tl! remove]
$this->dispatch('post-created', postId: $post->id); // [tl! add]
```

```html
<button wire:click="$emit('post-created')">...</button> <!-- [tl! remove] -->
<button wire:click="$dispatch('post-created')">...</button> <!-- [tl! add] -->

<button wire:click="$emit('post-created', 1)">...</button> <!-- [tl! remove] -->
<button wire:click="$dispatch('post-created', { postId: 1 })">...</button> <!-- [tl! add] -->

<button wire:click="$emitTo('foo', post-created', 1)">...</button> <!-- [tl! remove] -->
<button wire:click="$dispatchTo('foo', 'post-created', { postId: 1 })">...</button> <!-- [tl! add] -->

<button x-on:click="$wire.emit('post-created', 1)">...</button> <!-- [tl! remove] -->
<button x-on:click="$dispatch('post-created', { postId: 1 })">...</button> <!-- [tl! add] -->
```

### `emitUp()`

`emitUp` の概念は完全に削除されました。イベントはブラウザイベントとしてディスパッチされるため、デフォルトで「バブルアップ」します。

コンポーネント内の `$this->emitUp(...)` や `$emitUp(...)` の記述は削除してください。

### イベントのテスト

Livewireでは、イベントのディスパッチに関する用語統一に合わせて、イベントアサーションも変更されました:

```php
Livewire::test(Component::class)->assertEmitted('post-created'); // [tl! remove]
Livewire::test(Component::class)->assertDispatched('post-created'); // [tl! add]

Livewire::test(Component::class)->assertEmittedTo(Foo::class, 'post-created'); // [tl! remove]
Livewire::test(Component::class)->assertDispatchedTo(Foo::class, 'post-created'); // [tl! add]

Livewire::test(Component::class)->assertNotEmitted('post-created'); // [tl! remove]
Livewire::test(Component::class)->assertNotDispatched('post-created'); // [tl! add]

Livewire::test(Component::class)->assertEmittedUp() // [tl! remove]
```

### URLクエリストリング

以前のLivewireバージョンでは、プロパティをURLのクエリストリングにバインドすると、`except` オプションを使わない限り、その値が常にクエリストリングに表示されていました。

Livewire 3では、クエリストリングにバインドされたすべてのプロパティは、ページ読み込み後に値が変更された場合のみクエリストリングに表示されます。このデフォルトにより、`except` オプションは不要になりました。

```php
public $search = '';

protected $queryString = [
    'search' => ['except' => ''], // [tl! remove]
    'search', // [tl! add]
];
```

常に値に関係なくクエリストリングにプロパティを表示したい場合は、`keep` オプションを使用できます:

```php
public $search = '';

protected $queryString = [
    // highlight-next-line
    'search' => ['keep' => true],
];
```

## ページネーション

Livewire 3では、同一コンポーネント内で複数のページネーターをより良くサポートするため、ページネーションシステムが更新されました。

### 公開済みページネーションビューの更新

Livewireのページネーションビューを公開している場合は、[GitHubのpaginationディレクトリ](https://github.com/livewire/livewire/tree/master/src/Features/SupportPagination/views)にある新しいものを参照し、アプリケーションを更新してください。

### `$this->page` への直接アクセス

Livewireは、1つのコンポーネントで複数のページネーターをサポートするようになったため、コンポーネントクラスから `$page` プロパティを削除し、代わりにページネーターの配列を格納する `$paginators` プロパティを導入しました:

```php
$this->page = 2; // [tl! remove]
$this->paginators['page'] = 2; // [tl! add]
```

ただし、現在のページの取得や変更には、用意されている `getPage` および `setPage` メソッドの利用が推奨されます:

```php
// ゲッター...
$this->getPage();

// セッター...
$this->setPage(2);
```

### `wire:click.prefetch`

Livewireのプリフェッチ機能（`wire:click.prefetch`）は完全に削除されました。この機能に依存していた場合でも、アプリケーションは引き続き動作しますが、以前 `.prefetch` で得られていた一部のパフォーマンス向上はなくなります。

```html
<button wire:click.prefetch=""> <!-- [tl! remove] -->
<button wire:click="..."> <!-- [tl! add] -->
```

## コンポーネントクラスの変更

アプリケーションのコンポーネントが依存していた可能性のある、Livewireのベース `Livewire\Component` クラスに対して以下の変更が行われました。

### コンポーネント `$id` プロパティ

コンポーネントのIDに直接 `$this->id` でアクセスしていた場合は、代わりに `$this->getId()` を使用してください:

```php
$this->id; // [tl! remove]

$this->getId(); // [tl! add]
```

### 重複したメソッドとプロパティ名

PHPでは、クラスプロパティとメソッドに同じ名前を使用することが許可されています。Livewire 3では、これにより `wire:click` を介してフロントエンドからメソッドを呼び出す際に問題が発生します。

コンポーネント内のすべての公開メソッドとプロパティに異なる名前を使用することを強くお勧めします:

```php
public $search = ''; // [tl! remove]

public function search() {
    // ...
}
```

```php
public $query = ''; // [tl! add]

public function search() {
    // ...
}
```

## JavaScript APIの変更

### `livewire:load`

以前のLivewireバージョンでは、`livewire:load` イベントをリッスンして、Livewireがページを初期化する直前にJavaScriptコードを即座に実行することができました。

Livewire 3では、そのイベント名がAlpineの `alpine:init` に合わせて `livewire:init` に変更されました:

```js
document.addEventListener('livewire:load', () => {...}) // [tl! remove]
document.addEventListener('livewire:init', () => {...}) // [tl! add]
```

### ページ期限切れフック

バージョン2では、Livewireはページの期限切れ動作をカスタマイズするための専用のJavaScriptメソッド: `Livewire.onPageExpired()` を公開していました。このメソッドは、より強力な `request` フックを直接使用するように変更されました:

```js
Livewire.onPageExpired(() => {...}) // [tl! remove]

Livewire.hook('request', ({ fail }) => { // [tl! add:8]
    fail(({ status, preventDefault }) => {
        if (status === 419) {
            preventDefault()

            confirm('Your custom page expiration behavior...')
        }
    })
})
```

### 新しいライフサイクルフック

Livewire 3では、Livewireの内部JavaScriptライフサイクルフックの多くが変更されました。

以下は、古いフックと新しい構文の比較です。アプリケーション内で検索/置換する際の参考にしてください:

```js
Livewire.hook('component.initialized', (component) => {}) // [tl! remove]
Livewire.hook('component.init', ({ component, cleanup }) => {}) // [tl! add]

Livewire.hook('element.initialized', (el, component) => {}) // [tl! remove]
Livewire.hook('element.init', ({ el, component }) => {}) // [tl! add]

Livewire.hook('element.updating', (fromEl, toEl, component) => {}) // [tl! remove]
Livewire.hook('morph.updating', ({ el, toEl, component }) => {}) // [tl! add]

Livewire.hook('element.updated', (el, component) => {}) // [tl! remove]
Livewire.hook('morph.updated', ({ el, component }) => {}) // [tl! add]

Livewire.hook('element.removed', (el, component) => {}) // [tl! remove]
Livewire.hook('morph.removed', ({ el, component }) => {}) // [tl! add]

Livewire.hook('message.sent', (message, component) => {}) // [tl! remove]
Livewire.hook('message.failed', (message, component) => {}) // [tl! remove]
Livewire.hook('message.received', (message, component) => {}) // [tl! remove]
Livewire.hook('message.processed', (message, component) => {}) // [tl! remove]

Livewire.hook('commit', ({ component, commit, respond, succeed, fail }) => { // [tl! add:14]
    // Equivalent of 'message.sent'

    succeed(({ snapshot, effects }) => {
        // Equivalent of 'message.received'

        queueMicrotask(() => {
            // Equivalent of 'message.processed'
        })
    })

    fail(() => {
        // Equivalent of 'message.failed'
    })
})
```

あなたは新しい [JavaScriptフックのドキュメント](/docs/javascript) を参照して、新しいフックシステムをより徹底的に理解することができます。

## ローカリゼーション

アプリケーションが `https://example.com/en/...` のようにURIにロケールプレフィックスを使用している場合、Livewire 2ではコンポーネントの更新時に自動的にこのURLプレフィックスが保持されていました。

Livewire 3では、この動作は自動的にはサポートされなくなりました。代わりに、必要なURIプレフィックスでLivewireの更新エンドポイントをオーバーライドすることができます `setUpdateRoute()` を使用して:

```php
Route::group(['prefix' => LaravelLocalization::setLocale()], function ()
{
    // Your other localized routes...

    Livewire::setUpdateRoute(function ($handle) {
        return Route::post('/livewire/update', $handle);
    });
});
```

詳細については、[Livewireの更新エンドポイントの設定](/docs/installation#configuring-livewires-update-endpoint) に関するドキュメントをご覧ください。
