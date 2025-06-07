Livewire では、コンポーネントのライフサイクルの特定のタイミングでコードを実行できる、さまざまなライフサイクルフックが用意されています。これらのフックを使うことで、コンポーネントの初期化やプロパティの更新、テンプレートのレンダリングなど、特定のイベントの前後で処理を挟むことができます。

以下は、利用可能なコンポーネントのライフサイクルフック一覧です。

| フックメソッド                | 説明                                                                 |
|-------------------------------|----------------------------------------------------------------------|
| `mount()`                     | コンポーネントが生成されたときに呼び出されます                       |
| `hydrate()`                   | 2回目以降のリクエストで、コンポーネントが再構築される際に呼び出されます |
| `boot()`                      | すべてのリクエストの最初に呼び出されます（初回・2回目以降の両方）      |
| `updating()`                  | コンポーネントのプロパティが更新される直前に呼び出されます             |
| `updated()`                   | プロパティが更新された直後に呼び出されます                             |
| `rendering()`                 | `render()` が呼ばれる直前に呼び出されます                             |
| `rendered()`                  | `render()` が呼ばれた直後に呼び出されます                             |
| `dehydrate()`                 | すべてのコンポーネントリクエストの最後に呼び出されます                 |
| `exception($e, $stopPropagation)` | 例外がスローされたときに呼び出されます                        |

## Mount

通常の PHP クラスでは、コンストラクタ（`__construct()`）で外部からのパラメータを受け取り、オブジェクトの状態を初期化します。しかし、Livewire では `mount()` メソッドを使って、パラメータの受け取りやコンポーネントの初期化を行います。

Livewire コンポーネントは、ネットワークリクエストのたびに _再構築_ されるため、コンポーネントを初めて作成したときにのみ初期化を行う `__construct()` は使用しません。

以下は、`mount()` メソッドを使用して `UpdateProfile` コンポーネントの `name` と `email` プロパティを初期化する例です。

```php
use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class UpdateProfile extends Component
{
    public $name;

    public $email;

    public function mount()
    {
        $this->name = Auth::user()->name;

        $this->email = Auth::user()->email;
    }

    // ...
}
```

前述のとおり、`mount()` メソッドはコンポーネントに渡されたデータをメソッドのパラメータとして受け取ります。

```php
use Livewire\Component;
use App\Models\Post;

class UpdatePost extends Component
{
    public $title;

    public $content;

    public function mount(Post $post)
    {
        $this->title = $post->title;

        $this->content = $post->content;
    }

    // ...
}
```

