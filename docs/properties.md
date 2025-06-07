<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/properties.md -->
Livewireのコンポーネント内でデータを保持・管理するのが「プロパティ」です。プロパティはコンポーネントクラスのpublicプロパティとして定義され、サーバー・クライアントの両方からアクセス・変更できます。

## プロパティの初期化

プロパティの初期値は、コンポーネントの`mount()`メソッド内で設定できます。

次の例を見てみましょう。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class TodoList extends Component
{
    public $todos = [];

    public $todo = '';

    public function mount()
    {
        $this->todos = Auth::user()->todos; // [tl! highlight]
    }

    // ...
}
```

この例では、空の`todos`配列を定義し、認証済みユーザーの既存のToDoリストで初期化しています。これにより、コンポーネントが最初に表示される際、データベースに保存されているすべてのToDoがユーザーに表示されます。

## 一括割り当て

`mount()`メソッド内で多くのプロパティを初期化するのは冗長に感じることがあります。これを助けるために、Livewireは`fill()`メソッドを介して複数のプロパティを一度に割り当てる便利な方法を提供します。プロパティ名とそれぞれの値の連想配列を渡すことで、複数のプロパティを同時に設定し、`mount()`内の冗長なコードを削減できます。

例えば：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class UpdatePost extends Component
{
    public $post;

    public $title;

    public $description;

    public function mount(Post $post)
    {
        $this->post = $post;

        $this->fill( // [tl! highlight]
            $post->only('title', 'description'), // [tl! highlight]
        ); // [tl! highlight]
    }

    // ...
}
```

`$post->only(...)`が、渡された名前に基づいてモデル属性と値の連想配列を返すため、`$title`と`$description`プロパティは、データベースの`$post`モデルの`title`と`description`に初期設定されます。これにより、各プロパティを個別に設定する必要がなくなります。

## データバインディング

Livewireは、`wire:model` HTML属性を介して双方向データバインディングをサポートしています。これにより、コンポーネントプロパティとHTML入力の間でデータを簡単に同期させ、ユーザーインターフェースとコンポーネントの状態を同期させることができます。

`TodoList`コンポーネントの`$todo`プロパティを基本的な入力要素にバインドするために、`wire:model`ディレクティブを使用してみましょう。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class TodoList extends Component
{
    public $todos = [];

    public $todo = '';

    public function add()
    {
        $this->todos[] = $this->todo;

        $this->todo = '';
    }

    // ...
}
```

```blade
<div>
    <input type="text" wire:model="todo" placeholder="Todo..."> <!-- [tl! highlight] -->

    <button wire:click="add">Add Todo</button>

    <ul>
        @foreach ($todos as $todo)
            <li>{{ $todo }}</li>
        @endforeach
    </ul>
</div>
```

上記の例では、テキスト入力の値は、「Add Todo」ボタンがクリックされたときにサーバー上の`$todo`プロパティと同期されます。

これは`wire:model`のほんの表面をなぞったに過ぎません。データバインディングの詳細については、[フォームに関するドキュメント](/docs/forms)を参照してください。

## プロパティのリセット

時には、ユーザーによってアクションが実行された後にプロパティを初期状態にリセットする必要があるかもしれません。このような場合に、Livewireは1つまたは複数のプロパティ名を受け取り、それらの値を初期状態にリセットする`reset()`メソッドを提供します。

以下の例では、「Add Todo」ボタンがクリックされた後に`todo`フィールドをリセットするために、`$this->reset()`を使用してコードの重複を避けることができます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class ManageTodos extends Component
{
    public $todos = [];

    public $todo = '';

    public function addTodo()
    {
        $this->todos[] = $this->todo;

        $this->reset('todo'); // [tl! highlight]
    }

    // ...
}
```

上記の例では、「Add Todo」をクリックした後、追加されたばかりのtodoを保持している入力フィールドがクリアされ、新しいtodoを書き込むことができるようになります。

> [!warning] `reset()`は`mount()`で設定された値には機能しません
> `reset()`は、`mount()`メソッドが呼び出される前の状態にプロパティをリセットします。`mount()`でプロパティを別の値に初期化した場合は、手動でプロパティをリセットする必要があります。

## プロパティの取得

また、`pull()`メソッドを使用して、リセットと取得を1つの操作で実行することもできます。

