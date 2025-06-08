---
title: セキュリティ
---

Livewireアプリケーションのセキュリティを確保し、脆弱性を生まないようにすることは非常に重要です。Livewireには多くのケースをカバーする内部的なセキュリティ機能がありますが、コンポーネントの実装によっては開発者側で追加の対策が必要な場合もあります。

## アクションパラメータの認可

Livewireのアクションは非常に強力ですが、アクションに渡されるパラメータはクライアント側で自由に変更できるため、「信頼できないユーザー入力」として扱う必要があります。

Livewireで最もよくあるセキュリティ上の落とし穴は、アクション呼び出し時のパラメータを検証・認可せずにデータベースへ反映してしまうことです。

以下は認可処理がないために危険な例です。

```php
<?php

use App\Models\Post;
use Livewire\Component;

class ShowPost extends Component
{
    // ...

    public function delete($id)
    {
        // INSECURE!

        $post = Post::find($id);

        $post->delete();
    }
}
```

```html
<button wire:click="delete({{ $post->id }})">Delete Post</button>
```

上記の例が危険なのは、`wire:click="delete(...)"`の値をブラウザ上で書き換え、悪意のあるユーザーが任意の投稿IDを渡せてしまうためです。

このようなアクションパラメータ（この例では`$id`）は、他のブラウザ入力と同様に「信頼できない値」として扱うべきです。

このアプリケーションを安全に保ち、他人の投稿を削除できないようにするには、`delete()`アクション内で認可処理を追加する必要があります。

