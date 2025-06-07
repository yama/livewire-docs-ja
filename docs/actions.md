---
title: アクション
---

Livewireのアクションは、ボタンのクリックやフォーム送信など、フロントエンドの操作によってコンポーネント内のメソッドを呼び出す仕組みです。これにより、ブラウザから直接PHPメソッドを呼び出す感覚で開発でき、アプリケーションのロジックに集中しながら、フロントエンドとバックエンドをつなぐ煩雑なコードを書く必要がなくなります。

ここでは、`CreatePost`コンポーネントの`save`アクションを呼び出す基本的な例を見てみましょう。

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

        return redirect()->to('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

```blade
<form wire:submit="save"> <!-- [tl! highlight] -->
    <input type="text" wire:model="title">

    <textarea wire:model="content"></textarea>

    <button type="submit">Save</button>
</form>
```

上記の例では、ユーザーが「Save」をクリックしてフォームを送信すると、`wire:submit`が`submit`イベントをキャッチし、サーバー上の`save()`アクションを呼び出します。

要するに、アクションはユーザーの操作をサーバーサイドの機能に簡単にマッピングする方法であり、手動でAJAXリクエストを送信して処理する手間を省いてくれます。

## コンポーネントのリフレッシュ

時には、コンポーネントを単純に「リフレッシュ」したい場合もあるでしょう。例えば、データベースの何かのステータスをチェックしているコンポーネントがあり、ユーザーに結果を再表示するためのボタンを表示したい場合です。

この場合、Livewireのシンプルな`$refresh`アクションを使用できます。これは、自分のコンポーネントメソッドを参照する場所ならどこでも使うことができます。

```blade
<button type="button" wire:click="$refresh">...</button>
```

`$refresh`アクションがトリガーされると、Livewireはサーバーとの往復を行い、メソッドを呼び出すことなくコンポーネントを再レンダリングします。

注意すべきは、コンポーネントがリフレッシュされるときに（例えば`wire:model`バインディングのような）保留中のデータ更新がサーバーで適用されるということです。

内部的に、Livewireはコンポーネントがサーバーで更新されるたびに「コミット」という名前を使用します。この用語を好む場合は、`$refresh`の代わりに`$commit`ヘルパーを使用できます。両者は同じです。

```blade
<button type="button" wire:click="$commit">...</button>
```

また、Livewireコンポーネント内でAlpineJSを使用してコンポーネントのリフレッシュをトリガーすることもできます。

```blade
<button type="button" x-on:click="$wire.$refresh()">...</button>
```

詳細は、[Livewire内でAlpineを使用するためのドキュメント](/docs/alpine)を参照してください。

## アクションの確認

ユーザーにデータベースからポストを削除させるなどの危険なアクションを許可する場合、そのアクションを実行するかどうか確認するアラートを表示したいことがあります。

Livewireでは、`wire:confirm`というシンプルなディレクティブを提供することで、これを簡単に行えます。

```blade
<button
    type="button"
    wire:click="delete"
    wire:confirm="Are you sure you want to delete this post?"
>
    Delete post <!-- [tl! highlight:-2,1] -->
</button>
```

`wire:confirm`がLivewireアクションを含む要素に追加されると、そのアクションをトリガーしようとしたときに、ユーザーに確認ダイアログが表示されます。ユーザーは「OK」を押してアクションを確認するか、「キャンセル」やエスケープキーを押して中止できます。

詳細については、[`wire:confirm`のドキュメントページ](/docs/wire-confirm)を訪れてください。

## イベントリスナー

Livewireはさまざまなイベントリスナーをサポートしており、さまざまな種類のユーザー操作に応答できます。

| リスナー          | 説明                                       |
|-----------------|-------------------------------------------|
| `wire:click`    | 要素がクリックされたときにトリガーされる    |
| `wire:submit`   | フォームが送信されたときにトリガーされる  |
| `wire:keydown`  | キーが押されたときにトリガーされる        |
| `wire:keyup`  | キーが離されたときにトリガーされる
| `wire:mouseenter`| マウスが要素に入ったときにトリガーされる   |
| `wire:*`| `wire:`の後に続くテキストは、リスナーのイベント名として使用されます |

`wire:`の後のイベント名は何でもよいため、Livewireは必要なブラウザイベントをリッスンすることをサポートしています。例えば、`transitionend`をリッスンするには、`wire:transitionend`を使用できます。

### 特定のキーのリスニング

Livewireの便利なエイリアスのひとつを使用して、キー押下イベントリスナーを特定のキーまたはキーの組み合わせに絞り込むことができます。

例えば、ユーザーが検索ボックスに入力した後、`Enter`キーを押したときに検索を実行するには、`wire:keydown.enter`を使用できます。

```blade
<input wire:model="query" wire:keydown.enter="searchPosts">
```

最初の後にさらに多くのキーエイリアスをチェーンして、キーの組み合わせをリッスンすることができます。例えば、`Shift`キーを押している間だけ`Enter`キーをリッスンしたい場合は、次のように書くことができます。

```blade
<input wire:keydown.shift.enter="...">
```

以下は、利用可能なすべてのキー修飾子のリストです。

| 修飾子        | キー                          |
|---------------|------------------------------|
| `.shift`      | Shift                        |
| `.enter`      | Enter                        |
| `.space`      | Space                        |
| `.ctrl`       | Ctrl                         |
| `.cmd`        | Cmd                          |
| `.meta`       | Cmd on Mac, Windows key on Windows |
| `.alt`        | Alt                          |
| `.up`         | Up arrow                     |
| `.down`       | Down arrow                   |
| `.left`       | Left arrow                   |
| `.right`      | Right arrow                  |
| `.escape`     | Escape                       |
| `.tab`        | Tab                          |
| `.caps-lock`  | Caps Lock                    |
| `.equal`      | Equal, `=`                   |
| `.period`     | Period, `.`                  |
| `.slash`      | Forward Slash, `/`           |

### イベントハンドラ修飾子

Livewireには、一般的なイベント処理タスクを簡単にするための便利な修飾子も含まれています。

例えば、イベントリスナー内から`event.preventDefault()`を呼び出す必要がある場合、イベント名の後に`.prevent`を付けることができます。

```blade
<input wire:keydown.prevent="...">
```

利用可能なすべてのイベントリスナー修飾子とその機能の完全なリストは次のとおりです。

| 修飾子         | キー                                                     |
|------------------|---------------------------------------------------------|
| `.prevent`       | `.preventDefault()`を呼び出すのと同等                   |
| `.stop`          | `.stopPropagation()`を呼び出すのと同等                  |
| `.window`        | `window`オブジェクト上のイベントをリッスン               |
| `.outside`       | 要素の「外側」でのクリックのみをリッスン                 |
| `.document`      | `document`オブジェクト上のイベントをリッスン            |
| `.once`          | リスナーが1回だけ呼び出されることを保証                 |
| `.debounce`      | デフォルトで250msの間隔でハンドラをデバウンス            |
| `.debounce.100ms`| 特定の時間間隔でハンドラをデバウンス                   |
| `.throttle`      | 最低でも250msごとにハンドラを呼び出すようにスロットル    |
| `.throttle.100ms`| カスタムの時間間隔でハンドラをスロットル                |
| `.self`          | イベントがこの要素で発生した場合にのみリスナーを呼び出す |
| `.camel`         | イベント名をキャメルケースに変換 (`wire:custom-event` -> "customEvent") |
| `.dot`           | イベント名をドット表記に変換 (`wire:custom-event` -> "custom.event") |
| `.passive`       | `wire:touchstart.passive`はスクロールパフォーマンスをブロックしない |
| `.capture`       | イベントを「キャプチャ」フェーズでリッスン               |

`wire:`は内部的に[Alpine](https://alpinejs.dev)の`x-on`ディレクティブを使用しているため、これらの修飾子はAlpineによって提供されます。これらの修飾子を使用するタイミングについての詳細は、[Alpine Eventsのドキュメント](https://alpinejs.dev/essentials/events)を参照してください。

### サードパーティイベントのハンドリング

Livewireは、サードパーティライブラリによって発火されたカスタムイベントをリッスンすることもサポートしています。

例えば、プロジェクトで[トリックス](https://trix-editor.org/)リッチテキストエディタを使用していて、`trix-change`イベントをリッスンしてエディタの内容をキャッチしたい場合、`wire:trix-change`ディレクティブを使用してこれを実現できます。

```blade
<form wire:submit="save">
    <!-- ... -->

    <trix-editor
        wire:trix-change="setPostContent($event.target.value)"
    ></trix-editor>

    <!-- ... -->
</form>
```

この例では、`trix-change`イベントがトリガーされるたびに`setPostContent`アクションが呼び出され、Livewireコンポーネント内の`content`プロパティがTrixエディタの現在の値で更新されます。

:::info イベントオブジェクトへのアクセス
Livewireのイベントハンドラ内では、イベントオブジェクトに`$event`を介してアクセスできます。これは、イベントに関する情報を参照するのに便利です。例えば、`$event.target`を介してイベントをトリガーした要素にアクセスできます。
:::

:::warning
上記のTrixデモコードは不完全であり、イベントリスナーのデモンストレーションとしてのみ有用です。そのまま使用すると、毎回のキーストロークでネットワークリクエストが発火します。よりパフォーマンスに優れた実装は次のとおりです。

```blade
<trix-editor
   x-on:trix-change="$wire.content = $event.target.value"
></trix-editor>
```
:::

### ディスパッチされたカスタムイベントのリッスン

アプリケーションがAlpineからカスタムイベントをディスパッチする場合、Livewireを使用してそれらをリッスンすることもできます。

```blade
<div wire:custom-event="...">

    <!-- このコンポーネント内で深くネストされた部分: -->
    <button x-on:click="$dispatch('custom-event')">...</button>

</div>
```

上記の例では、ボタンがクリックされると`custom-event`イベントがディスパッチされ、Livewireコンポーネントのルートまでバブルアップし、そこで`wire:custom-event`がそれをキャッチして指定されたアクションを呼び出します。

アプリケーションのどこか別の場所でディスパッチされたイベントをリッスンしたい場合は、イベントが`window`オブジェクトにバブルアップするのを待ってから、そこでリッスンする必要があります。幸いなことに、Livewireはこのプロセスを簡単にするために、任意のイベントリスナーにシンプルな`.window`修飾子を追加できるようにしています。

```blade
<div wire:custom-event.window="...">
    <!-- ... -->
</div>

<!-- ページのどこか外部でディスパッチされた: -->
<button x-on:click="$dispatch('custom-event')">...</button>
```

### フォーム送信中の入力無効化

前述の`CreatePost`の例を考えてみましょう。

```blade
<form wire:submit="save">
    <input wire:model="title">

    <textarea wire:model="content"></textarea>

    <button type="submit">Save</button>
</form>
```

ユーザーが「Save」をクリックすると、ネットワークリクエストがサーバーに送信され、Livewireコンポーネントの`save()`アクションが呼び出されます。

しかし、ユーザーが遅いインターネット接続でこのフォームに入力していると想像してみてください。「Save」をクリックしても、ネットワークリクエストに通常より時間がかかるため、最初は何も起こりません。ユーザーは送信に失敗したのではないかと考え、最初のリクエストがまだ処理中の間に再度「Save」ボタンをクリックしようとするかもしれません。

この場合、同じアクションに対して2つのリクエストが同時に処理されることになります。

このシナリオを防ぐために、Livewireは`wire:submit`アクションが処理されている間、`<form>`要素内の送信ボタンとすべてのフォーム入力を自動的に無効にします。これにより、フォームが誤って2回送信されるのを防ぎます。

遅い接続のユーザーに対する混乱をさらに軽減するために、微妙な背景色の変更やSVGアニメーションなどのローディングインジケーターを表示することがしばしば役立ちます。

Livewireは、ページ上の任意の場所にローディングインジケーターを表示および非表示にするのを簡単にする`wire:loading`ディレクティブを提供しています。以下は、`wire:loading`を使用して「Save」ボタンの下にローディングメッセージを表示する短い例です。

```blade
<form wire:submit="save">
    <textarea wire:model="content"></textarea>

    <button type="submit">Save</button>

    <span wire:loading>Saving...</span> <!-- [tl! highlight] -->
</form>
```

`wire:loading`は強力な機能であり、さまざまな高度な機能があります。詳細については、[完全なローディングドキュメント](/docs/wire-loading)を確認してください。

## パラメータの渡し方

Livewireでは、Bladeテンプレートからコンポーネント内のアクションにパラメータを渡すことができ、アクションが呼び出されるときに追加のデータや状態をフロントエンドから提供できます。

例えば、`ShowPosts`コンポーネントがあり、ユーザーがポストを削除できると想像してみてください。ポストのIDを`delete()`アクションにパラメータとして渡すことができます。次に、そのアクションは関連するポストを取得し、データベースから削除できます。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    public function delete($id)
    {
        $post = Post::findOrFail($id);

        $this->authorize('delete', $post);

        $post->delete();
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Auth::user()->posts,
        ]);
    }
}
```

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="delete({{ $post->id }})">Delete</button> <!-- [tl! highlight] -->
        </div>
    @endforeach
</div>
```

