---
title: コンポーネント
---

Livewireアプリケーションの「コンポーネント」は、UIを構成する基本的な単位です。コンポーネントは状態と振る舞いを組み合わせて、フロントエンドで再利用可能なUIパーツを作成します。ここでは、コンポーネントの作成とレンダリングの基本について解説します。

## コンポーネントの作成

Livewireコンポーネントは、`Livewire\Component`を継承したPHPクラスです。コンポーネントファイルは手動で作成することもできますが、以下のArtisanコマンドを使うのが便利です。

```shell
php artisan make:livewire CreatePost
```

名前をケバブケース（小文字とハイフン区切り）で指定したい場合は、次のように記述できます。

```shell
php artisan make:livewire create-post
```

このコマンドを実行すると、Livewireはアプリケーション内に2つの新しいファイルを作成します。ひとつ目はコンポーネントのクラスファイルで、`app/Livewire/CreatePost.php`に生成されます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
    public function render()
    {
        return view('livewire.create-post');
    }
}
```

2つ目はコンポーネントのBladeビューで、`resources/views/livewire/create-post.blade.php`に生成されます。

```blade
<div>
    {{-- ... --}}
</div>
```

コンポーネントをサブディレクトリ内に作成する場合は、名前空間構文またはドット表記を使用できます。たとえば、次のコマンドは`Posts`サブディレクトリ内に`CreatePost`コンポーネントを作成します。

```shell
php artisan make:livewire Posts\\CreatePost
php artisan make:livewire posts.create-post
```

### インラインコンポーネント

コンポーネントが比較的小さい場合は、_インライン_ コンポーネントとして作成することを検討してください。インラインコンポーネントは、ビューテンプレートが別ファイルではなく`render()`メソッド内に直接含まれる単一ファイルのLivewireコンポーネントです。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
    public function render()
    {
        return <<<'HTML' // [tl! highlight:4]
        <div>
            {{-- Your Blade template goes here... --}}
        </div>
        HTML;
    }
}
```

インラインコンポーネントは、`make:livewire`コマンドに`--inline`フラグを追加することで作成できます。

```shell
php artisan make:livewire CreatePost --inline
```

### renderメソッドの省略

コンポーネントのボイラープレートを減らすために、`render()`メソッドを完全に省略することもできます。その場合、Livewireは独自の基盤となる`render()`メソッドを使用し、コンポーネントに対応する従来の名前のビューを返します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
    //
}
```

上記のコンポーネントがページにレンダリングされると、Livewireは自動的に`livewire.create-post`テンプレートを使用してレンダリングすることを判断します。

### コンポーネントスタブのカスタマイズ

新しいコンポーネントを生成する際にLivewireが使用するファイル（または_スタブ_）をカスタマイズするには、次のコマンドを実行します。

```shell
php artisan livewire:stubs
```

これにより、アプリケーション内に7つの新しいファイルが作成されます。

* `stubs/livewire.stub` — 新しいコンポーネントを生成するために使用
* `stubs/livewire.attribute.stub` — 属性クラスを生成するために使用
* `stubs/livewire.form.stub` — フォームクラスを生成するために使用
* `stubs/livewire.inline.stub` — _インライン_ コンポーネントを生成するために使用
* `stubs/livewire.pest-test.stub` — Pestテストファイルを生成するために使用
* `stubs/livewire.test.stub` — PHPUnitテストファイルを生成するために使用
* `stubs/livewire.view.stub` — コンポーネントビューを生成するために使用

これらのファイルはアプリケーション内に存在しますが、`make:livewire` Artisanコマンドを引き続き使用でき、Livewireはファイルを生成する際に自動的にカスタムスタブを使用します。

## プロパティの設定

Livewireコンポーネントにはデータを格納するプロパティがあり、コンポーネントのクラスとBladeビュー内で簡単にアクセスできます。このセクションでは、コンポーネントにプロパティを追加し、アプリケーションで使用する基本について説明します。

Livewireコンポーネントにプロパティを追加するには、コンポーネントクラス内にpublicプロパティを宣言します。たとえば、`CreatePost`コンポーネントに`$title`プロパティを作成してみましょう。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
    public $title = 'Post title...';

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

### ビュー内でのプロパティへのアクセス

コンポーネントプロパティは自動的にコンポーネントのBladeビューで利用可能になります。標準のBlade構文を使用して参照できます。ここでは、`$title`プロパティの値を表示します。

```blade
<div>
    <h1>Title: "{{ $title }}"</h1>
