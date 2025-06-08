---
title: テスト
---

Livewireコンポーネントのテストファイルを生成するには、`make:livewire`コマンドに`--test`フラグを付けて実行します：

```shell
php artisan make:livewire create-post --test
```

このコマンドを実行すると、コンポーネント本体に加えて、`tests/Feature/Livewire/CreatePostTest.php`というテストファイルも生成されます。

[Pest PHP](https://pestphp.com/)によるテストを作成したい場合は、`--pest`オプションを付けてください：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_renders_successfully()
    {
        Livewire::test(CreatePost::class)
            ->assertStatus(200);
    }
}
```

もちろん、これらのファイルは手動で作成することもできますし、既存のLaravelテスト内でLivewireのテストユーティリティを利用することも可能です。

より詳しく知りたい場合は、[Laravelのテスト機能](https://laravel.com/docs/testing)もご覧ください。

## ページにコンポーネントが含まれているかをテストする

最もシンプルなLivewireのテストは、特定のエンドポイントに指定したLivewireコンポーネントが正しく含まれてレンダリングされているかを検証することです。

Livewireは`assertSeeLivewire()`メソッドを提供しており、Laravelのどのテストからでも利用できます：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_component_exists_on_the_page()
    {
        $this->get('/posts/create')
            ->assertSeeLivewire(CreatePost::class);
    }
}
```

:::tip これは「スモークテスト」と呼ばれます
スモークテストは、アプリケーションに致命的な問題がないことを広く確認するテストです。一見するとあまり重要でないように思えるかもしれませんが、メンテナンスコストが低く、アプリケーションが大きなエラーなく動作するという基本的な信頼性を担保できるため有用です。
:::

## ビューのテスト

Livewireは、コンポーネントのレンダリング結果に特定のテキストが含まれているかを検証する`assertSee()`メソッドも提供しています。

以下は、データベース内の全ての投稿がページ上に表示されていることを`assertSee()`で確認する例です：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\ShowPosts;
use Livewire\Livewire;
use App\Models\Post;
use Tests\TestCase;

class ShowPostsTest extends TestCase
{
    public function test_displays_posts()
    {
        Post::factory()->make(['title' => 'On bathing well']);
        Post::factory()->make(['title' => 'There\'s no time like bathtime']);

        Livewire::test(ShowPosts::class)
            ->assertSee('On bathing well')
            ->assertSee('There\'s no time like bathtime');
    }
}
```

### ビューに渡されたデータの検証

レンダリング結果だけでなく、ビューに渡されるデータ自体をテストしたい場合もあります。

下記は、先ほどのテストをレンダリング結果ではなく、ビューに渡されたデータで検証する例です：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\ShowPosts;
use Livewire\Livewire;
use App\Models\Post;
use Tests\TestCase;

class ShowPostsTest extends TestCase
{
    public function test_displays_all_posts()
    {
        Post::factory()->make(['title' => 'On bathing well']);
        Post::factory()->make(['title' => 'The bathtub is my sanctuary']);

        Livewire::test(ShowPosts::class)
            ->assertViewHas('posts', function ($posts) {
                return count($posts) == 2;
            });
    }
}
```

このように、`assertViewHas()`を使うことで、指定したデータに対して柔軟なアサーションが可能です。

単純に特定の値であることを検証したい場合は、`assertViewHas()`の第2引数に値を直接渡すこともできます。

例えば、ビューに`$postCount`という変数が渡されている場合、次のように値を検証できます：

```php
$this->assertViewHas('postCount', 3)
```

## 認証ユーザーの設定

多くのWebアプリケーションでは、利用前にユーザーのログインが必要です。テストのたびにダミーユーザーで手動認証する代わりに、Livewireの`actingAs()`メソッドを使うことができます。

下記は、複数ユーザーが投稿を持っている状況で、認証ユーザーには自分の投稿だけが表示されることをテストする例です：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\ShowPosts;
use Livewire\Livewire;
use App\Models\User;
use App\Models\Post;
use Tests\TestCase;

class ShowPostsTest extends TestCase
{
    public function test_user_only_sees_their_own_posts()
    {
        $user = User::factory()
            ->has(Post::factory()->count(3))
            ->create();

        $stranger = User::factory()
            ->has(Post::factory()->count(2))
            ->create();

        Livewire::actingAs($user)
            ->test(ShowPosts::class)
            ->assertViewHas('posts', function ($posts) {
                return count($posts) == 3;
            });
    }
}
```

## プロパティのテスト

Livewireは、コンポーネント内のプロパティを直接セット・検証するための便利なテストユーティリティも提供しています。

通常、`wire:model`付きのフォーム入力を通じてプロパティが更新されますが、テストでは実際のブラウザ操作を行わないため、`set()`メソッドで直接プロパティを更新できます。

以下は、`CreatePost`コンポーネントの`$title`プロパティを`set()`で更新する例です：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_can_set_title()
    {
        Livewire::test(CreatePost::class)
            ->set('title', 'Confessions of a serial soaker')
            ->assertSet('title', 'Confessions of a serial soaker');
    }
}
```

