<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/pagination.md -->
Laravelのページネーション機能を使うと、データの一部だけを取得し、ユーザーがその結果の「ページ」を移動しながら閲覧できるようになります。

Laravelのページネーターは静的なアプリケーション向けに設計されているため、Livewireを使わない通常のアプリケーションでは、ページを移動するたびに新しいURL（例: `?page=2`）へのブラウザ遷移が発生します。

しかし、Livewireコンポーネント内でページネーションを利用すると、ユーザーは同じページ内でページ移動ができ、Livewireが裏側ですべてを処理します。これには、現在のページ番号をURLのクエリ文字列に反映することも含まれます。

## 基本的な使い方

以下は、`ShowPosts`コンポーネント内でページネーションを使い、１度に10件だけ投稿を表示する最も基本的な例です。

> [!warning] `WithPagination`トレイトの利用が必須です
> Livewireのページネーション機能を利用するには、ページネーションを含む各コンポーネントで`Livewire\WithPagination`トレイトを使う必要があります。

```php
<?php

namespace App\Livewire;

use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    use WithPagination;

    public function render()
    {
        return view('show-posts', [
            'posts' => Post::paginate(10),
        ]);
    }
}
```

```blade
<div>
    <div>
        @foreach ($posts as $post)
            <!-- ... -->
        @endforeach
    </div>

    {{ $posts->links() }}
</div>
```

このように、`Post::paginate()`メソッドを使って表示件数を制限するだけでなく、`$posts->links()`を使ってページ移動用のリンクを表示します。

