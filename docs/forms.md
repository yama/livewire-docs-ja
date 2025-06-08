---
title: フォーム
---

フォームは多くのWebアプリケーションの基盤となるため、Livewireはフォーム構築を支援する多くの便利な機能を提供しています。シンプルな入力要素の扱いから、リアルタイムバリデーションやファイルアップロードのような複雑な処理まで、Livewireには開発を簡単にし、ユーザー体験を向上させるための分かりやすいツールが揃っています。

さっそく見ていきましょう。

## フォームの送信

まずは、`CreatePost`コンポーネント内のとてもシンプルなフォームを見てみましょう。このフォームには2つのテキスト入力と送信ボタンがあり、フォームの状態管理や送信処理を行うバックエンドのコードも含まれています。

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
        Post::create(
            $this->only(['title', 'content'])
        );

        session()->flash('status', 'Post successfully updated.');

        return $this->redirect('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

```blade
<form wire:submit="save">
    <input type="text" wire:model="title">

    <input type="text" wire:model="content">

    <button type="submit">Save</button>
</form>
```

ご覧の通り、上記のフォームでは`wire:model`を使用して、公開プロパティである`$title`と`$content`をバインディングしています。これはLivewireで最も一般的に使用される、かつ強力な機能の一つです。

`$title`と`$content`のバインディングに加えて、`wire:submit`を使用して「保存」ボタンがクリックされたときの`submit`イベントをキャッチし、`save()`アクションを呼び出しています。このアクションは、フォーム入力をデータベースに永続化します。

新しい投稿がデータベースに作成された後、ユーザーは`ShowPosts`コンポーネントのページにリダイレクトされ、新しい投稿が作成されたことを示す「フラッシュ」メッセージが表示されます。

### バリデーションの追加

不完全または危険なユーザー入力を保存しないようにするために、ほとんどのフォームには何らかの入力バリデーションが必要です。

Livewireでは、バリデーションを行いたいプロパティの上に`#[Validate]`属性を追加するだけで、フォームのバリデーションを非常に簡単に行うことができます。

プロパティに`#[Validate]`属性が付けられると、そのプロパティの値はサーバー側で更新されるたびにバリデーションルールが適用されます。

では、`CreatePost`コンポーネントの`$title`と`$content`プロパティに基本的なバリデーションルールを追加してみましょう：

```php
<?php

namespace App\Livewire;

// highlight-next-line
use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    // highlight-next-line
    #[Validate('required')]
    public $title = '';

    // highlight-next-line
    #[Validate('required')]
    public $content = '';

    public function save()
    {
        // highlight-next-line
        $this->validate();

        Post::create(
            $this->only(['title', 'content'])
        );

        return $this->redirect('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

また、Bladeテンプレートを修正して、ページ上にバリデーションエラーを表示するようにします。

```blade
<form wire:submit="save">
    <input type="text" wire:model="title">
    <div>
        <!-- highlight-next-line -->
        @error('title') <span class="error">{{ $message }}</span> @enderror
    </div>

    <input type="text" wire:model="content">
    <div>
        <!-- highlight-next-line -->
        @error('content') <span class="error">{{ $message }}</span> @enderror
    </div>

    <button type="submit">Save</button>
</form>
```

これで、ユーザーがフィールドに何も入力せずにフォームを送信しようとすると、どのフィールドに入力が必要かを示すバリデーションメッセージが表示されるようになります。

Livewireには、さらに多くのバリデーション機能があります。詳細については、[バリデーションに関する専用ドキュメントページ](/docs/validation)をご覧ください。

### フォームオブジェクトの抽出

大規模なフォームを扱っていて、そのすべてのプロパティ、バリデーションロジックなどを別のクラスに抽出したい場合、Livewireはフォームオブジェクトを提供しています。

フォームオブジェクトを使用すると、コンポーネント間でフォームロジックを再利用でき、すべてのフォーム関連コードを別のクラスにグループ化することでコンポーネントクラスをクリーンに保つことができます。

手動でフォームクラスを作成するか、便利なartisanコマンドを使用できます：

```shell
php artisan livewire:form PostForm
```

上記のコマンドは、`app/Livewire/Forms/PostForm.php`というファイルを作成します。

では、`CreatePost`コンポーネントを`PostForm`クラスを使用するように書き換えてみましょう：

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';
}
```

```php
<?php

namespace App\Livewire;

use App\Livewire\Forms\PostForm;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    // highlight-next-line
    public PostForm $form;

    public function save()
    {
        $this->validate();

        Post::create(
            // highlight-next-line
            $this->form->only(['title', 'content'])
        );

        return $this->redirect('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

```blade
<form wire:submit="save">
    <input type="text" wire:model="form.title">
    <div>
        @error('form.title') <span class="error">{{ $message }}</span> @enderror
    </div>

    <input type="text" wire:model="form.content">
    <div>
        @error('form.content') <span class="error">{{ $message }}</span> @enderror
    </div>

    <button type="submit">Save</button>
</form>
```

もしよろしければ、投稿作成ロジックをフォームオブジェクトに抽出することもできます：

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    // highlight-next-line
    public function store() 
    {
        $this->validate();

        Post::create($this->only(['title', 'content']));
    }
}
```

これで、コンポーネントから`$this->form->store()`を呼び出すことができます：

```php
class CreatePost extends Component
{
    public PostForm $form;

    public function save()
    {
    // highlight-next-line
        $this->form->store();

        return $this->redirect('/posts');
    }

    // ...
}
```

このフォームオブジェクトを作成と更新の両方に使用したい場合、両方のユースケースを処理できるように簡単に適応させることができます。

以下は、同じフォームオブジェクトを`UpdatePost`コンポーネントで使用し、初期データで埋める方法の例です：

```php
<?php

namespace App\Livewire;

use App\Livewire\Forms\PostForm;
use Livewire\Component;
use App\Models\Post;

class UpdatePost extends Component
{
    public PostForm $form;

    public function mount(Post $post)
    {
        $this->form->setPost($post);
    }

    public function save()
    {
        $this->form->update();

        return $this->redirect('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;
use App\Models\Post;

class PostForm extends Form
{
    public ?Post $post;

    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    public function setPost(Post $post)
    {
        $this->post = $post;

        $this->title = $post->title;

        $this->content = $post->content;
    }

    public function store()
    {
        $this->validate();

        Post::create($this->only(['title', 'content']));
    }

    public function update()
    {
        $this->validate();

        $this->post->update(
            $this->only(['title', 'content'])
        );
    }
}
```

ご覧の通り、`PostForm`オブジェクトに`setPost()`メソッドを追加して、既存のデータでフォームを埋めることができるようにし、フォームオブジェクトに投稿を保存できるようにしました。また、既存の投稿を更新するための`update()`メソッドも追加しました。

フォームオブジェクトはLivewireで作業する際に必須ではありませんが、コンポーネントを繰り返しのボイラープレートから解放するための素晴らしい抽象化を提供します。

### フォームフィールドのリセット

フォームオブジェクトを使用している場合、送信後にフォームをリセットしたいことがあります。これは、`reset()`メソッドを呼び出すことで行えます：

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    // ...

    public function store()
    {
        $this->validate();

        Post::create($this->only(['title', 'content']));

        // highlight-next-line
        $this->reset();
    }
}
```

特定のプロパティのみをリセットしたい場合は、プロパティ名を`reset()`メソッドに渡すことでリセットできます：

```php
$this->reset('title');