以下は、上記と同じ例ですが、`pull()`を使用して簡略化されています。

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class ManageTodos extends Component
{
    public $todos = [];

    public $todo = '';

    public function addTodo()
    {
        $this->todos[] = $this->pull('todo'); // [tl! highlight]
    }

    // ...
}
```

上記の例では、単一の値をプルしていますが、`pull()`はすべてまたは一部のプロパティをリセットして取得するためにも使用できます（キーと値のペアとして）：

```php
// $this->all()と$this->reset()と同じ
$this->pull();

// $this->only(...)と$this->reset(...)と同じ
$this->pull(['title', 'content']);
```

## サポートされているプロパティタイプ

Livewireは、サーバーリクエスト間でコンポーネントデータを管理する独自のアプローチのため、限られたセットのプロパティタイプをサポートしています。

Livewireコンポーネントの各プロパティは、リクエスト間でJSONにシリアル化または「脱水」され、次のリクエストのためにPHPに「再水和」されます。

この双方向変換プロセスには特定の制限があり、Livewireが操作できるプロパティのタイプが制限されます。

### プリミティブタイプ

Livewireは、文字列や整数などのプリミティブタイプをサポートしています。これらのタイプはJSONへの変換とそこからの変換が容易であり、Livewireコンポーネントのプロパティとして使用するのに理想的です。

Livewireがサポートするプリミティブプロパティタイプは次のとおりです： `Array`, `String`, `Integer`, `Float`, `Boolean`, および `Null`。

```php
class TodoList extends Component
{
    public $todos = []; // 配列

    public $todo = ''; // 文字列

    public $maxTodos = 10; // 整数

    public $showTodos = false; // 真偽値

    public $todoFilter; // null
}
```

### 一般的なPHPタイプ

プリミティブタイプに加えて、LivewireはLaravelアプリケーションで使用される一般的なPHPオブジェクトタイプもサポートしています。ただし、これらのタイプは各リクエストごとにJSONに「脱水」され、PHPに「再水和」されることに注意してください。つまり、クロージャなどの実行時値はプロパティに保持されません。また、クラス名などのオブジェクトに関する情報がJavaScriptに公開される可能性があります。

サポートされているPHPタイプ：
| タイプ | 完全クラス名 |
|------|-----------------|
| BackedEnum | `BackedEnum` |
| Collection | `Illuminate\Support\Collection` |
| Eloquent Collection | `Illuminate\Database\Eloquent\Collection` |
| Model | `Illuminate\Database\Eloquent\Model` |
| DateTime | `DateTime` |
| Carbon | `Carbon\Carbon` |
| Stringable | `Illuminate\Support\Stringable` |

> [!warning] Eloquentコレクションとモデル
> LivewireプロパティにEloquentコレクションとモデルを格納する場合、select(...)のような追加のクエリ制約は、後続のリクエストでは再適用されません。
>
> 詳細については、[リクエスト間でEloquent制約が保持されない](#eloquent-constraints-arent-preserved-between-requests)を参照してください。

これらのさまざまなタイプとしてプロパティを設定する例を次に示します。

```php
public function mount()
{
    $this->todos = collect([]); // コレクション

    $this->todos = Todos::all(); // Eloquentコレクション

    $this->todo = Todos::first(); // モデル

    $this->date = new DateTime('now'); // DateTime

    $this->date = new Carbon('now'); // Carbon

    $this->todo = str(''); // Stringable
}
```

### カスタムタイプのサポート

Livewireは、2つの強力なメカニズムを介してアプリケーションがカスタムタイプをサポートすることを許可します。

* Wireables
* Synthesizers

Wireablesはほとんどのアプリケーションにとってシンプルで使いやすいものであるため、以下で詳しく説明します。より柔軟性を求める上級ユーザーやパッケージ作成者向けには、[Synthesizersが適しています](/docs/synthesizers)。

#### Wireables

Wireablesは、アプリケーション内の`Wireable`インターフェースを実装する任意のクラスです。

たとえば、アプリケーションに顧客に関する主要なデータを含む`Customer`オブジェクトがあると仮定します。

```php
class Customer
{
    protected $name;
    protected $age;

    public function __construct($name, $age)
    {
        $this->name = $name;
        $this->age = $age;
    }
}
```

このクラスのインスタンスをLivewireコンポーネントプロパティに設定しようとすると、`Customer`プロパティタイプがサポートされていないというエラーが発生します。

```php
class ShowCustomer extends Component
{
    public Customer $customer;

    public function mount()
    {
        $this->customer = new Customer('Caleb', 29);
    }
}
```

ただし、`Wireable`インターフェースを実装し、クラスに`toLivewire()`メソッドと`fromLivewire()`メソッドを追加することで、これを解決できます。これらのメソッドは、LivewireにこのタイプのプロパティをJSONに変換し、再びPHPに戻す方法を指示します。

```php
use Livewire\Wireable;