</div>
```

このコンポーネントのレンダリング結果は次のようになります。

```blade
<div>
    <h1>Title: "Post title..."</h1>
</div>
```

### ビューへの追加データの共有

プロパティに加えて、`render()`メソッドからビューにデータを明示的に渡すこともできます。これは、プロパティとして保存せずに追加データを渡したい場合に便利です。プロパティには[特定のパフォーマンスとセキュリティの懸念](/docs/properties#security-concerns)があります。

`render()`メソッド内でビューにデータを渡すには、ビューインスタンスの`with()`メソッドを使用します。たとえば、投稿の著者名をビューに渡したいとします。この場合、投稿の著者は現在認証されているユーザーです。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class CreatePost extends Component
{
    public $title;

    public function render()
    {
        return view('livewire.create-post')->with([
            'author' => Auth::user()->name,
        ]);
    }
}
```

これで、コンポーネントのBladeビューから`$author`プロパティにアクセスできるようになりました。

```blade
<div>
    <h1>Title: {{ $title }}</h1>

    <span>Author: {{ $author }}</span>
</div>
```

### `@foreach`ループへの`wire:key`の追加

Livewireテンプレート内でデータをループ処理する際に`@foreach`を使用する場合、ループによってレンダリングされるルート要素に一意の`wire:key`属性を追加する必要があります。

Bladeループ内に`wire:key`属性が存在しないと、Livewireは古い要素と新しい位置を適切に照合できなくなります。これにより、アプリケーション内で診断が難しい多くの問題が発生する可能性があります。

たとえば、投稿の配列をループ処理している場合、`wire:key`属性を投稿のIDに設定できます。

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}"> <!-- [tl! highlight] -->
            <!-- ... -->
        </div>
    @endforeach
</div>
```

Livewireコンポーネントをレンダリングしている配列をループ処理している場合は、キーをコンポーネント属性`:key`として設定するか、`@livewire`ディレクティブを使用する際に3番目の引数としてキーを渡すことができます。

```blade
<div>
    @foreach ($posts as $post)
        <livewire:post-item :$post :key="$post->id">

        @livewire(PostItem::class, ['post' => $post], key($post->id))
    @endforeach
</div>
```

### 入力とプロパティのバインディング

Livewireの最も強力な機能のひとつは、「データバインディング」です。これは、ページ上のフォーム入力とプロパティを自動的に同期させる能力です。

`CreatePost`コンポーネントの`$title`プロパティをテキスト入力にバインドしてみましょう。`wire:model`ディレクティブを使用します。

```blade
<form>
    <label for="title">Title:</label>

    <input type="text" id="title" wire:model="title"> <!-- [tl! highlight] -->
