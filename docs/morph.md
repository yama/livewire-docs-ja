LivewireコンポーネントがブラウザのDOMを更新する際、Livewireは「モーフィング」と呼ばれる独自の賢い方法でこれを行います。ここでいう _morph_（モーフ）は、_replace_（置き換え）とは異なるアプローチです。

コンポーネントが更新されるたびにHTML全体を新しく描画して _置き換える_ のではなく、Livewireは現在のHTMLと新しいHTMLを動的に比較し、差分を特定して、必要な箇所だけをピンポイントで変更します。

この仕組みにより、変更されていない既存の要素がそのまま維持されます。たとえば、イベントリスナーやフォーカス状態、フォーム入力値などはLivewireの更新間で保持されます。もちろん、毎回DOM全体を消して再描画するよりもパフォーマンス面でも大きなメリットがあります。

## モーフィングの仕組み

Livewireがリクエストごとにどの要素を更新するかをどのように判断しているのか、シンプルな`Todos`コンポーネントを例に見てみましょう。

```php
class Todos extends Component
{
    public $todo = '';

    public $todos = [
        'first',
        'second',
    ];

    public function add()
    {
        $this->todos[] = $this->todo;
    }
}
```

```blade
<form wire:submit="add">
    <ul>
        @foreach ($todos as $item)
            <li>{{ $item }}</li>
        @endforeach
    </ul>

    <input wire:model="todo">
</form>
```

このコンポーネントの初回レンダリングでは、次のようなHTMLが出力されます。

```html
<form wire:submit="add">
    <ul>
        <li>first</li>

        <li>second</li>
    </ul>

    <input wire:model="todo">
</form>
```

ここで、入力フィールドに「third」と入力して `[Enter]` キーを押したとします。新しくレンダリングされたHTMLは次のようになります。

```html
<form wire:submit="add">
    <ul>
        <li>first</li>

        <li>second</li>

        <li>third</li> <!-- [tl! add] -->
    </ul>

    <input wire:model="todo">
</form>
```

Livewireがコンポーネントの更新を処理する際、元のDOMを新しくレンダリングされたHTMLに _モーフィング_ します。次のビジュアライゼーションは、その仕組みを直感的に理解するのに役立ちます。

<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/844600772?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="morph_basic"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

ご覧の通り、Livewireは両方のHTMLツリーを同時に走査します。両方のツリー内の各要素に出会うと、それらを比較して変更、追加、削除を判断します。変更が検出されると、適切な変更が外科的に行われます。

## モーフィングの短所

以下は、モーフィングアルゴリズムがHTMLツリーの変更を正しく特定できず、アプリケーションに問題を引き起こすシナリオです。

### 中間要素の挿入

架空の `CreatePost` コンポーネントのLivewire Bladeテンプレートを考えてみましょう。

```blade
<form wire:submit="save">
    <div>
        <input wire:model="title">
    </div>

    @if ($errors->has('title'))
        <div>{{ $errors->first('title') }}</div>
    @endif

    <div>
        <button>Save</button>
    </div>
</form>
```

ユーザーがフォームを送信しようとしたが、バリデーションエラーに遭遇した場合、次のような問題が発生します。

<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/844600840?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="morph_problem"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

ご覧の通り、Livewireが新しいエラーメッセージ用の `<div>` に遭遇すると、それを既存の `<div>` に対してインプレースで変更するべきか、新しい `<div>` を中間に挿入するべきかを判断できません。

より明示的に何が起こっているのかを再確認すると：

* Livewireは両方のツリー内の最初の `<div>` に遭遇します。それらは同じであるため、処理を続行します。
* Livewireは両方のツリー内の2番目の `<div>` に遭遇し、それらが同じ `<div>` であり、単に内容が変更されたと考えます。したがって、エラーメッセージを新しい要素として挿入するのではなく、 `<button>` をエラーメッセージに変更します。
* Livewireは、その後、前の要素を誤って変更した後、比較の最後に追加の要素を検出します。それから、それを前の要素の後に作成して追加します。
* したがって、単に移動されるべきであった要素が破壊され、再作成されます。

このシナリオは、ほとんどすべてのモーフ関連のバグの根本原因です。

これらのバグのいくつかの具体的な影響は次のとおりです。
* 更新間でイベントリスナーや要素の状態が失われる
* イベントリスナーや状態が誤った要素に配置される
* Livewireコンポーネント全体がリセットまたは複製される可能性がある（LivewireコンポーネントはDOMツリー内の単純な要素でもあるため）
* Alpineコンポーネントや状態が失われたり、誤って配置されたりする

幸いなことに、Livewireは次のアプローチを使用して、これらの問題を軽減するために努力してきました。

### 内部先読み

Livewireのモーフィングアルゴリズムには、要素を変更する前に後続の要素とその内容をチェックする追加のステップがあります。

これにより、多くのケースで上記のシナリオが発生するのを防ぎます。

「先読み」アルゴリズムの動作を示すビジュアライゼーションは次のとおりです。

<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/844600800?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="morph_lookahead"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

### モーフマーカーの注入

バックエンドでは、LivewireはBladeテンプレート内の条件文を自動的に検出し、それらをLivewireのJavaScriptがモーフィング時にガイドとして使用できるHTMLコメントマーカーでラップします。

次のBladeテンプレートの例を見てみましょう。Livewireの注入されたマーカーがあります。

```blade
<form wire:submit="save">
    <div>
        <input wire:model="title">
    </div>

    <!--[if BLOCK]><![endif]--> <!-- [tl! highlight] -->
    @if ($errors->has('title'))
        <div>Error: {{ $errors->first('title') }}</div>
    @endif
    <!--[if ENDBLOCK]><![endif]--> <!-- [tl! highlight] -->

    <div>
        <button>Save</button>
    </div>
</form>
```

これらのマーカーがテンプレートに注入されることで、Livewireは変更と追加の違いをより簡単に検出できるようになります。

この機能はLivewireアプリケーションにとって非常に有益ですが、正規表現を介してテンプレートを解析する必要があるため、条件文を正しく検出できない場合があります。この機能がアプリケーションにとって妨げとなる場合は、アプリケーションの `config/livewire.php` ファイルで次の設定を行うことで無効にできます。

```php
'inject_morph_markers' => false,
```

#### 条件文のラッピング

上記の2つの解決策で状況がカバーされない場合、モーフィングの問題を回避する最も信頼性の高い方法は、条件文やループを常に存在する独自の要素でラップすることです。

たとえば、次のようにラッピング `<div>` 要素を使って書き換えられたBladeテンプレートを示します。

```blade
<form wire:submit="save">
    <div>
        <input wire:model="title">
    </div>

    <div> <!-- [tl! highlight] -->
        @if ($errors->has('title'))
            <div>{{ $errors->first('title') }}</div>
        @endif
    </div> <!-- [tl! highlight] -->

    <div>
        <button>Save</button>
    </div>
</form>
```

これで、条件文が永続的な要素にラップされているため、Livewireは2つの異なるHTMLツリーを適切にモーフィングできます。

#### モーフィングのバイパス

要素に対してモーフィングを完全にバイパスする必要がある場合は、[wire:replace](/docs/wire-replace)を使用して、Livewireに既存の要素をモーフィングするのではなく、要素のすべての子要素を置き換えるよう指示できます。