IDが2のポストの場合、上記のBladeテンプレート内の「Delete」ボタンはブラウザで次のようにレンダリングされます。

```blade
<button wire:click="delete(2)">Delete</button>
```

このボタンがクリックされると、`delete()`メソッドが呼び出され、`$id`には「2」という値が渡されます。

:::warning アクションパラメータを信頼しない
アクションパラメータはHTTPリクエスト入力と同様に扱うべきであり、アクションパラメータの値は信頼できません。データベースを更新する前に、常にエンティティの所有権を認可する必要があります。

詳細については、[セキュリティに関する懸念とベストプラクティス](/docs/actions#security-concerns)に関するドキュメントを参照してください。
:::

さらに便利なことに、アクションのパラメータとして提供されたモデルIDによってEloquentモデルを自動的に解決することができます。これは、[ルートモデルバインディング](/docs/components#using-route-model-binding)に非常に似ています。始めるには、アクションパラメータをモデルクラスで型ヒントし、適切なモデルがデータベースから自動的に取得され、IDの代わりにアクションに渡されます。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    public function delete(Post $post) // [tl! highlight]
    {
        $this->authorize('delete', $post);

        $post->delete();
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Auth::user()->posts,
        ]);
    }
}
```

## 依存性注入

アクションのシグネチャにパラメータを型ヒントすることで、[Laravelの依存性注入](https://laravel.com/docs/controllers#dependency-injection-and-controllers)システムを利用できます。LivewireとLaravelは、アクションの依存関係をコンテナから自動的に解決します。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Repositories\PostRepository;

class ShowPosts extends Component
{
    public function delete(PostRepository $posts, $postId) // [tl! highlight]
    {
        $posts->deletePost($postId);
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Auth::user()->posts,
        ]);
    }
}
```

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="delete({{ $post->id }})">Delete</button> <!-- [tl! highlight] -->
        </div>
    @endforeach
