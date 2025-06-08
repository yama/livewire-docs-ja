---
title: シンセサイザー
---

Livewireコンポーネントは、JSONにシリアライズ（デハイドレート）されてから、リクエストごとにPHPコンポーネントへとアンシリアライズ（再ハイドレート）されます。そのため、プロパティはJSONでシリアライズ可能である必要があります。

PHPのプリミティブな値は標準でJSONにシリアライズできますが、モデルやコレクション、Carbonインスタンス、Stringableなど、より高度なプロパティ型をサポートするには、より柔軟な仕組みが必要です。

そこでLivewireは「シンセサイザー（Synthesizer）」という拡張ポイントを提供し、任意のカスタムプロパティ型もサポートできるようになっています。

:::tip まずは「ハイドレート」について理解しましょう
シンセサイザーを使う前に、Livewireのハイドレートシステムを理解しておくと役立ちます。詳しくは[ハイドレートのドキュメント](/docs/hydration)をご覧ください。
:::

## シンセサイザーの仕組み

カスタムシンセサイザーの作成方法を学ぶ前に、まずLivewireが[Laravel Stringable](https://laravel.com/docs/strings)をサポートするために内部で使っているシンセサイザーを見てみましょう。

例えば、次のような`CreatePost`コンポーネントがあるとします：

```php
class CreatePost extends Component
{
    public $title = '';
}
```

リクエスト間でLivewireはこのコンポーネントの状態を次のようなJSONオブジェクトにシリアライズします：

```js
state: { title: '' },
```

次に、`$title`プロパティの値が単なる文字列ではなく、stringableの場合を考えます：

```php
class CreatePost extends Component
{
    public $title = '';

    public function mount()
    {
        $this->title = str($this->title);
    }
}
```

この場合、デハイドレートされたJSONは単なる空文字列ではなく、[メタデータタプル](/docs/hydration#deeply-nested-tuples)を含みます：

```js
state: { title: ['', { s: 'str' }] },
```

Livewireはこのタプルを使って、次のリクエスト時に`$title`プロパティを再びstringableとしてハイドレートできます。

ここまででシンセサイザーの「外側から見た」効果が分かりました。次は、Livewire内部のstringable用シンセサイザーの実際のソースコードを見てみましょう：

```php
use Illuminate\Support\Stringable;

class StringableSynth extends Synth
{
    public static $key = 'str';

    public static function match($target)
    {
        return $target instanceof Stringable;
    }

    public function dehydrate($target)
    {
        return [$target->__toString(), []];
    }

    public function hydrate($value)
    {
        return str($value);
    }
}
```

このコードを順に解説します。

まずは`$key`プロパティ：

```php
public static $key = 'str';
```

すべてのシンセサイザーは、Livewireが[メタデータタプル](/docs/hydration#deeply-nested-tuples)（例：`['', { s: 'str' }]`）からstringableへ復元するための静的`$key`プロパティを持つ必要があります。各タプルの`s`キーがこの値を参照しています。

逆に、Livewireがプロパティをデハイドレートする際は、シンセサイザーの`match()`メソッドで対象プロパティ（`$target`）がこのシンセサイザーで処理すべきか判定します：

```php
public static function match($target)
{
    return $target instanceof Stringable;
}
```

`match()`がtrueを返すと、`dehydrate()`メソッドが呼ばれ、プロパティのPHP値を受け取り、JSON化可能な[メタデータ](/docs/hydration#deeply-nested-tuples)タプルを返します：

```php
public function dehydrate($target)
{
    return [$target->__toString(), []];
}
```

次のリクエスト開始時、タプル内の`{ s: 'str' }`キーでこのシンセサイザーが特定されると、`hydrate()`メソッドが呼ばれ、JSONの値からPHP互換の値へ復元されます。

```php
public function hydrate($value)
{
    return str($value);
}
```

## カスタムシンセサイザーの登録

独自のプロパティ型をサポートするシンセサイザーを作成する例として、次の`UpdateProperty`コンポーネントを使います：

```php
class UpdateProperty extends Component
{
    public Address $address;

    public function mount()
    {
        $this->address = new Address();
    }
}
```

`Address`クラスのソースは次の通りです：

```php
namespace App\Dtos\Address;

class Address
{
    public $street = '';
    public $city = '';
    public $state = '';
    public $zip = '';
}
```

この`Address`型プロパティをサポートするには、次のようなシンセサイザーを用意します：

```php
use App\Dtos\Address;

class AddressSynth extends Synth
{
    public static $key = 'address';

    public static function match($target)
    {
        return $target instanceof Address;
    }

    public function dehydrate($target)
    {
        return [[
            'street' => $target->street,
            'city' => $target->city,
            'state' => $target->state,
            'zip' => $target->zip,
        ], []];
    }

    public function hydrate($value)
    {
        $instance = new Address;

        $instance->street = $value['street'];
        $instance->city = $value['city'];
        $instance->state = $value['state'];
        $instance->zip = $value['zip'];

        return $instance;
    }
}
```

アプリケーション全体で利用できるようにするには、サービスプロバイダのbootメソッドでLivewireの`propertySynthesizer`メソッドを使って登録します：

```php
class AppServiceProvider extends ServiceProvider
{
    /**
     * アプリケーションサービスの起動処理
     */
    public function boot(): void
    {
        Livewire::propertySynthesizer(AddressSynth::class);
    }
}
```

## データバインディング対応

先ほどの`UpdateProperty`の例のように、`Address`オブジェクトのプロパティに`wire:model`バインディングを直接使いたい場合もあるでしょう。シンセサイザーでは`get()`と`set()`メソッドを実装することで、これに対応できます：

```php
use App\Dtos\Address;

class AddressSynth extends Synth
{
    public static $key = 'address';

    public static function match($target)
    {
        return $target instanceof Address;
    }

    public function dehydrate($target)
    {
        return [[
            'street' => $target->street,
            'city' => $target->city,
            'state' => $target->state,
            'zip' => $target->zip,
        ], []];
    }

    public function hydrate($value)
    {
        $instance = new Address;

        $instance->street = $value['street'];
        $instance->city = $value['city'];
        $instance->state = $value['state'];
        $instance->zip = $value['zip'];

        return $instance;
    }

    public function get(&$target, $key) // [tl! highlight:8]
    {
        return $target->{$key};
    }

    public function set(&$target, $key, $value)
    {
        $target->{$key} = $value;
    }
}
```