// または、複数同時に...

$this->reset(['title', 'content']);
```

### フォームフィールドのプル

また、`pull()`メソッドを使用して、フォームのプロパティを取得し、それらを1回の操作でリセットすることもできます。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:5')]
    public $title = '';

    #[Validate('required|min:5')]
    public $content = '';

    // ...

    public function store()
    {
        $this->validate();

        Post::create(
            // highlight-next-line
            $this->pull()
        );
    }
}
```

特定のプロパティのみをプルしたい場合は、プロパティ名を`pull()`メソッドに渡すことでプルできます：

```php
// リセット前に値を返す...
$this->pull('title');

 // リセット前にプロパティのキーと値の配列を返す...
$this->pull(['title', 'content']);
```

### ルールオブジェクトの使用

より高度なバリデーションシナリオがあり、Laravelの`Rule`オブジェクトが必要な場合は、代わりに`rules()`メソッドを定義してバリデーションルールを宣言できます。

```php
<?php

namespace App\Livewire\Forms;

use Illuminate\Validation\Rule;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    public ?Post $post;

    public $title = '';

    public $content = '';

    protected function rules()
    {
        return [
            'title' => [
                'required',
                // highlight-next-line
                Rule::unique('posts')->ignore($this->post),
            ],
            'content' => 'required|min:5',
        ];
    }

    // ...

    public function update()
    {
        $this->validate();

        $this->post->update($this->only(['title', 'content']));

        $this->reset();
    }
}
```

