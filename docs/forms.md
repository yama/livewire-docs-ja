<!-- フォームは多くのWebアプリケーションの基盤となるため、Livewireはフォーム構築を支援する多くの便利な機能を提供しています。シンプルな入力要素の扱いから、リアルタイムバリデーションやファイルアップロードのような複雑な処理まで、Livewireには開発を簡単にし、ユーザー体験を向上させるための分かりやすいツールが揃っています。 -->

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

use Livewire\Attributes\Validate; // [tl! highlight]
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    #[Validate('required')] // [tl! highlight]
    public $title = '';

    #[Validate('required')] // [tl! highlight]
    public $content = '';

    public function save()
    {
        $this->validate(); // [tl! highlight]

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
        @error('title') <span class="error">{{ $message }}</span> @enderror <!-- [tl! highlight] -->
    </div>

    <input type="text" wire:model="content">
    <div>
        @error('content') <span class="error">{{ $message }}</span> @enderror <!-- [tl! highlight] -->
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
    public PostForm $form; // [tl! highlight]

    public function save()
    {
        $this->validate();

        Post::create(
            $this->form->only(['title', 'content']) // [tl! highlight]
        );

        return $this->redirect('/posts');
    }

    public function render()
    {
   