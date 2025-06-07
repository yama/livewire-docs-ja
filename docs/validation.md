---
title: バリデーション
---

Livewireは、ユーザーの入力を検証し、フィードバックを返す体験をできるだけ快適にすることを目指しています。Laravelのバリデーション機能を基盤とし、Livewireは既存の知識を活かしつつ、リアルタイムバリデーションなどの強力な追加機能も提供します。

以下は、Livewireで最も基本的なバリデーションのワークフローを示す `CreatePost` コンポーネントの例です。

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
        $validated = $this->validate([ // [tl! highlight:3]
			'title' => 'required|min:3',
			'content' => 'required|min:3',
        ]);

		Post::create($validated);

		return redirect()->to('/posts');
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
    <div>@error('title') {{ $message }} @enderror</div>

	<textarea wire:model="content"></textarea>
    <div>@error('content') {{ $message }} @enderror</div>

	<button type="submit">Save</button>
</form>
```

ご覧の通り、Livewireは `validate()` メソッドを提供しており、コンポーネントのプロパティを簡単にバリデーションできます。このメソッドは検証済みのデータセットを返すため、そのまま安全にデータベースへ保存できます。

フロントエンドでは、Laravelの既存のBladeディレクティブを使って、ユーザーにバリデーションメッセージを表示できます。

詳細は [LaravelのBladeでのバリデーションエラー表示に関するドキュメント](https://laravel.com/docs/blade#validation-errors) を参照してください。

## Validate attributes

コンポーネントのバリデーションルールをプロパティと直接関連付けて配置したい場合は、Livewireの `#[Validate]` 属性を使用できます。

`#[Validate]` を使用してプロパティにバリデーションルールを関連付けることで、Livewireは各更新の前にプロパティのバリデーションルールを自動的に実行します。ただし、データベースに保存する前に `$this->validate()` を実行して、更新されていないプロパティもバリデーションする必要があります。

```php
use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    #[Validate('required|min:3')] // [tl! highlight]
	public $title = '';

    #[Validate('required|min:3')] // [tl! highlight]
    public $content = '';

    public function save()
    {
        $this->validate();

		Post::create([
            'title' => $this->title,
            'content' => $this->content,
		]);

		return redirect()->to('/posts');
    }

    // ...
}
```

