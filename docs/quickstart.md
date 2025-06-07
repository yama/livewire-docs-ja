Livewireの使い方を体験するために、まずはシンプルな「カウンター」コンポーネントを作成し、ブラウザで表示してみましょう。この例は、Livewireの“ライブ感”を最も簡単な形で体験できる、初めての方におすすめの内容です。

## 前提条件

作業を始める前に、以下がインストールされていることを確認してください。

- Laravel バージョン10以上
- PHP バージョン8.1以上

## Livewireのインストール

Laravelアプリのルートディレクトリで、次の[Composer](https://getcomposer.org/)コマンドを実行します。

```shell
composer require livewire/livewire
```

> [!warning] Alpineがすでにインストールされていないか確認してください
> もしご利用中のアプリケーションにAlpineJSがすでにインストールされている場合は、Livewireが正しく動作するようAlpineを削除してください。Alpineが二重に読み込まれると、Livewireが動作しなくなります。たとえば、Laravel Breezeの「Blade with Alpine」スターターキットを使っている場合は、`resources/js/app.js`からAlpineを削除してください。

## Livewireコンポーネントの作成

Livewireには、新しいコンポーネントを素早く生成できる便利なArtisanコマンドが用意されています。次のコマンドで`Counter`コンポーネントを作成しましょう。

```shell
php artisan make:livewire counter
```

このコマンドを実行すると、プロジェクト内に2つの新しいファイルが生成されます。
* `app/Livewire/Counter.php`
* `resources/views/livewire/counter.blade.php`

## クラスの記述

`app/Livewire/Counter.php`を開き、内容を以下のコードに置き換えてください。

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

    public function decrement()
    {
        $this->count--;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

上記コードの簡単な説明は以下の通りです：
- `public $count = 1;` — 初期値`1`で`$count`という名前のパブリックプロパティを宣言します。
- `public function increment()` — `$count`プロパティをインクリメントする`increment()`という名前のパブリックメソッドを宣言します。このようなパブリックメソッドは、ボタンがクリックされたときなど、さまざまな方法でブラウザからトリガーされます。
- `public function render()` — Bladeビューを返す`render()`メソッドを宣言します。このBladeビューが、コンポーネントのHTMLテンプレートとなります。

## ビューの記述

`resources/views/livewire/counter.blade.php`ファイルを開き、その内容を以下のコードに置き換えてください。

```blade
<div>
    <h1>{{ $count }}</h1>

    <button wire:click="increment">+</button>

    <button wire:click="decrement">-</button>
</div>
```

このコードは、`$count`プロパティの値を表示し、それぞれ`$count`プロパティをインクリメントおよびデクリメントする2つのボタンを表示します。

> [!warning] Livewireコンポーネントはルート要素を1つだけ持つ必要があります
> Livewireが機能するためには、コンポーネントはルート要素として**1つだけ**の要素を持っている必要があります。複数のルート要素が検出されると、例外がスローされます。推奨されるように、例として`<div>`要素を使用してください。HTMLコメントは別々の要素としてカウントされ、ルート要素内に配置する必要があります。
> [フルページコンポーネント](/docs/components#full-page-components)をレンダリングする場合、レイアウトファイルの名前付きスロットはルート要素の外に置くことができます。これらはコンポーネントがレンダリングされる前に削除されます。

## コンポーネントのルート登録

Laravelアプリケーションの`routes/web.php`ファイルを開き、以下のコードを追加します。

```php
use App\Livewire\Counter;

Route::get('/counter', Counter::class);
```

これで、_counter_コンポーネントは`/counter`ルートに割り当てられました。ユーザーがアプリケーション内の`/counter`エンドポイントにアクセスすると、このコンポーネントがブラウザによってレンダリングされます。

## テンプレートレイアウトの作成

ブラウザで`/counter`にアクセスする前に、コンポーネントがレンダリングされるためのHTMLレイアウトが必要です。デフォルトでは、Livewireは自動的に`resources/views/components/layouts/app.blade.php`という名前のレイアウトファイルを探します。

このファイルがまだ存在しない場合は、次のコマンドを実行して作成できます。

```shell
php artisan livewire:layout
```

このコマンドを実行すると、以下の内容を持つ`resources/views/components/layouts/app.blade.php`というファイルが生成されます。

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>{{ $title ?? 'Page Title' }}</title>
    </head>
    <body>
        {{ $slot }}
    </body>
</html>
```

上記のテンプレート内の`$slot`変数の場所に、_counter_コンポーネントがレンダリングされます。

Livewireから提供されるJavaScriptやCSSのアセットがないことにお気づきかもしれません。それは、Livewire 3以降は必要なフロントエンドアセットが自動的に注入されるためです。

## 動作確認

コンポーネントクラスとテンプレートが整ったので、コンポーネントのテストを行いましょう！

ブラウザで`/counter`にアクセスすると、画面に数字が表示され、数字をインクリメントおよびデクリメントするための2つのボタンが表示されます。

ボタンのいずれかをクリックすると、ページをリロードすることなくカウントがリアルタイムで更新されるのに気づくでしょう。これがLivewireの魔法です：PHPだけで書かれた動的なフロントエンドアプリケーションです。

Livewireが提供する機能のすべてを知るには、ドキュメントを読み続けてください。