`#[Validate]`の代わりに`rules()`メソッドを使用する場合、Livewireは`$this->validate()`を呼び出したときにのみバリデーションルールを実行します。プロパティが更新されるたびに実行されるわけではありません。

リアルタイムバリデーションや、特定のフィールドを各リクエスト後にLivewireにバリデートさせたい場合は、次のようにルールを指定せずに`#[Validate]`を使用できます。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Illuminate\Validation\Rule;
use App\Models\Post;
use Livewire\Form;

class PostForm extends Form
{
    public ?Post $post;

    // highlight-next-line
    #[Validate]
    public $title = '';

    public $content = '';

    protected function rules()
    {
        return [
            'title' => [
                'required',
                Rule::unique('posts')->ignore($this->post),
            ],
            'content' => 'required|min:5',
        ];
    }

    // ...

    public function update()
    {
        $this->validate();

        $this->post->update($this->only(['title', 'content']));

        $this->reset();
    }
}
```

これで、`$title`プロパティがフォーム送信前に更新された場合（例えば、[`wire:model.blur`](/docs/wire-model#updating-on-blur-event)を使用している場合）、`$title`のバリデーションが実行されます。

### ローディングインジケーターの表示

デフォルトでは、Livewireはフォーム送信中に送信ボタンを自動的に無効化し、入力欄を `readonly` にします。これにより、最初の送信が処理されている間にユーザーが再度フォームを送信するのを防ぎます。

しかし、アプリケーションのUIに追加の工夫がないと、ユーザーが「ローディング」状態を認識しづらい場合があります。

以下は、`wire:loading` を使って「Save」ボタンに小さなローディングスピナーを追加し、フォーム送信中であることをユーザーに分かりやすくする例です：

```blade
<button type="submit">
    Save

    <div wire:loading>
        <svg>...</svg> <!-- SVG loading spinner -->
    </div>
</button>
```

ユーザーが「Save」を押すと、小さなインラインスピナーが表示されます。

Livewireの`wire:loading`機能には、さらに多くの機能があります。詳細については、[ローディングに関するドキュメント](/docs/wire-loading)をご覧ください。

## リアルタイムでのフィールド更新

デフォルトでは、Livewireはフォームが送信されたとき（または他の[アクション](/docs/actions)が呼び出されたとき）にのみネットワークリクエストを送信します。フォームに入力している間は送信しません。

例えば、`CreatePost`コンポーネントを考えてみましょう。ユーザーが入力するたびに「タイトル」入力フィールドが`$title`プロパティと同期されるようにするには、次のように`wire:model`に`.live`修飾子を追加します。

```blade
<input type="text" wire:model.live="title">
```

これで、ユーザーがこのフィールドに入力するたびに、ネットワークリクエストがサーバーに送信され、`$title`が更新されます。これは、ユーザーが検索ボックスに入力するたびにデータセットがフィルタリングされるような、リアルタイム検索に便利です。

## フィールドの更新を _blur_ イベントのみに制限

ほとんどの場合、リアルタイムのフォームフィールド更新には`wire:model.live`で問題ありません。しかし、テキスト入力ではネットワークリソースを過剰に消費する可能性があります。

ユーザーが入力中にネットワークリクエストを送信するのではなく、ユーザーがタブキーを押すかテキスト入力の外をクリックするなどして「離れた」時にのみリクエストを送信したい場合は、代わりに`.blur`修飾子を使用できます。

```blade
<input type="text" wire:model.blur="title" >
```

これで、コンポーネントクラスはユーザーがタブキーを押すかテキスト入力の外をクリックするまで更新されません。

## リアルタイムバリデーション

時には、ユーザーがフォームに入力する際にバリデーションエラーを表示したいことがあります。このようにすることで、ユーザーはフォーム全体を記入するのを待たずに、何か問題があることを早期に通知されます。

Livewireはこの種の処理を自動的に行います。`wire:model`に`.live`または`.blur`を使用することで、ユーザーがフォームに入力する際にネットワークリクエストが送信されます。各ネットワークリクエストは、プロパティを更新する前に適切なバリデーションルールを実行します。バリデーションに失敗した場合、プロパティはサーバー上で更新されず、ユーザーにバリデーションメッセージが表示されます。

```blade
<input type="text" wire:model.blur="title">

