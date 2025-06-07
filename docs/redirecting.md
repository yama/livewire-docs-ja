---
title: リダイレクト
---

ユーザーがフォーム送信などの操作を行った後、別のページへリダイレクトしたい場合があります。

Livewireのリクエストは通常のブラウザによるページ遷移とは異なるため、標準的なHTTPリダイレクトは機能しません。その代わり、JavaScript経由でリダイレクトを実現する必要があります。Livewireでは、コンポーネント内で`$this->redirect()`ヘルパーメソッドを使うことで簡単にリダイレクトが可能です。内部的には、Livewireがフロントエンド側でリダイレクト処理を行います。

また、[Laravel標準のリダイレクト機能](https://laravel.com/docs/responses#redirects)もコンポーネント内で利用できます。

## 基本的な使い方

以下は、投稿作成フォーム送信後に別ページへリダイレクトする`CreatePost`コンポーネントの例です。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
	public $title = '';

    public $content = '';

    public function save()
    {
		Post::create([
			'title' => $this->title,
			'content' => $this->content,
		]);

		$this->redirect('/posts'); // [tl! highlight]
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

このように、`save`アクションが実行されると同時に`/posts`へリダイレクトされます。Livewireはこのレスポンスを受け取ると、フロントエンドで自動的に指定したURLへ遷移します。

## ルート名でリダイレクト

ページのルート名を使ってリダイレクトしたい場合は、`redirectRoute`メソッドを利用できます。

たとえば、`'profile'`という名前のルートがある場合：

```php
    Route::get('/user/profile', function () {
        // ...
    })->name('profile');
```

このページへリダイレクトするには、次のように記述します。

```php
    $this->redirectRoute('profile');
```

ルートにパラメータを渡したい場合は、`redirectRoute`の第2引数に配列で指定できます。

```php
    $this->redirectRoute('profile', ['id' => 1]);
```

## 元のページへリダイレクト

ユーザーを直前のページに戻したい場合は、`redirectIntended`を使います。第1引数にデフォルトのURLを指定でき、前のページ情報がない場合はそのURLに遷移します。

```php
    $this->redirectIntended('/default/url');
```

## フルページコンポーネントへのリダイレクト

LivewireはLaravelのリダイレクト機能を利用しているため、Laravelアプリケーションで利用できるすべてのリダイレクト手法が使えます。

たとえば、Livewireコンポーネントをルートにフルページで割り当てている場合：

```php
use App\Livewire\ShowPosts;

Route::get('/posts', ShowPosts::class);
```

このコンポーネントへリダイレクトしたい場合は、`redirect()`メソッドにコンポーネント名を渡します。

```php
public function save()
{
    // ...

    $this->redirect(ShowPosts::class);
}
```

## フラッシュメッセージ

Laravelのリダイレクト機能と同様に、Livewireでも[セッションのフラッシュデータ](https://laravel.com/docs/session#flash-data)が利用できます。

リダイレクト時にフラッシュデータを渡すには、Laravelの`session()->flash()`メソッドを使います。

```php
use Livewire\Component;

class UpdatePost extends Component
{
    // ...

    public function update()
    {
        // ...

        session()->flash('status', 'Post successfully updated.');

        $this->redirect('/posts');
    }
}
```

リダイレクト先のページで以下のBladeスニペットがあれば、ユーザーは「Post successfully updated.」というメッセージを確認できます。

```blade
@if (session('status'))
    <div class="alert alert-success">
        {{ session('status') }}
    </div>
@endif
```