まず、以下のコマンドでPostモデル用の[Laravelポリシー](https://laravel.com/docs/authorization#creating-policies)を作成します。

```bash
php artisan make:policy PostPolicy --model=Post
```

上記コマンドで`app/Policies/PostPolicy.php`が作成されるので、`delete`メソッドを次のように実装します。

```php
<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;

class PostPolicy
{
    /**
     * Determine if the given post can be deleted by the user.
     */
    public function delete(?User $user, Post $post): bool
    {
        return $user?->id === $post->user_id;
    }
}
```

次に、Livewireコンポーネント内で`$this->authorize()`メソッドを使い、ユーザーが投稿の所有者かどうかを確認します。

```php
public function delete($id)
{
    $post = Post::find($id);

    // ユーザーが所有者でない場合はAuthorizationExceptionがスローされます
    // highlight-next-line
    $this->authorize('delete', $post);

    $post->delete();
}
```

詳しくは：
* [Laravel Gates](https://laravel.com/docs/authorization#gates)
* [Laravel Policies](https://laravel.com/docs/authorization#creating-policies)

## パブリックプロパティの認可

アクションパラメータと同様に、Livewireのパブリックプロパティも「信頼できないユーザー入力」として扱うべきです。

先ほどの削除例を、別の形で危険に実装した例を見てみましょう。

```php
<?php

use App\Models\Post;
use Livewire\Component;

class ShowPost extends Component
{
    public $postId;

    public function mount($postId)
    {
        $this->postId = $postId;
    }

    public function delete()
    {
        // INSECURE!

        $post = Post::find($this->postId);

        $post->delete();
    }
}
```

```html
<button wire:click="delete">Delete Post</button>
```

この例では、`delete`メソッドの引数としてではなく、コンポーネントのパブリックプロパティ`$postId`に値を保持しています。

この場合、悪意のあるユーザーが次のような要素をページに追加することで、`$postId`の値を自由に変更できてしまいます。

```html
<input type="text" wire:model="postId">
```

このままでは、認可処理がないため、ユーザーは自分以外の投稿も削除できてしまいます。

このリスクを防ぐには、次の2つの方法があります。

### モデルプロパティを使う

Livewireでは、パブリックプロパティにモデル（Eloquentモデル）を直接保持した場合、IDの改ざんができないようになっています。

たとえば、`$postId`の代わりに`$post`モデルをプロパティとして持たせると安全です。

```php
<?php

use App\Models\Post;
use Livewire\Component;

class ShowPost extends Component
{
    public Post $post;

    public function mount($postId)
    {
        $this->post = Post::find($postId);
    }

    public function delete()
    {
        $this->post->delete();
    }
}
```

```html
<button wire:click="delete">Delete Post</button>
```

この場合、`$post`プロパティは外部から改ざんできないため、悪意のあるユーザーによる不正な削除を防げます。

### プロパティのロック

プロパティの値が意図しないものに変更されるのを防ぐには、[ロック属性](https://livewire.laravel.com/docs/locked)を使う方法もあります。`#[Locked]`属性を付与すると、ユーザーが値を改ざんしようとした際にエラーが発生します。

ただし、Locked属性を付けたプロパティも、バックエンド側のLivewire関数内では値の変更が可能なため、やはり「信頼できない入力」を直接プロパティに代入しないよう注意が必要です。

```php
<?php

use App\Models\Post;
use Livewire\Component;
use Livewire\Attributes\Locked;

class ShowPost extends Component
{
    // highlight-next-line
    #[Locked]
    public $postId;

    public function mount($postId)
    {
        $this->postId = $postId;
    }

    public function delete()
    {
        $post = Post::find($this->postId);

        $post->delete();
    }
}
```

### プロパティの認可

モデルプロパティを使わない場合は、`delete`アクション内で手動で認可処理を行うこともできます。

```php
<?php

use App\Models\Post;
use Livewire\Component;

class ShowPost extends Component
{
    public $postId;

    public function mount($postId)
    {
        $this->postId = $postId;
    }

    public function delete()
    {
        $post = Post::find($this->postId);

        // highlight-next-line
        $this->authorize('delete', $post);

        $post->delete();
    }
}
```

```html
<button wire:click="delete">Delete Post</button>
```

この場合も、`$postId`の値は改ざん可能ですが、`delete`アクション内で`$this->authorize()`を呼び出すことで、所有者以外の削除を防げます。

詳しくは：
* [Laravel Gates](https://laravel.com/docs/authorization#gates)
* [Laravel Policies](https://laravel.com/docs/authorization#creating-policies)

## ミドルウェア

Livewireコンポーネントが、ルートレベルで[認可ミドルウェア](https://laravel.com/docs/authorization#via-middleware)を適用したページで読み込まれる場合：

```php
Route::get('/post/{post}', App\Livewire\UpdatePost::class)
    // highlight-next-line
    ->middleware('can:update,post');
```

Livewireは、その後のネットワークリクエストでもミドルウェアを再適用します。これをLivewireでは「永続的ミドルウェア」と呼びます。

永続的ミドルウェアは、初回ページロード後に認可ルールやユーザー権限が変更された場合でも、セキュリティを維持します。

より詳しいシナリオ例を見てみましょう。

```php
Route::get('/post/{post}', App\Livewire\UpdatePost::class)
    // highlight-next-line
    ->middleware('can:update,post');
```

```php
<?php

use App\Models\Post;
use Livewire\Component;
use Livewire\Attributes\Validate;

class UpdatePost extends Component
{
    public Post $post;

    #[Validate('required|min:5')]
    public $title = '';

    public $content = '';

    public function mount()
    {
        $this->title = $this->post->title;
        $this->content = $this->post->content;
    }

    public function update()
    {
        $this->post->update([
            'title' => $this->title,
            'content' => $this->content,
        ]);
    }
}
```

ご覧の通り、`can:update,post`ミドルウェアがルートレベルで適用されています。つまり、投稿を更新する権限がないユーザーはページ自体を閲覧できません。

しかし、次のようなシナリオを考えてみてください：
* ページを読み込む
* ページ読み込み後に更新権限を失う
* 権限を失った状態で投稿の更新を試みる

Livewireでページが一度正常に読み込まれた場合、「その後の投稿更新リクエスト時にも`can:update,post`ミドルウェアは再度適用されるのか？ それとも認可されていないユーザーでも更新できてしまうのか？」と疑問に思うかもしれません。

Livewireには、元のエンドポイントのミドルウェアを内部的に再適用する仕組みがあるため、このような場合でもセキュリティが保たれます。

### 永続的ミドルウェアの設定

デフォルトで、Livewireは以下のミドルウェアをネットワークリクエスト間で永続化します。

```php
\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
\Laravel\Jetstream\Http\Middleware\AuthenticateSession::class,
\Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
\Illuminate\Routing\Middleware\SubstituteBindings::class,
\App\Http\Middleware\RedirectIfAuthenticated::class,
\Illuminate\Auth\Middleware\Authenticate::class,
\Illuminate\Auth\Middleware\Authorize::class,
```

初回ページロード時にこれらのミドルウェアが適用されていれば、以降のLivewireリクエストでも自動的に再適用されます。

独自のミドルウェアを永続化したい場合は、[サービスプロバイダ](https://laravel.com/docs/providers#main-content)で次のように追加します。

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Livewire;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Livewire::addPersistentMiddleware([ // [tl! highlight:2]
            App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    }
}
```

これにより、`EnsureUserHasRole`ミドルウェアが適用されたページでLivewireコンポーネントを使うと、以降のリクエストでも同じミドルウェアが再適用されます。

:::warning ミドルウェア引数はサポートされていません
Livewireの永続的ミドルウェア定義では、引数付きのミドルウェアは利用できません。

```php
// NG例
Livewire::addPersistentMiddleware(AuthorizeResource::class.':admin');

// OK例
Livewire::addPersistentMiddleware(AuthorizeResource::class);
```
:::

### Livewire全体へのミドルウェア適用

すべてのLivewireリクエストに特定のミドルウェアを適用したい場合は、Livewireのアップデートルートを独自に登録し、任意のミドルウェアを付与できます。

```php
Livewire::setUpdateRoute(function ($handle) {
    return Route::post('/livewire/update', $handle)
        ->middleware(App\Http\Middleware\LocalizeViewPaths::class);
});
```

これにより、LivewireのAJAXリクエストは上記エンドポイントを経由し、`LocalizeViewPaths`ミドルウェアが適用されます。

詳しくは[インストールページのアップデートエンドポイントのカスタマイズ](https://livewire.laravel.com/docs/installation#configuring-livewires-update-endpoint)を参照してください。

## スナップショットのチェックサム

Livewireでは、各リクエストごとにコンポーネントのスナップショット（状態）が作成され、ブラウザに送信されます。このスナップショットは、次回のリクエスト時にコンポーネントを再構築するために使われます。

[Livewireのスナップショットについて詳しくはHydrationのドキュメントを参照](https://livewire.laravel.com/docs/hydration#the-snapshot)

ブラウザ上でリクエストが改ざんされる可能性があるため、Livewireは各スナップショットに「チェックサム」を付与します。

次回のリクエスト時にこのチェックサムを検証し、スナップショットが改ざんされていないか確認します。

もしチェックサムが一致しない場合、Livewireは`CorruptComponentPayloadException`をスローし、リクエストを拒否します。

これにより、悪意のある改ざんによって本来許可されていない操作やコード実行が行われるのを防ぎます。

:::warning
公開メソッドの制限
Livewireコンポーネントのpublicメソッドはすべてクライアントから呼び出せるため、意図しないメソッドはprotected/privateにしましょう。
:::

:::info
CSRF対策
Livewireは自動的にCSRFトークンを送信しますが、API連携時などは追加の対策が必要な場合があります。
:::