</div>
```

この例では、`delete()`メソッドは、提供された`$postId`パラメータを受け取る前に、コンテナから解決された`PostRepository`のインスタンスを受け取ります。

## Alpineからのアクション呼び出し

Livewireは、[Alpine](https://alpinejs.dev/)とシームレスに統合されます。実際、内部的には、すべてのLivewireコンポーネントはAlpineコンポーネントでもあります。つまり、コンポーネント内でAlpineのすべての利点を活用して、JavaScriptによるクライアントサイドのインタラクティブ性を追加できます。

この組み合わせをさらに強力にするために、LivewireはAlpineにマジックの`$wire`オブジェクトを公開しており、PHPコンポーネントのJavaScript表現として扱うことができます。これにより、[JavaScriptからプロパティにアクセスおよび変更する](/docs/properties#accessing-properties-from-javascript)に加えて、アクションを呼び出すことができます。アクションが`$wire`オブジェクトで呼び出されると、対応するPHPメソッドがバックエンドのLivewireコンポーネントで呼び出されます。

```blade
<button x-on:click="$wire.save()">Save Post</button>
```

また、Alpineの[`x-intersect`](https://alpinejs.dev/plugins/intersect)ユーティリティを使用して、特定の要素がページ上に表示されたときに`incrementViewCount()`Livewireアクションをトリガーする例を示します。

```blade
<div x-intersect="$wire.incrementViewCount()">...</div>
```

### パラメータの渡し方

`$wire`メソッドに渡すパラメータは、アクションに渡されるパラメータとしても渡されます。例えば、次のLivewireアクションを考えてみてください。

```php
public function addTodo($todo)
{
    $this->todos[] = $todo;
}
```

コンポーネントのBladeテンプレート内で、このアクションをAlpine経由で呼び出し、アクションに渡されるパラメータを提供できます。

```blade
<div x-data="{ todo: '' }">
    <input type="text" x-model="todo">

    <button x-on:click="$wire.addTodo(todo)">Add Todo</button>
