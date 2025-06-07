---
title: ネスト
---

Livewireでは、親コンポーネントの中にさらにLivewireコンポーネントをネストして配置できます。この機能は非常に強力で、アプリケーション全体で共有されるLivewireコンポーネント内の振る舞いを再利用・カプセル化することができます。

:::warning
Livewireコンポーネントが本当に必要か再考しましょう
テンプレートの一部をネストしたLivewireコンポーネントとして切り出す前に、「この部分は“ライブ”である必要があるか？」を考えてみてください。もしそうでなければ、シンプルな[Bladeコンポーネント](https://laravel.com/docs/blade#components)の利用をおすすめします。Livewireの動的な特性やパフォーマンス上の利点がある場合のみ、Livewireコンポーネントを作成してください。
:::

Livewireコンポーネントのネストに関するパフォーマンスや使い方、制約については、[詳細な技術解説](/docs/understanding-nesting)もご参照ください。

## コンポーネントのネスト

親コンポーネント内にLivewireコンポーネントをネストするには、親コンポーネントのBladeビューにそのまま含めるだけです。以下は、`Dashboard`という親コンポーネントの中に`TodoList`コンポーネントをネストした例です：

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class Dashboard extends Component
{
    public function render()
    {
        return view('livewire.dashboard');
    }
}
```

```blade
<div>
    <h1>Dashboard</h1>

    <livewire:todo-list /> <!-- [tl! highlight] -->
</div>
```

このページが最初にレンダリングされる際、`Dashboard`コンポーネントは`<livewire:todo-list />`に遭遇し、それをその場でレンダリングします。次回`Dashboard`へのネットワークリクエストが行われると、ネストされた`todo-list`コンポーネントはすでにページ上に独立したコンポーネントとして存在するため、レンダリングをスキップします。ネストとレンダリングの背後にある技術的な概念については、[ネストされたコンポーネントは「アイランド」である理由](/docs/understanding-nesting#every-component-is-an-island)に関するドキュメントをご覧ください。

コンポーネントをレンダリングするための構文に関する詳細は、[コンポーネントのレンダリング](/docs/components#rendering-components)に関するドキュメントをご参照ください。

## 子コンポーネントへのプロパティの受け渡し

親コンポーネントから子コンポーネントへデータを渡すのは簡単です。実際、これは通常の[Bladeコンポーネント](https://laravel.com/docs/blade#components)にプロパティを渡すのと非常に似ています。

例えば、`TodoList`コンポーネントが`TodoCount`という子コンポーネントに`$todos`のコレクションを渡す例を見てみましょう：

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class TodoList extends Component
{
    public function render()
    {
        return view('livewire.todo-list', [
            'todos' => Auth::user()->todos,
        ]);
    }
}
```

```blade
<div>
    <livewire:todo-count :todos="$todos" />

    <!-- ... -->
</div>
```

ご覧の通り、`:todos="$todos"`という構文を使って`todo-count`に`$todos`を渡しています。

`$todos`が子コンポーネントに渡されたので、子コンポーネントの`mount()`メソッドでそのデータを受け取ることができます：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Todo;

class TodoCount extends Component
{
    public $todos;

    public function mount($todos)
    {
        $this->todos = $todos;
    }

    public function render()
    {
        return view('livewire.todo-count', [
            'count' => $this->todos->count(),
        ]);
    }
}
```

:::tip `mount()`を省略する短縮方法
上記の例の`mount()`メソッドが冗長に感じる場合、プロパティ名とパラメータ名が一致していれば省略できます：

```php
public $todos; // [tl! highlight]
```
:::

### 静的プロパティの受け渡し

前の例では、Livewireの動的プロパティ構文を使用して子コンポーネントにプロパティを渡しました。これは次のようにPHP式をサポートしています：

```blade
<livewire:todo-count :todos="$todos" />
```

しかし、時にはコンポーネントに文字列などの単純な静的値を渡したい場合もあります。このような場合、構文の先頭からコロンを省略できます：

```blade
<livewire:todo-count :todos="$todos" label="Todo Count:" />
```

ブール値はキーのみを指定することでコンポーネントに渡すことができます。例えば、`$inline`という変数に`true`の値を渡すには、コンポーネントタグに`inline`とだけ記述します：

```blade
<livewire:todo-count :todos="$todos" inline />
```

### 属性構文の短縮

PHP変数をコンポーネントに渡すとき、変数名とプロパティ名はしばしば同じです。名前を二度書くのを避けるために、Livewireでは変数の前にコロンを付けるだけで済みます：

```blade
<livewire:todo-count :todos="$todos" /> <!-- [tl! remove] -->

<livewire:todo-count :$todos /> <!-- [tl! add] -->
```

## ループ内での子コンポーネントのレンダリング

ループ内で子コンポーネントをレンダリングする場合、各イテレーションに対して一意の`key`値を含める必要があります。

コンポーネントのキーは、特にコンポーネントがすでにレンダリングされている場合や、複数のコンポーネントがページ上で再配置されている場合に、Livewireが各コンポーネントを追跡する方法です。

子コンポーネントに`key`プロパティを指定することで、コンポーネントのキーを指定できます：

```blade
<div>
    <h1>Todos</h1>

    @foreach ($todos as $todo)
        <livewire:todo-item :$todo :key="$todo->id" />
    @endforeach
</div>
```

ご覧の通り、各子コンポーネントには各`$todo`のIDに設定された一意のキーがあります。これにより、キーが一意であり、todoが再注文された場合でも追跡されます。

:::warning キーは必須です
VueやAlpineのようなフロントエンドフレームワークを使用したことがある方は、ループ内のネストされた要素にキーを追加することに慣れているかもしれません。しかし、これらのフレームワークではキーは_必須_ではなく、アイテムはレンダリングされますが、再注文が正しく追跡されない場合があります。しかし、Livewireはキーにより依存しており、キーなしでは正しく動作しません。
:::

## リアクティブプロパティ

Livewireに不慣れな開発者は、プロパティがデフォルトで「リアクティブ」であると期待します。言い換えれば、親が子コンポーネントに渡されるプロパティの値を変更すると、子コンポーネントが自動的に更新されることを期待します。しかし、デフォルトではLivewireのプロパティはリアクティブではありません。

Livewireを使用する際は、[すべてのコンポーネントがアイランドである](/docs/understanding-nesting#every-component-is-an-island)ことを理解してください。つまり、親で更新がトリガーされ、ネットワークリクエストが送信されると、サーバーに送信されるのは親コンポーネントの状態のみであり、子コンポーネントの状態は含まれません。この動作の意図は、サーバーとクライアント間で最小限のデータのみを送受信し、更新をできるだけパフォーマンス良く行うことです。

しかし、プロパティをリアクティブにしたい、またはする必要がある場合は、`#[Reactive]`属性パラメータを使用してこの動作を簡単に有効にできます。

例えば、以下は親`TodoList`コンポーネントのテンプレートです。その中で、`TodoCount`コンポーネントをレンダリングし、現在のtodoリストを渡しています：

```blade
<div>
    <h1>Todos:</h1>

    <livewire:todo-count :$todos />

    <!-- ... -->
</div>
```

次に、`TodoCount`コンポーネントの`$todos`プロパティに`#[Reactive]`を追加してみましょう。そうすることで、親コンポーネント内でtodoが追加または削除されると、自動的に`TodoCount`コンポーネント内でも更新がトリガーされます：

```php
<?php

namespace App\Livewire;

use Livewire\Attributes\Reactive;
use Livewire\Component;
use App\Models\Todo;

class TodoCount extends Component
{
    #[Reactive] // [tl! highlight]
    public $todos;

    public function render()
    {
        return view('livewire.todo-count', [
            'count' => $this->todos->count(),
        ]);
    }
}
```

リアクティブプロパティは非常に強力な機能であり、LivewireをVueやReactのようなフロントエンドコンポーネントライブラリに近づけます。しかし、この機能のパフォーマンスへの影響を理解し、特定のシナリオに対して意味がある場合にのみ`#[Reactive]`を追加することが重要です。

## `wire:model`を使用した子データへのバインディング

親コンポーネントと子コンポーネント間で状態を共有するための別の強力なパターンは、Livewireの`Modelable`機能を介して子コンポーネントに直接`wire:model`を使用することです。

この動作は、入力要素を専用のLivewireコンポーネントに抽出しながら、その状態に親コンポーネントからもアクセスする必要がある場合に非常に一般的に必要とされます。

以下は、現在のtodoを追跡する`$todo`プロパティを含む親`TodoList`コンポーネントの例です。ユーザーが追加しようとしているtodoです：

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Todo;

class TodoList extends Component
{
    public $todo = '';

    public function add()
    {
        Todo::create([
            'content' => $this->pull('todo'),
        ]);
    }

    public function render()
    {
        return view('livewire.todo-list', [
            'todos' => Auth::user()->todos,
        ]);
    }
}
```

`TodoList`テンプレートでは、`wire:model`を使用して`$todo`プロパティをネストされた`TodoInput`コンポーネントに直接バインドしています：

```blade
<div>
    <h1>Todos</h1>

    <livewire:todo-input wire:model="todo" /> <!-- [tl! highlight] -->

    <button wire:click="add">Add Todo</button>

    <div>
        @foreach ($todos as $todo)
            <livewire:todo-item :$todo :key="$todo->id" />
        @endforeach
    </div>
</div>
```

Livewireは、親からこのプロパティに`wire:model`が宣言された場合に、これをこのプロパティにバインドするようにLivewireに指示するために、`TodoInput`コンポーネントの`$value`プロパティの上に`#[Modelable]`属性を追加します：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Modelable;

class TodoInput extends Component
{
    #[Modelable] // [tl! highlight]
    public $value = '';

    public function render()
    {
        return view('livewire.todo-input');
    }
}
```

```blade
<div>
    <input type="text" wire:model="value" >
</div>
```

これで、親`TodoList`コンポーネントは`TodoInput`を他の入力要素と同様に扱い、`wire:model`を使用してその値に直接バインドできます。

:::warning
現在、Livewireは単一の`#[Modelable]`属性のみをサポートしているため、最初のひとつだけがバインドされます。
:::

## 子コンポーネントからのイベントリスニング

親子コンポーネント間の通信手法として、Livewireのイベントシステムを使用することもできます。これにより、サーバーまたはクライアントでイベントを発火し、他のコンポーネントによってインターセプトされることができます。

Livewireのイベントシステムに関する[完全なドキュメント](/docs/events)では、イベントの詳細情報が提供されていますが、以下にイベントを使用して親コンポーネントの更新をトリガーする簡単な例を示します。

`TodoList`コンポーネントがあり、ここにtodoを表示および削除する機能があるとします：

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Todo;

class TodoList extends Component
{
    public function remove($todoId)
    {
        $todo = Todo::find($todoId);

        $this->authorize('delete', $todo);

        $todo->delete();
    }

    public function render()
    {
        return view('livewire.todo-list', [
            'todos' => Auth::user()->todos,
        ]);
    }
}
```

```blade
<div>
    @foreach ($todos as $todo)
        <livewire:todo-item :$todo :key="$todo->id" />
    @endforeach
</div>
```

`remove()`を子の`TodoItem`コンポーネント内から呼び出すには、`#[On]`属性を使用して`TodoList`にイベントリスナーを追加できます：

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use App\Models\Todo;
use Livewire\Attributes\On;

class TodoList extends Component
{
    #[On('remove-todo')] // [tl! highlight]
    public function remove($todoId)
    {
        $todo = Todo::find($todoId);

        $this->authorize('delete', $todo);

        $todo->delete();
    }

    public function render()
    {
        return view('livewire.todo-list', [
            'todos' => Auth::user()->todos,
        ]);
    }
}
```

アクションに属性が追加されたので、`TodoList`子コンポーネントから`remove-todo`イベントを発火できます：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Todo;

class TodoItem extends Component
{
    public Todo $todo;

    public function remove()
    {
        $this->dispatch('remove-todo', todoId: $this->todo->id); // [tl! highlight]
    }

    public function render()
    {
        return view('livewire.todo-item');
    }
}
```

```blade
<div>
    <span>{{ $todo->content }}</span>

    <button wire:click="remove">Remove</button>
</div>
```

これで、「Remove」ボタンが`TodoItem`内でクリックされると、親`TodoList`コンポーネントが発火したイベントをインターセプトし、todoの削除を実行します。

todoが親で削除されると、リストが再レンダリングされ、`remove-todo`イベントを発火させた子コンポーネントがページから削除されます。

### クライアント側でのディスパッチによるパフォーマンスの向上

上記の例は機能しますが、単一のアクションを実行するのに2回のネットワークリクエストがかかります：

1. 最初のネットワークリクエストは、`TodoItem`コンポーネントから`remove`アクションをトリガーし、`remove-todo`イベントを発火させます。
2. 2回目のネットワークリクエストは、`remove-todo`イベントがクライアント側で発火し、`TodoList`がその`remove`アクションを呼び出すためにインターセプトされます。

可能な限り最初のリクエストを回避するには、イベントをクライアント側で直接発火させます。以下は、ネットワークリクエストをトリガーせずに`remove-todo`イベントを発火させるように更新された`TodoItem`コンポーネントです：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Todo;

class TodoItem extends Component
{
    public Todo $todo;

    public function render()
    {
        return view('livewire.todo-item');
    }
}
```

```blade
<div>
    <span>{{ $todo->content }}</span>

    <button wire:click="$dispatch('remove-todo', { todoId: {{ $todo->id }} })">Remove</button>
</div>
```

一般的なルールとして、可能な限りクライアント側でのディスパッチを優先してください。

## 子から親への直接アクセス

イベント通信には間接的な層が追加されます。親は子から発火されないイベントをリッスンでき、子は親によってインターセプトされないイベントを発火できます。

この間接的な通信は時には望ましいですが、他のケースでは子コンポーネントから親コンポーネントに直接アクセスしたい場合もあります。

Livewireでは、Bladeテンプレート内でマジック変数`$parent`を提供することで、これを実現できます。これにより、子コンポーネントは親コンポーネントのアクションやプロパティに直接アクセスできます。以下は、`remove()`アクションをマジック`$parent`変数を介して親に直接呼び出させるように書き換えられた`TodoItem`テンプレートです：

```blade
<div>
    <span>{{ $todo->content }}</span>

    <button wire:click="$parent.remove({{ $todo->id }})">Remove</button>
</div>
```

イベントと直接親通信は、親コンポーネントと子コンポーネント間での双方向通信を実現するためのいくつかの方法のうちの一部です。それぞれのトレードオフを理解することで、特定のシナリオでどのパターンを使用するかについてより情報に基づいた決定を下すことができます。

## 動的子コンポーネント

時には、実行時までページにどの子コンポーネントをレンダリングするかわからない場合もあります。そのため、Livewireでは実行時に子コンポーネントを選択できる`<livewire:dynamic-component ...>`を介して子コンポーネントをレンダリングできます。これは`:is`プロパティを受け取ります：

```blade
<livewire:dynamic-component :is="$current" />
```

動的子コンポーネントはさまざまなシナリオで便利ですが、以下はマルチステップフォームの異なるステップを動的コンポーネントを使用してレンダリングする例です：

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class Steps extends Component
{
    public $current = 'step-one';

    protected $steps = [
        'step-one',
        'step-two',
        'step-three',
    ];

    public function next()
    {
        $currentIndex = array_search($this->current, $this->steps);

        $this->current = $this->steps[$currentIndex + 1];
    }

    public function render()
    {
        return view('livewire.todo-list');
    }
}
```

```blade
<div>
    <livewire:dynamic-component :is="$current" :key="$current" />

    <button wire:click="next">Next</button>
</div>
```

`Steps`コンポーネントの`$current`プロパティが「step-one」に設定されている場合、Livewireは次のように「step-one」という名前のコンポーネントをレンダリングします：

```php
<?php

namespace App\Livewire;

use Livewire\Component;

class StepOne extends Component
{
    public function render()
    {
        return view('livewire.step-one');
    }
}
```

お好みで、代替構文を使用することもできます：

```blade
<livewire:is :component="$current" :key="$current" />
```

:::warning 各子コンポーネントに一意のキーを割り当てるのを忘れないでください。Livewireは`<livewire:dynamic-child />`および`<livewire:is />`に自動的にキーを生成しますが、そのキーは_すべての_子コンポーネントに適用されるため、後続のレンダリングがスキップされることになります。

コンポーネントのレンダリングに対するキーの影響をより深く理解するには、[子コンポーネントの再レンダリングを強制する](#forcing-a-child-component-to-re-render)を参照してください。
:::

## 再帰コンポーネント

ほとんどのアプリケーションではほとんど必要とされませんが、Livewireコンポーネントは再帰的にネストすることができます。つまり、親コンポーネントが自分自身を子としてレンダリングすることができます。

アンケートを想像してみてください。その中に`SurveyQuestion`コンポーネントがあり、それにサブ質問を添付できるとします：

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Question;

class SurveyQuestion extends Component
{
    public Question $question;

    public function render()
    {
        return view('livewire.survey-question', [
            'subQuestions' => $this->question->subQuestions,
        ]);
    }
}
```

```blade
<div>
    Question: {{ $question->content }}

    @foreach ($subQuestions as $subQuestion)
        <livewire:survey-question :question="$subQuestion" :key="$subQuestion->id" />
    @endforeach
</div>
```

:::warning
もちろん、再帰コンポーネントには標準の再帰ルールが適用されます。最も重要なのは、テンプレート内にテンプレートが無限に再帰しないようにするロジックが必要であることです。上記の例では、もし`$subQuestion`が自分自身の`$subQuestion`として元の質問を含んでいた場合、無限ループが発生します。
:::

## 子コンポーネントの再レンダリングの強制

内部では、Livewireはテンプレート内の各ネストされたLivewireコンポーネントにキーを生成します。

例えば、次のようなネストされた`todo-count`コンポーネントを考えてみてください：

```blade
<div>
    <livewire:todo-count :$todos />
</div>
```

Livewireは内部的に次のようにコンポーネントにランダムな文字列キーを添付します：

```blade
<div>
    <livewire:todo-count :$todos key="lska" />
</div>
```

親コンポーネントがレンダリングされ、上記のような子コンポーネントに遭遇すると、そのキーは親に添付された子のリストに保存されます：

```php
'children' => ['lska'],
```

Livewireは、後続のレンダリング時にこのリストを参照して、子コンポーネントがすでにレンダリングされているかどうかを検出します。すでにレンダリングされている場合、コンポーネントはスキップされます。前述のとおり、[ネストされたコンポーネントはアイランドです](/docs/understanding-nesting#every-component-is-an-island)。ただし、子キーがリストにない場合、つまりまだレンダリングされていない場合、Livewireはコンポーネントの新しいインスタンスを作成し、その場でレンダリングします。

これらのニュアンスは、ほとんどのユーザーが意識する必要のない裏側の動作ですが、子コンポーネントのキーを設定するという概念は、子コンポーネントのレンダリングを制御するための強力なツールです。

この知識を使用して、コンポーネントを再レンダリングさせたい場合は、そのキーを変更するだけで済みます。

以下は、`$todos`が変更された場合に`todo-count`コンポーネントを破棄して再初期化したい場合の例です：

```blade
<div>
    <livewire:todo-count :todos="$todos" :key="$todos->pluck('id')->join('-')" />
</div>
```

上記のように、`$todos`の内容に基づいて動的な`:key`文字列を生成しています。これにより、`todo-count`コンポーネントは通常通りレンダリングされ、存在しますが、`$todos`自体が変更されると、コンポーネントは最初から再初期化され、古いコンポーネントは破棄されます。
