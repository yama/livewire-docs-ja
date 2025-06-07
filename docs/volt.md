---
title: Volt パッケージ
---

> [!warning] まずはLivewireの基本を理解しましょう
> Voltを使い始める前に、標準的なクラスベースのLivewireの使い方に慣れておくことをおすすめします。これにより、Livewireの知識をスムーズにVoltの関数型APIへ応用できます。

Voltは、Livewireのために設計された洗練された関数型APIで、PHPロジックとBladeテンプレートを同じファイル内で共存させる「シングルファイルコンポーネント」をサポートします。内部的には、この関数型APIはLivewireのクラスコンポーネントへとコンパイルされ、同じファイル内のテンプレートと連携します。

シンプルなVoltコンポーネントの例は次の通りです：

```php
<?php

use function Livewire\Volt\{state};

state(['count' => 0]);

$increment = fn () => $this->count++;

?>

<div>
    <h1>{{ $count }}</h1>
    <button wire:click="increment">+</button>
</div>
```

## インストール

まずはComposerパッケージマネージャーを使ってVoltをプロジェクトにインストールします：

```bash
composer require livewire/volt
```

Voltをインストールした後は、`volt:install` Artisanコマンドを実行して、Voltのサービスプロバイダーをアプリケーションにインストールします。このサービスプロバイダーは、Voltがシングルファイルコンポーネントを検索するためのマウントディレクトリを指定します：

```bash
php artisan volt:install
```

## コンポーネントの作成

Voltコンポーネントは、`.blade.php`拡張子のファイルをVoltのマウントディレクトリのいずれかに配置することで作成できます。デフォルトでは、`VoltServiceProvider`が`resources/views/livewire`と`resources/views/pages`ディレクトリをマウントしますが、これらのディレクトリはVoltサービスプロバイダーの`boot`メソッドでカスタマイズ可能です。

便利なことに、`make:volt` Artisanコマンドを使用して新しいVoltコンポーネントを作成できます：

```bash
php artisan make:volt counter
```