</div>
```

ユーザーがテキスト入力に「Take out the trash」と入力し、「Add Todo」ボタンを押した場合、`addTodo()`メソッドは`$todo`パラメータの値として「Take out the trash」を受け取ります。

### 戻り値の受け取り

さらに強力なことに、呼び出された`$wire`アクションは、ネットワークリクエストが処理されている間、プロミスを返します。サーバーの応答が受信されると、プロミスはバックエンドアクションによって返された値で解決されます。

例えば、次のアクションを持つLivewireコンポーネントを考えてみてください。

```php
use App\Models\Post;

public function getPostCount()
{
    return Post::count();
}
```

`$wire`を使用して、このアクションを呼び出し、その戻り値を解決できます。

```blade
<span x-init="$el.innerHTML = await $wire.getPostCount()"></span>
```

この例では、`getPostCount()`メソッドが「10」を返すと、`<span>`タグも「10」を含むようになります。

Livewireを使用する際にAlpineの知識は必須ではありませんが、Alpineは非常に強力なツールであり、その知識はLivewireの体験と生産性を向上させます。

## JavaScriptアクション

Livewireでは、サーバーリクエストを行うことなくクライアントサイドで完全に実行されるJavaScriptアクションを定義できます。これは、次の2つのシナリオで便利です。

1. サーバーとの通信を必要としない簡単なUI更新を行いたいとき
2. サーバーリクエストを行う前に、JavaScriptでUIを楽観的に更新したいとき

JavaScriptアクションを定義するには、コンポーネント内の`<script>`タグ内で`$js()`関数を使用できます。

以下は、サーバーリクエストを行う前に楽観的にUIを更新するJavaScriptアクションを使用したポストのブックマークの例です。JavaScriptアクションは、データベースにブックマークを永続化するリクエストを行う前に、すぐにブックマークアイコンが塗りつぶされるのを表示します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post;

    public $bookmarked = false;

    public function mount()
    {
        $this->bookmarked = $this->post->bookmarkedBy(auth()->user());
    }

    public function bookmarkPost()
    {
        $this->post->bookmark(auth()->user());

        $this->bookmarked = $this->post->bookmarkedBy(auth()->user());
    }

    public function render()
    {
        return view('livewire.show-post');
    }
}
```

