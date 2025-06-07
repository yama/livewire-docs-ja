---
title: セッションプロパティ
---

<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/session-properties.md -->
Livewireでは、`#[Session]`属性を使うことで、プロパティの値をページのリフレッシュや遷移後も簡単に保持できます。

コンポーネント内のプロパティに`#[Session]`を付与すると、そのプロパティの値が変更されるたびにLivewireが自動的にセッションへ保存します。ページをリフレッシュした際も、セッションから最新の値が取得され、コンポーネントで利用されます。

`#[Session]`属性は、[`#[Url]`](/docs/url)属性と似た用途で使われます。どちらも同じような場面で役立ちますが、主な違いは`#[Session]`がURLのクエリストリングを変更せずに値を保持できる点です。URLを変更したくない場合などに便利です。

## 基本的な使い方

次の例は、`ShowPosts`コンポーネントで、ユーザーが`$search`プロパティに入力した文字列で投稿を絞り込めるようにしています。

```php
<?php

use Livewire\Attributes\Session;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    #[Session] // [tl! highlight]
    public $search;

    protected function posts()
    {
        return $this->search === ''
            ? Post::all()
            : Post::where('title', 'like', '%'.$this->search.'%');
    }

    public function render()
    {
        return view('livewire.show-posts', [
            'posts' => $this->posts(),
        ]);
    }
}
```

`#[Session]`属性を`$search`プロパティに追加したことで、ユーザーが検索値を入力した後にページをリフレッシュしても、その検索値が保持されるようになります。`$search`が更新されるたびに、その新しい値がユーザーのセッションに保存され、ページの読み込みをまたいで利用されます。

> [!warning] パフォーマンスへの影響
> Laravelのセッションは、リクエストのたびにメモリに読み込まれるため、ユーザーのセッションに過剰なデータを保存すると、アプリケーション全体のパフォーマンスが低下する可能性があります。

## カスタムキーの設定

`[#Session]`を使用する際、Livewireはコンポーネント名とプロパティ名を組み合わせた動的に生成されたキーを使用して、セッションにプロパティ値を保存します。

これにより、コンポーネントインスタンス間でプロパティが同じセッション値を使用することが保証されます。また、異なるコンポーネントの同名のプロパティが衝突することもありません。

特定のプロパティに対してLivewireが使用するセッションキーを完全に制御したい場合は、`key:`パラメータを渡すことができます。

```php
<?php

use Livewire\Attributes\Session;
use Livewire\Component;

class ShowPosts extends Component
{
    #[Session(key: 'search')] // [tl! highlight]
    public $search;

    // ...
}
```

Livewireが`$search`プロパティの値を保存および取得する際には、指定されたキー「search」を使用します。

さらに、コンポーネント内の他のプロパティから動的にキーを生成したい場合は、次の波括弧表記を使用できます。

```php
<?php

use Livewire\Attributes\Session;
use Livewire\Component;
use App\Models\Author;

class ShowPosts extends Component
{
    public Author $author;

    #[Session(key: 'search-{author.id}')] // [tl! highlight]
    public $search;

    // ...
}
```

上記の例では、`$author`モデルのIDが「4」の場合、セッションキーは`search-4`になります。