コンポーネントを生成する際に`--test`ディレクティブを追加すると、対応するテストファイルも生成されます。関連するテストに[Pest](https://pestphp.com/)を使用したい場合は、`--pest`フラグを使用する必要があります：

```bash
php artisan make:volt counter --test --pest
```


`--class`ディレクティブを追加すると、クラスベースのVoltコンポーネントが生成されます。

```bash
php artisan make:volt counter --class
```

## APIスタイル

Voltの関数型APIを利用することで、インポートした`Livewire\Volt`関数を通じてLivewireコンポーネントのロジックを定義できます。次に、Voltは関数型コードを従来のLivewireクラスに変換・コンパイルし、ボイラープレートを削減しつつLivewireの広範な機能を活用できるようにします。

VoltのAPIは、使用されるクロージャを基盤となるコンポーネントに自動的にバインドします。したがって、アクション、計算プロパティ、リスナーは、いつでも`$this`変数を使用してコンポーネントを参照できます：

```php
use function Livewire\Volt\{state};

state(['count' => 0]);

$increment = fn () => $this->count++;

// ...
```

### クラスベースのVoltコンポーネント

Voltのシングルファイルコンポーネントの機能を享受しながら、クラスベースのコンポーネントを書きたい場合でも安心です。始めるには、`Livewire\Volt\Component`を拡張する匿名クラスを定義します。クラス内では、従来のLivewire構文を使用してLivewireのすべての機能を利用できます：

```blade
<?php

use Livewire\Volt\Component;

new class extends Component {
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }
} ?>

<div>
    <h1>{{ $count }}</h1>
    <button wire:click="increment">+</button>
</div>
```

#### クラス属性

通常のLivewireコンポーネントと同様に、Voltコンポーネントはクラス属性をサポートしています。匿名PHPクラスを利用する場合、クラス属性は`new`キーワードの後に定義する必要があります：

```blade
<?php

use Livewire\Attributes\{Layout, Title};
use Livewire\Volt\Component;

new
#[Layout('layouts.guest')]
#[Title('Login')]
class extends Component
{
    public string $name = '';

    // ...
```

#### 追加のビューデータの提供

クラスベースのVoltコンポーネントを使用しているとき、レンダリングされるビューは同じファイル内に存在するテンプレートです。ビューがレンダリングされるたびに追加のデータをビューに渡す必要がある場合、`with`メソッドを使用できます。このデータは、コンポーネントのパブリックプロパティに加えて、ビューに渡されます：

```blade
<?php

use Livewire\WithPagination;
use Livewire\Volt\Component;
use App\Models\Post;

new class extends Component {
    use WithPagination;

    public function with(): array
    {
        return [
            'posts' => Post::paginate(10),
        ];
    }
} ?>

<div>
    <!-- ... -->
</div>
```

#### ビューインスタンスの修正

時には、ビューインスタンスに直接対話し、翻訳された文字列を使用してビューのタイトルを設定するなどの操作を行いたい場合があります。これを実現するために、コンポーネントに`rendering`メソッドを定義できます：

```blade
<?php

use Illuminate\View\View;
use Livewire\Volt\Component;

new class extends Component {
    public function rendering(View $view): void
    {
        $view->title('Create Post');

        // ...
    }

    // ...
```

## コンポーネントのレンダリングとマウント

通常のLivewireコンポーネントと同様に、VoltコンポーネントはLivewireのタグ構文や`@livewire` Bladeディレクティブを使用してレンダリングできます：

```blade
<livewire:user-index :users="$users" />
```

コンポーネントの受け入れるプロパティを宣言するには、`state`関数を使用します：

```php
use function Livewire\Volt\{state};

state('users');

// ...
```

必要に応じて、コンポーネントに渡されるプロパティをインターセプトすることも可能で、`state`関数にクロージャを提供することで、与えられた値を操作・修正できます：

```php
use function Livewire\Volt\{state};

state(['count' => fn ($users) => count($users)]);
```

`mount`関数は、Livewireコンポーネントの「マウント」[ライフサイクルフック](/docs/lifecycle-hooks)を定義するために使用できます。コンポーネントに提供されるパラメータは、このメソッドに注入されます。マウントフックに必要なその他のパラメータは、Laravelのサービスコンテナによって解決されます：

```php
use App\Services\UserCounter;
use function Livewire\Volt\{mount};

mount(function (UserCounter $counter, $users) {
    $counter->store('userCount', count($users));

    // ...
});
```

### フルページコンポーネント

オプションとして、アプリケーションの`routes/web.php`ファイルにVoltルートを定義することで、Voltコンポーネントをフルページコンポーネントとしてレンダリングできます：

```php
use Livewire\Volt\Volt;

Volt::route('/users', 'user-index');
```

デフォルトでは、コンポーネントは`components.layouts.app`レイアウトを使用してレンダリングされます。このレイアウトファイルは、`layout`関数を使用してカスタマイズできます：

```php
use function Livewire\Volt\{layout, state};

state('users');

layout('components.layouts.admin');

// ...
```

ページのタイトルをカスタマイズするには、`title`関数を使用します：

```php
use function Livewire\Volt\{layout, state, title};

state('users');

layout('components.layouts.admin');

title('Users');

// ...
```

タイトルがコンポーネントの状態や外部依存関係に依存する場合、`title`関数にクロージャを渡すこともできます：

```php
use function Livewire\Volt\{layout, state, title};

state('users');

layout('components.layouts.admin');

title(fn () => 'Users: ' . $this->users->count());
```

## プロパティ

Voltプロパティは、Livewireプロパティと同様にビューで簡単にアクセスでき、Livewireの更新間で持続します。`state`関数を使用してプロパティを定義できます：

```php
<?php

use function Livewire\Volt\{state};

state(['count' => 0]);

?>

<div>
    {{ $count }}
</div>
```

状態プロパティの初期値が、データベースクエリやモデル、コンテナサービスなどの外部依存関係に依存する場合、その解決はクロージャ内にカプセル化する必要があります。これにより、値が絶対に必要になるまで解決されないようにします：

```php
use App\Models\User;
use function Livewire\Volt\{state};

state(['count' => fn () => User::count()]);
```

状態プロパティの初期値が、[Laravel Folioの](https://github.com/laravel/folio)ルートモデルバインディングを介して注入される場合も、クロージャ内にカプセル化する必要があります：

```php
use App\Models\User;
use function Livewire\Volt\{state};

state(['user' => fn () => $user]);
```

もちろん、プロパティは初期値を明示的に指定せずに宣言することもできます。そのような場合、初期値は`null`に設定されるか、レンダリング時にコンポーネントに渡されたプロパティに基づいて設定されます：

```php
use function Livewire\Volt\{mount, state};

state(['count']);

mount(function ($users) {
    $this->count = count($users);

    //
});
```

### ロックされたプロパティ

Livewireは、プロパティを保護する機能を提供しており、プロパティを「ロック」することで、クライアント側での変更を防ぐことができます。Voltを使用してこれを実現するには、保護したい状態に`locked`メソッドをチェーンします：

```php
state(['id'])->locked();
```

### リアクティブプロパティ

ネストされたコンポーネントを扱う際に、親コンポーネントから子コンポーネントにプロパティを渡し、親コンポーネントがプロパティを更新したときに子コンポーネントが自動的に更新されるようにする必要がある場合があります。

Voltを使用してこれを実現するには、リアクティブにしたい状態に`reactive`メソッドをチェーンします：

```php
state(['todos'])->reactive();
```

### モデル可能なプロパティ

リアクティブプロパティを使用したくない場合、Livewireは親コンポーネントと子コンポーネント間で状態を共有するための[モデル可能な機能](/docs/nesting#binding-to-child-data-using-wiremodel)を提供しており、子コンポーネント上で直接`wire:model`を使用できます。

Voltを使用してこれを実現するには、モデル可能にしたい状態に`modelable`メソッドをチェーンします：

```php
state(['form'])->modelable();
```

### 計算プロパティ

Livewireは、コンポーネントに必要な情報を遅延取得するのに役立つ[計算プロパティ](/docs/computed-properties)を定義することも可能です。計算プロパティの結果は、個々のLivewireリクエストライフサイクルのために「メモ化」またはキャッシュされます。

計算プロパティを定義するには、`computed`関数を使用します。変数の名前が計算プロパティの名前を決定します：

```php
<?php

use App\Models\User;
use function Livewire\Volt\{computed};

$count = computed(function () {
    return User::count();
});

?>

<div>
    {{ $this->count }}
</div>
```

計算プロパティの値をアプリケーションのキャッシュに永続化するには、計算プロパティ定義に`persist`メソッドをチェーンします：

```php
$count = computed(function () {
    return User::count();
})->persist();
```

デフォルトでは、Livewireは計算プロパティの値を3600秒間キャッシュします。この値は、`persist`メソッドに希望する秒数を指定することでカスタマイズできます：

```php
$count = computed(function () {
    return User::count();
})->persist(seconds: 10);
```

## アクション

Livewireの[アクション](/docs/actions)は、ページのインタラクションにリスニングし、コンポーネント上の対応するメソッドを呼び出してコンポーネントの再レンダリングを引き起こす便利な方法を提供します。多くの場合、アクションはユーザーがボタンをクリックしたときに呼び出されます。

Voltを使用してLivewireアクションを定義するには、単にクロージャを定義するだけです。クロージャを含む変数の名前がアクションの名前を決定します：

```php
<?php

use function Livewire\Volt\{state};

state(['count' => 0]);

$increment = fn () => $this->count++;

?>

<div>
    <h1>{{ $count }}</h1>
    <button wire:click="increment">+</button>
</div>
```

クロージャ内では、`$this`変数が基盤となるLivewireコンポーネントにバインドされており、通常のLivewireコンポーネントと同様にコンポーネント上の他のメソッドにアクセスできます：

```php
use function Livewire\Volt\{state};

state(['count' => 0]);

$increment = function () {
    $this->dispatch('count-updated');

    //
};
```

アクションは、Laravelのサービスコンテナから引数や依存関係を受け取ることもできます：

```php
use App\Repositories\PostRepository;
use function Livewire\Volt\{state};

state(['postId']);

$delete = function (PostRepository $posts) {
    $posts->delete($this->postId);

    // ...
};
```

### レンダーレスアクション

場合によっては、コンポーネントがレンダリングの変更を引き起こさないアクションを宣言することがあります。その場合、`action`関数内にアクションをカプセル化し、定義に`renderless`メソッドをチェーンすることで、Livewireのライフサイクルのレンダリングフェーズを[スキップ](/docs/actions#skipping-re-renders)できます：

```php
use function Livewire\Volt\{action};

$incrementViewCount = action(fn () => $this->viewCount++)->renderless();
```

### 保護されたヘルパー

デフォルトでは、すべてのVoltアクションは「パブリック」であり、クライアントによって呼び出すことができます。アクション内からのみアクセス可能な関数を作成したい場合は、`protect`関数を使用できます：

```php
use App\Repositories\PostRepository;
use function Livewire\Volt\{protect, state};

state(['postId']);

$delete = function (PostRepository $posts) {
    $this->ensurePostCanBeDeleted();

    $posts->delete($this->postId);

    // ...
};

$ensurePostCanBeDeleted = protect(function () {
    // ...
});
```

## フォーム

Livewireの[フォーム](/docs/forms)は、単一のクラス内でフォームのバリデーションと送信を簡単に処理する便利な方法を提供します。Voltコンポーネント内でLivewireフォームを使用するには、`form`関数を利用します：

```php
<?php

use App\Livewire\Forms\PostForm;
use function Livewire\Volt\{form};

form(PostForm::class);

$save = function () {
    $this->form->store();

    // ...
};

?>

<form wire:submit="save">
    <input type="text" wire:model="form.title">
    @error('form.title') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save</button>
</form>
```

ご覧のとおり、`form`関数はLivewireフォームクラスの名前を受け入れます。一度定義されると、フォームはコンポーネント内で`$this->form`プロパティを介してアクセスできます。

フォームに別のプロパティ名を使用したい場合は、`form`関数に第二引数として名前を渡すことができます：

```php
form(PostForm::class, 'postForm');

$save = function () {
    $this->postForm->store();

    // ...
};
```

## リスナー

Livewireのグローバルな[イベントシステム](/docs/events)は、コンポーネント間の通信を可能にします。ページ上に2つのLivewireコンポーネントが存在する場合、イベントとリスナーを利用して通信できます。Voltを使用する場合、リスナーは`on`関数を使用して定義できます：

```php
use function Livewire\Volt\{on};

on(['eventName' => function () {
    //
}]);
```

認証ユーザーやコンポーネントに渡されるデータに基づいて動的な名前をイベントリスナーに割り当てる必要がある場合、`on`関数にクロージャを渡すことができます。このクロージャは、コンポーネントパラメータやLaravelのサービスコンテナによって解決される追加の依存関係を受け取ることができます：

```php
on(fn ($post) => [
    'event-'.$post->id => function () {
        //
    }),
]);
```

便利なことに、リスナーを定義する際に「ドット」表記を使用してコンポーネントデータを参照することもできます：

```php
on(['event-{post.id}' => function () {
    //
}]);
```

## ライフサイクルフック

Livewireには、コンポーネントのライフサイクルのさまざまなポイントでコードを実行するために使用できるさまざまな[ライフサイクルフック](/docs/lifecycle-hooks)があります。Voltの便利なAPIを使用すると、これらのライフサイクルフックを対応する関数として定義できます：

```php
use function Livewire\Volt\{boot, booted, ...};

boot(fn () => /* ... */);
booted(fn () => /* ... */);
mount(fn () => /* ... */);
hydrate(fn () => /* ... */);
hydrate(['count' => fn () => /* ... */]);
dehydrate(fn () => /* ... */);
dehydrate(['count' => fn () => /* ... */]);
updating(['count' => fn () => /* ... */]);
updated(['count' => fn () => /* ... */]);
```

## レイジーローディングプレースホルダー

Livewireコンポーネントをレンダリングする際に、`lazy`パラメータをLivewireコンポーネントに渡すことで、初期ページが完全にロードされるまで[ロードを遅延させる](/docs/lazy)ことができます。デフォルトでは、Livewireはコンポーネントがロードされる場所に`<div></div>`タグをDOMに挿入します。

初期ページがロードされる間、コンポーネントのプレースホルダー内に表示されるHTMLをカスタマイズしたい場合は、`placeholder`関数を使用できます：

```php
use function Livewire\Volt\{placeholder};

placeholder('<div>Loading...</div>');
```

## バリデーション

Livewireは、Laravelの強力な[バリデーション機能](/docs/validation)に簡単にアクセスできるようにします。VoltのAPIを使用して、コンポーネントのバリデーションルールを`rules`関数を使用して定義できます。従来のLivewireコンポーネントと同様に、これらのルールは`validate`メソッドを呼び出すときにコンポーネントデータに適用されます：

```php
<?php

use function Livewire\Volt\{rules};

rules(['name' => 'required|min:6', 'email' => 'required|email']);

$submit = function () {
    $this->validate();

    // ...
};

?>

<form wire:submit.prevent="submit">
    //
</form>
```

認証ユーザーやデータベースの情報に基づいて動的にルールを定義する必要がある場合は、`rules`関数にクロージャを提供できます：

```php
rules(fn () => [
    'name' => ['required', 'min:6'],
    'email' => ['required', 'email', 'not_in:'.Auth::user()->email]
]);
```

### エラーメッセージと属性

バリデーション中に使用されるバリデーションメッセージや属性を変更するには、`rules`定義に`messages`と`attributes`メソッドをチェーンできます：

```php
use function Livewire\Volt\{rules};

rules(['name' => 'required|min:6', 'email' => 'required|email'])
    ->messages([
        'email.required' => 'The :attribute may not be empty.',
        'email.email' => 'The :attribute format is invalid.',
    ])->attributes([
        'email' => 'email address',
    ]);
```

## ファイルアップロード

Voltを使用すると、Livewireのおかげで[ファイルのアップロードと保存](/docs/uploads)がはるかに簡単になります。関数型Voltコンポーネントに`Livewire\WithFileUploads`トレイトを含めるには、`usesFileUploads`関数を使用します：

```php
use function Livewire\Volt\{state, usesFileUploads};

usesFileUploads();

state(['photo']);

$save = function () {
    $this->validate([
        'photo' => 'image|max:1024',
    ]);

    $this->photo->store('photos');
};
```

## URLクエリパラメータ

コンポーネントの状態が変化したときに[ブラウザのURLクエリパラメータを更新](/docs/url)することが便利な場合があります。このような場合、`url`メソッドを使用して、LivewireにURLクエリパラメータをコンポーネント状態の一部と同期させるよう指示できます：

```php
<?php

use App\Models\Post;
use function Livewire\Volt\{computed, state};

state(['search'])->url();

$posts = computed(function () {
    return Post::where('title', 'like', '%'.$this->search.'%')->get();
});

?>

<div>
    <input wire:model.live="search" type="search" placeholder="Search posts by title...">

    <h1>Search Results:</h1>

    <ul>
        @foreach($this->posts as $post)
            <li wire:key="{{ $post->id }}">{{ $post->title }}</li>
        @endforeach
    </ul>
</div>
```

Livewireがサポートする追加のURLクエリパラメータオプション（URLクエリパラメータのエイリアスなど）も、`url`メソッドに提供できます：

```php
use App\Models\Post;
use function Livewire\Volt\{state};

state(['page' => 1])->url(as: 'p', history: true, keep: true);

// ...
```

## ページネーション

LivewireとVoltは、[ページネーション](/docs/pagination)を完全にサポートしています。関数型VoltコンポーネントにLivewireの`Livewire\WithPagination`トレイトを含めるには、`usesPagination`関数を使用します：

```php
<?php

use function Livewire\Volt\{with, usesPagination};

usesPagination();

with(fn () => ['posts' => Post::paginate(10)]);

?>

<div>
    @foreach ($posts as $post)
        //
    @endforeach

    {{ $posts->links() }}
</div>
```

Laravelと同様に、LivewireのデフォルトのページネーションビューはTailwindクラスをスタイリングに使用しています。アプリケーションでBootstrapを使用している場合は、`usesPagination`関数を呼び出す際に希望するテーマを指定することで、Bootstrapページネーションテーマを有効にできます：

```php
usesPagination(theme: 'bootstrap');
```

## カスタムトレイトとインターフェース

任意のトレイトやインターフェースを関数型Voltコンポーネントに含めるには、`uses`関数を使用します：

```php
use function Livewire\Volt\{uses};

use App\Contracts\Sorting;
use App\Concerns\WithSorting;

uses([Sorting::class, WithSorting::class]);
```

## 匿名コンポーネント

時には、ページの一部を別のファイルに抽出することなくVoltコンポーネントに変換したい場合があります。たとえば、次のビューを返すLaravelルートを想像してみてください。

```php
Route::get('/counter', fn () => view('pages/counter.blade.php'));
```

ビューの内容は、レイアウト定義やスロットを含む通常のBladeテンプレートです。ただし、ビューの一部を`@volt` Bladeディレクティブでラップすることで、その部分を完全に機能するVoltコンポーネントに変換できます。

```php
<?php

use function Livewire\Volt\{state};

state(['count' => 0]);

$increment = fn () => $this->count++;

?>

<x-app-layout>
    <x-slot name="header">
        Counter
    </x-slot>

    @volt('counter')
        <div>
            <h1>{{ $count }}</h1>
            <button wire:click="increment">+</button>
        </div>
    @endvolt
</x-app-layout>
```

#### 匿名コンポーネントへのデータの渡し方

匿名コンポーネントを含むビューをレンダリングする際には、ビューに渡されるすべてのデータが匿名Voltコンポーネントにも利用可能になります：

```php
use App\Models\User;

Route::get('/counter', fn () => view('users.counter', [
    'count' => User::count(),
]));
```

もちろん、このデータをVoltコンポーネントの「状態」として宣言することもできます。ビューからプロキシされたデータを使用して状態を初期化する際には、状態変数の名前だけを宣言すれば十分です。Voltは自動的に状態のデフォルト値をプロキシされたビューデータを使用して水和します：

```php
<?php

use function Livewire\Volt\{state};

state('count');

$increment = function () {
    // 新しいカウント値をデータベースに保存...

    $this->count++;
};

?>

<x-app-layout>
    <x-slot name="header">
        Initial value: {{ $count }}
    </x-slot>

    @volt('counter')
        <div>
            <h1>{{ $count }}</h1>
            <button wire:click="increment">+</button>
        </div>
    @endvolt
</x-app-layout>
```

## コンポーネントのテスト

Voltコンポーネントのテストを開始するには、`Volt::test`メソッドを呼び出し、コンポーネントの名前を提供します：

```php
use Livewire\Volt\Volt;

it('increments the counter', function () {
    Volt::test('counter')
        ->assertSee('0')
        ->call('increment')
        ->assertSee('1');
});
```

Voltコンポーネントをテストする際は、標準の[LivewireテストAPI](/docs/testing)で提供されるすべてのメソッドを利用できます。

Voltコンポーネントがネストされている場合は、テストしたいコンポーネントを指定するために「ドット」表記を使用できます：

```php
Volt::test('users.stats')
```

匿名Voltコンポーネントを含むページをテストする際は、`assertSeeVolt`メソッドを使用してコンポーネントがレンダリングされていることを確認できます：

```php
$this->get('/users')
    ->assertSeeVolt('stats');
```
