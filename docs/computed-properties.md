---
title: 計算プロパティ
---

Computed properties are a way to create "derived" properties in Livewire. Like accessors on an Eloquent model, computed properties allow you to access values and cache them for future access during the request.

Computed properties are particularly useful in combination with component's public properties.

## Basic usage

To create a computed property, you can add the `#[Computed]` attribute above any method in your Livewire component. Once the attribute has been added to the method, you can access it like any other property.

> [!warning] Make sure you import attribute classes
> Make sure you import any attribute classes. For example, the below `#[Computed]` attribute requires the following import `use Livewire\Attributes\Computed;`.

For example, here's a `ShowUser` component that uses a computed property named `user()` to access a `User` Eloquent model based on a property named `$userId`:

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

Because the `#[Computed]` attribute has been added to the `user()` method, the value is accessible in other methods in the component and within the Blade template.

> [!info] Must use `$this` in your template
> Unlike normal properties, computed properties aren't directly available inside your component's template. Instead, you must access them on the `$this` object. For example, a computed property named `posts()` must be accessed via `$this->posts` inside your template.

> [!warning] Computed properties are not supported on `Livewire\Form` objects.
> Trying to use a Computed property within a [Form](https://livewire.laravel.com/docs/forms) will result in an error when you attempt to access the property in blade using $form->property syntax.

## Performance advantage

You may be asking yourself: why use computed properties at all? Why not just call the method directly?

Accessing a method as a computed property offers a performance advantage over calling a method. Internally, when a computed property is executed for the first time, Livewire caches the returned value. This way, any subsequent accesses in the request will return the cached value instead of executing multiple times.

This allows you to freely access a derived value and not worry about the performance implications.

> [!warning] Computed properties are only cached for a single request
> It's a common misconception that Livewire caches computed properties for the entire lifespan of your Livewire component on a page. However, this isn't the case. Instead, Livewire only caches the result for the duration of a single component request. This means that if your computed property method contains an expensive database query, it will be executed every time your Livewire component performs an update.

### Busting the cache

Consider the following problematic scenario:
1) You access a computed property that depends on a certain property or database state
2) The underlying property or database state changes
3) The cached value for the property becomes stale and needs to be re-computed

To clear, or "bust", the stored cache, you can use PHP's `unset()` function.

Below is an example of an action called `createPost()` that, by creating a new post in the application, makes the `posts()` computed stale — meaning the computed property `posts()` needs to be re-computed to include the newly added post:

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

        unset($this->posts); // [tl! highlight]
    }

    #[Computed]
    public function posts()
    {
        return Auth::user()->posts;
    }

    // ...
}
```

上記のコンポーネントでは、`createPost()` メソッドが新しい投稿を作成する前に `$this->posts` にアクセスしているため、コンピューテッドプロパティは新しい投稿が作成される前の状態でキャッシュされます。ビュー内で `$this->posts` を最新の内容にするには、`unset($this->posts)` を使ってキャッシュを無効化します。

### リクエスト間でのキャッシュ

Livewire コンポーネントのライフサイクル全体でコンピューテッドプロパティの値をキャッシュしたい場合もあります（リクエストごとにクリアされるのではなく）。このような場合は、[Laravel のキャッシュユーティリティ](https://laravel.com/docs/cache#retrieve-store)を利用できます。

以下は `user()` というコンピューテッドプロパティの例です。Eloquent クエリを直接実行する代わりに、`Cache::remember()` でラップすることで、今後のリクエストではクエリを再実行せず Laravel のキャッシュから値を取得できるようにしています。

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
        $seconds = 3600; // 1 hour...

        return Cache::remember($key, $seconds, function () {
            return User::find($this->userId);
        });
    }

    // ...
}
```

Because each unique instance of a Livewire component has a unique ID, we can use `$this->getId()` to generate a unique cache key that will only be applied to future requests for this same component instance.