</form>
```

テキスト入力に加えられた変更は、Livewireコンポーネント内の`$title`プロパティと自動的に同期されます。

:::warning なぜコンポーネントが入力中にライブ更新されないのか？
これをブラウザで試して、タイトルが自動的に更新されない理由に混乱している場合は、Livewireは「アクション」が送信されたときにのみコンポーネントを更新するためです。たとえば、送信ボタンを押すときなどです。これにより、ネットワークリクエストが削減され、パフォーマンスが向上します。ユーザーが入力中に「ライブ」更新を有効にするには、代わりに`wire:model.live`を使用できます。データバインディングの詳細については、[プロパティのドキュメント](/docs/properties#data-binding)を参照してください。
:::


Livewireプロパティは非常に強力であり、理解するための重要な概念です。詳細については、[Livewireプロパティのドキュメント](/docs/properties)を参照してください。

## アクションの呼び出し

アクションは、ユーザーの操作に応答したり、特定のタスクを実行したりするLivewireコンポーネント内のメソッドです。これらは、ページ上のボタンクリックやフォーム送信に応答するのに役立ちます。

アクションについて学ぶために、`CreatePost`コンポーネントに`save`アクションを追加してみましょう。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $title;

    public function save() // [tl! highlight:8]
    {
        Post::create([
            'title' => $this->title
        ]);

        return redirect()->to('/posts')
             ->with('status', 'Post created!');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

次に、コンポーネントのBladeビューから`save`アクションを呼び出してみましょう。`<form>`要素に`wire:submit`ディレクティブを追加します。

```blade
<form wire:submit="save"> <!-- [tl! highlight] -->
    <label for="title">Title:</label>

    <input type="text" id="title" wire:model="title">

    <button type="submit">Save</button>
</form>
```

「保存」ボタンがクリックされると、Livewireコンポーネント内の`save()`メソッドが実行され、コンポーネントが再レンダリングされます。

アクションについての学習を続けるには、[アクションのドキュメント](/docs/actions)を訪れてください。

## コンポーネントのレンダリング

Livewireコンポーネントをページにレンダリングする方法は2つあります。

1. 既存のBladeビュー内に含める
2. ルートに直接割り当ててフルページコンポーネントとして表示する

最初の方法は、2番目の方法よりも簡単です。

コンポーネントをBladeテンプレートに含めるには、`<livewire:component-name />`構文を使用します。

```blade
<livewire:create-post />
```

コンポーネントクラスが`app/Livewire/`ディレクトリ内のさらに深い場所にネストされている場合は、ドット`。`文字を使用してディレクトリのネストを示すことができます。たとえば、コンポーネントが`app/Livewire/EditorPosts/CreatePost.php`にあると仮定すると、次のようにレンダリングできます。

```blade
<livewire:editor-posts.create-post />
```

:::warning ケバブケースを使用する必要があります
上記のスニペットのように、コンポーネント名の_ケバブケース_バージョンを使用する必要があります。_StudlyCase_バージョンの名前（`<livewire:CreatePost />`）を使用することは無効であり、Livewireによって認識されません。
:::


### コンポーネントへのデータの渡し方

外部データをLivewireコンポーネントに渡すには、コンポーネントタグに属性を使用します。これは、特定のデータでコンポーネントを初期化したいときに便利です。

`CreatePost`コンポーネントの`$title`プロパティに初期値を渡すには、次の構文を使用できます。

```blade
<livewire:create-post title="Initial Title" />
```

動的な値や変数をコンポーネントに渡す必要がある場合は、属性の前にコロン`:`を付けてPHP式を書くことができます。

```blade
<livewire:create-post :title="$initialTitle" />
```

コンポーネントに渡されたデータは、`mount()`ライフサイクルフックを介してメソッドパラメータとして受信されます。この場合、`$title`パラメータをプロパティに割り当てるには、次のような`mount()`メソッドを記述します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
    public $title;

    public function mount($title = null)
    {
        $this->title = $title;
    }

    // ...
}
```

この例では、`$title`プロパティは「Initial Title」という値で初期化されます。

`mount()`メソッドは、コンポーネントの初回読み込み時に実行され、その後のページ内のリクエストでは実行されません。`mount()`メソッドや他の便利なライフサイクルフックの詳細については、[ライフサイクルドキュメント](/docs/lifecycle-hooks)を参照してください。