:::info `#[Validate]` 属性は Rule オブジェクトをサポートしていません
PHPの属性（アトリビュート）は、プレーンな文字列や配列など特定の構文のみをサポートしています。Laravelの Rule オブジェクト（例: `Rule::exists(...)`）のような実行時構文を使いたい場合は、代わりにコンポーネント内で [rules() メソッドを定義](#defining-a-rules-method) してください。

LivewireでのLaravel Ruleオブジェクトの利用方法については、[こちらのドキュメント](#using-laravel-rule-objects) もご覧ください。
:::


プロパティのバリデーションを実行するタイミングをより細かく制御したい場合は、`#[Validate]` 属性に `onUpdate: false` パラメータを渡すことができます。これにより、自動バリデーションが無効になり、代わりに `$this->validate()` メソッドを使用してプロパティを手動でバリデートすることが前提となります。

```php
use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    #[Validate('required|min:3', onUpdate: false)]
	public $title = '';

    #[Validate('required|min:3', onUpdate: false)]
    public $content = '';

    public function save()
    {
        $validated = $this->validate();

		Post::create($validated);

		return redirect()->to('/posts');
    }

    // ...
}
```

### Custom attribute name

バリデーションメッセージに挿入される属性名をカスタマイズしたい場合は、`as: ` パラメータを使用できます。

```php
use Livewire\Attributes\Validate;

#[Validate('required', as: 'date of birth')]
public $dob;
```

上記のスニペットでバリデーションに失敗した場合、Laravelはフィールドの名前として「date of birth」を使用します。そのため、生成されるメッセージは「The date of birth field is required」となり、「The dob field is required」にはなりません。

### Custom validation message

Laravelのバリデーションメッセージをバイパスして独自のメッセージに置き換えたい場合は、`#[Validate]` 属性の `message: ` パラメータを使用できます。

```php
use Livewire\Attributes\Validate;

#[Validate('required', message: 'Please provide a post title')]
public $title;
```

これで、このプロパティのバリデーションに失敗した場合のメッセージは、「The title field is required」ではなく「Please provide a post title」となります。

異なるルールに対して異なるメッセージを追加したい場合は、単に複数の `#[Validate]` 属性を提供すればよいのです。

```php
#[Validate('required', message: 'Please provide a post title')]
#[Validate('min:3', message: 'This title is too short')]
public $title;
```

### Opting out of localization

デフォルトでは、Livewireのルールメッセージと属性はLaravelの翻訳ヘルパー `trans()` を使用してローカライズされます。

`#[Validate]` 属性に `translate: false` パラメータを渡すことで、ローカライズをオプトアウトできます。

```php
#[Validate('required', message: 'Please provide a post title', translate: false)]
public $title;
```

### Custom key

`#[Validate]` 属性を使用してプロパティにバリデーションルールを適用する場合、Livewireはバリデーションキーがプロパティの名前であると仮定します。ただし、バリデーションキーをカスタマイズしたい場合もあります。

たとえば、配列プロパティとその子要素に対して別々のバリデーションルールを提供したい場合、`#[Validate]` 属性の最初の引数としてバリデーションルールを渡すのではなく、キーと値のペアの配列を渡すことができます。

```php
#[Validate([
    'todos' => 'required',
    'todos.*' => [
        'required',
        'min:3',
        new Uppercase,
    ],
])]
public $todos = [];
```

これで、ユーザーが `$todos` を更新したり `validate()` メソッドが呼び出されたりすると、これらのバリデーションルールの両方が適用されます。

## Form objects

プロパティとバリデーションルールがLivewireコンポーネントに追加されると、コンポーネントが混雑しているように感じることがあります。この問題を軽減し、コードの再利用のための便利な抽象化を提供するために、Livewireの*Form Objects*を使用してプロパティとバリデーションルールを格納できます。

以下は、プロパティとルールが `PostForm` という専用のフォームオブジェクトに抽出された同じ `CreatePost` の例です。

```php
<?php

namespace App\Livewire\Forms;

use Livewire\Attributes\Validate;
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|min:3')]
	public $title = '';

    #[Validate('required|min:3')]
    public $content = '';
}
```

上記の `PostForm` は、`CreatePost` コンポーネントでプロパティとして定義できます。

```php
<?php

namespace App\Livewire;

use App\Livewire\Forms\PostForm;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public PostForm $form;

    public function save()
    {
		Post::create(
    		$this->form->all()
    	);

		return redirect()->to('/posts');
    }

    // ...
}
```

このように、各プロパティを個別に列挙する代わりに、フォームオブジェクトの `->all()` メソッドを使用してすべてのプロパティ値を取得できます。

また、テンプレート内でプロパティ名を参照する際は、各インスタンスの前に `form.` を付ける必要があります。

```blade
<form wire:submit="save">
	<input type="text" wire:model="form.title">
    <div>@error('form.title') {{ $message }} @enderror</div>

	<textarea wire:model="form.content"></textarea>
    <div>@error('form.content') {{ $message }} @enderror</div>

	<button type="submit">Save</button>
</form>
```

フォームオブジェクトを使用する場合、`#[Validate]` 属性のバリデーションはプロパティが更新されるたびに実行されます。ただし、属性で `onUpdate: false` を指定してこの動作を無効にした場合は、`$this->form->validate()` を使用してフォームオブジェクトのバリデーションを手動で実行できます。

```php
public function save()
{
    Post::create(
        $this->form->validate()
    );

    return redirect()->to('/posts');
}
```

フォームオブジェクトは、より大規模なデータセットに対する便利な抽象化であり、さらに強力にするためのさまざまな追加機能を提供します。詳細については、包括的な [form object documentation](/docs/forms#extracting-a-form-object) を参照してください。

## Real-time validation

リアルタイムバリデーションとは、フォームに入力する際にユーザーの入力を検証することを指し、フォームの送信を待つのではありません。

特定の入力に対してリアルタイムバリデーション体験を提供するために、特別なバックエンドの作業は必要ありません。必要なのは、フィールドが入力されるときにネットワークリクエストをトリガーするようLivewireに指示する `wire:model.live` または `wire:model.blur` を使用することだけです。

以下の例では、テキスト入力に `wire:model.blur` が追加されています。これにより、ユーザーがフィールドに入力してからタブを移動するかフィールドの外をクリックすると、ネットワークリクエストがトリガーされ、更新された値とバリデーションルールが実行されます。

```blade
<form wire:submit="save">
    <input type="text" wire:model.blur="title">

    <!-- -->
</form>
```

`#[Validate]` 属性の代わりに `rules()` メソッドを使用してプロパティのバリデーションルールを宣言している場合でも、リアルタイムバリデーションを保持するためにパラメータなしの `#[Validate]` 属性を含めることができます。

```php
use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    #[Validate] // [tl! highlight]
	public $title = '';

    public $content = '';

    protected function rules()
    {
        return [
            'title' => 'required|min:5',
            'content' => 'required|min:5',
        ];
    }

    public function save()
    {
        $validated = $this->validate();

		Post::create($validated);

		return redirect()->to('/posts');
    }
```

上記の例では、たとえ `#[Validate]` が空であっても、Livewireによりフィールドのバリデーションが `rules()` によって提供されたものがプロパティが更新されるたびに実行されるようになります。

## Customizing error messages

初期設定のままでは、Laravelは `$title` プロパティに `required` ルールが付いている場合、「The title field is required.」のような妥当なバリデーションメッセージを提供します。

ただし、これらのエラーメッセージの言語をカスタマイズして、アプリケーションやユーザーにより適したものにする必要があるかもしれません。

### Custom attribute names

時には、検証しているプロパティの名前がユーザーに表示するのに適していないことがあります。たとえば、アプリのデータベースフィールドに「dob」という名前が付いている場合、これは「生年月日」を表すものであり、「The date of birth field is required」ではなく「The dob field is required」と表示したいでしょう。

Livewireでは、`as: ` パラメータを使用してプロパティの代替名を指定できます。

```php
use Livewire\Attributes\Validate;

#[Validate('required', as: 'date of birth')]
public $dob = '';
```

これで、`required` バリデーションルールに失敗した場合、エラーメッセージは「The date of birth field is required.」となります。

### Custom messages

プロパティ名のカスタマイズだけでは不十分な場合、`message: ` パラメータを使用してバリデーションメッセージ全体をカスタマイズできます。

```php
use Livewire\Attributes\Validate;

#[Validate('required', message: 'Please fill out your date of birth.')]
public $dob = '';
```

メッセージをカスタマイズするルールが複数ある場合は、それぞれに対して完全に別々の `#[Validate]` 属性を使用することをお勧めします。

```php
use Livewire\Attributes\Validate;

#[Validate('required', message: 'Please enter a title.')]
#[Validate('min:5', message: 'Your title is too short.')]
public $title = '';
```

`#[Validate]` 属性の配列構文を代わりに使用したい場合は、次のようにカスタム属性とメッセージを指定できます。

```php
use Livewire\Attributes\Validate;

#[Validate([
    'titles' => 'required',
    'titles.*' => 'required|min:5',
], message: [
    'required' => 'The :attribute is missing.',
    'titles.required' => 'The :attribute are missing.',
    'min' => 'The :attribute is too short.',
], attribute: [
    'titles.*' => 'title',
])]
public $titles = [];
```

## Defining a `rules()` method

Livewireの `#[Validate]` 属性の代わりに、コンポーネント内に `rules()` メソッドを定義してフィールドと対応するバリデーションルールのリストを返すことができます。これは、`Rule::password()` のようなランタイム構文を使用しようとしている場合に役立ちます。

これらのルールは、コンポーネント内で `$this->validate()` を実行するときに適用されます。また、`messages()` および `validationAttributes()` 関数を定義することもできます。

以下はその例です。

```php
use Livewire\Component;
use App\Models\Post;
use Illuminate\Validation\Rule;

class CreatePost extends Component
{
	public $title = '';

    public $content = '';

    protected function rules() // [tl! highlight:6]
    {
        return [
            'title' => Rule::exists('posts', 'title'),
            'content' => 'required|min:3',
        ];
    }

    protected function messages() // [tl! highlight:6]
    {
        return [
            'content.required' => 'The :attribute are missing.',
            'content.min' => 'The :attribute is too short.',
        ];
    }

    protected function validationAttributes() // [tl! highlight:6]
    {
        return [
            'content' => 'description',
        ];
    }

    public function save()
    {
        $this->validate();

		Post::create([
            'title' => $this->title,
            'content' => $this->content,
		]);

		return redirect()->to('/posts');
    }

    // ...
}
```

:::warning `rules()` メソッドはデータ更新時にはバリデーションされません
`rules()` メソッドでルールを定義した場合、Livewireは `$this->validate()` を実行したときのみ、これらのバリデーションルールを適用します。これは、`#[Validate]` 属性が `wire:model` などでフィールドが更新されるたびに適用されるのとは異なります。プロパティが更新されるたびにこれらのバリデーションルールを適用したい場合は、追加のパラメータなしで `#[Validate]` を併用してください。
:::

:::warning] Livewireの仕組みと競合しないように
> Livewireのバリデーション機能を利用する際、コンポーネント内で `rules`、`messages`、`validationAttributes`、`validationCustomValues` という名前のプロパティやメソッドを、バリデーションのカスタマイズ目的以外で定義しないでください。これらはLivewireの内部処理と競合するため、予期しない動作の原因となります。
:::

## Using Laravel Rule objects

Laravel `Rule` objects are an extremely powerful way to add advanced validation behavior to your forms.

Here is an example of using Rule objects in conjunction with Livewire's `rules()` method to achieve more sophisticated validation:

```php
<?php

namespace App\Livewire;

use Illuminate\Validation\Rule;
use App\Models\Post;
use Livewire\Form;

class UpdatePost extends Form
{
    public ?Post $post;

    public $title = '';

    public $content = '';

    protected function rules()
    {
        return [
            'title' => [
                'required',
                Rule::unique('posts')->ignore($this->post), // [tl! highlight]
            ],
            'content' => 'required|min:5',
        ];
    }

    public function mount()
    {
        $this->title = $this->post->title;
        $this->content = $this->post->content;
    }

    public function update()
    {
        $this->validate(); // [tl! highlight]

        $this->post->update($this->all());

        $this->reset();
    }

    // ...
}
```

## Manually controlling validation errors

Livewireのバリデーションユーティリティは、最も一般的なバリデーションシナリオを処理します。ただし、コンポーネント内のバリデーションメッセージを完全に制御したい場合もあるでしょう。

以下は、Livewireコンポーネント内で利用可能なバリデーションエラーメッセージを操作するためのすべてのメソッドです。

メソッド | 説明
--- | ---
`$this->addError([key], [message])` | バリデーションメッセージをエラーバッグに手動で追加します
`$this->resetValidation([?key])` | 指定されたキーのバリデーションエラーをリセットするか、キーが指定されていない場合はすべてのエラーをリセットします
`$this->getErrorBag()` | Livewireコンポーネントで使用される基礎となるLaravelエラーバッグを取得します

:::info `$this->addError()` をフォームオブジェクトで使う場合
フォームオブジェクト内で `$this->addError` を使って手動でエラーを追加する場合、キーは親コンポーネントでそのフォームを割り当てたプロパティ名で自動的にプレフィックスされます。たとえば、コンポーネントでフォームを `$data` というプロパティに割り当てている場合、キーは `data.key` となります。
:::

## Accessing the validator instance

時には、Livewireが内部で使用するバリデーターインスタンスにアクセスしたい場合もあるでしょう。これは、`withValidator` メソッドを使用することで可能です。提供されたクロージャは、完全に構築されたバリデーターを引数として受け取り、そのルールが実際に評価される前に、そのメソッドのいずれかを呼び出すことができます。

以下は、Livewireの内部バリデーターをインターセプトして手動で条件をチェックし、追加のバリデーションメッセージを加える例です。

```php
use Livewire\Attributes\Validate;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    #[Validate('required|min:3')]
	public $title = '';

    #[Validate('required|min:3')]
    public $content = '';

    public function boot()
    {
        $this->withValidator(function ($validator) {
            $validator->after(function ($validator) {
                if (str($this->title)->startsWith('"')) {
                    $validator->errors()->add('title', 'Titles cannot start with quotations');
                }
            });
        });
    }

    public function save()
    {
		Post::create($this->all());

		return redirect()->to('/posts');
    }

    // ...
}
```

## Using custom validators

Livewireで独自のバリデーションシステムを使用したい場合でも、問題ありません。Livewireは、コンポーネント内でスローされた `ValidationException` 例外をキャッチし、エラーをビューに提供します。これは、Livewireの独自の `validate()` メソッドを使用しているかのように行われます。

以下は、Livewireのバリデーション機能を使用せず、代わりにカスタムバリデーターを作成してコンポーネントプロパティに適用している `CreatePost` コンポーネントの例です。

```php
use Illuminate\Support\Facades\Validator;
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
	public $title = '';

    public $content = '';

    public function save()
    {
        $validated = Validator::make(
            // Data to validate...
            ['title' => $this->title, 'content' => $this->content],

            // Validation rules to apply...
            ['title' => 'required|min:3', 'content' => 'required|min:3'],

            // Custom validation messages...
            ['required' => 'The :attribute field is required'],
         )->validate();

		Post::create($validated);

		return redirect()->to('/posts');
    }

    // ...
}
```

## Testing validation

Livewireは、`assertHasErrors()` メソッドなど、バリデーションシナリオのテストに役立つテストユーティリティを提供します。

以下は、`$title` プロパティに入力がない場合にバリデーションエラーがスローされることを確認する基本的なテストケースです。

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\CreatePost;
use Livewire\Livewire;
use Tests\TestCase;

class CreatePostTest extends TestCase
{
    public function test_cant_create_post_without_title()
    {
        Livewire::test(CreatePost::class)
            ->set('content', 'Sample content...')
            ->call('save')
            ->assertHasErrors('title');
    }
}
```

エラーの存在をテストするだけでなく、`assertHasErrors` を使用して、メソッドの2番目の引数としてテストするルールを渡すことで、特定のルールに絞ってアサーションを行うこともできます。

```php
public function test_cant_create_post_with_title_shorter_than_3_characters()
{
    Livewire::test(CreatePost::class)
        ->set('title', 'Sa')
        ->set('content', 'Sample content...')
        ->call('save')
        ->assertHasErrors(['title' => ['min:3']]);
}
```

複数のプロパティに対するバリデーションエラーの存在を同時にアサートすることもできます。

```php
public function test_cant_create_post_without_title_and_content()
{
    Livewire::test(CreatePost::class)
        ->call('save')
        ->assertHasErrors(['title', 'content']);
}
```

Livewireが提供する他のテストユーティリティに関する詳細は、[testing documentation](/docs/testing) を参照してください。

## Deprecated `[#Rule]` attribute

Livewire v3が最初にリリースされたとき、「Rule」という用語は「Validate」の代わりにそのバリデーション属性に使用されていました（`#[Rule]`）。

Laravelのルールオブジェクトとの名前の衝突を避けるために、これは `#[Validate]` に変更されました。Livewire v3では両方がサポートされていますが、最新の状態を保つためにすべての `#[Rule]` の発生を `#[Validate]` に変更することをお勧めします。
