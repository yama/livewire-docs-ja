<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/lazy.md -->
Livewireを使うと、初回のページ読み込みを遅くしてしまうコンポーネントを遅延読み込み（レイジーロード）できます。

たとえば、`mount()`内で重いデータベースクエリを実行する`Revenue`コンポーネントがあるとします。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Transaction;

class Revenue extends Component
{
    public $amount;

    public function mount()
    {
        // 重いデータベースクエリ...
        $this->amount = Transaction::monthToDate()->sum('amount');
    }

    public function render()
    {
        return view('livewire.revenue');
    }
}
```

```blade
<div>
    今月の売上: {{ $amount }}
</div>
```

遅延読み込みを使わない場合、このコンポーネントはページ全体の読み込みを遅らせてしまい、アプリケーション全体が遅く感じられてしまいます。

遅延読み込みを有効にするには、コンポーネントに`lazy`パラメータを渡します。

```blade
<livewire:revenue lazy />
```

これで、コンポーネントをすぐに読み込むのではなく、Livewireはこのコンポーネントをスキップし、ページをコンポーネントなしで読み込みます。そして、コンポーネントがビューポートに表示される時に、Livewireはネットワークリクエストを行い、このコンポーネントをページに完全に読み込みます。

> [!info] 遅延リクエストはデフォルトでアイソレートされています
> 他のネットワークリクエストとは異なり、遅延読み込みの更新は、サーバーに送信される際に互いにアイソレートされます。これにより、ページ読み込み時に各コンポーネントが並行して読み込まれ、遅延読み込みが高速になります。[この動作を無効にする方法については、こちらを参照してください →](#disabling-request-isolation)

## プレースホルダーHTMLのレンダリング

デフォルトでは、Livewireはコンポーネントが完全に読み込まれる前に、空の`<div></div>`を挿入します。コンポーネントが最初はユーザーに見えないため、コンポーネントが突然ページに表示されると、ユーザーにとっては不自然に感じられることがあります。

コンポーネントが読み込まれていることをユーザーに知らせるために、`placeholder()`メソッドを定義して、ローディングスピナーやスケルトンプレースホルダーなど、任意の種類のプレースホルダーHTMLをレンダリングできます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Transaction;

class Revenue extends Component
{
    public $amount;

    public function mount()
    {
        // 重いデータベースクエリ...
        $this->amount = Transaction::monthToDate()->sum('amount');
    }

    public function placeholder()
    {
        return <<<'HTML'
        <div>
            <!-- ローディングスピナー... -->
            <svg>...</svg>
        </div>
        HTML;
    }

    public function render()
    {
        return view('livewire.revenue');
    }
}
```

上記のコンポーネントは`placeholder()`メソッドからHTMLを返すことで「プレースホルダー」を指定しているため、コンポーネントが完全に読み込まれるまでの間、ユーザーはSVGローディングスピナーを見ることになります。

> [!warning] プレースホルダーとコンポーネントは同じ要素タイプである必要があります
> たとえば、プレースホルダーのルート要素タイプが'div'の場合、コンポーネントも'div'要素を使用する必要があります。

### ビューを介したプレースホルダーのレンダリング

スケルトンなどのより複雑なローダーの場合、`render()`と同様に`placeholder()`から`view`を返すことができます。

```php
public function placeholder(array $params = [])
{
    return view('livewire.placeholders.skeleton', $params);
}
```

遅延読み込みされるコンポーネントからの任意のパラメータは、`placeholder()`メソッドに渡される`$params`引数として利用可能です。

## ビューポート外での遅延読み込み

デフォルトでは、遅延読み込みされたコンポーネントは、ユーザーがそれにスクロールするなどしてブラウザのビューポートに入るまで完全には読み込まれません。

ページが読み込まれるとすぐに、ビューポートに入るのを待たずにページ上のすべてのコンポーネントを遅延読み込みしたい場合は、`lazy`パラメータに「on-load」を渡すことで可能です。

```blade
<livewire:revenue lazy="on-load" />
```

これで、このコンポーネントはページが準備完了後、ビューポート内に入るのを待たずに読み込まれます。

## プロパティの受け渡し

一般に、`lazy`コンポーネントは通常のコンポーネントと同様に扱うことができ、外部からデータを渡すことができます。

たとえば、親コンポーネントから`Revenue`コンポーネントに時間間隔を渡すシナリオを考えてみましょう。

```blade
<input type="date" wire:model="start">
<input type="date" wire:model="end">

<livewire:revenue lazy :$start :$end />
```

