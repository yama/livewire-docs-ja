---
title: イベント
---

<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/events.md -->
イベントをトリガーするには、コンポーネント内のどこからでも `dispatch()` メソッドを使い、ページ上の他のコンポーネントからそのイベントをリッスンできます。

## イベントの発火

Livewireコンポーネントからイベントを発火するには、`dispatch()` メソッドにイベント名と、必要に応じて追加データを渡して呼び出します。

以下は、`CreatePost` コンポーネントから `post-created` イベントを発火する例です。

```php
use Livewire\Component;

class CreatePost extends Component
{
    public function save()
    {
        // ...

        $this->dispatch('post-created'); // [tl! highlight]
    }
}
```

この例では、`dispatch()` メソッドが呼び出されると `post-created` イベントが発火し、このイベントをリッスンしているページ上の他のすべてのコンポーネントに通知されます。

イベントに追加データを渡したい場合は、`dispatch()` メソッドの第2引数としてデータを渡します。

```php
$this->dispatch('post-created', title: $post->title);
```

## イベントのリッスン

Livewireコンポーネントでイベントをリッスンするには、特定のイベントが発火したときに呼び出されるメソッドの上に `#[On]` 属性を追加します。

> [!warning] 属性クラスのインポートを忘れずに
> 属性クラスをインポートすることを忘れないでください。例えば、以下の `#[On()]` 属性には、`use Livewire\Attributes\On;` のインポートが必要です。

```php
use Livewire\Component;
use Livewire\Attributes\On; // [tl! highlight]

class Dashboard extends Component
{
	#[On('post-created')] // [tl! highlight]
    public function updatePostList($title)
    {
		// ...
    }
}
```

これで、`CreatePost` から `post-created` イベントが発火されると、ネットワークリクエストがトリガーされ、`updatePostList()` アクションが呼び出されます。

イベントと一緒に送信された追加データは、アクションの最初の引数として提供されます。

### 動的イベント名のリッスン

場合によっては、コンポーネントのデータを使用して実行時にイベントリスナー名を動的に生成したいことがあります。

例えば、特定のEloquentモデルにスコープを絞ったイベントリスナーを作成する場合、次のようにイベント名にモデルのIDを追加します。

```php
use Livewire\Component;

class UpdatePost extends Component
{
    public function update()
    {
        // ...

        $this->dispatch("post-updated.{$post->id}"); // [tl! highlight]
    }
}
```

そして、その特定のモデルをリッスンします。

```php
use Livewire\Component;
use App\Models\Post;
use Livewire\Attributes\On; // [tl! highlight]

class ShowPost extends Component
{
    public Post $post;

	#[On('post-updated.{post.id}')] // [tl! highlight]
    public function refreshPost()
    {
		// ...
    }
}
```

上記の `$post` モデルのIDが `3` の場合、`refreshPost()` メソッドは `post-updated.3` という名前のイベントによってのみトリガーされます。

### 特定の子コンポーネントからのイベントのリッスン

Livewireでは、Bladeテンプレート内の個々の子コンポーネントで直接イベントをリッスンすることができます。

```blade
<div>
    <livewire:edit-post @saved="$refresh">

    <!-- ... -->
</div>
```

上記のシナリオでは、`edit-post` 子コンポーネントが `saved` イベントを発火すると、親の `$refresh` が呼び出され、親が更新されます。

`$refresh` の代わりに、`wire:click` などに通常渡すメソッドを渡すことができます。例えば、モーダルダイアログを閉じるような `close()` メソッドを呼び出す例です。

```blade
<livewire:edit-post @saved="close">
```

子コンポーネントがリクエストと一緒にパラメータを送信した場合、例えば `$this->dispatch('saved', postId: 1)` のように、次の構文を使用してそれらの値を親メソッドに転送できます。

```blade
<livewire:edit-post @saved="close($event.detail.postId)">
```

## JavaScriptを使用したイベントの操作

Livewireのイベントシステムは、アプリケーション内のJavaScriptから操作することで、はるかに強力になります。これにより、ページ上のLivewireコンポーネントとアプリ内の他のJavaScriptとの通信が可能になります。

