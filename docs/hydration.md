---
title: ハイドレーション
---

Livewireを使うと、まるでサーバーサイドのPHPクラスを直接Webブラウザに接続しているかのように感じられます。ボタンを押すだけでサーバーサイドの関数を直接呼び出せるなど、この“錯覚”を支える仕組みが用意されています。しかし、実際にはこれはあくまで“錯覚”にすぎません。

実際のLivewireは、一般的なWebアプリケーションとよく似た動作をしています。静的なHTMLをブラウザにレンダリングし、ブラウザ上のイベントを監視し、サーバーサイドのコードを呼び出すためにAJAXリクエストを送信します。

Livewireがサーバーに送る各AJAXリクエストは「ステートレス」です。つまり、サーバー側でコンポーネントの状態を永続的（＝リクエスト間で保持し続ける）に保存する仕組みはありません。そのため、Livewireは更新のたびにコンポーネントの直近の状態を毎回サーバー上で再現する必要があります。

このため、Livewireはサーバーサイドで更新が発生するたびにPHPコンポーネントの「スナップショット」を取得し、次回のリクエスト時にそのスナップショットからコンポーネントを再生成（または“再開”）できるようにしています。

このドキュメントでは、スナップショットを取得するプロセスを「デハイドレーション」、スナップショットからコンポーネントを再生成するプロセスを「ハイドレーション」と呼びます。

## デハイドレーション（Dehydrating）

Livewireがサーバーサイドコンポーネントを「デハイドレート」する際、主に次の2つの処理を行います：

* コンポーネントのテンプレートをHTMLにレンダリングする
* コンポーネントのJSONスナップショットを作成する

### HTMLのレンダリング

コンポーネントがマウントされた直後や更新が発生した後、Livewireはコンポーネントの`render()`メソッドを呼び出し、Bladeテンプレートを生のHTMLに変換します。

例えば、次のような`Counter`コンポーネントを考えてみましょう：

```php
class Counter extends Component
{
    public $count = 1;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return <<<'HTML'
        <div>
            Count: {{ $count }}

            <button wire:click="increment">+</button>
        </div>
        HTML;
    }
}
```

マウントまたは更新のたびに、Livewireは上記の`Counter`コンポーネントを次のHTMLにレンダリングします。

```html
<div>
    Count: 1

    <button wire:click="increment">+</button>
</div>
```

### スナップショット

次のリクエスト時にサーバー上で`Counter`コンポーネントを再作成するために、可能な限りコンポーネントの状態をキャプチャしようとするJSONスナップショットが作成されます。

```js
{
    state: {
        count: 1,
    },

    memo: {
        name: 'counter',

        id: '1526456',
    },
}
```

スナップショットには`memo`と`state`の2つの異なる部分があります。

`memo`部分はコンポーネントを識別し再作成するために必要な情報を格納するために使用され、`state`部分はコンポーネントのすべてのパブリックプロパティの値を格納します。