```blade
<div>
    <button wire:click="$js.bookmark" class="flex items-center gap-1">
        {{-- アウトライン付きのブックマークアイコン... --}}
        <svg wire:show="!bookmarked" wire:cloak xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>

        {{-- 塗りつぶされたブックマークアイコン... --}}
        <svg wire:show="bookmarked" wire:cloak xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clip-rule="evenodd" />
        </svg>
    </button>
</div>

@script
<script>
    $js('bookmark', () => {
        $wire.bookmarked = !$wire.bookmarked

        $wire.bookmarkPost()
    })
</script>
@endscript
```

ユーザーがハートボタンをクリックすると、次のシーケンスが発生します。

1. 「bookmark」JavaScriptアクションがトリガーされる
2. ハートアイコンがクライアントサイドで`$wire.bookmarked`をトグルして即座に更新される
3. `bookmarkPost()`メソッドが呼び出されて変更がデータベースに保存される

これにより、変更が適切に永続化されると同時に、即時の視覚的フィードバックが提供されます。

### Alpineからの呼び出し

JavaScriptアクションは、`$wire`オブジェクトを使用してAlpineから直接呼び出すこともできます。例えば、`$wire`オブジェクトを使用して`bookmark`JavaScriptアクションを呼び出すことができます。

```blade
<button x-on:click="$wire.$js.bookmark()">Bookmark</button>
```