Laravelのページネーションに関する詳細は、[Laravelの包括的なページネーションドキュメント](https://laravel.com/docs/pagination)を参照してください。

## URLのクエリ文字列追跡の無効化

デフォルトでは、Livewireのページネーターは現在のページをブラウザのURLのクエリ文字列に`?page=2`のように追跡します。

Livewireのページネーション機能を使いつつ、クエリ文字列による追跡を無効にしたい場合は、`WithoutUrlPagination`トレイトを使います。

```php
use Livewire\WithoutUrlPagination;
use Livewire\WithPagination;
use Livewire\Component;

class ShowPosts extends Component
{
    use WithPagination, WithoutUrlPagination; // [tl! highlight]

    // ...
}
```

これで、ページネーションは期待通りに動作しますが、現在のページはクエリ文字列に表示されなくなります。つまり、ページ変更時に現在のページが保持されなくなります。

## スクロール動作のカスタマイズ

デフォルトでは、Livewireのページネーターはページ変更後にページのトップにスクロールします。

この動作を無効にするには、`links()`メソッドの`scrollTo`パラメータに`false`を渡します。

```blade
{{ $posts->links(data: ['scrollTo' => false]) }}
```

または、`scrollTo`パラメータに任意のCSSセレクタを指定すると、Livewireはそのセレクタに一致する最寄りの要素を見つけて、各ナビゲーション後にそこにスクロールします。

```blade
{{ $posts->links(data: ['scrollTo' => '#paginated-posts']) }}
```

## ページのリセット

結果のソートやフィルタリングを行う際、ページ番号を`1`にリセットしたくなることがよくあります。

このために、Livewireはどこからでもページ番号をリセットできる`$this->resetPage()`メソッドを提供しています。

以下のコンポーネントは、検索フォームが送信された後にページをリセットする方法を示しています。

```php
<?php

namespace App\Livewire;

use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Post;

class SearchPosts extends Component
{
    use WithPagination;

    public $query = '';

    public function search()
    {
        $this->resetPage();
    }

    public function render()
    {
        return view('show-posts', [
            'posts' => Post::where('title', 'like', '%'.$this->query.'%')->paginate(10),
        ]);
    }
}
```

```blade
<div>
    <form wire:submit="search">
        <input type="text" wire:model="query">

        <button type="submit">Search posts</button>
    </form>

    <div>
        @foreach ($posts as $post)
            <!-- ... -->
        @endforeach
    </div>

    {{ $posts->links() }}
</div>
```

これで、ユーザーが結果のページ`5`にいて、「Search posts」を押してさらに結果をフィルタリングした場合、ページは`1`にリセットされます。

### 利用可能なページナビゲーションメソッド

`$this->resetPage()`に加えて、Livewireはコンポーネントからプログラム的にページ間を移動するための他の便利なメソッドも提供しています。

| メソッド        | 説明                                   |
|-----------------|-------------------------------------------|
| `$this->setPage($page)`    | ページネーターを特定のページ番号に設定 |
| `$this->resetPage()`    | ページを1にリセット |
| `$this->nextPage()`    | 次のページに移動 |
| `$this->previousPage()`    | 前のページに移動 |

## 複数のページネーター

LaravelとLivewireの両方がURLのクエリ文字列パラメータを使用して現在のページ番号を保存および追跡するため、1つのページに複数のページネーターがある場合は、それぞれに異なる名前を付けることが重要です。

問題をより明確に示すために、以下の`ShowClients`コンポーネントを考えてみましょう。

```php
use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Client;

class ShowClients extends Component
{
    use WithPagination;

    public function render()
    {
        return view('show-clients', [
            'clients' => Client::paginate(10),
        ]);
    }
}
```

上記のコンポーネントには、ページネーションされた*クライアント*のセットがあります。ユーザーがこの結果セットのページ`2`に移動すると、URLは次のようになります。

```
http://application.test/?page=2
```

ページに`ShowInvoices`コンポーネントがあり、これもページネーションを使用しているとします。2番目のページネーターの現在のページを独立して追跡するには、次のようにページネームを指定する必要があります。

```php
use Livewire\WithPagination;
use Livewire\Component;
use App\Models\Invoices;

class ShowInvoices extends Component
{
    use WithPagination;

    public function render()
    {
        return view('show-invoices', [
            'invoices' => Invoice::paginate(10, pageName: 'invoices-page'),
        ]);
    }
}
```

これで、`paginate`メソッドに追加された`pageName`パラメータのおかげで、ユーザーが*請求書*のページ`2`を訪れると、URLには次のように表示されます。

```
https://application.test/customers?page=2&invoices-page=2
```

名前付きページネーターでLivewireのページナビゲーションメソッドを使用する場合は、追加のパラメータとしてページ名を指定する必要があります。

```php
$this->setPage(2, pageName: 'invoices-page');

$this->resetPage(pageName: 'invoices-page');

$this->nextPage(pageName: 'invoices-page');

$this->previousPage(pageName: 'invoices-page');
```

## ページ更新時のフック

Livewireを使うと、ページが更新される前後にコードを実行できます。これは、コンポーネント内に次のいずれかのメソッドを定義することで行います。

```php
use Livewire\WithPagination;

class ShowPosts extends Component
{
    use WithPagination;

    public function updatingPage($page)
    {
        // ページが更新される前にこのコンポーネント内で実行される...
    }

    public function updatedPage($page)
    {
        // ページが更新された後にこのコンポーネント内で実行される...
    }

    public function render()
    {
        return view('show-posts', [
            'posts' => Post::paginate(10),
        ]);
    }
}
```

### 名前付きページネーターフック

前述のフックはデフォルトのページネーターにのみ適用されます。名前付きページネーターを使用している場合は、ページネーターの名前を使用してメソッドを定義する必要があります。

たとえば、`invoices-page`という名前のページネーターのフックは次のようになります。

```php
public function updatingInvoicesPage($page)
{
    //
}
```

### 一般的なページネーターフック

フックメソッド名にページネーター名を参照したくない場合は、より一般的な代替手段を使用し、フックメソッドに`$pageName`を第二引数として受け取ることができます。

```php
public function updatingPaginators($page, $pageName)
{
    // ページが更新される前にこのコンポーネント内で実行される...
}

public function updatedPaginators($page, $pageName)
{
    // ページが更新された後にこのコンポーネント内で実行される...
}
```

## シンプルテーマの使用

Laravelの`simplePaginate()`メソッドを`paginate()`の代わりに使用すると、速度とシンプルさが向上します。

このメソッドを使用して結果をページネーションする場合、ユーザーには各ページ番号の個別リンクの代わりに*次へ*と*前へ*のナビゲーションリンクのみが表示されます。

```php
public function render()
{
    return view('show-posts', [
        'posts' => Post::simplePaginate(10),
    ]);
}
```

シンプルページネーションの詳細については、[Laravelの「simplePaginator」ドキュメント](https://laravel.com/docs/pagination#simple-pagination)を参照してください。

## カーソルページネーションの使用

Livewireは、Laravelのカーソルページネーションもサポートしています。これは、大規模なデータセットに便利なより高速なページネーションメソッドです。

```php
public function render()
{
    return view('show-posts', [
        'posts' => Post::cursorPaginate(10),
    ]);
}
```

`paginate()`や`simplePaginate()`の代わりに`cursorPaginate()`を使用すると、アプリケーションのURLのクエリ文字列には、標準のページ番号の代わりにエンコードされた*カーソル*が保存されます。例えば：

```
https://example.com/posts?cursor=eyJpZCI6MTUsIl9wb2ludHNUb05leHRJdGVtcyI6dHJ1ZX0
```

カーソルページネーションの詳細については、[Laravelのカーソルページネーションドキュメント](https://laravel.com/docs/pagination#cursor-pagination)を参照してください。

## Tailwindの代わりにBootstrapを使用

アプリケーションのCSSフレームワークとして[Bootstrap](https://getbootstrap.com/)を使用している場合、Livewireを構成してデフォルトのTailwindビューの代わりにBootstrapスタイルのページネーションビューを使用できます。

これを行うには、アプリケーションの`config/livewire.php`ファイルで`pagination_theme`構成値を設定します。

```php
'pagination_theme' => 'bootstrap',
```

> [!info] Livewireの構成ファイルの公開
> ページネーションテーマをカスタマイズする前に、次のコマンドを実行してLivewireの構成ファイルをアプリケーションの`/config`ディレクトリに公開する必要があります。
> ```shell
> php artisan livewire:publish --config
> ```

## デフォルトのページネーションビューの変更

Livewireのページネーションビューをアプリケーションのスタイルに合わせて変更したい場合は、次のコマンドを使用してそれらを*公開*できます。

```shell
php artisan livewire:publish --pagination
```

このコマンドを実行すると、次の4つのファイルが`resources/views/vendor/livewire`ディレクトリに挿入されます。

| ビューファイル名        | 説明                                   |
|-----------------|-------------------------------------------|
| `tailwind.blade.php`    | 標準のTailwindページネーションテーマ |
| `tailwind-simple.blade.php`    | *シンプル*なTailwindページネーションテーマ |
| `bootstrap.blade.php`    | 標準のBootstrapページネーションテーマ |
| `bootstrap-simple.blade.php`    | *シンプル*なBootstrapページネーションテーマ |

ファイルが公開されると、それらを完全に制御できます。テンプレート内でページネーションリンクをレンダリングする際に、Livewireは自分の代わりにこれらのファイルを使用します。

## カスタムページネーションビューの使用

Livewireのページネーションビューを完全にバイパスしたい場合は、次の2つの方法のいずれかで独自のビューをレンダリングできます。

1. Bladeビュー内の`->links()`メソッド
2. コンポーネント内の`paginationView()`または`paginationSimpleView()`メソッド

### `->links()`経由

最初のアプローチは、単にカスタムページネーションBladeビューの名前を`->links()`メソッドに直接渡すことです。

```blade
{{ $posts->links('custom-pagination-links') }}
```

ページネーションリンクをレンダリングする際に、Livewireは`resources/views/custom-pagination-links.blade.php`にビューを探します。

### `paginationView()`または`paginationSimpleView()`経由

2番目のアプローチは、コンポーネント内に`paginationView`または`paginationSimpleView`メソッドを宣言し、使用したいビューの名前を返すことです。

```php
public function paginationView()
{
    return 'custom-pagination-links-view';
}

public function paginationSimpleView()
{
    return 'custom-simple-pagination-links-view';
}
```

### サンプルページネーションビュー

以下は、参考のためのスタイルなしのシンプルなLivewireページネーションビューのサンプルです。

このように、ボタンに`wire:click="nextPage"`を追加することで、テンプレート内でLivewireのページナビゲーションヘルパー`$this->nextPage()`を直接使用できます。

```blade
<div>
    @if ($paginator->hasPages())
        <nav role="navigation" aria-label="Pagination Navigation">
            <span>
                @if ($paginator->onFirstPage())
                    <span>Previous</span>
                @else
                    <button wire:click="previousPage" wire:loading.attr="disabled" rel="prev">Previous</button>
                @endif
            </span>

            <span>
                @if ($paginator->onLastPage())
                    <span>Next</span>
                @else
                    <button wire:click="nextPage" wire:loading.attr="disabled" rel="next">Next</button>
                @endif
            </span>
        </nav>
    @endif
</div>
```

