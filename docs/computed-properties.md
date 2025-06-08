---
title: 算出プロパティ
---

算出プロパティ（Computed properties）は、Livewire で「派生プロパティ」を作成するための仕組みです。Eloquent モデルのアクセサのように、算出プロパティを使うことで値を取得し、その値をリクエスト中にキャッシュして再利用できます。

算出プロパティは、特にコンポーネントの public プロパティと組み合わせて使うと便利です。

## 基本的な使い方

算出プロパティを作成するには、Livewire コンポーネント内の任意のメソッドの上に `#[Computed]` 属性を追加します。この属性を付けたメソッドは、他のプロパティと同じようにアクセスできます。

:::warning 属性クラスのインポートを忘れずに
属性クラスのインポートを忘れずに。たとえば、下記の `#[Computed]` 属性を使う場合は、`use Livewire\Attributes\Computed;` のインポートが必要です。
:::

例えば、`ShowUser` コンポーネントで `$userId` プロパティをもとに `User` モデルを取得する `user()` という算出プロパティを定義する例です。

```php
<?php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\User;

class ShowUser extends Component
{
    public $userId;

    #[Computed]
    public function user()
    {
        return User::find($this->userId);
    }

    public function follow()
    {
        Auth::user()->follow($this->user);
    }

    public function render()
    {
        return view('livewire.show-user');
    }
}
```

```blade
<div>
    <h1>{{ $this->user->name }}</h1>

    <span>{{ $this->user->email }}</span>

    <button wire:click="follow">Follow</button>
</div>
```

`user()` メソッドに `#[Computed]` 属性を付けることで、他のメソッドや Blade テンプレート内でも `$this->user` として値にアクセスできます。

:::info
テンプレート内では `$this` を使う必要があります
:::

> 通常のプロパティとは異なり、算出プロパティはコンポーネントのテンプレート内で直接参照できません。必ず `$this->プロパティ名` の形でアクセスしてください。たとえば、`posts()` という算出プロパティは、テンプレート内で `$this->posts` として参照します。