### PHPからの呼び出し

JavaScriptアクションは、PHPの`js()`メソッドを使用して呼び出すこともできます。

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

        $this->js('onPostSaved'); // [tl! highlight]
    }
}
```

```blade
<div>
    <!-- ... -->

    <button wire:click="save">Save</button>
</div>

@script
<script>
    $js('onPostSaved', () => {
        alert('Your post has been saved successfully!')
    })
</script>
@endscript
```

この例では、`save()`アクションが終了すると、`postSaved`JavaScriptアクションが実行され、アラートダイアログがトリガーされます。

## マジックアクション

Livewireは、カスタムメソッドを定義することなくコンポーネント内の一般的なタスクを実行できる「マジック」アクションのセットを提供します。これらのマジックアクションは、Bladeテンプレート内で定義されたイベントリスナー内で使用できます。

### `$parent`

`$parent`マジック変数を使用すると、子コンポーネントから親コンポーネントのプロパティにアクセスしたり、親コンポーネントのアクションを呼び出したりできます。

```blade
<button wire:click="$parent.removePost({{ $post->id }})">Remove</button>
```

上記の例では、親コンポーネントに`removePost()`アクションがある場合、子コンポーネントは`$parent.removePost()`を使用して直接呼び出すことができます。

### `$set`

`$set`マジックアクションを使用すると、BladeテンプレートからLivewireコンポーネント内のプロパティを直接更新できます。`$set`を使用するには、更新したいプロパティと新しい値を引数として指定します。

```blade
<button wire:click="$set('query', '')">Reset Search</button>
```

この例では、ボタンがクリックされると、ネットワークリクエストが送信され、コンポーネント内の`$query`プロパティが`''`に設定されます。

### `$refresh`

`$refresh`アクションは、Livewireコンポーネントの再レンダリングをトリガーします。これは、プロパティ値を変更することなくコンポーネントのビューを更新する際に便利です。

```blade
<button wire:click="$refresh">Refresh</button>
```

ボタンがクリックされると、コンポーネントが再レンダリングされ、最新の変更がビューに表示されます。

### `$toggle`

`$toggle`アクションは、Livewireコンポーネント内のブール値プロパティの値をトグルするために使用されます。

```blade
<button wire:click="$toggle('sortAsc')">
    Sort {{ $sortAsc ? 'Descending' : 'Ascending' }}
</button>
```

この例では、ボタンがクリックされると、コンポーネント内の`$sortAsc`プロパティが`true`と`false`の間でトグルされます。

### `$dispatch`

`$dispatch`アクションを使用すると、ブラウザ内でLivewireイベントを直接ディスパッチできます。以下は、クリックされると`post-deleted`イベントをディスパッチするボタンの例です。

```blade
<button type="submit" wire:click="$dispatch('post-deleted')">Delete Post</button>
```

### `$event`

`$event`アクションは、`wire:click`のようなイベントリスナー内で使用できます。このアクションを使用すると、トリガーされたJavaScriptイベントにアクセスでき、トリガー要素やその他の関連情報を参照できます。

```blade
<input type="text" wire:keydown.enter="search($event.target.value)">
```

上記の入力フィールド内でユーザーがEnterキーを押すと、入力内容が`search()`アクションのパラメータとして渡されます。

### Alpineからのマジックアクションの呼び出し

Alpineを使用している場合、マジックアクションを呼び出すこともできます。例えば、`$wire`オブジェクトを使用して`$refresh`マジックアクションを呼び出すことができます。

```blade
<button x-on:click="$wire.$refresh()">Refresh</button>
```

## 再レンダリングのスキップ

時には、アクションに副作用がなく、そのアクションが呼び出されたときにレンダリングされたBladeテンプレートに変更がない場合もあるでしょう。その場合、アクションメソッドの上に`#[Renderless]`属性を追加することで、Livewireのライフサイクルの`render`部分をスキップできます。