### プロパティの初期化

Livewireコンポーネントは、親コンポーネントやルートパラメータからデータを受け取ることがよくあります。Livewireのテストでは、`Livewire::test()`メソッドの第2引数でデータを手動で渡すことができます：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\UpdatePost;
use Livewire\Livewire;
use App\Models\Post;
use Tests\TestCase;

class UpdatePostTest extends TestCase
{
    public function test_title_field_is_populated()
    {
        $post = Post::factory()->make([
            'title' => 'Top ten bath bombs',
        ]);

        Livewire::test(UpdatePost::class, ['post' => $post])
            ->assertSet('title', 'Top ten bath bombs');
    }
}
```

テスト対象の`UpdatePost`コンポーネントは、`mount()`メソッド経由で`$post`を受け取ります。実際の`UpdatePost`のソースは次の通りです：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class UpdatePost extends Component
{
	public Post $post;

    public $title = '';

	public function mount(Post $post)
	{
		$this->post = $post;

		$this->title = $post->title;
	}

	// ...
}
```

### URLパラメータの設定

LivewireコンポーネントがページのURLクエリパラメータに依存している場合、`withQueryParams()`メソッドでテスト時に手動でパラメータを設定できます。

下記は、[LivewireのURL機能](/docs/url)を使って現在の検索クエリをクエリ文字列で管理する`SearchPosts`コンポーネントの例です：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Url;
use App\Models\Post;

class SearchPosts extends Component
{
    // highlight-next-line
    #[Url]
    public $search = '';

    public function render()
    {
        return view('livewire.search-posts', [
            'posts' => Post::search($this->search)->get(),
        ]);
    }
}
```

上記の`$search`プロパティは、Livewireの`#[Url]`属性を使うことで、その値がURLに保存されることを示しています。

このコンポーネントが特定のクエリパラメータを必要とする場合、テストでは次のように手動で設定できます：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\SearchPosts;
use Livewire\Livewire;
use App\Models\Post;
use Tests\TestCase;

class SearchPostsTest extends TestCase
{
    public function test_can_search_posts_via_url_query_string()
    {
        Post::factory()->create(['title' => 'Testing the first water-proof hair dryer']);
        Post::factory()->create(['title' => 'Rubber duckies that actually float']);

        Livewire::withQueryParams(['search' => 'hair'])
            ->test(SearchPosts::class)
            ->assertSee('Testing the first')
            ->assertDontSee('Rubber duckies');
    }
}
```

### クッキーの設定

Livewireコンポーネントがクッキーに依存している場合、`withCookie()`または`withCookies()`メソッドでテスト時に手動でクッキーを設定できます。

下記は、マウント時にクッキーからディスカウントトークンを読み込む`Cart`コンポーネントの例です：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Url;
use App\Models\Post;

class Cart extends Component
{
    public $discountToken;

    public mount()
    {
        $this->discountToken = request()->cookie('discountToken');
    }
}
```

上記の`$discountToken`プロパティは、リクエストのクッキーから値を取得しています。

このコンポーネントが特定のクッキーを必要とする場合、テストでは次のように手動で設定できます：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\Cart;
use Livewire\Livewire;
use Tests\TestCase;

class CartTest extends TestCase
{
    public function test_can_load_discount_token_from_a_cookie()
    {
        Livewire::withCookies(['discountToken' => 'CALEB2023'])
            ->test(Cart::class)
            ->assertSet('discountToken', 'CALEB2023');
    }
}
```

## アクションの呼び出し

Livewireのアクションは通常、`wire:click`のようにフロントエンドから呼び出されます。

Livewireコンポーネントのテストでは実際のブラウザを使用しないため、`call()`メソッドでアクションをトリガーできます。

以下は、`call()`メソッドを使用して`save()`アクションをトリガーする`CreatePost`コンポーネントの例です：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use App\Models\Post;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_can_create_post()
    {
        $this->assertEquals(0, Post::count());

        Livewire::test(CreatePost::class)
            ->set('title', 'Wrinkly fingers? Try this one weird trick')
            ->set('content', '...')
            ->call('save');

        $this->assertEquals(1, Post::count());
    }
}
```