ボイラープレートコードを減らすために、`mount()`メソッドを省略すると、Livewireは自動的に渡された値に一致する名前のプロパティにコンポーネントのプロパティを設定します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class CreatePost extends Component
{
    public $title; // [tl! highlight]

    // ...
}
```

これは、`mount()`メソッド内で`$title`に割り当てるのと実質的に同じです。

:::warning これらのプロパティはデフォルトでは反応しません
`$title`プロパティは、外部の`:title="$initialValue"`が初回ページ読み込み後に変更されても自動的に更新されません。これは、Livewireを使用する際の一般的な混乱の原因です。特に、VueやReactなどのJavaScriptフレームワークを使用したことがある開発者にとっては、これらの「パラメータ」がそれらのフレームワークにおける「反応するプロップ」のように動作することを前提としています。しかし、心配はいりません。Livewireでは、[プロパティを反応させる](/docs/nesting#reactive-props)オプションがあります。
:::


## フルページコンポーネント

Livewireを使用すると、コンポーネントをLaravelアプリケーションのルートに直接割り当てることができます。これを「フルページコンポーネント」と呼びます。これを使用して、ロジックとビューを完全にカプセル化したスタンドアロンページをコンポーネント内に構築できます。

フルページコンポーネントを作成するには、`routes/web.php`ファイルにルートを定義し、`Route::get()`メソッドを使用して特定のURLにコンポーネントをマッピングします。たとえば、`CreatePost`コンポーネントを`/posts/create`という専用のルートでレンダリングしたいとします。

次の行を`routes/web.php`ファイルに追加することで、これを実現できます。

```php
use App\Livewire\CreatePost;

Route::get('/posts/create', CreatePost::class);
```

これで、ブラウザで`/posts/create`パスにアクセスすると、`CreatePost`コンポーネントがフルページコンポーネントとしてレンダリングされます。

### レイアウトファイル

フルページコンポーネントは、通常`resources/views/components/layouts/app.blade.php`ファイルに定義されたアプリケーションのレイアウトを使用します。

このファイルが存在しない場合は、次のコマンドを実行して作成できます。

```shell
php artisan livewire:layout
```

これにより、`resources/views/components/layouts/app.blade.php`というファイルが生成されます。

この場所にBladeファイルを作成し、`{{ $slot }}`プレースホルダーを含めていることを確認してください。

```blade
<!-- resources/views/components/layouts/app.blade.php -->

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

#### グローバルレイアウト設定

すべてのコンポーネントでカスタムレイアウトを使用するには、`config/livewire.php`の`layout`キーをカスタムレイアウトのパスに設定します。このパスは`resources/views`に対して相対的です。たとえば：

```php
'layout' => 'layouts.app',
```

上記の設定により、Livewireはフルページコンポーネントを`resources/views/layouts/app.blade.php`のレイアウトファイル内にレンダリングします。

#### コンポーネントごとのレイアウト設定

特定のコンポーネントに異なるレイアウトを使用するには、コンポーネントの`render()`メソッドの上にLivewireの`#[Layout]`属性を配置し、カスタムレイアウトの相対ビューパスを渡します。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Layout;
use Livewire\Component;

class CreatePost extends Component
{
    // ...

    #[Layout('layouts.app')] // [tl! highlight]
    public function render()
    {
        return view('livewire.create-post');
    }
}
```

または、クラス宣言の上にこの属性を使用することもできます。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Layout;
use Livewire\Component;

#[Layout('layouts.app')] // [tl! highlight]
class CreatePost extends Component
{
    // ...
}
```

PHP属性はリテラル値のみをサポートしています。動的な値を渡す必要がある場合や、この代替構文を好む場合は、コンポーネントの`render()`メソッド内で流暢な`->layout()`メソッドを使用できます。

```php
public function render()
{
    return view('livewire.create-post')
         ->layout('layouts.app'); // [tl! highlight]
}
```

従来のBladeレイアウトファイルを`@extends`で使用することもサポートされています。

次のレイアウトファイルがあるとします。

```blade
<body>
    @yield('content')
</body>
```

これを参照するには、`->extends()`を使用してLivewireに指示できます。

```php
public function render()
{
    return view('livewire.show-posts')
        ->extends('layouts.app'); // [tl! highlight]
}
```

コンポーネントが使用する`@section`を設定する必要がある場合は、`->section()`メソッドでそれを設定できます。