class Customer implements Wireable
{
    protected $name;
    protected $age;

    public function __construct($name, $age)
    {
        $this->name = $name;
        $this->age = $age;
    }

    public function toLivewire()
    {
        return [
            'name' => $this->name,
            'age' => $this->age,
        ];
    }

    public static function fromLivewire($value)
    {
        $name = $value['name'];
        $age = $value['age'];

        return new static($name, $age);
    }
}
```

これで、`Customer`オブジェクトをLivewireコンポーネントに自由に設定できるようになり、LivewireはこれらのオブジェクトをJSONに変換し、再びPHPに戻す方法を知っています。

前述のように、よりグローバルで強力なタイプサポートを提供するために、LivewireはSynthesizersを提供しています。これは、さまざまなプロパティタイプを処理するための高度な内部メカニズムです。 [Synthesizersの詳細](/docs/synthesizers)をご覧ください。

## JavaScriptからのプロパティへのアクセス

Livewireプロパティはブラウザでも利用可能なため、AlpineJSからそのJavaScript表現にアクセスし、操作できます。

Alpineは、Livewireに含まれる軽量のJavaScriptライブラリです。 Alpineは、完全なサーバー往復を行うことなく、Livewireコンポーネントに軽量のインタラクションを構築する方法を提供します。

内部的に、LivewireのフロントエンドはAlpineの上に構築されています。 実際、すべてのLivewireコンポーネントは、実際にはAlpineコンポーネントです。 つまり、Livewireコンポーネント内でAlpineを自由に利用できるということです。

このページの残りの部分では、Alpineに関する基本的な知識があることを前提としています。 Alpineに不慣れな場合は、[Alpineのドキュメント](https://alpinejs.dev/docs)を参照してください。

### プロパティへのアクセス

LivewireはAlpineに`$wire`というマジックオブジェクトを公開しています。 この`$wire`オブジェクトには、Livewireコンポーネント内の任意のAlpine式からアクセスできます。

`$wire`オブジェクトは、JavaScript版のLivewireコンポーネントのように扱うことができます。 PHP版のコンポーネントと同じプロパティとメソッドをすべて持っていますが、テンプレート内で特定の機能を実行するためのいくつかの専用メソッドも含まれています。

たとえば、`$wire`を使用して`todo`入力フィールドのライブ文字数を表示してみましょう。

```blade
<div>
    <input type="text" wire:model="todo">

    Todo character length: <h2 x-text="$wire.todo.length"></h2>
</div>
```

ユーザーがフィールドに入力すると、現在書き込まれているtodoの文字数がページ上に表示され、ライブで更新されます。これにより、サーバーへのネットワークリクエストを送信することなく、リアルタイムでのフィードバックが可能になります。

好みに応じて、同じことを達成するためにより明示的な`.get()`メソッドを使用することもできます。

```blade
<div>
    <input type="text" wire:model="todo">

    Todo character length: <h2 x-text="$wire.get('todo').length"></h2>
</div>
```

### プロパティの操作

同様に、JavaScriptを使用して`$wire`を介してLivewireコンポーネントプロパティを操作できます。

たとえば、`TodoList`コンポーネントに「クリア」ボタンを追加して、ユーザーがJavaScriptのみを使用して入力フィールドをリセットできるようにしてみましょう。

```blade
<div>
    <input type="text" wire:model="todo">

    <button x-on:click="$wire.todo = ''">Clear</button>