上記のテストでは、`save()`を呼び出すことで新しい投稿がデータベースに作成されることを検証しています。

アクションにパラメータを渡すことも可能で、その場合は`call()`メソッドに追加のパラメータを渡します：

```php
->call('deletePost', $postId);
```

### バリデーション

バリデーションエラーが発生したかをテストするには、Livewireの`assertHasErrors()`メソッドを使用します：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_title_field_is_required()
    {
        Livewire::test(CreatePost::class)
            ->set('title', '')
            ->call('save')
            ->assertHasErrors('title');
    }
}
```

特定のバリデーションルールが失敗したかをテストしたい場合は、ルールの配列を渡します：

```php
$this->assertHasErrors(['title' => ['required']]);
```

または、バリデーションメッセージが存在することを検証することもできます：

```php
$this->assertHasErrors(['title' => ['The title field is required.']]);
```

### 認可

信頼できない入力に基づくアクションの認可は、Livewireコンポーネント内で[必須](/docs/properties#authorizing-the-input)です。Livewireは、認証または認可チェックが失敗したことを確認するために`assertUnauthorized()`および`assertForbidden()`メソッドを提供しています：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\UpdatePost;
use Livewire\Livewire;
use App\Models\User;
use App\Models\Post;
use Tests\TestCase;

class UpdatePostTest extends TestCase
{
    public function test_cant_update_another_users_post()
    {
        $user = User::factory()->create();
        $stranger = User::factory()->create();

        $post = Post::factory()->for($stranger)->create();

        Livewire::actingAs($user)
            ->test(UpdatePost::class, ['post' => $post])
            ->set('title', 'Living the lavender life')
            ->call('save')
            ->assertUnauthorized();

        Livewire::actingAs($user)
            ->test(UpdatePost::class, ['post' => $post])
            ->set('title', 'Living the lavender life')
            ->call('save')
            ->assertForbidden();
    }
}
```

また、アクションによってトリガーされた明示的なステータスコードをテストすることもできます。例えば、認証エラーの場合は`assertStatus(401)`、権限エラーの場合は`assertStatus(403)`のように記述します。

```php
->assertStatus(401); // Unauthorized
->assertStatus(403); // Forbidden
```

### リダイレクト

Livewireアクションがリダイレクトを行ったかをテストするには、`assertRedirect()`メソッドを使用します：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_redirected_to_all_posts_after_creating_a_post()
    {
        Livewire::test(CreatePost::class)
            ->set('title', 'Using a loofah doesn\'t make you aloof...ugh')
            ->set('content', '...')
            ->call('save')
            ->assertRedirect('/posts');
    }
}
```

さらに、ユーザーがハードコーディングされたURLではなく、特定のページコンポーネントにリダイレクトされたことを確認することもできます。

```php
->assertRedirect(CreatePost::class);
```

### イベント

コンポーネント内からイベントがディスパッチされたことを確認するには、`->assertDispatched()`メソッドを使用します：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_creating_a_post_dispatches_event()
    {
        Livewire::test(CreatePost::class)
            ->set('title', 'Top 100 bubble bath brands')
            ->set('content', '...')
            ->call('save')
            ->assertDispatched('post-created');
    }
}
```

イベントがパラメータ付きでディスパッチされる場合、その値を検証することも役立ちます。例えば、`ShowPosts`コンポーネントが`banner-message`イベントを`message`パラメータ付きでディスパッチする場合を考えてみましょう：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\PostCountBadge;
use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class PostCountBadgeTest extends TestCase
{
    public function test_post_count_is_updated_when_event_is_dispatched()
    {
        $badge = Livewire::test(PostCountBadge::class)
            ->assertSee("0");

        Livewire::test(CreatePost::class)
            ->set('title', 'Tear-free: the greatest lie ever told')
            ->set('content', '...')
            ->call('save')
            ->assertDispatched('post-created');

        $badge->dispatch('post-created')
            ->assertSee("1");
    }
}
```

イベントが1つ以上のパラメータ付きでディスパッチされたことを検証したい場合もあります。ここでは、`ShowPosts`コンポーネントが`banner-message`というイベントを`message`パラメータ付きでディスパッチする例を見てみましょう：

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\ShowPosts;
use Livewire\Livewire;
use Tests\TestCase;

class ShowPostsTest extends TestCase
{
    public function test_notification_is_dispatched_when_deleting_a_post()
    {
        Livewire::test(ShowPosts::class)
            ->call('delete', postId: 3)
            ->assertDispatched('notify',
                message: 'The post was deleted',
            );
    }
}
```

