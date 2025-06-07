## グローバル・コンポーネントフック

アプリケーション内のすべてのコンポーネントに機能や挙動を追加したい場合は、Livewireの「コンポーネントフック」を利用できます。

コンポーネントフックを使うと、Livewireコンポーネントのライフサイクルに外部から（コンポーネントクラス自体やトレイトではなく）フックできるクラスをひとつ定義できます。

実際の使用例を見る前に、利用可能なすべてのメソッドを含んだ汎用的なコンポーネントフックのクラス例を紹介します。

```php
use Livewire\ComponentHook;

class MyComponentHook extends ComponentHook
{
    public static function provide()
    {
        // アプリケーションの起動時に一度だけ実行されます。
        // 必要なサービスの登録などに利用できます。
    }

    public function mount($params, $parent)
    {
        // コンポーネントが「マウント」されたときに呼び出されます
        // 
        // $params: コンポーネントに渡されたパラメータの配列
        // $parent: ネストされたコンポーネントの場合の親コンポーネントオブジェクト
    }

    public function hydrate($memo)
    {
        // コンポーネントが「ハイドレート」されたときに呼び出されます
        //
        // $memo: このコンポーネントの「デハイドレート」されたメタデータの連想配列
    }

    public function boot()
    {
        // コンポーネントのブート時に呼び出されます
    }

    public function update($property, $path, $value)
    {
        // コンポーネントが更新される前に呼び出されます...

        return function () {
            // コンポーネントプロパティが更新された後に呼び出されます...
        };
    }

    public function call($method, $params, $returnEarly)
    {
        // コンポーネントのメソッドが呼び出される前に実行されます...

        return function ($returnValue) {
            // メソッド呼び出し後に実行されます
        };
    }

    public function render($view, $data)
    {
        // 「render」が呼び出された後、Bladeがレンダリングされる前に実行されます...
        return function ($html) {
            // コンポーネントのビューがレンダリングされた後に呼び出されます
        };
    }

    public function dehydrate($context)
    {
        // コンポーネントが「デハイドレート」されるときに呼び出されます
    }

    public function exception($e, $stopPropagation)
    {
        // コンポーネント内で例外がスローされた場合に呼び出されます...
    }
}
```

サービスプロバイダー（例：`App\Providers\AppServiceProvider`）からコンポーネントフックを登録するには、次のようにします。

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Livewire\Livewire;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Livewire::componentHook(MyComponentHook::class);
    }

    // ...
}
```

コンポーネントフックの概要を見たので、次は実際にそれらを使用してアプリケーションに便利な機能を提供する実用的な例を見てみましょう。

たとえば、任意のLivewireアクションからCSVを返す機能をサポートし、自動的にファイルダウンロードをトリガーしたいとします。たとえば、`CreatePost`コンポーネント内の`save`というメソッドからCsvを返すことができます。

```php
use Livewire\Component;

class CreateUser extends Component
{
    public $username = '';

    public $email = '';

    public function something()
    {
        return new Csv();
    }

    // ...
}
```


```php
<?php

namespace App;

use Livewire\ComponentHook;

class SupportCsvDownloads extends ComponentHook
{
    public function call($method, $params, $returnEarly)
    {
        // コンポーネントのメソッドが呼び出される前に実行されます...

        return function ($returnValue) {
            if ($returnValue instanceof Csv) {
                // 何かを行う
            }
        };
    }
}
```

これで、コンポーネントメソッドからCsvインスタンスを返すと、自動的にファイルダウンロードがトリガーされるようになります。