### コンポーネントスクリプト内でのイベントのリッスン

次のように、コンポーネントのテンプレート内の `@script` ディレクティブから `post-created` イベントをリッスンできます。

```html
@script
<script>
    $wire.on('post-created', () => {
        //
    });
</script>
@endscript
```

上記のスニペットは、登録されているコンポーネント内から `post-created` をリッスンします。コンポーネントがページ上に存在しなくなると、イベントリスナーはトリガーされなくなります。

[Livewireコンポーネント内でのJavaScriptの使用について詳しく読む →](/docs/javascript#using-javascript-in-livewire-components)

### コンポーネントスクリプトからのイベントの発火

次のように、コンポーネントの `@script` 内からイベントを発火することもできます。

```html
@script
<script>
    $wire.dispatch('post-created');
</script>
@endscript
```

上記の `@script` が実行されると、`post-created` イベントが定義されているコンポーネントに発火されます。

スクリプトが存在するコンポーネントにのみイベントを発火させ、ページ上の他のコンポーネントには発火させないように（イベントの「バブリング」を防ぐために）、`dispatchSelf()` を使用できます。

```js
$wire.dispatchSelf('post-created');
```

イベントに追加のパラメータを渡すには、`dispatch()` の第二引数としてオブジェクトを渡します。

```html
@script
<script>
    $wire.dispatch('post-created', { refreshPosts: true });
</script>
@endscript
```

これで、Livewireクラスと他のJavaScriptイベントリスナーの両方から、イベントパラメータにアクセスできるようになります。

以下は、`refreshPosts` パラメータをLivewireクラス内で受信する例です。

```php
use Livewire\Attributes\On;

// ...

#[On('post-created')]
public function handleNewPost($refreshPosts = false)
{
    //
}
```

JavaScriptイベントリスナーからも `refreshPosts` パラメータにアクセスできます。イベントの `detail` プロパティを使用します。

```html
@script
<script>
    $wire.on('post-created', (event) => {
        let refreshPosts = event.detail.refreshPosts

        // ...
    });
</script>
@endscript
```

[Livewireコンポーネント内でのJavaScriptの使用について詳しく読む →](/docs/javascript#using-javascript-in-livewire-components)

### グローバルJavaScriptからLivewireイベントをリッスン

また、アプリケーションの任意のスクリプトから `Livewire.on` を使用して、Livewireイベントをグローバルにリッスンすることもできます。

```html
<script>
    document.addEventListener('livewire:init', () => {
       Livewire.on('post-created', (event) => {
           //
       });
    });
</script>
```

上記のスニペットは、ページ上の任意のコンポーネントから発火された `post-created` イベントをリッスンします。

理由があってこのイベントリスナーを削除したい場合は、返された `cleanup` 関数を使用して行うことができます。

```html
<script>
    document.addEventListener('livewire:init', () => {
        let cleanup = Livewire.on('post-created', (event) => {
            //
        });

        // "cleanup()" を呼び出すと、上記のイベントリスナーが登録解除されます...
        cleanup();
    });
</script>
```

## Alpineでのイベント

Livewireイベントは、内部的には単なるブラウザイベントであるため、Alpineを使用してそれらをリッスンしたり、発火したりすることができます。

### AlpineでのLivewireイベントのリッスン

例えば、Alpineを使用して `post-created` イベントを簡単にリッスンできます。

```blade
<div x-on:post-created="..."></div>
```

上記のスニペットは、`x-on` ディレクティブが割り当てられたHTML要素の子である任意のLivewireコンポーネントからの `post-created` イベントをリッスンします。

ページ上の任意のLivewireコンポーネントからイベントをリッスンするには、リスナーに `.window` を追加します。

```blade
<div x-on:post-created.window="..."></div>
```

イベントと一緒に送信された追加データにアクセスしたい場合は、`$event.detail` を使用してアクセスできます。

```blade
<div x-on:post-created="notify('New post: ' + $event.detail.title)"></div>
```

Alpineのドキュメントには、[イベントのリッスン](https://alpinejs.dev/directives/on) に関するさらなる情報が提供されています。

### AlpineからのLivewireイベントの発火

Alpineから発火されたイベントは、Livewireコンポーネントによってキャッチされることができます。

例えば、Alpineから `post-created` イベントを簡単に発火できます。

```blade
<button @click="$dispatch('post-created')">...</button>
```

Livewireの `dispatch()` メソッドと同様に、メソッドの第二引数としてデータを渡すことで、イベントと一緒に追加データを渡すことができます。

```blade
<button @click="$dispatch('post-created', { title: 'Post Title' })">...</button>
```

Alpineを使用したイベントの発火について詳しくは、[Alpineのドキュメント](https://alpinejs.dev/magics/dispatch) を参照してください。

> [!tip] イベントが不要な場合
> 子から親への動作呼び出しにイベントを使用している場合、Bladeテンプレート内で `$parent` を使用して子から直接アクションを呼び出すことができます。例えば：
>
> ```blade
> <button wire:click="$parent.showCreatePostForm()">Create Post</button>
> ```
>
> [$parent について詳しく読む](/docs/nesting#directly-accessing-the-parent-from-the-child)。

## 別のコンポーネントへの直接のイベント発火

ページ上の2つのコンポーネント間で直接通信するためにイベントを使用したい場合は、`dispatch()->to()` 修飾子を使用できます。

以下は、`CreatePost` コンポーネントが `post-created` イベントを `Dashboard` コンポーネントに直接発火し、特定のイベントをリッスンしている他のコンポーネントをスキップする例です。

```php
use Livewire\Component;

class CreatePost extends Component
{
    public function save()
    {
		// ...

		$this->dispatch('post-created')->to(Dashboard::class);
    }
}
```

## コンポーネント自身へのイベントの発火

`dispatch()->self()` 修飾子を使用すると、イベントをトリガーしたコンポーネントのみにそのイベントをインターセプトさせることができます。

```php
use Livewire\Component;

class CreatePost extends Component
{
    public function save()
    {
		// ...

		$this->dispatch('post-created')->self();
    }
}
```

## Bladeテンプレートからのイベントの発火

ユーザーの操作（ボタンクリックなど）からイベントをトリガーしたい場合、Bladeテンプレートから `$dispatch` JavaScript 関数を使用してイベントを発火できます。

```blade
<button wire:click="$dispatch('show-post-modal', { id: {{ $post->id }} })">
    EditPost
</button>
```

この例では、ボタンがクリックされると、指定されたデータと共に `show-post-modal` イベントが発火されます。

イベントを別のコンポーネントに直接発火させたい場合は、`$dispatchTo()` JavaScript 関数を使用できます。

```blade
<button wire:click="$dispatchTo('posts', 'show-post-modal', { id: {{ $post->id }} })">
    EditPost
</button>
```

この例では、ボタンがクリックされると、`Posts` コンポーネントに直接 `show-post-modal` イベントが発火されます。

## 発火されたイベントのテスト

コンポーネントによって発火されたイベントをテストするには、Livewireテスト内で `assertDispatched()` メソッドを使用します。このメソッドは、コンポーネントのライフサイクル中に特定のイベントが発火されたことをチェックします。

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Livewire\CreatePost;
use Livewire\Livewire;

class CreatePostTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_dispatches_post_created_event()
    {
        Livewire::test(CreatePost::class)
            ->call('save')
            ->assertDispatched('post-created');
    }
}
```

この例では、テストは `CreatePost` コンポーネントの `save()` メソッドが呼び出されたときに、指定されたデータと共に `post-created` イベントが発火されることを確認します。

### イベントリスナーのテスト

イベントリスナーをテストするには、テスト環境からイベントを発火し、イベントに応じて期待されるアクションが実行されることを確認します。

```php
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Livewire\Dashboard;
use Livewire\Livewire;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_updates_post_count_when_a_post_is_created()
    {
        Livewire::test(Dashboard::class)
            ->assertSee('Posts created: 0')
            ->dispatch('post-created')
            ->assertSee('Posts created: 1');
    }
}
```

この例では、テストは `post-created` イベントを発火し、その後 `Dashboard` コンポーネントがイベントを適切に処理し、更新されたカウントを表示することを確認します。

## Laravel Echoを使用したリアルタイムイベント

Livewireは、[Laravel Echo](https://laravel.com/docs/broadcasting#client-side-installation) と組み合わせることで、WebSocketを使用してウェブページにリアルタイム機能を提供します。

> [!warning] Laravel Echoのインストールが前提条件
> この機能は、Laravel Echo がインストールされており、`window.Echo` オブジェクトがアプリケーション内でグローバルに利用可能であることを前提としています。Echo のインストールに関する詳細は、[Laravel Echo のドキュメント](https://laravel.com/docs/broadcasting#client-side-installation) を確認してください。

### Echoイベントのリッスン

Laravelアプリケーション内に `OrderShipped` という名前のイベントがあると仮定します。

```php
<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;

    public function broadcastOn()
    {
        return new Channel('orders');
    }
}
```

このイベントは、アプリケーションの別の部分から次のように発火されるかもしれません。

```php
use App\Events\OrderShipped;

OrderShipped::dispatch();
```

Laravel Echo のみを使用してこのイベントをJavaScriptでリッスンする場合、次のようになります。

```js
Echo.channel('orders')
    .listen('OrderShipped', e => {
        console.log(e.order)
    })
```

Laravel Echo がインストールされ、設定されている場合、Livewire コンポーネント内からこのイベントをリッスンできます。

以下は、`OrderTracker` コンポーネントが `OrderShipped` イベントをリッスンして、ユーザーに新しい注文の視覚的な通知を表示する例です。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\On; // [tl! highlight]
use Livewire\Component;

class OrderTracker extends Component
{
    public $showNewOrderNotification = false;

    #[On('echo:orders,OrderShipped')]
    public function notifyNewOrder()
    {
        $this->showNewOrderNotification = true;
    }

    // ...
}
```

変数が埋め込まれたEchoチャンネル（例えばOrder IDなど）を持つ場合は、`#[On]` 属性の代わりに `getListeners()` メソッドを使用してリスナーを定義できます。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\On; // [tl! highlight]
use Livewire\Component;
use App\Models\Order;

class OrderTracker extends Component
{
    public Order $order;

    public $showOrderShippedNotification = false;

    public function getListeners()
    {
        return [
            "echo:orders.{$this->order->id},OrderShipped" => 'notifyShipped',
        ];
    }

    public function notifyShipped()
    {
        $this->showOrderShippedNotification = true;
    }

    // ...
}
```

または、動的イベント名構文を使用することもできます。

```php
#[On('echo:orders.{order.id},OrderShipped')]
public function notifyNewOrder()
{
    $this->showNewOrderNotification = true;
}
```

イベントのペイロードにアクセスする必要がある場合は、渡された `$event` パラメータを介してアクセスできます。

```php
#[On('echo:orders.{order.id},OrderShipped')]
public function notifyNewOrder($event)
{
    $order = Order::find($event['orderId']);

    //
}
```

### プライベートおよびプレゼンスチャンネル

プライベートおよびプレゼンスチャンネルにブロードキャストされたイベントをリッスンすることもできます。

> [!info]
> 続行する前に、ブロードキャストチャンネルの<a href="https://laravel.com/docs/master/broadcasting#defining-authorization-callbacks">認証コールバック</a>を定義していることを確認してください。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class OrderTracker extends Component
{
    public $showNewOrderNotification = false;

    public function getListeners()
    {
        return [
            // パブリックチャンネル
            "echo:orders,OrderShipped" => 'notifyNewOrder',

            // プライベートチャンネル
            "echo-private:orders,OrderShipped" => 'notifyNewOrder',

            // プレゼンスチャンネル
            "echo-presence:orders,OrderShipped" => 'notifyNewOrder',
            "echo-presence:orders,here" => 'notifyNewOrder',
            "echo-presence:orders,joining" => 'notifyNewOrder',
            "echo-presence:orders,leaving" => 'notifyNewOrder',
        ];
    }

    public function notifyNewOrder()
    {
        $this->showNewOrderNotification = true;
    }
}
```
