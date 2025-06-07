---
title: ネストの理解
---

Livewireコンポーネントは、他の多くのコンポーネントベースのフレームワークと同様に、入れ子（ネスト）にできます。つまり、1つのコンポーネントの中で複数のコンポーネントをレンダリングできます。

ただし、Livewireのネストシステムは他のフレームワークとは異なる仕組みで構築されているため、いくつか注意すべき点や制約があります。

> [!tip] まずは「水和」について理解しましょう
> Livewireのネストシステムを学ぶ前に、Livewireがどのようにコンポーネントを水和するかを理解しておくと役立ちます。詳しくは[水和のドキュメント](/docs/hydration)をご覧ください。

## すべてのコンポーネントは「島」

Livewireでは、ページ上のすべてのコンポーネントが独立して状態を管理し、他のコンポーネントとは無関係に更新を行います。

例えば、次のような`Posts`コンポーネントと、その中にネストされた`ShowPost`コンポーネントを考えてみましょう：

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class Posts extends Component
{
    public $postLimit = 2;

    public function render()
    {
        return view('livewire.posts', [
            'posts' => Auth::user()->posts()
                ->limit($this->postLimit)->get(),
        ]);
    }
}
```

```blade
<div>
    投稿上限: <input type="number" wire:model.live="postLimit">

    @foreach ($posts as $post)
        <livewire:show-post :$post :key="$post->id">
    @endforeach
</div>
```

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post;

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

    <button wire:click="$refresh">投稿をリフレッシュ</button>
</div>
```

初回ページロード時のコンポーネントツリーのHTMLは次のようになります：

```html
<div wire:id="123" wire:snapshot="...">
    投稿上限: <input type="number" wire:model.live="postLimit">

    <div wire:id="456" wire:snapshot="...">
        <h1>最初の投稿</h1>

        <p>投稿コンテンツ</p>

        <button wire:click="$refresh">投稿をリフレッシュ</button>
    </div>

    <div wire:id="789" wire:snapshot="...">
        <h1>2番目の投稿</h1>

        <p>投稿コンテンツ</p>

        <button wire:click="$refresh">投稿をリフレッシュ</button>
    </div>
</div>
```

親コンポーネントは、自身のテンプレートと、ネストされたすべての子コンポーネントのテンプレートを含んでいます。

各コンポーネントは独立しているため、それぞれ独自のIDやスナップショット（`wire:id`や`wire:snapshot`）がHTMLに埋め込まれ、LivewireのJavaScriptコアがこれを抽出・管理します。

ここで、異なるレベルのネストでLivewireがどのように更新を処理するか、いくつかのシナリオを見てみましょう。

### 子コンポーネントの更新

子`show-post`コンポーネントの「投稿をリフレッシュ」ボタンをクリックした場合、サーバーに送信されるデータは次のようになります：

```js
{
    memo: { name: 'show-post', id: '456' },

    state: { ... },
}
```

サーバーから返されるHTMLは：

```html
<div wire:id="456">
    <h1>最初の投稿</h1>

    <p>投稿コンテンツ</p>

    <button wire:click="$refresh">投稿をリフレッシュ</button>
</div>
```

ここで重要なのは、子コンポーネントで更新が発生した場合、そのコンポーネントのデータだけがサーバーに送信され、該当コンポーネントだけが再レンダリングされる点です。

次に、直感的ではない「親コンポーネントの更新」について見てみましょう。

### 親コンポーネントの更新

改めて、親`Posts`コンポーネントのBladeテンプレートは次の通りです：

```blade
<div>
    投稿上限: <input type="number" wire:model.live="postLimit">

    @foreach ($posts as $post)
        <livewire:show-post :$post :key="$post->id">
    @endforeach
</div>
```

ユーザーが「投稿上限」の値を`2`から`1`に変更すると、親だけが更新されます。

リクエストのペイロード例：

```js
{
    updates: { postLimit: 1 },

    snapshot: {
        memo: { name: 'posts', id: '123' },

        state: { postLimit: 2, ... },
    },
}
```

このとき、親`Posts`コンポーネントのスナップショットだけがサーバーに送信されます。

ここで疑問になるのは、「親が再レンダリングされる際、子`show-post`コンポーネントはどうなるのか？」という点です。スナップショットが送信されていない子は再レンダリングされるのでしょうか？

答えは「再レンダリングされません」。

Livewireが`Posts`コンポーネントをレンダリングする際、子コンポーネントが見つかるとプレースホルダーを出力します。

更新後の`Posts`コンポーネントのHTML例：

```html
<div wire:id="123">
    投稿上限: <input type="number" wire:model.live="postLimit">

    <div wire:id="456"></div>
</div>
```

このHTMLがフロントエンドで受信されると、Livewireは親コンポーネントの古いHTMLを新しいHTMLへ「モーフ」しますが、子コンポーネントのプレースホルダー部分は賢くスキップします。

結果として、親`Posts`コンポーネントの最終的なDOMは次のようになります：

```html
<div wire:id="123">
    投稿上限: <input type="number" wire:model.live="postLimit">

    <div wire:id="456">
        <h1>最初の投稿</h1>

        <p>投稿コンテンツ</p>

        <button wire:click="$refresh">投稿をリフレッシュ</button>
    </div>
</div>
```

## パフォーマンスへの影響

Livewireの「島」アーキテクチャは、アプリケーションに良い影響も悪い影響も与えます。

この仕組みの利点は、アプリケーションの重い処理部分を独立したコンポーネントとして分離できる点です。たとえば、重いDBクエリを独立したコンポーネントに隔離すれば、そのパフォーマンスの影響が他の部分に波及しません。

一方で最大のデメリットは、コンポーネント同士が完全に独立しているため、相互の連携や依存関係の実現が難しくなる点です。

たとえば、親`Posts`コンポーネントから子`ShowPost`コンポーネントへプロパティを渡しても、それは「リアクティブ」にはなりません。各コンポーネントが「島」なので、親で値が変わっても子には自動で反映されません。

Livewireはこうした課題を克服するため、[リアクティブプロパティ](/docs/nesting#reactive-props)、[Modelableコンポーネント](/docs/nesting#binding-to-child-data-using-wiremodel)、[$parentオブジェクト](/docs/nesting#directly-accessing-the-parent-from-the-child)などの専用APIを用意しています。

Livewireのネスト動作を理解しておくことで、アプリケーション内でコンポーネントをどのようにネストするか、より適切な判断ができるようになります。



