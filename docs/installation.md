---
title: インストール
---

LivewireはLaravelのパッケージです。そのため、Livewireをインストールして利用するには、あらかじめLaravelアプリケーションが動作している必要があります。Laravelアプリケーションのセットアップ方法については、[公式Laravelドキュメント](https://laravel.com/docs/installation)をご覧ください。

Livewireのインストールは、ターミナルでLaravelアプリケーションのディレクトリに移動し、次のコマンドを実行するだけです。

```shell
composer require livewire/livewire
```

本当にこれだけで完了です。さらに細かいカスタマイズをしたい場合は、このまま読み進めてください。特に必要がなければ、すぐにLivewireの利用を始められます。

:::warning `/livewire/livewire.js` が404になる場合
通常、Livewireはアプリケーション内に `/livewire/livewire.js` というパスでJavaScriptアセットを配信するルートを自動的に用意します。多くの環境では問題ありませんが、Nginxで独自の設定をしている場合、このエンドポイントで404エラーが発生することがあります。その場合は、[LivewireのJavaScriptアセットを自分でビルドする](#manually-bundling-livewire-and-alpine)か、[Nginxの設定を調整する](https://benjamincrozat.com/livewire-js-404-not-found)ことで解決できます。
:::

## 設定ファイルの公開

Livewireは「ゼロコンフィグ」設計のため、特別な設定をしなくても、推奨される使い方に従えばそのまま利用できます。ただし、必要に応じて設定ファイルを公開し、カスタマイズすることも可能です。設定ファイルを公開するには、以下のArtisanコマンドを実行してください。

```shell
php artisan livewire:publish --config
```

このコマンドを実行すると、Laravelアプリケーションの `config` ディレクトリに `livewire.php` ファイルが作成されます。

## Livewireのフロントエンドアセットを手動で読み込む

通常、Livewireは必要なJavaScriptやCSSアセットを、Livewireコンポーネントを含む各ページに自動で挿入します。

もし、この動作を手動で制御したい場合は、次のBladeディレクティブを使用してページにアセットを手動で読み込むことができます。

```blade
<html>
<head>
	...
	@livewireStyles
</head>
<body>
	...
	@livewireScripts
</body>
</html>
```

これらのアセットをページに手動で含めることで、Livewireは自動的にアセットを挿入しないようになります。

:::warning AlpineJSはLivewireにバンドルされています
AlpineはLivewireのJavaScriptアセットにバンドルされているため、Alpineを使用するすべてのページに `@verbatim`@livewireScripts`@endverbatim` を含める必要があります。たとえそのページでLivewireを使用していなくてもです。
:::

ほとんどの場合必要ありませんが、アプリケーションの `config/livewire.php` ファイル内の `inject_assets` [設定オプション](#publishing-the-configuration-file) を更新することで、Livewireの自動挿入アセット動作を無効にすることができます。

```php
'inject_assets' => false,
```

もし、特定のページまたは複数のページでLivewireにアセットを強制的に挿入させたい場合は、現在のルートまたはサービスプロバイダーから次のグローバルメソッドを呼び出すことができます。

```php
\Livewire\Livewire::forceAssetInjection();
```

## Livewireの更新エンドポイントの設定

Livewireコンポーネントの更新は、次のエンドポイントにネットワークリクエストを送信します: `https://example.com/livewire/update`

これは、ローカリゼーションやマルチテナンシーを使用しているアプリケーションにとって問題になることがあります。

その場合は、好きなように独自のエンドポイントを登録でき、`Livewire::setUpdateRoute()` 内でそれを行う限り、Livewireはすべてのコンポーネント更新にこのエンドポイントを使用することを知っています。

```php
Livewire::setUpdateRoute(function ($handle) {
	return Route::post('/custom/livewire/update', $handle);
});
```

これで、`/livewire/update` の代わりに、Livewireは `/custom/livewire/update` にコンポーネントの更新を送信します。

Livewireは独自の更新ルートを登録できるため、`setUpdateRoute()` 内で直接Livewireに使用させたい追加のミドルウェアを宣言することもできます。

```php
Livewire::setUpdateRoute(function ($handle) {
	return Route::post('/custom/livewire/update', $handle)
        // highlight-next-line
        ->middleware([...]);
});
```

## アセットURLのカスタマイズ

デフォルトでは、Livewireは次のURLからJavaScriptアセットを配信します: `https://example.com/livewire/livewire.js`。さらに、Livewireは次のようにスクリプトタグからこのアセットを参照します。

```blade
<script src="/livewire/livewire.js" ...
```

アプリケーションにローカリゼーションやマルチテナンシーによるグローバルルートプレフィックスがある場合、LivewireがJavaScriptを取得する際に内部的に使用する独自のエンドポイントを登録できます。

カスタムJavaScriptアセットエンドポイントを使用するには、`Livewire::setScriptRoute()` 内で独自のルートを登録できます。

```php
Livewire::setScriptRoute(function ($handle) {
    return Route::get('/custom/livewire/livewire.js', $handle);
});
```

これで、Livewireは次のようにJavaScriptを読み込みます。

```blade
<script src="/custom/livewire/livewire.js" ...
```

## LivewireとAlpineの手動バンドル

デフォルトでは、AlpineとLivewireは `<script src="livewire.js">` タグを使用して読み込まれます。これでは、これらのライブラリが読み込まれる順序を制御できません。その結果、以下の例のようにAlpineプラグインをインポートして登録することができなくなります。

```js
// 警告: このスニペットは、絶対にやってはいけないことを示しています...

import Alpine from 'alpinejs'
import Clipboard from '@ryangjchandler/alpine-clipboard'

Alpine.plugin(Clipboard)
Alpine.start()
```

この問題を解決するために、Livewireに対してESM（ECMAScriptモジュール）バージョンを自分たちで使用することを通知し、`livewire.js` スクリプトタグの挿入を防ぐ必要があります。そのためには、レイアウトファイル（`resources/views/components/layouts/app.blade.php`）に `@livewireScriptConfig` ディレクティブを追加します。

```blade
<html>
<head>
    <!-- ... -->
    @livewireStyles
    @vite(['resources/js/app.js'])
</head>
<body>
    {{ $slot }}

    <!-- highlight-next-line -->
    @livewireScriptConfig
</body>
</html>
```

Livewireが `@livewireScriptConfig` ディレクティブを検出すると、LivewireとAlpineのスクリプトの挿入を控えるようになります。もし、Livewireを手動で読み込むために `@livewireScripts` ディレクティブを使用している場合は、それを削除してください。まだ存在しない場合は、`@livewireStyles` ディレクティブを追加してください。

最後のステップは、`app.js` ファイル内でAlpineとLivewireをインポートし、カスタムリソースを登録し、最終的にLivewireとAlpineを起動することです。

```js
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import Clipboard from '@ryangjchandler/alpine-clipboard'

Alpine.plugin(Clipboard)

Livewire.start()
```

:::tip Composer update後にアセットを再ビルド
LivewireとAlpineを手動でバンドルしている場合は、`composer update` を実行するたびにアセットを再ビルドすることを確認してください。
:::

:::warning Laravel Mixとは互換性がありません
LivewireとAlpineJSを手動でバンドルしている場合、Laravel Mixは機能しません。その代わりに、[Viteに切り替えることをお勧めします](https://laravel.com/docs/vite)。
:::

## Livewireのフロントエンドアセットの公開

:::warning アセットの公開は必須ではありません
Livewireを実行するためにアセットを公開する必要はありません。特定の必要がある場合のみ行ってください。
:::

JavaScriptアセットをLaravel経由ではなく、Webサーバーから直接配信させたい場合は、`livewire:publish` コマンドを使用します。

```bash
php artisan livewire:publish --assets
```

アセットを最新の状態に保ち、将来のアップデートでの問題を避けるために、次のコマンドをcomposer.jsonファイルに追加することを強くお勧めします。

```json
{
    "scripts": {
        "post-update-cmd": [
            // 他のスクリプト
            "@php artisan vendor:publish --tag=livewire:assets --ansi --force"
        ]
    }
}
```