<div>
    @error('title') <span class="error">{{ $message }}</span> @enderror
</div>
```

```php
#[Validate('required|min:5')]
public $title = '';
```

これで、ユーザーが「タイトル」入力フィールドに3文字だけ入力し、次のフィールドに移動しようとすると、そのフィールドに5文字以上の入力が必要であることを示すバリデーションメッセージが表示されます。

詳細については、[バリデーションに関するドキュメントページ](/docs/validation)をご覧ください。

## リアルタイムフォーム保存

ユーザーが「送信」ボタンをクリックするのを待たずに、ユーザーがフォームに入力するたびに自動的に保存したい場合は、Livewireの`updated()`フックを使用してこれを行うことができます。

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

class UpdatePost extends Component
{
    public Post $post;

    #[Validate('required')]
    public $title = '';

    #[Validate('required')]
    public $content = '';

    public function mount(Post $post)
    {
        $this->post = $post;
        $this->title = $post->title;
        $this->content = $post->content;
    }

    public function updated($name, $value) // [tl! highlight:5]
    {
        $this->post->update([
            $name => $value,
        ]);
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

```blade
<form wire:submit>
    <input type="text" wire:model.blur="title">
    <div>
        @error('title') <span class="error">{{ $message }}</span> @enderror
    </div>

    <input type="text" wire:model.blur="content">
    <div>
        @error('content') <span class="error">{{ $message }}</span> @enderror
    </div>
</form>
```

上記の例では、ユーザーがフィールドを完了すると（クリックまたはタブで次のフィールドに移動）、ネットワークリクエストが送信され、そのプロパティがコンポーネント上で更新されます。プロパティがクラス上で更新された後、`updated()`フックがその特定のプロパティ名と新しい値に対して呼び出されます。

このフックを使用して、データベース内のその特定のフィールドのみを更新できます。

さらに、`#[Validate]`属性がそれらのプロパティに添付されているため、バリデーションルールはプロパティが更新され、`updated()`フックが呼び出される前に実行されます。

`updated`ライフサイクルフックや他のフックについて詳しく知りたい場合は、[ライフサイクルフックに関するドキュメント](/docs/lifecycle-hooks)をご覧ください。

## ダーティインジケーターの表示

上記で説明したリアルタイム保存シナリオでは、フィールドがまだデータベースに永続化されていないときに、ユーザーに示すことが役立つ場合があります。

例えば、ユーザーが`UpdatePost`ページを訪れ、テキスト入力で投稿のタイトルを変更し始めたとします。このとき、タイトルが実際にデータベースに更新されるタイミングが不明確な場合があります。特に、フォームの下部に「保存」ボタンがない場合はなおさらです。

Livewireは、入力の値がサーバー側のコンポーネントと乖離したときに、要素のトグルやクラスの変更を行うための`wire:dirty`ディレクティブを提供します。