```php
public function render()
{
    return view('livewire.show-posts')
        ->extends('layouts.app')
        ->section('body'); // [tl! highlight]
}
```

### ページタイトルの設定

アプリケーション内の各ページに一意のページタイトルを割り当てることは、ユーザーと検索エンジンの両方にとって役立ちます。

フルページコンポーネントのカスタムページタイトルを設定するには、まずレイアウトファイルに動的なタイトルが含まれていることを確認します。

```blade
<head>
    <title>{{ $title ?? 'Page Title' }}</title>
</head>
```

次に、Livewireコンポーネントの`render()`メソッドの上に`#[Title]`属性を追加し、ページタイトルを渡します。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Title;
use Livewire\Component;

class CreatePost extends Component
{
    // ...

    #[Title('Create Post')] // [tl! highlight]
    public function render()
    {
        return view('livewire.create-post');
    }
}
```

これにより、`CreatePost` Livewireコンポーネントのページタイトルが設定されます。この例では、コンポーネントがレンダリングされるときにページタイトルが「Create Post」となります。

この属性をクラス宣言の上に使用することもできます。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Create Post')] // [tl! highlight]
class CreatePost extends Component
{
    // ...
}
```

動的なタイトルを渡す必要がある場合は、たとえばコンポーネントプロパティを使用するタイトルを渡す場合は、`render()`メソッド内の流暢な`->title()`メソッドを使用できます。

```php
public function render()
{
    return view('livewire.create-post')
         ->title('Create Post'); // [tl! highlight]
}
```

### 追加のレイアウトファイルスロットの設定