But, as you may have noticed, most of this code is predictable and can easily be abstracted. Because of this, Livewire's `#[Computed]` attribute provides a helpful `persist` parameter. By applying `#[Computed(persist: true)]` to a method, you can achieve the same result without any extra code:

```php
use Livewire\Attributes\Computed;
use App\Models\User;

#[Computed(persist: true)]
public function user()
{
    return User::find($this->userId);
}
```

In the example above, when `$this->user` is accessed from your component, it will continue to be cached for the duration of the Livewire component on the page. This means the actual Eloquent query will only be executed once.

Livewire caches persisted values for 3600 seconds (one hour). You can override this default by passing an additional `seconds` parameter to the `#[Computed]` attribute:

```php
#[Computed(persist: true, seconds: 7200)]
```

> [!tip] Calling `unset()` will bust this cache
> As previously discussed, you can clear a computed property's cache using PHP's `unset()` method. This also applies to computed properties using the `persist: true` parameter. When calling `unset()` on a cached computed property, Livewire will clear not only the computed property cache, but also the underlying cached value in Laravel's cache.

## Caching across all components

Instead of caching the value of a computed property for the duration of a single component's lifecycle, you can cache the value of a computed across all components in your application using the `cache: true` parameter provided by the `#[Computed]` attribute:

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed(cache: true)]
public function posts()
{
    return Post::all();
}
```

In the above example, until the cache expires or is busted, every instance of this component in your application will share the same cached value for `$this->posts`.

If you need to manually clear the cache for a computed property, you may set a custom cache key using the `key` parameter:

```php
use Livewire\Attributes\Computed;
use App\Models\Post;

#[Computed(cache: true, key: 'homepage-posts')]
public function posts()
{
    return Post::all();
}
```

## When to use computed properties?

In addition to offering performance advantages, there are a few other scenarios where computed properties are helpful。

特に、コンポーネントの Blade テンプレートにデータを渡すときに、コンピューテッドプロパティを使うことでより適したケースがいくつかあります。以下は、投稿のコレクションを Blade テンプレートに渡すシンプルなコンポーネントの `render()` メソッドの例です。

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

この方法でも多くのケースで十分ですが、コンピューテッドプロパティを使うことでより適したケースが３つあります。

### 値への条件付きアクセス

Blade テンプレート内で計算コストの高い値に条件付きでアクセスする場合、コンピューテッドプロパティを使うことでパフォーマンスの無駄を減らせます。

以下はコンピューテッドプロパティを使わない場合のテンプレート例です。

```blade
<div>
    @if (Auth::user()->can_see_posts)
        @foreach ($posts as $post)
            <!-- ... -->
        @endforeach
    @endif
</div>
```

この場合、ユーザーが投稿の閲覧を制限されていても、投稿を取得するためのデータベースクエリはすでに実行されてしまい、テンプレート内で実際には使われません。

次に、同じシナリオをコンピューテッドプロパティで書き直した例です。

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

このように、コンピューテッドプロパティを使ってテンプレートにデータを渡すことで、必要なときだけデータベースクエリが実行されるようになります。

### インラインテンプレートの利用

コンピューテッドプロパティが役立つもう１つのケースは、[インラインテンプレート](/docs/components#inline-components)を使う場合です。

以下は `render()` メソッド内でテンプレート文字列を直接返しているインラインコンポーネントの例です。この場合、ビューにデータを渡す機会がありません。

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

このような場合、コンピューテッドプロパティがなければ Blade テンプレートに明示的にデータを渡す方法がありません。

### render メソッドの省略

Livewire では、コンポーネントの `render()` メソッド自体を省略して記述量を減らすこともできます。`render()` メソッドを省略した場合、Livewire は自動的に対応する Blade ビューを返す `render()` メソッドを内部的に利用します。

この場合、Blade ビューにデータを渡すための `render()` メソッドが存在しません。

このようなときも、`render()` メソッドを再び追加するのではなく、コンピューテッドプロパティを使ってビューにデータを提供できます。

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