:::info
上記のスナップショットは、Livewireの実際のスナップショットの簡略版です。実際のアプリケーションでは、スナップショットにはバリデーションエラー、子コンポーネントのリスト、ロケールなど、さらに多くの情報が含まれます。スナップショットオブジェクトの詳細な情報については、[スナップショットスキーマドキュメント](/docs/javascript#the-snapshot-object)を参照してください。
:::

### HTMLへのスナップショットの埋め込み

コンポーネントが最初にレンダリングされると、LivewireはスナップショットをJSON形式で`wire:snapshot`というHTML属性に格納します。これにより、LivewireのJavaScriptコアはJSONを抽出し、実行時オブジェクトに変換します：

```html
<div wire:id="..." wire:snapshot="{ state: {...}, memo: {...} }">
    Count: 1

    <button wire:click="increment">+</button>
</div>
```

## ハイドレーション（Hydrating）

たとえば、`Counter`コンポーネントで「+」ボタンが押されるなど、コンポーネントの更新がトリガーされると、次のようなペイロードがサーバーに送信されます：

```js
{
    calls: [
        { method: 'increment', params: [] },
    ],

    snapshot: {
        state: {
            count: 1,
        },

        memo: {
            name: 'counter',

            id: '1526456',
        },
    }
}
```

Livewireが`increment`メソッドを呼び出す前に、まず新しい`Counter`インスタンスを作成し、スナップショットのstateで初期化する必要があります。

次のPHP擬似コードは、この結果を達成します：

```php
$state = request('snapshot.state');
$memo = request('snapshot.memo');

$instance = Livewire::new($memo['name'], $memo['id']);

foreach ($state as $property => $value) {
    $instance[$property] = $value;
}
```

上記のスクリプトに従うと、`Counter`オブジェクトが作成された後、そのパブリックプロパティはスナップショットから提供された状態に基づいて設定されます。

## 高度なハイドレーション

上記の`Counter`の例は、ハイドレーションの概念を示すのに適しています。しかし、整数（`1`など）のような単純な値のハイドレーション方法しか示していません。

ご存知のように、Livewireは整数以外にも多くの洗練されたプロパティタイプをサポートしています。

少し複雑な例として、`Todos`コンポーネントを見てみましょう：

```php
class Todos extends Component
{
    public $todos;

    public function mount() {
        $this->todos = collect([
            'first',
            'second',
            'third',
        ]);
    }
}
```

このように、`$todos`プロパティを3つの文字列を含む[Laravelコレクション](https://laravel.com/docs/collections#main-content)に設定しています。

JSONだけではLaravelコレクションを表現する方法がないため、Livewireはスナップショット内の純粋なデータにメタデータを関連付ける独自のパターンを作成しました。

この`Todos`コンポーネントのスナップショットの状態オブジェクトは次のようになります：

```js
state: {
    todos: [
        [ 'first', 'second', 'third' ],
        { s: 'clctn', class: 'Illuminate\\Support\\Collection' },
    ],
},
```

これは、次のような単純な配列を期待していた場合には混乱を招くかもしれません：

```js
state: {
    todos: [ 'first', 'second', 'third' ],
},
```

しかし、Livewireがこのデータに基づいてコンポーネントをハイドレートしている場合、配列ではなくコレクションであることを知る方法がありません。

したがって、Livewireはタプル（2つのアイテムの配列）という形式の代替状態構文をサポートしています。

```js
todos: [
    [ 'first', 'second', 'third' ],
    { s: 'clctn', class: 'Illuminate\\Support\\Collection' },
],
```

Livewireがコンポーネントの状態をハイドレートする際にタプルに遭遇した場合、タプルの2番目の要素に格納された情報を使用して、最初の要素に格納された状態をよりインテリジェントにハイドレートします。

より明確に示すために、上記のスナップショットに基づいてコレクションプロパティを再作成する方法を示す簡略化されたコードを以下に示します：

```php
[ $state, $metadata ] = request('snapshot.state.todos');

$collection = new $metadata['class']($state);
```

ご覧のとおり、Livewireは状態に関連付けられたメタデータを使用して、完全なコレクションクラスを導出します。

### 深くネストされたタプル

このアプローチの1つの明確な利点は、深くネストされたプロパティを脱水および再水和できることです。

たとえば、上記の`Todos`の例を考えてみてください。ただし、プレーンな文字列の代わりに[Laravel Stringable](https://laravel.com/docs/helpers#method-str)をコレクション内の3番目のアイテムとして使用します。

```php
class Todos extends Component
{
    public $todos;

    public function mount() {
        $this->todos = collect([
            'first',
            'second',
            str('third'),
        ]);
    }
}
```

このコンポーネントの状態に対する脱水スナップショットは、次のようになります。

```js
todos: [
    [
        'first',
        'second',
        [ 'third', { s: 'str' } ],
    ],
    { s: 'clctn', class: 'Illuminate\\Support\\Collection' },
],
```

ご覧のとおり、コレクション内の3番目のアイテムはメタデータタプルに脱水されています。タプル内の最初の要素はプレーンな文字列値であり、2番目の要素はこの文字列が_文字列可能_であることをLivewireに示すフラグです。

### カスタムプロパティタイプのサポート

内部的に、Livewireは最も一般的なPHPおよびLaravelタイプのハイドレーションをサポートしています。ただし、サポートされていないタイプをサポートしたい場合は、[Synthesizers](/docs/synthesizers)を使用して行うことができます。これは、非プリミティブプロパティタイプのハイドレーション/脱水のためのLivewireの内部メカニズムです。