[レイアウトファイル](#layout-files)に`$slot`以外の名前付きスロットがある場合、Bladeビュー内でそれらの内容を設定できます。これは、各コンポーネントに対して異なる値を設定したい場合に便利です。

たとえば、各コンポーネントの言語を個別に設定できるようにするには、レイアウトファイルのHTMLタグ内に動的な`$lang`スロットを追加します。

```blade
<!-- resources/views/components/layouts/app.blade.php -->

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', $lang ?? app()->getLocale()) }}"> <!-- [tl! highlight] -->
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

次に、コンポーネントビュー内でルート要素の外に`<x-slot>`要素を定義します。

```blade
<x-slot:lang>fr</x-slot> // このコンポーネントはフランス語です <!-- [tl! highlight] -->

<div>
    // フランス語のコンテンツがここに入ります...
</div>
```


### ルートパラメータへのアクセス

フルページコンポーネントで作業しているときに、ルートパラメータにアクセスする必要がある場合があります。

まず、`routes/web.php`ファイルにパラメータ付きのルートを定義します。

```php
use App\Livewire\ShowPost;

Route::get('/posts/{id}', ShowPost::class);
```

ここでは、`id`パラメータを持つルートを定義しています。これは投稿のIDを表します。

次に、`mount()`メソッドでルートパラメータを受け取るようにLivewireコンポーネントを更新します。

```php
<?php

namespace App\Livewire;

use App\Models\Post;
use Livewire\Component;

class ShowPost extends Component
{
    public Post $post;

    public function mount($id) // [tl! highlight]
    {
        $this->post = Post::findOrFail($id);
    }

    public function render()
    {
        return view('livewire.show-post');
    }
}
```

この例では、パラメータ名`$id`がルートパラメータ`{id}`と一致するため、`/posts/1` URLにアクセスすると、Livewireは「1」という値を`$id`に渡します。

### ルートモデルバインディングの使用

Laravelのルートモデルバインディングを使用すると、ルートパラメータからEloquentモデルを自動的に解決できます。

`routes/web.php`ファイルにモデルパラメータ付きのルートを定義した後：

```php
use App\Livewire\ShowPost;

Route::get('/posts/{post}', ShowPost::class);
```

`mount()`メソッドを介してルートモデルパラメータを受け取ることができます。

```php
<?php

namespace App\Livewire;

use App\Models\Post;
use Livewire\Component;

class ShowPost extends Component
{
    public Post $post;

    public function mount(Post $post) // [tl! highlight]
    {
        $this->post = $post;
    }

    public function render()
    {
        return view('livewire.show-post');
    }
}
```

`Post`型ヒントが`$post`パラメータの前に付いているため、Livewireは「ルートモデルバインディング」を使用することを認識します。

以前と同様に、`mount()`メソッドを省略することでボイラープレートを減らすことができます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post; // [tl! highlight]

    public function render()
    {
        return view('livewire.show-post');
    }
}
```

`$post`プロパティは、ルートの`{post}`パラメータを介してバインドされたモデルに自動的に割り当てられます。

### レスポンスの変更

特定のシナリオでは、レスポンスを変更してカスタムレスポンスヘッダーを設定したい場合があります。ビューの`response()`メソッドを呼び出すことでレスポンスオブジェクトにフックし、クロージャを使用してレスポンスオブジェクトを変更できます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Http\Response;

class ShowPost extends Component
{
    public function render()
    {
        return view('livewire.show-post')
            ->response(function(Response $response) {
                $response->header('X-Custom-Header', true);
            });
    }
}
```

## JavaScriptの使用

組み込みのLivewireおよびAlpineユーティリティだけでは、Livewireコンポーネント内での目標達成に不十分な場合が多くあります。

幸いなことに、Livewireは独自のJavaScriptと対話するための多くの便利な拡張ポイントとユーティリティを提供しています。詳細なリファレンスは[JavaScriptドキュメントページ](/docs/javascript)を参照してください。しかし、ここでは、コンポーネント内で独自のJavaScriptを使用するためのいくつかの便利な方法を紹介します。

### スクリプトの実行

Livewireは、`<script>`要素をラップする`@script`ディレクティブを提供しています。これにより、コンポーネントがページ上で初期化されるときに指定されたJavaScriptが実行されます。

次の例は、JavaScriptの`setInterval()`を使用して2秒ごとにコンポーネントを更新するシンプルな`@script`です。

```blade
@script
<script>
    setInterval(() => {
        $wire.$refresh()
    }, 2000)
</script>
@endscript
```

ここで、`<script>`内で`$wire`というオブジェクトを使用してコンポーネントを制御していることに注意してください。このオブジェクトは、任意の`@script`内で自動的に利用可能になります。`$wire`に不明な点がある場合は、次のドキュメントを参照してください。
* [JavaScriptからプロパティにアクセス](/docs/properties#accessing-properties-from-javascript)
* [JS/AlpineからLivewireアクションを呼び出す](/docs/actions#calling-actions-from-alpine)
* [The `$wire` object reference](/docs/javascript#the-wire-object)

### アセットの読み込み

一度きりの`@script`に加えて、Livewireは`@assets`ユーティリティを提供しており、ページ上で任意のスクリプト/スタイル依存関係を簡単に読み込むことができます。

これにより、提供されたアセットがブラウザページごとに1回だけ読み込まれることが保証されます。これは、新しいLivewireコンポーネントのインスタンスが初期化されるたびに実行される`@script`とは異なります。

次の例では、`@assets`を使用して日付ピッカーライブラリ[Pikaday](https://github.com/Pikaday/Pikaday)を読み込み、`@script`で初期化します。

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

:::info
`@verbatim@script@endverbatim`および`@verbatim@assets@endverbatim`をBladeコンポーネント内で使用する
Bladeコンポーネントを使用してマークアップの一部を抽出する場合、これらのコンポーネント内で`@verbatim@script@endverbatim`および`@verbatim@assets@endverbatim`を使用できます。たとえ同じLivewireコンポーネント内に複数のBladeコンポーネントがあっても。ただし、`@verbatim@script@endverbatim`および`@verbatim@assets@endverbatim`は現在、Livewireコンポーネントのコンテキスト内でのみサポートされています。つまり、BladeコンポーネントをLivewireの外部で使用すると、これらのスクリプトやアセットはページに読み込まれません。
:::
