---
title: URL
---

Livewireでは、コンポーネントのプロパティをURLのクエリ文字列に保存できます。たとえば、`$search`プロパティをURLに含めることで、`https://example.com/users?search=bob`のように状態を共有・ブックマークできるようになります。これは、フィルタ・ソート・ページネーションなど、ページの特定状態を共有したい場合に特に便利です。

## 基本的な使い方

以下は、ユーザー名で検索できる`ShowUsers`コンポーネントの例です：

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Url;
use Livewire\Component;
use App\Models\User;

class ShowUsers extends Component
{
    public $search = '';

    public function render()
    {
        return view('livewire.show-users', [
            'users' => User::search($this->search)->get(),
        ]);
    }
}
```

```blade
<div>
    <input type="text" wire:model.live="search">

    <ul>
        @foreach ($users as $user)
            <li wire:key="{{ $user->id }}">{{ $user->name }}</li>
        @endforeach
    </ul>
</div>
```

このように、テキスト入力で`wire:model.live="search"`を使うと、入力のたびにネットワークリクエストが送信され、`$search`プロパティが更新されてページ上のユーザー一覧が絞り込まれます。

ただし、ページをリロードすると検索値や結果は失われてしまいます。

検索値をページリロードやURL共有時にも保持したい場合は、`#[Url]`属性を`$search`プロパティの上に追加します：

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Url;
use Livewire\Component;
use App\Models\User;

class ShowUsers extends Component
{
    #[Url] // [tl! highlight]
    public $search = '';

    public function render()
    {
        return view('livewire.show-users', [
            'posts' => User::search($this->search)->get(),
        ]);
    }
}
```

これで、たとえば「bob」と入力すると、ブラウザのURLバーは次のようになります：

```
https://example.com/users?search=bob
```

このURLを新しいウィンドウで開くと、「bob」が検索欄に自動入力され、結果も絞り込まれます。

## URLからプロパティを初期化

`#[Url]`を使うと、値が更新されるたびにクエリ文字列へ保存されるだけでなく、ページロード時に既存のクエリ値も参照されます。

たとえば、`https://example.com/users?search=bob`でアクセスすると、`$search`の初期値は「bob」になります。

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url]
    public $search = ''; // Will be set to "bob"...

    // ...
}
```

### null許容プロパティ

デフォルトでは、`?search=`のように空のクエリ値があると、Livewireはそれを空文字列として扱います。ただし、`?search=`を`null`として扱いたい場合は、nullable型ヒントを使います：

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url]
    public ?string $search; // [tl! highlight]

    // ...
}
```

上記のように型ヒントに`?`がある場合、Livewireは`?search=`を`null`として扱います。逆に、アプリケーション内で`$this->search = null`とした場合も、クエリ文字列は`?search=`となります。

## エイリアスの利用

クエリ文字列で表示される名前は自由に変更できます。たとえば、`$search`プロパティを`q`という短い名前でURLに出したい場合、`#[Url]`属性の`as`パラメータを使います：

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(as: 'q')]
    public $search = '';

    // ...
}
```

これで「bob」と入力すると、URLは`https://example.com/users?q=bob`となります。

## 特定の値を除外

デフォルトでは、Livewireは初期値から変更があった場合のみクエリ文字列に値を出力します。より細かく制御したい場合は、`except`パラメータを使います。

たとえば、`mount()`で初期値を変更している場合、`except: ''`を指定すると、`search`が空文字列のときだけクエリから除外されます：

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(except: '')]
    public $search = '';

    public function mount() {
        $this->search = auth()->user()->username;
    }

    // ...
}
```

`except`がない場合、`search`が`auth()->user()->username`と同じ値になった時点でクエリから除外されますが、`except: ''`を使うことで空文字列のときだけ除外されるようになります。

## ページロード時も常に表示

デフォルトでは、`$search`の初期値が空文字列の場合、URLに`?search`は表示されません。値が空でも常にクエリ文字列に出したい場合は、`keep`パラメータを使います：

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(keep: true)]
    public $search = '';

    // ...
}
```

これでページロード時も`https://example.com/users?search=`のように常にクエリが表示されます。

## 履歴への保存

デフォルトでは、Livewireは[`history.replaceState()`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState)でURLを書き換えます。つまり、クエリ更新時にブラウザの履歴を新規追加せず、現在の履歴エントリを上書きします。

そのため、ブラウザの「戻る」ボタンを押すと、前の`?search=`値ではなく前のページに戻ります。

URL更新時に`history.pushState`を使いたい場合は、`history`パラメータを指定します：

```php
use Livewire\Attributes\Url;
use Livewire\Component;

class ShowUsers extends Component
{
    #[Url(history: true)]
    public $search = '';

    // ...
}
```

この例では、ユーザーが検索値を「bob」から「frank」に変更し、ブラウザの戻るボタンをクリックすると、検索値（およびURL）は「bob」に戻ります。

## queryStringメソッドの利用

クエリ文字列はコンポーネントのメソッドとして定義することもできます。これは、一部のプロパティに動的オプションがある場合に便利です。

```php
use Livewire\Component;

class ShowUsers extends Component
{
    // ...

    protected function queryString()
    {
        return [
            'search' => [
                'as' => 'q',
            ],
        ];
    }
}
```

## トレイトフック

Livewireはクエリ文字列用の[フック](/docs/lifecycle-hooks)も提供しています。

```php
trait WithSorting
{
    // ...

    protected function queryStringWithSorting()
    {
        return [
            'sortBy' => ['as' => 'sort'],
            'sortDirection' => ['as' => 'direction'],
        ];
    }
}
```
