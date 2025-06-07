<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/wire-click.md -->
Livewireでは、ページ上の特定の要素がクリックされたときにコンポーネントのメソッド（アクション）を呼び出すためのシンプルなディレクティブ `wire:click` を提供しています。

例えば、以下の `ShowInvoice` コンポーネントを考えてみましょう。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Invoice;

class ShowInvoice extends Component
{
    public Invoice $invoice;

    public function download()
    {
        return response()->download(
            $this->invoice->file_path, 'invoice.pdf'
        );
    }
}
```

上記のクラスで「Download Invoice」ボタンがクリックされたときに `download()` メソッドを実行したい場合、ボタンに `wire:click="download"` を追加します。

```html
<button type="button" wire:click="download"> <!-- [tl! highlight] -->
    Download Invoice
</button>
```

## `wire:click` をリンクに使う場合

`<a>` タグで `wire:click` を使う場合は、ブラウザのデフォルトのリンク動作を防ぐために `.prevent` を付与する必要があります。これを付けないと、ブラウザがリンク先に遷移し、ページのURLが更新されてしまいます。

```html
<a href="#" wire:click.prevent="...">
```

## さらに詳しく

`wire:click` はLivewireで利用できる多くのイベントリスナーのひとつです。他のイベントリスナーも含めた詳細な使い方は、[Livewireアクションのドキュメントページ](/docs/actions) をご覧ください。