</div>
```

ユーザーが「クリア」をクリックすると、入力は空の文字列にリセットされ、サーバーへのネットワークリクエストを送信することなく、即座にフィードバックが得られます。

その後のリクエストで、サーバー側の`$todo`の値が更新され、同期されます。

好みに応じて、クライアント側のプロパティを設定するために、より明示的な`.set()`メソッドを使用することもできます。ただし、デフォルトで`.set()`を使用すると、ネットワークリクエストが即座にトリガーされ、サーバーと状態が同期されることに注意してください。これが望ましい場合は、これは優れたAPIです。

```blade
<button x-on:click="$wire.set('todo', '')">Clear</button>
```

ネットワークリクエストをサーバーに送信せずにプロパティを更新するには、3番目のブール値のパラメータを渡すことができます。これにより、ネットワークリクエストが遅延され、次のリクエストでサーバー側で状態が同期されます。

```blade
<button x-on:click="$wire.set('todo', '', false)">Clear</button>
```

## セキュリティに関する懸念

Livewireプロパティは強力な機能ですが、使用する前に認識しておくべきいくつかのセキュリティ上の考慮事項があります。

簡単に言うと、常にpublicプロパティをユーザー入力として扱い、従来のエンドポイントからのリクエスト入力として扱う必要があります。この観点から、データベースに永続化する前に、プロパティを検証および認可することが重要です。これは、コントローラーでリクエスト入力を扱うときと同様です。

### プロパティ値を信頼しない

プロパティの認可と検証を怠ることでアプリケーションにセキュリティホールが生じる様子を示すために、次の`UpdatePost`コンポーネントは攻撃に対して脆弱です。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class UpdatePost extends Component
{
    public $id;
    public $title;
    public $content;

    public function mount(Post $post)
    {
        $this->id = $post->id;
        $this->title = $post->title;
        $this->content = $post->content;
    }

    public function update()
    {
        $post = Post::findOrFail($this->id);

        $post->update([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        session()->flash('message', 'Post updated successfully!');
    }

    public function render()
    {
        return view('livewire.update-post');
    }
}
```

```blade
<form wire:submit="update">
    <input type="text" wire:model="title">
    <input type="text" wire:model="content">

    <button type="submit">Update</button>
</form>
```

一見すると、このコンポーネントは完全に正常に見えます。しかし、攻撃者がこのコンポーネントを使用してアプリケーション内で不正な操作を行う方法を見てみましょう。

`id`をプロパティとして公開しているため、クライアント側で`id`を変更することができます。これにより、悪意のあるユーザーは、次のようにブラウザのDevToolsを使用してビューを簡単に変更できます。

```blade
<form wire:submit="update">
    <input type="text" wire:model="id"> <!-- [tl! highlight] -->
    <input type="text" wire:model="title">
    <input type="text" wire:model="content">

    <button type="submit">Update</button>
</form>
```

これで、悪意のあるユーザーは、別の投稿モデルのIDに`id`入力を更新できます。フォームが送信され、`update()`が呼び出されると、`Post::findOrFail()`は、ユーザーが所有していない投稿を返して更新します。

この種の攻撃を防ぐために、次のいずれかまたは両方の戦略を使用できます。

* 入力を認可する
* プロパティの更新をロックする

#### 入力の認可