```blade
<input type="text" wire:model.blur="title" wire:dirty.class="border-yellow">
```

上記の例では、ユーザーが入力フィールドに入力すると、フィールドの周りに黄色のボーダーが表示されます。ユーザーがタブを外すと、ネットワークリクエストが送信され、ボーダーが消えます。これにより、入力が永続化され、「ダーティ」ではなくなったことがユーザーに示されます。

要素全体の表示/非表示を切り替えたい場合は、`wire:target`と組み合わせて`wire:dirty`を使用できます。`wire:target`は、「ダーティ」状態を監視したいデータを指定するために使用されます。この場合、「タイトル」フィールドです。

```blade
<input type="text" wire:model="title">

<div wire:dirty wire:target="title">Unsaved...</div>
```

## 入力のデバウンス

`.live`をテキスト入力に使用する場合、ネットワークリクエストが送信される頻度をより細かく制御したいことがあります。デフォルトでは、「250ms」のデバウンスが入力に適用されます。ただし、`.debounce`修飾子を使用してこれをカスタマイズできます。

```blade
<input type="text" wire:model.live.debounce.150ms="title" >
```

ここで、`.debounce.150ms`がフィールドに追加され、入力更新を処理する際に「150ms」の短いデバウンスが使用されます。言い換えれば、ユーザーが入力を停止してから150ミリ秒以上経過しない限り、ネットワークリクエストは送信されません。

## 入力のスロットル

前述のように、入力デバウンスがフィールドに適用されると、ユーザーが一定時間入力を停止するまでネットワークリクエストは送信されません。ユーザーが長いメッセージを入力し続けると、リクエストはユーザーが終了するまで送信されません。

これが望ましくない場合、ユーザーが入力を終了したり、一時停止したりしたときではなく、入力中にリクエストを送信したい場合があります。

このような場合は、`.throttle`を使用して、ネットワークリクエストを送信する時間間隔を指定できます。

```blade
<input type="text" wire:model.live.throttle.150ms="title" >
```

上記の例では、ユーザーが「タイトル」フィールドに連続して入力していると、ユーザーが入力を終了するまでの間隔でネットワークリクエストが送信されます。

## 入力フィールドをBladeコンポーネントに抽出

`CreatePost`のような小さなコンポーネントでも、バリデーションメッセージやラベルなど、多くのフォームフィールドボイラープレートが重複してしまいます。