コンポーネントがイベントをディスパッチする際に、パラメータの値を条件付きで検証する必要がある場合、`assertDispatched`メソッドの第2引数にクロージャを渡すことができます。このクロージャは、最初の引数にイベント名、2番目の引数にパラメータを含む配列を受け取り、真偽値を返す必要があります。

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\ShowPosts;
use Livewire\Livewire;
use Tests\TestCase;

class ShowPostsTest extends TestCase
{
    public function test_notification_is_dispatched_when_deleting_a_post()
    {
        Livewire::test(ShowPosts::class)
            ->call('delete', postId: 3)
            ->assertDispatched('notify', function($eventName, $params) {
                return ($params['message'] ?? '') === 'The post was deleted';
            })
    }
}
```

## 利用可能な全テストユーティリティ

Livewireは多くのテストユーティリティを提供しています。以下は、各テストメソッドの簡単な説明と共に、利用可能な全てのテストユーティリティの包括的なリストです：

### セットアップメソッド
| メソッド                                                  | 説明                                                                                                      |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `Livewire::test(CreatePost::class)`                      | `CreatePost`コンポーネントのテスト |
| `Livewire::test(UpdatePost::class, ['post' => $post])`                      | `UpdatePost`コンポーネントを`post`パラメータ付きでテスト（`mount()`メソッドを通じて受け取ることを想定） |
| `Livewire::actingAs($user)`                      | 指定したユーザーをセッションの認証ユーザーとして設定 |
| `Livewire::withQueryParams(['search' => '...'])`                      | テストの`search`URLクエリパラメータを指定した値（例：`?search=...`）に設定します。通常は、Livewireの[`#[Url]`属性](/docs/url)を使用するプロパティのコンテキスト内で使用されます |
| `Livewire::withCookie('color', 'blue')`                      | テストの`color`クッキーを指定した値（`blue`）に設定 |
| `Livewire::withCookies(['color' => 'blue', 'name' => 'Taylor])`                      | テストの`color`および`name`クッキーを指定した値（`blue`、`Taylor`）に設定 |
| `Livewire::withHeaders(['X-COLOR' => 'blue', 'X-NAME' => 'Taylor])`                      | テストの`X-COLOR`および`X-NAME`ヘッダーを指定した値（`blue`、`Taylor`）に設定 |
| `Livewire::withoutLazyLoading()`                      | このテストおよびすべての子コンポーネントでレイジーロードを無効にします。 |


### コンポーネントとのインタラクション
| メソッド                                                  | 説明                                                                                                      |
|---------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `set('title', '...')`                      | `title`プロパティを指定した値に設定 |
| `set(['title' => '...', ...])`                      | 複数のコンポーネントプロパティを連想配列を使用して設定 |
| `toggle('sortAsc')`                      | `sortAsc`プロパティを`true`と`false`の間でトグル |
| `call('save')`                      | `save`アクション/メソッドを呼び出す |
| `call('remove', $post->id)`                      | `remove`メソッドを呼び出し、最初のパラメータとして`$post->id`を渡す（追加のパラメータも受け入れます） |
| `refresh()`                      | コンポーネントの再レンダリングをトリガー |
| `dispatch('post-created')`                      | コンポーネントから`post-created`イベントをディスパッチ |
| `dispatch('post-created', postId: $post->id)`                      | `$post->id`を追加のパラメータとして持つ`post-created`イベントをディスパッチ |