このデータは、他のコンポーネントと同様に`mount()`メソッドで受け取ることができます。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Transaction;

class Revenue extends Component
{
    public $amount;

    public function mount($start, $end)
    {
        // 高コストなデータベースクエリ...
        $this->amount = Transactions::between($start, $end)->sum('amount');
    }

    public function placeholder()
    {
        return <<<'HTML'
        <div>
            <!-- ローディングスピナー... -->
            <svg>...</svg>
        </div>
        HTML;
    }

    public function render()
    {
        return view('livewire.revenue');
    }
}
```

しかし、通常のコンポーネントの読み込みとは異なり、`lazy`コンポーネントは渡されたプロパティをシリアライズまたは「脱水」し、コンポーネントが完全に読み込まれるまでクライアント側に一時的に保存する必要があります。

たとえば、`Revenue`コンポーネントにEloquentモデルを渡したい場合、次のようにします。

```blade
<livewire:revenue lazy :$user />
```

通常のコンポーネントでは、実際のPHPメモリ内の`$user`モデルが`Revenue`の`mount()`メソッドに渡されます。しかし、次のネットワークリクエストが処理されるまで`mount()`は実行されないため、Livewireは内部的に`$user`をJSONにシリアライズし、次のリクエストが処理される前にデータベースから再クエリします。

通常、このシリアライズはアプリケーションの動作に影響を与えることはありません。

## デフォルトでの遅延読み込み

すべてのコンポーネントの使用が遅延読み込みされるように強制したい場合は、コンポーネントクラスの上に`#[Lazy]`属性を追加します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Lazy;

#[Lazy]
class Revenue extends Component
{
    // ...
}
```

遅延読み込みをオーバーライドしたい場合は、`lazy`パラメータを`false`に設定します。

```blade
<livewire:revenue :lazy="false" />
```

### リクエストのアイソレーションの無効化

ページに複数の遅延読み込みコンポーネントがある場合、各コンポーネントは独立したネットワークリクエストを行います。つまり、各遅延更新が単一のリクエストにバンドルされるのではなく、個別に処理されます。

このアイソレーション動作を無効にし、すべての更新を単一のネットワークリクエストにバンドルしたい場合は、`isolate: false`パラメータを使用します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Lazy;

#[Lazy(isolate: false)] // [tl! highlight]
class Revenue extends Component
{
    // ...
}
```

これで、同じページに10個の`Revenue`コンポーネントがある場合、ページが読み込まれると、すべての10個の更新がバンドルされ、単一のネットワークリクエストとしてサーバーに送信されます。

## フルページの遅延読み込み

フルページのLivewireコンポーネントを遅延読み込みしたい場合は、ルートで`->lazy()`と呼び出すことで可能です。

```php
Route::get('/dashboard', \App\Livewire\Dashboard::class)->lazy();
```

または、デフォルトで遅延読み込みされるコンポーネントがあり、その遅延読み込みをオプトアウトしたい場合は、次の`enabled: false`パラメータを使用します。

```php
Route::get('/dashboard', \App\Livewire\Dashboard::class)->lazy(enabled: false);
```

## デフォルトのプレースホルダービュー

すべてのコンポーネントにデフォルトのプレースホルダービューを設定したい場合は、`/config/livewire.php`設定ファイルでビューを参照することで可能です。

```php
'lazy_placeholder' => 'livewire.placeholder',
```

これで、コンポーネントが遅延読み込みされ、`placeholder()`が定義されていない場合、Livewireは構成されたBladeビュー（この場合は`livewire.placeholder`）を使用します。

## テスト用の遅延読み込みの無効化

遅延コンポーネントや、ネストされた遅延コンポーネントを含むページをユニットテストする際に、「遅延」動作を無効にして最終的なレンダリング結果をアサートしたい場合があります。その場合、テスト中はプレースホルダーとしてレンダリングされます。

次のように、`Livewire::withoutLazyLoading()`テストヘルパーを使用して遅延読み込みを簡単に無効にできます。

```php
<?php

namespace Tests\Feature\Livewire;

use App\Livewire\Dashboard;
use Livewire\Livewire;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    public function test_renders_successfully()
    {
        Livewire::withoutLazyLoading() // [tl! highlight]
            ->test(Dashboard::class)
            ->assertSee(...);
    }
}
```

これで、このテストのためにダッシュボードコンポーネントがレンダリングされるとき、`placeholder()`のレンダリングをスキップし、遅延読み込みが適用されていないかのようにフルコンポーネントがレンダリングされます。