このような繰り返しのUI要素は、アプリケーション全体で共有できる専用の[Bladeコンポーネント](https://laravel.com/docs/blade#components)に抽出すると便利です。

例えば、以下は`CreatePost`コンポーネントの元のBladeテンプレートです。ここから、次の2つのテキスト入力を専用のBladeコンポーネントに抽出します。

```blade
<form wire:submit="save">
    <input type="text" wire:model="title"> <!-- [tl! highlight:3] -->
    <div>
        @error('title') <span class="error">{{ $message }}</span> @enderror
    </div>

    <input type="text" wire:model="content"> <!-- [tl! highlight:3] -->
    <div>
        @error('content') <span class="error">{{ $message }}</span> @enderror
    </div>

    <button type="submit">Save</button>
</form>
```

以下は、`x-input-text`という再利用可能なBladeコンポーネントに抽出した後のテンプレートの例です。

```blade
<form wire:submit="save">
    <!-- highlight-next-line -->
    <x-input-text name="title" wire:model="title" />

    <!-- highlight-next-line -->
    <x-input-text name="content" wire:model="content" />

    <button type="submit">Save</button>
</form>
```

次に、`x-input-text`コンポーネントのソースコードは以下の通りです。

```blade
<!-- resources/views/components/input-text.blade.php -->

@props(['name'])

<input type="text" name="{{ $name }}" {{ $attributes }}>

<div>
    @error($name) <span class="error">{{ $message }}</span> @enderror
</div>
```

ご覧の通り、繰り返しのHTMLを専用のBladeコンポーネントに配置しました。

ほとんどの場合、Bladeコンポーネントには元のコンポーネントから抽出したHTMLのみが含まれています。ただし、次の2つのものを追加しました。

* `@props`ディレクティブ
* 入力要素への`{{ $attributes }}`ステートメント

これらの追加事項について説明します。

`@props(['name'])`を使用して`name`を「プロパティ」として指定することで、Bladeに対して「name」という属性がこのコンポーネントに設定されている場合、その値を取得し、`$name`としてこのコンポーネント内で利用できるようにします。

他の明示的な目的を持たない属性に対しては、`{{ $attributes }}`ステートメントを使用しました。これは「属性転送」に使用され、Bladeコンポーネントに書かれたHTML属性を取得し、コンポーネント内の要素に転送します。

これにより、`wire:model="title"`や`disabled`、`class="..."`、`required`などの属性が実際の`<input>`要素に転送されます。

### カスタムフォームコントロール

前の例では、入力要素を再利用可能なBladeコンポーネントに「ラップ」しましたが、これはネイティブのHTML入力要素として使用できるようにするためです。

このパターンは非常に便利ですが、Livewireプロパティに`wire:model`でバインドしながら、ゼロから入力コンポーネントを作成したい場合もあるかもしれません。

例えば、Alpineで書かれたシンプルな「カウンター」入力コンポーネントを作成したいと仮定してみましょう。

まず、純粋なAlpineのカウンターコンポーネントのシンプルな例を見てみましょう。

```blade
<div x-data="{ count: 0 }">
    <button x-on:click="count--">-</button>

    <span x-text="count"></span>

    <button x-on:click="count++">+</button>
</div>
```

上記のコンポーネントは、数値とその数値を増減させる2つのボタンを表示します。

次に、`<x-input-counter />`というBladeコンポーネントに抽出し、次のようにコンポーネント内で使用すると仮定します。

```blade
<x-input-counter wire:model="quantity" />
```

このコンポーネントを作成するのはほとんど簡単です。カウンターのHTMLを取得し、`resources/views/components/input-counter.blade.php`のようなBladeコンポーネントテンプレートに配置します。

ただし、`wire:model`を使用してLivewireコンポーネントからAlpineコンポーネント内の「count」にデータをバインドできるようにするには、1つの追加ステップが必要です。

以下は、コンポーネントのソースコードです。

```blade
<!-- resources/view/components/input-counter.blade.php -->

<div x-data="{ count: 0 }" x-modelable="count" {{ $attributes}}>
    <button x-on:click="count--">-</button>

    <span x-text="count"></span>

    <button x-on:click="count++">+</button>
</div>
```

ご覧の通り、`x-modelable="count"`と`{{ $attributes }}`だけが異なります。

`x-modelable`はAlpineのユーティリティで、外部からのバインディングに特定のデータを利用可能にするようAlpineに指示します。[Alpineのドキュメントには、このディレクティブに関する詳細があります。](https://alpinejs.dev/directives/modelable)

`{{ $attributes }}`は、前述のように、Bladeコンポーネントに渡された属性を取得し、コンポーネント内の要素に転送します。この場合、`wire:model`ディレクティブが転送されます。

`{{ $attributes }}`のおかげで、HTMLがブラウザにレンダリングされるとき、`wire:model="quantity"`は`x-modelable="count"`とともにAlpineコンポーネントのルート`<div>`にレンダリングされます。

```blade
<div x-data="{ count: 0 }" x-modelable="count" wire:model="quantity">
```

`x-modelable="count"`は、Alpineに`x-model`や`wire:model`を探し、それらにバインドするデータとして「count」を使用するように指示します。

`x-modelable`は`wire:model`と`x-model`の両方に機能するため、LivewireとAlpineの両方でこのBladeコンポーネントを入れ替えて使用することもできます。次のように、純粋なAlpineコンテキストでこのBladeコンポーネントを使用する例を示します。

```blade
<x-input-counter x-model="quantity" />
```

アプリケーション内でカスタム入力要素を作成することは非常に強力ですが、LivewireとAlpineが提供するユーティリティとそれらの相互作用をより深く理解する必要があります。