:::warning 算出プロパティは `Livewire\Form` オブジェクトではサポートされていません。
[Form](https://livewire.laravel.com/docs/forms) 内で算出プロパティを使い、Blade で `$form->property` のようにアクセスしようとするとエラーになります。
:::


## パフォーマンス上の利点

「なぜ算出プロパティを使う必要があるのか？メソッドを直接呼び出せばいいのでは？」と思うかもしれません。

算出プロパティとしてメソッドを呼び出すと、パフォーマンス上の利点があります。内部的には、算出プロパティが最初に実行されたときに値がキャッシュされ、同じリクエスト内で再度アクセスしてもメソッドが何度も実行されず、キャッシュされた値が返されます。

これにより、計算コストの高い値でも安心して何度も参照できます。

:::warning 算出プロパティのキャッシュは1リクエストのみ有効です
算出プロパティは Livewire コンポーネントのページ上でずっとキャッシュされると誤解されがちですが、実際は1リクエストごとにキャッシュされます。たとえば、算出プロパティ内で重いDBクエリがあっても、Livewire のリクエストごとに毎回実行されます。
:::

### キャッシュのクリア（バスト）

次のような問題が起こる場合があります：

1. ある算出プロパティが特定のプロパティやDBの状態に依存している
2. そのプロパティやDBの状態が変化する
3. キャッシュされた値が古くなり、再計算が必要になる

このような場合、PHP の `unset()` 関数でキャッシュをクリア（バスト）できます。

以下は、`createPost()` アクションで新しい投稿を作成した際に、`posts()` 算出プロパティのキャッシュをクリアする例です。

```php
<?php

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

class ShowPosts extends Component
{
    public function createPost()
    {
        if ($this->posts->count() > 10) {
            throw new \Exception('Maximum post count exceeded');
        }

        Auth::user()->posts()->create(...);

        // highlight-next-line
        unset($this->posts);
    }

    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    // ...
}
```

上記の例では、`createPost()` メソッド内で新しい投稿を作成する前に `$this->posts` にアクセスしているため、算出プロパティは作成前の状態でキャッシュされます。ビューで最新の `$this->posts` を取得するには、`unset($this->posts)` でキャッシュをクリアします。

### リクエストをまたいだキャッシュ

Livewire コンポーネントのライフサイクル全体で算出プロパティの値をキャッシュしたい場合は、[Laravel のキャッシュユーティリティ](https://laravel.com/docs/cache#retrieve-store)を利用できます。

以下は `user()` 算出プロパティの例です。Eloquent クエリを直接実行する代わりに、`Cache::remember()` でラップすることで、今後のリクエストではクエリを再実行せず Laravel のキャッシュから値を取得できます。

```php
<?php

use Illuminate\Support\Facades\Cache;
use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\User;

class ShowUser extends Component
{
    public $userId;

    #[Computed]
    public function user()
    {
        $key = 'user'.$this->getId();
        $seconds = 3600; // 1時間

        return Cache::remember($key, $seconds, function () {
            return User::find($this->userId);
        });
    }

    // ...
}
```

Livewire コンポーネントごとに一意の ID が割り当てられるため、`$this->getId()` を使ってキャッシュキーを生成し、同じインスタンスでのみキャッシュが共有されるようにしています。

ただし、こうしたコードはパターン化できるため、Livewire の `#[Computed]` 属性には `persist` パラメータが用意されています。`#[Computed(persist: true)]` をメソッドに付けるだけで、同じ効果が得られます。

```php
use Livewire\Attributes\Computed;
use App\Models\User;

#[Computed(persist: true)]
public function user()
{
    return User::find($this->userId);
}
```

上記の例では、`$this->user` にアクセスすると、Livewire コンポーネントのライフサイクル中は値がキャッシュされ、実際の Eloquent クエリは1回だけ実行されます。

Livewire では、`persist: true` の場合、デフォルトで3600秒（1時間）キャッシュされます。キャッシュ時間は `seconds` パラメータで変更できます。

```php
#[Computed(persist: true, seconds: 7200)]
```

:::tip `unset()` でキャッシュをクリアできます
先述の通り、PHP の `unset()` で算出プロパティのキャッシュをクリアできます。`persist: true` の場合も同様で、Livewire のキャッシュと Laravel のキャッシュの両方がクリアされます。
:::

## 全コンポーネント間でのキャッシュ共有

ひとつのコンポーネントのライフサイクルだけでなく、アプリケーション内の全コンポーネントで算出プロパティの値を共有したい場合は、`#[Computed]` 属性の `cache: true` パラメータを使います。

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed(cache: true)]
public function posts()
{
    return Post::all();
}
```

この例では、キャッシュが有効な間、アプリケーション内のすべてのコンポーネントで `$this->posts` の値が共有されます。

算出プロパティのキャッシュを手動でクリアしたい場合は、`key` パラメータでカスタムキーを指定できます。

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed(cache: true, key: 'homepage-posts')]
public function posts()
{
    return Post::all();
}
```

## 算出プロパティを使うべき場面

パフォーマンス面以外にも、算出プロパティが役立つ場面があります。

特に、コンポーネントの Blade テンプレートにデータを渡す際に、算出プロパティを使うことで便利なケースがいくつかあります。以下は、投稿のコレクションを Blade テンプレートに渡すシンプルな `render()` メソッドの例です。

```php
public function render()
{
    return view('livewire.show-posts', [
        'posts' => Post::all(),
    ]);
}
```

```blade
<div>
    @foreach ($posts as $post)
        <!-- ... -->
    @endforeach
</div>
```

この方法でも十分な場合が多いですが、算出プロパティを使うことでより適したケースが3つあります。

### 値への条件付きアクセス

Blade テンプレート内で計算コストの高い値に条件付きでアクセスする場合、算出プロパティを使うことでパフォーマンスの無駄を防げます。

算出プロパティを使わない場合の例：

```blade
<div>
    @if (Auth::user()->can_see_posts)
        @foreach ($posts as $post)
            <!-- ... -->
        @endforeach
    @endif
</div>
```

この場合、ユーザーが投稿を閲覧できなくても、`$posts` のDBクエリは実行されてしまいます。

同じシナリオを算出プロパティで書き直すと：

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed]
public function posts()
{
    return Post::all();
}

public function render()
{
    return view('livewire.show-posts');
}
```

```blade
<div>
    @if (Auth::user()->can_see_posts)
        @foreach ($this->posts as $post)
            <!-- ... -->
        @endforeach
    @endif
</div>
```

このように算出プロパティを使うことで、必要なときだけDBクエリが実行されます。

### インラインテンプレートの利用

算出プロパティが役立つもうひとつのケースは、[インラインテンプレート](/docs/components#inline-components)を使う場合です。

以下は `render()` メソッド内でテンプレート文字列を直接返すインラインコンポーネントの例です。この場合、ビューにデータを渡す手段がありません。

```php
<?php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    #[Computed]
    public function posts()
    {
        return Post::all();
    }

    public function render()
    {
        return <<<HTML
        <div>
            @foreach ($this->posts as $post)
                <!-- ... -->
            @endforeach
        </div>
        HTML;
    }
}
```

このような場合、算出プロパティがなければ Blade テンプレートに明示的にデータを渡す方法がありません。

### render メソッドの省略

Livewire では、コンポーネントの `render()` メソッド自体を省略して記述量を減らすこともできます。`render()` メソッドを省略した場合、Livewire は自動的に対応する Blade ビューを返す `render()` メソッドを内部的に利用します。

この場合、Blade ビューにデータを渡すための `render()` メソッドが存在しません。

このようなときも、`render()` メソッドを再び追加するのではなく、算出プロパティを使ってビューにデータを提供できます。

```php
<?php

use Livewire\Attributes\Computed;
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    #[Computed]
    public function posts()
    {
        return Post::all();
    }
}
```

```blade
<div>
    @foreach ($this->posts as $post)
        <!-- ... -->
    @endforeach
</div>
```