### アサーション
| メソッド                                                | 説明                                                                                                                                                                          |
|-------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `assertSet('title', '...')`                           | `title`プロパティが指定した値に設定されていることをアサート                                                                                                                        |
| `assertNotSet('title', '...')`                        | `title`プロパティが指定した値に設定されていないことをアサート                                                                                                                    |
| `assertSetStrict('title', '...')`                     | `title`プロパティが指定した値に厳密に比較して設定されていることをアサート                                                                                                                        |
| `assertNotSetStrict('title', '...')`                  | `title`プロパティが指定した値に厳密に比較して設定されていないことをアサート                                                                                                                  |
| `assertReturned('...')`                               | 前の`->call(...)`が指定した値を返したことをアサート
| `assertCount('posts', 3)`                             | `posts`プロパティが配列のような値であり、3つのアイテムを含んでいることをアサート                                                                                                         |
| `assertSnapshotSet('date', '08/26/1990')`             | `date`プロパティの生の値（JSONからのデシリアライズされた値）が`08/26/1990`に設定されていることをアサート。`date`に対するアサーションの代替手段 |
| `assertSnapshotNotSet('date', '08/26/1990')`          | `date`の生の値が指定した値と等しくないことをアサート                                                                                                       |
| `assertSee($post->title)`                             | コンポーネントのレンダリングされたHTMLに指定した値が含まれていることをアサート                                                                                                           |
| `assertDontSee($post->title)`                         | コンポーネントのレンダリングされたHTMLに指定した値が含まれていないことをアサート                                                                                                          |
| `assertSeeHtml('<div>...</div>')`                     | 提供された文字列リテラルが、HTML特殊文字がエスケープされることなくレンダリングされたHTMLに含まれていることをアサート（`assertSee`はデフォルトで提供された文字をエスケープします） |
| `assertDontSeeHtml('<div>...</div>')`                 | 提供された文字列がレンダリングされたHTMLに含まれていないことをアサート                                                                                                                         |
| `assertSeeText($post->title)`                         | 提供された文字列がレンダリングされたHTMLテキストに含まれていることをアサート。レンダリングされたコンテンツは、アサーションが行われる前に`strip_tags` PHP関数に渡されます。                                                                                          |
| `assertDontSeeText($post->title)`                     | 提供された文字列がレンダリングされたHTMLテキストに含まれていないことをアサート。レンダリングされたコンテンツは、アサーションが行われる前に`strip_tags` PHP関数に渡されます。                                                                                |
| `assertSeeInOrder(['...', '...'])`                    | 提供された文字列がレンダリングされたHTML出力内で順番に表示されることをアサート                                                                                        |
| `assertSeeHtmlInOrder([$firstString, $secondString])` | 提供されたHTML文字列がコンポーネントのレンダリング出力内で順番に表示されることをアサート                                                                                        |
| `assertDispatched('post-created')`                    | 指定したイベントがコンポーネントによってディスパッチされたことをアサート                                                                                                                     |
| `assertNotDispatched('post-created')`                 | 指定したイベントがコンポーネントによってディスパッチされていないことをアサート                                                                                                                 |
| `assertHasErrors('title')`                            | `title`プロパティのバリデーションが失敗していることをアサート                                                                                                                           |
| `assertHasErrors(['title' => ['required', 'min:6']])`   | 指定したバリデーションルールが`title`プロパティに対して失敗したことをアサート                                                                                                            |
| `assertHasNoErrors('title')`                          | `title`プロパティにバリデーションエラーがないことをアサート                                                                                                                  |
| `assertHasNoErrors(['title' => ['required', 'min:6']])` | 指定したバリデーションルールが`title`プロパティに対して失敗していないことをアサート                                                                                                    |
| `assertRedirect()`                                    | コンポーネント内でリダイレクトがトリガーされたことをアサート
| `assertRedirect('/posts')`                            | コンポーネントが`/posts`エンドポイントへのリダイレクトをトリガーしたことをアサート                                                                 |
| `assertRedirect(ShowPosts::class)`                    | コンポーネントが`ShowPosts`コンポーネントへのリダイレクトをトリガーしたことをアサート                                                             |
| `assertRedirectToRoute('name', ['parameters'])`       | コンポーネントが指定したルートへのリダイレクトをトリガーしたことをアサート                                                                       |
| `assertNoRedirect()`                                  | リダイレクトがトリガーされていないことをアサート                                                                                                 |
| `assertViewHas('posts')`                              | `render()`メソッドがビューに`posts`項目を渡したことをアサート                                                                                   |
| `assertViewHas('postCount', 3)`                       | ビューに`postCount`変数が値`3`で渡されたことをアサート                                                                                           |
| `assertViewHas('posts', function ($posts) { ... })`   | `posts`ビュー変数が存在し、コールバックで宣言されたアサーションを満たすことをアサート                                                            |
| `assertViewIs('livewire.show-posts')`                 | コンポーネントのrenderメソッドが指定したビュー名を返したことをアサート                                                                           |
| `assertFileDownloaded()`                              | ファイルのダウンロードがトリガーされたことをアサート                                                                                             |
| `assertFileDownloaded($filename)`                     | 指定したファイル名のダウンロードがトリガーされたことをアサート                                                                                   |
| `assertNoFileDownloaded()`                            | ファイルのダウンロードがトリガーされていないことをアサート                                                                                       |
| `assertUnauthorized()`                                | コンポーネント内で認可例外（ステータスコード: 401）がスローされたことをアサート                                                                  |
| `assertForbidden()`                                   | ステータスコード403のエラー応答がトリガーされたことをアサート                                                                                    |
| `assertStatus(500)`                                   | 最新のレスポンスが指定したステータスコード（ここでは500）と一致することをアサート                                                                |