以下の`ShowPost`コンポーネントでは、ユーザーがポストの下部までスクロールしたときに「view count」が記録されます。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Renderless;
use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post;

    public function mount(Post $post)
    {
        $this->post = $post;
    }

    #[Renderless] // [tl! highlight]
    public function incrementViewCount()
    {
        $this->post->incrementViewCount();
    }

    public function render()
    {
        return view('livewire.show-post');
    }
}
```

```blade
<div>
    <h1>{{ $post->title }}</h1>
    <p>{{ $post->content }}</p>

    <div x-intersect="$wire.incrementViewCount()"></div>
</div>
```

上記の例では、[`x-intersect`](https://alpinejs.dev/plugins/intersect)を使用しており、これは要素がビューポートに入ると式を呼び出すために使用されます（通常、ユーザーがページの下部にある要素にスクロールしたときに検出されます）。

このように、ユーザーがポストの下部までスクロールすると、`incrementViewCount()`が呼び出されます。アクションに`#[Renderless]`が追加されているため、ビューが記録されますが、テンプレートは再レンダリングされず、ページのどの部分も影響を受けません。

メソッド属性を使用したくない場合や、条件に応じてレンダリングをスキップしたい場合は、コンポーネントアクション内で`skipRender()`メソッドを呼び出すことができます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post;

    public function mount(Post $post)
    {
        $this->post = $post;
    }

    public function incrementViewCount()
    {
        $this->post->incrementViewCount();

        $this->skipRender(); // [tl! highlight]
    }

    public function render()
    {
        return view('livewire.show-post');
    }
}
```

## セキュリティに関する懸念

Livewireコンポーネント内のすべての公開メソッドは、関連する`wire:click`ハンドラがなくてもクライアントから呼び出すことができます。このようなシナリオでは、ユーザーはブラウザのDevToolsからアクションをトリガーできます。

以下に、Livewireコンポーネント内で見落としがちな脆弱性の3つの例を示します。最初に脆弱なコンポーネントを示し、その後に安全なコンポーネントを示します。最初の例で脆弱性を見つけるのが難しい場合は、解決策を見る前に練習として脆弱性を見つけてみてください。

これらの脆弱性を見つけるのが難しい場合、そしてそれが自分のアプリケーションを安全に保つ能力に懸念を抱かせる場合は、これらの脆弱性はリクエストとコントローラを使用する標準的なWebアプリケーションにも適用されることを思い出してください。コンポーネントメソッドをコントローラメソッドへのプロキシとして使用し、そのパラメータをリクエスト入力へのプロキシとして使用する場合、既存のアプリケーションセキュリティの知識をLivewireコードに適用できるはずです。

### アクションパラメータの常時認可

コントローラのリクエスト入力と同様に、アクションパラメータを認可することが不可欠です。なぜなら、アクションパラメータは任意のユーザー入力であるためです。

以下は、ユーザーがひとつのページですべてのポストを表示できる`ShowPosts`コンポーネントの例です。ユーザーは、いずれかのポストの「Delete」ボタンを使用してポストを削除できます。

脆弱なコンポーネントの例を示します。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    public function delete($id)
    {
        $post = Post::find($id);

        $post->delete();
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Auth::user()->posts,
        ]);
    }
}
```

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="delete({{ $post->id }})">Delete</button>
        </div>
    @endforeach
</div>
```

悪意のあるユーザーは、任意のパラメータをアクションに渡して`delete()`をブラウザのJavaScriptコンソールから直接呼び出すことができることを思い出してください。これにより、自分のポストを表示しているユーザーが、他のユーザーのポストを削除するために`delete()`に不正なIDを渡すことが可能になります。

これを防ぐために、削除されるポストの所有権を確認するために、アクションに認可を追加する必要があります。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    public function delete($id)
    {
        $post = Post::find($id);

        $this->authorize('delete', $post); // [tl! highlight]

        $post->delete();
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => Auth::user()->posts,
        ]);
    }
}
```