> [!tip] すべてのフックメソッドで依存性注入が使用可能
> Livewire では、ライフサイクルフックのメソッドパラメータに型ヒントを指定することで、[Laravel のサービスコンテナ](https://laravel.com/docs/container#automatic-injection) から依存関係を解決できます。

`mount()` メソッドは Livewire を使用する上で重要な部分です。以下のドキュメントでは、`mount()` メソッドを使用して一般的なタスクを実行するさらなる例が示されています。

* [プロパティの初期化](/docs/properties#initializing-properties)
* [親コンポーネントからのデータの受信](/docs/nesting#passing-props-to-children)
* [ルートパラメータへのアクセス](/docs/components#accessing-route-parameters)

## Boot

`mount()` メソッドが非常に便利である一方で、コンポーネントライフサイクルのたびに1回だけ実行されるため、特定のコンポーネントに対するすべてのリクエストの最初にロジックを実行したい場合には不十分です。

このような場合に備えて、Livewire では `boot()` メソッドが用意されており、コンポーネントクラスが起動されるたびに実行したいセットアップコードを記述できます。初期化時とその後のリクエストの両方で実行されます。

`boot()` メソッドは、リクエスト間で永続化されないプロパティを初期化するのに便利です。以下は、Eloquent モデルとして保護されたプロパティを初期化する例です。

```php
use Livewire\Attributes\Locked;
use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    #[Locked]
    public $postId = 1;

    protected Post $post;

    public function boot() // [tl! highlight:3]
    {
        $this->post = Post::find($this->postId);
    }

    // ...
}
```

このテクニックを使用すると、Livewire コンポーネント内のコンポーネントプロパティの初期化を完全に制御できます。

> [!tip] ほとんどの場合、計算プロパティを使用するだけで済みます
> 上記のテクニックは強力ですが、[Livewire の計算プロパティ](/docs/computed-properties) を使用してこのユースケースを解決する方が良い場合がよくあります。

> [!warning] 常に機密の公開プロパティをロックしてください
> 上記のように、`#[Locked]` 属性を `$postId` プロパティに使用しています。上記のようなシナリオでは、`$postId` プロパティがクライアント側で改ざんされないことを保証するために、使用する前にプロパティの値を認可するか、プロパティが変更されないように `#[Locked]` を追加することが重要です。
>
> 詳細については、[ロックされたプロパティに関するドキュメント](/docs/locked) を参照してください。

## Update

クライアント側のユーザーは、最も一般的には `wire:model` を使用している入力を変更することで、公開プロパティをさまざまな方法で更新できます。

Livewire では、公開プロパティの更新を intercept して、設定される前に値を検証または認可したり、プロパティが特定の形式で設定されるようにしたりするための便利なフックが提供されています。

以下は、`updating` を使用して `$postId` プロパティの変更を防止する例です。

この特定の例では、実際のアプリケーションでは、上記の例と同様に、むしろ [`#[Locked]` 属性](/docs/locked) を使用すべきであることに注意してください。

```php
use Exception;
use Livewire\Component;

class ShowPost extends Component
{
    public $postId = 1;

    public function updating($property, $value)
    {
        // $property: 現在更新中のプロパティの名前
        // $value: プロパティに設定されようとしている値

        if ($property === 'postId') {
            throw new Exception;
        }
    }

    // ...
}
```

上記の `updating()` メソッドは、プロパティが更新される前に実行されるため、無効な入力をキャッチしてプロパティの更新を防ぐことができます。以下は、`updated()` を使用してプロパティの値の一貫性を確保する例です。

```php
use Livewire\Component;

class CreateUser extends Component
{
    public $username = '';

    public $email = '';

    public function updated($property)
    {
        // $property: 現在更新されたプロパティの名前

        if ($property === 'username') {
            $this->username = strtolower($this->username);
        }
    }

    // ...
}
```

これで、クライアント側で `$username` プロパティが更新されるたびに、その値が常に小文字であることが保証されます。

更新フックを使用する際に特定のプロパティをターゲットにすることが多いため、Livewire ではこのテクニックを使用してプロパティ名をメソッド名の一部として直接指定できます。上記の例を、これを利用して書き換えたものが以下です。

```php
use Livewire\Component;

class CreateUser extends Component
{
    public $username = '';

    public $email = '';

    public function updatedUsername()
    {
        $this->username = strtolower($this->username);
    }

    // ...
}
```

もちろん、このテクニックは `updating` フックにも適用できます。

### 配列

配列プロパティには、これらの関数に渡される追加の `$key` 引数があり、変更される要素を指定します。

配列自体が特定のキーではなく更新される場合、`$key` 引数は null になります。

```php
use Livewire\Component;

class UpdatePreferences extends Component
{
    public $preferences = [];

    public function updatedPreferences($value, $key)
    {
        // $value = 'dark'
        // $key   = 'theme'
    }

    // ...
}
```

## Hydrate & Dehydrate

Hydrate と dehydrate はあまり知られておらず、あまり利用されていないフックですが、特定のシナリオでは強力な機能を発揮します。

「dehydrate」と「hydrate」という用語は、Livewire コンポーネントがクライアント側用に JSON にシリアライズされ、その後のリクエストで PHP オブジェクトに再シリアライズされるプロセスを指します。

私たちはしばしば、Livewire のコードベースやドキュメント全体でこのプロセスを指して「hydrate」および「dehydrate」という用語を使用します。これらの用語についてさらに明確にしたい場合は、[ハイドレーションに関するドキュメント](/docs/hydration) を参照してください。

次に、`mount()` 、 `hydrate()` 、および `dehydrate()` をすべて一緒に使用して、コンポーネント内の投稿データを Eloquent モデルの代わりにカスタムの [データ転送オブジェクト (DTO)](https://en.wikipedia.org/wiki/Data_transfer_object) を使用する例を見てみましょう。

```php
use Livewire\Component;

class ShowPost extends Component
{
    public $post;

    public function mount($title, $content)
    {
        // 最初のリクエストの最初に実行される...

        $this->post = new PostDto([
            'title' => $title,
            'content' => $content,
        ]);
    }

    public function hydrate()
    {
        // すべての「2回目以降の」リクエストの最初に実行される...
        // 初回リクエストでは実行されない（「mount」が実行される）...

        $this->post = new PostDto($this->post);
    }

    public function dehydrate()
    {
        // すべてのリクエストの最後に実行される...

        $this->post = $this->post->toArray();
    }

    // ...
}
```

これで、アクションやコンポーネント内の他の場所から、原始的なデータの代わりに `PostDto` オブジェクトにアクセスできるようになります。

上記の例は、主に `hydrate()` および `dehydrate()` フックの機能と性質を示しています。ただし、これを達成するには、むしろ [Wireables または Synthesizers](/docs/properties#supporting-custom-types) を使用することをお勧めします。

## Render

コンポーネントの Blade ビューのレンダリングプロセスにフックしたい場合は、`rendering()` および `rendered()` フックを使用できます。

```php
use Livewire\Component;
use App\Models\Post;

class ShowPosts extends Component
{
    public function render()
    {
        return view('livewire.show-posts', [
            'post' => Post::all(),
        ])
    }

    public function rendering($view, $data)
    {
        // 提供されたビューがレンダリングされる前に実行される...
        //
        // $view: レンダリングされるビュー
        // $data: ビューに提供されるデータ
    }

    public function rendered($view, $html)
    {
        // 提供されたビューがレンダリングされた後に実行される...
        //
        // $view: レンダリングされたビュー
        // $html: 最終的にレンダリングされた HTML
    }

    // ...
}
```

## Exception

エラーを intercept してキャッチすることが役立つ場合があります。例えば、エラーメッセージをカスタマイズしたり、特定のタイプの例外を無視したりするためです。`exception()` フックを使用すると、まさにそのことができます。 `$error` をチェックし、 `$stopPropagation` パラメータを使用して問題をキャッチできます。
これは、コードのさらなる実行を停止したいとき（早期リターン）にも強力なパターンを解放します。これが、内部メソッド `validate()` が機能する方法です。

```php
use Livewire\Component;

class ShowPost extends Component
{
    public function mount() // [tl! highlight:3]
    {
        $this->post = Post::find($this->postId);
    }

    public function exception($e, $stopPropagation) {
        if ($e instanceof NotFoundException) {
            $this->notify('Post is not found');
            $stopPropagation();
        }
    }

    // ...
}
```

## Using hooks inside a trait

トレイトは、コンポーネント間でコードを再利用したり、単一のコンポーネントからコードを専用ファイルに抽出したりするのに役立ちます。

ライフサイクルフックメソッドを宣言する際に複数のトレイトが互いに競合しないようにするために、Livewire では、現在それらを宣言しているトレイトの _キャメルケース_ 名でフックメソッドを接頭辞付けすることがサポートされています。

これにより、同じライフサイクルフックを使用する複数のトレイトを持ち、メソッド定義の競合を回避できます。

以下は、`HasPostForm` というトレイトを参照しているコンポーネントの例です。

```php
use Livewire\Component;

class CreatePost extends Component
{
    use HasPostForm;

    // ...
}
```

ここに、すべての利用可能なプレフィックス付きフックを含む実際の `HasPostForm` トレイトがあります。

```php
trait HasPostForm
{
    public $title = '';

    public $content = '';

    public function mountHasPostForm()
    {
        // ...
    }

    public function hydrateHasPostForm()
    {
        // ...
    }

    public function bootHasPostForm()
    {
        // ...
    }

    public function updatingHasPostForm()
    {
        // ...
    }

    public function updatedHasPostForm()
    {
        // ...
    }

    public function renderingHasPostForm()
    {
        // ...
    }

    public function renderedHasPostForm()
    {
        // ...
    }

    public function dehydrateHasPostForm()
    {
        // ...
    }

    // ...
}
```

## Using hooks inside a form object

フォームオブジェクトでは、プロパティ更新フックがサポートされています。これらのフックは、[コンポーネント更新フック](#update) と似ており、フォームオブジェクト内のプロパティが変更されたときにアクションを実行できます。

以下は、`PostForm` フォームオブジェクトを使用しているコンポーネントの例です。

```php
use Livewire\Component;

class CreatePost extends Component
{
    public PostForm $form;

    // ...
}
```

ここに、すべての利用可能なフックを含む `PostForm` フォームオブジェクトがあります。

```php
namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;

class PostForm extends Form
{
    public $title = '';

    public $tags = [];

    public function updating($property, $value)
    {
        // ...
    }

    public function updated($property, $value)
    {
        // ...
    }

    public function updatingTitle($value)
    {
        // ...
    }

    public function updatedTitle($value)
    {
        // ...
    }

    public function updatingTags($value, $key)
    {
        // ...
    }

    public function updatedTags($value, $key)
    {
        // ...
    }

    // ...
}
```