`wire:model`のようにクライアント側で変更可能な`$id`は、Laravelの[認可](https://laravel.com/docs/authorization)を使用して、現在のユーザーが投稿を更新できるかどうかを確認できます。

```php
public function update()
{
    $post = Post::findOrFail($this->id);

    $this->authorize('update', $post); // [tl! highlight]

    $post->update(...);
}
```

悪意のあるユーザーが`$id`プロパティを変更しても、追加された認可により、それがキャッチされてエラーがスローされます。

#### プロパティのロック

Livewireは、クライアント側でのプロパティの変更を防ぐためにプロパティを「ロック」することもできます。プロパティをクライアント側の操作からロックするには、`#[Locked]`属性を使用します。

```php
use Livewire\Attributes\Locked;
use Livewire\Component;

class UpdatePost extends Component
{
    #[Locked] // [tl! highlight]
    public $id;

    // ...
}
```

これで、ユーザーがフロントエンドで`$id`を変更しようとすると、エラーがスローされます。

`#[Locked]`を使用することで、このプロパティがコンポーネントのクラスの外部で変更されていないと仮定できます。

プロパティのロックに関する詳細は、[ロックされたプロパティのドキュメント](/docs/locked)を参照してください。

#### Eloquentモデルとロック

EloquentモデルがLivewireコンポーネントプロパティに割り当てられると、Livewireは自動的にプロパティをロックし、IDが変更されないようにします。これにより、この種の攻撃から保護されます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class UpdatePost extends Component
{
    public Post $post; // [tl! highlight]
    public $title;
    public $content;

    public function mount(Post $post)
    {
        $this->post = $post;
        $this->title = $post->title;
        $this->content = $post->content;
    }

    public function update()
    {
        $this->post->update([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        session()->flash('message', 'Post updated successfully!');
    }

    public function render()
    {
        return view('livewire.update-post');
    }
}
```

### プロパティはシステム情報をブラウザに公開します

もう1つ重要なことは、Livewireプロパティはブラウザに送信される前にシリアル化または「脱水」されることです。これにより、プロパティの値がワイヤー越しに送信され、JavaScriptによって理解される形式に変換されます。この形式は、アプリケーションに関する情報、プロパティの名前やクラス名を含む可能性があります。

たとえば、Livewireコンポーネントに`$post`という名前のpublicプロパティが定義されているとします。このプロパティには、データベースから取得した`Post`モデルのインスタンスが含まれています。この場合、このプロパティの脱水された値は、次のようになります。

```json
{
    "type": "model",
    "class": "App\Models\Post",
    "key": 1,
    "relationships": []
}
```

ご覧のとおり、`$post`プロパティの脱水された値には、モデルのクラス名（`App\Models\Post`）やID、事前にロードされたリレーションシップなどが含まれています。

クラス名を公開したくない場合は、サービスプロバイダからLaravelの「morphMap」機能を使用して、モデルクラス名にエイリアスを割り当てることができます。

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Relation::morphMap([
            'post' => 'App\Models\Post',
        ]);
    }
}
```

これで、Eloquentモデルが「脱水」されると、元のクラス名は公開されず、代わりに「post」エイリアスだけが公開されます。

```json
{
    "type": "model",
    "class": "App\Models\Post", // [tl! remove]
    "class": "post", // [tl! add]
    "key": 1,
    "relationships": []
}
```

### Eloquent制約はリクエスト間で保持されません

通常、Livewireはリクエスト間でサーバー側のプロパティを保持および再作成できます。ただし、リクエスト間で値を保持できない特定のシナリオがあります。

たとえば、LivewireプロパティとしてEloquentコレクションを格納する場合、`select(...)`のような追加のクエリ制約は、後続のリクエストでは再適用されません。

次の`ShowTodos`コンポーネントを考えてみてください。このコンポーネントには、`Todos` Eloquentコレクションに対して`select()`制約が適用されています。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class ShowTodos extends Component
{
    public $todos;

    public function mount()
    {
        $this->todos = Auth::user()
            ->todos()
            ->select(['title', 'content']) // [tl! highlight]
            ->get();
    }

    public function render()
    {
        return view('livewire.show-todos');
    }
}
```

このコンポーネントが最初に読み込まれると、`$todos`プロパティはユーザーのtodosのEloquentコレクションに設定されます。ただし、各データベース行の`title`と`content`フィールドのみがクエリされ、モデルにロードされます。

Livewireが後続のリクエストでこのプロパティのJSONをPHPに「再水和」するとき、select制約は失われます。

Eloquentクエリの整合性を確保するために、プロパティの代わりに[計算プロパティ](/docs/computed-properties)を使用することをお勧めします。

計算プロパティは、`#[Computed]`属性でマークされたコンポーネント内のメソッドです。これらは、コンポーネントの状態の一部として保存されず、オンザフライで評価される動的プロパティとしてアクセスできます。

次のように、計算プロパティを使用して上記の例を書き換えます。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

class ShowTodos extends Component
{
    #[Computed] // [tl! highlight]
    public function todos()
    {
        return Auth::user()
            ->todos()
            ->select(['title', 'content'])
            ->get();
    }

    public function render()
    {
        return view('livewire.show-todos');
    }
}
```

これらの_ todos_にBladeビューからアクセスする方法は次のとおりです。

```blade
<ul>
    @foreach ($this->todos as $todo)
        <li>{{ $todo }}</li>
    @endforeach
</ul>
```

ビュー内では、常に`$this`オブジェクトのように、`$this->todos`の計算プロパティにアクセスできることに注意してください。

クラス内からも`$todos`にアクセスできます。たとえば、`markAllAsComplete()`アクションがある場合：

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Attributes\Computed;
use Livewire\Component;

class ShowTodos extends Component
{
    #[Computed]
    public function todos()
    {
        return Auth::user()
            ->todos()
            ->select(['title', 'content'])
            ->get();
    }

    public function markAllComplete() // [tl! highlight:3]
    {
        $this->todos->each->complete();
    }

    public function render()
    {
        return view('livewire.show-todos');
    }
}
```

なぜ必要なときに直接`$this->todos()`メソッドを呼び出さないのか疑問に思うかもしれません。なぜ`#[Computed]`を使用するのか？

その理由は、計算プロパティにはパフォーマンス上の利点があるからです。なぜなら、リクエスト中に最初に使用された後は自動的にキャッシュされるからです。これにより、コンポーネント内で自由に`$this->todos`にアクセスでき、実際のメソッドが複数回呼び出されることはなく、同じリクエスト内で高価なクエリが複数回実行されることがありません。

詳細については、[計算プロパティのドキュメント](/docs/computed-properties)をご覧ください。