### サーバーサイドの常時認可

標準的なLaravelコントローラと同様に、Livewireアクションは任意のユーザーによって呼び出すことができ、UI内でアクションを呼び出すための手段がなくても呼び出すことができます。

以下は、任意のユーザーがアプリケーション内のすべてのポストを見ることができる`BrowsePosts`コンポーネントの例ですが、管理者のみがポストを削除できます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class BrowsePosts extends Component
{
    public function deletePost($id)
    {
        $post = Post::find($id);

        $post->delete();
    }

    public function render()
    {
        return view('livewire.browse-posts', [
            'posts' => Post::all(),
        ]);
    }
}
```

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            @if (Auth::user()->isAdmin())
                <button wire:click="deletePost({{ $post->id }})">Delete</button>
            @endif
        </div>
    @endforeach
</div>
```

ご覧のとおり、「Delete」ボタンは管理者にのみ表示されます。ただし、どのユーザーでもブラウザのDevToolsから`deletePost()`をコンポーネントで呼び出すことができます。

この脆弱性を修正するには、サーバー側でアクションを認可する必要があります。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class BrowsePosts extends Component
{
    public function deletePost($id)
    {
        if (! Auth::user()->isAdmin) { // [tl! highlight:2]
            abort(403);
        }

        $post = Post::find($id);

        $post->delete();
    }

    public function render()
    {
        return view('livewire.browse-posts', [
            'posts' => Post::all(),
        ]);
    }
}
```

この変更により、管理者のみがこのコンポーネントからポストを削除できるようになります。

### 危険なメソッドは常にprotectedまたはprivateに

Livewireコンポーネント内のすべてのpublicメソッドは、クライアントから呼び出すことができます。関連する`wire:click`ハンドラがなくてもです。このため、クライアント側で呼び出すことを意図していないメソッドが誤って呼び出されるのを防ぐために、それらを`protected`または`private`としてマークする必要があります。こうすることで、その敏感なメソッドへのアクセスがコンポーネントのクラスとそのサブクラスに制限され、クライアント側から呼び出すことができなくなります。

前述の`BrowsePosts`の例を再度考えてみましょう。ここでは、ユーザーがアプリケーション内のすべてのポストを表示でき、管理者のみがポストを削除できます。[サーバーサイドの常時認可](/docs/actions#always-authorize-server-side)セクションでは、アクションを認可することでセキュリティを強化しました。次に、実際のポスト削除を専用のメソッドにリファクタリングしたと想像してください。これは、コードをシンプルに保つために行うかもしれません。

```php
// 警告: これは何をすべきかを示すスニペットではありません...
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class BrowsePosts extends Component
{
    public function deletePost($id)
    {
        if (! Auth::user()->isAdmin) {
            abort(403);
        }

        $this->delete($id); // [tl! highlight]
    }

    public function delete($postId)  // [tl! highlight:5]
    {
        $post = Post::find($postId);

        $post->delete();
    }

    public function render()
    {
        return view('livewire.browse-posts', [
            'posts' => Post::all(),
        ]);
    }
}
```

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h1>{{ $post->title }}</h1>
            <span>{{ $post->content }}</span>

            <button wire:click="deletePost({{ $post->id }})">Delete</button>
        </div>
    @endforeach
</div>
```

ご覧のとおり、ポスト削除ロジックが`delete()`という専用のメソッドにリファクタリングされました。このメソッドは、テンプレート内のどこにも参照されていなくても、ユーザーがブラウザのDevToolsから呼び出すことができます。

これを修正するには、メソッドを`protected`または`private`としてマークします。そうすることで、ユーザーがそのメソッドを呼び出そうとするとエラーが発生します。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class BrowsePosts extends Component
{
    public function deletePost($id)
    {
        if (! Auth::user()->isAdmin) {
            abort(403);
        }

        $this->delete($id);
    }

    protected function delete($postId) // [tl! highlight]
    {
        $post = Post::find($postId);

        $post->delete();
    }

    public function render()
    {
        return view('livewire.browse-posts', [
            'posts' => Post::all(),
        ]);
    }
}
```
