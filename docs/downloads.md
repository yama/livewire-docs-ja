---
title: ダウンロード
---

Livewireでのファイルダウンロードは、基本的にLaravel本体と同じように動作します。通常、Livewireコンポーネント内でLaravelのダウンロード用ユーティリティをそのまま利用でき、期待通りに動作します。

ただし、内部的には標準的なLaravelアプリケーションとは異なる方法でファイルダウンロードが処理されます。Livewireを使う場合、ファイルの内容はBase64でエンコードされてフロントエンドに送信され、クライアント側でバイナリにデコードされて直接ダウンロードされます。

## 基本的な使い方

Livewireでファイルをダウンロードするには、通常のLaravelのダウンロードレスポンスを返すだけでOKです。

以下は、請求書PDFをダウンロードする「ダウンロード」ボタンを持つ`ShowInvoice`コンポーネントの例です。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Invoice;

class ShowInvoice extends Component
{
    public Invoice $invoice;

    public function mount(Invoice $invoice)
    {
        $this->invoice = $invoice;
    }

    public function download()
    {
        return response()->download( // [tl! highlight:2]
            $this->invoice->file_path, 'invoice.pdf'
        );
    }

    public function render()
    {
        return view('livewire.show-invoice');
    }
}
```

```blade
<div>
    <h1>{{ $invoice->title }}</h1>

    <span>{{ $invoice->date }}</span>
    <span>{{ $invoice->amount }}</span>

    <!-- highlight-next-line -->
    <button type="button" wire:click="download">Download</button>
</div>
```

Laravelのコントローラと同様に、`Storage`ファサードを使ってダウンロードを開始することもできます。

```php
public function download()
{
    return Storage::disk('invoices')->download('invoice.csv');
}
```

## ストリーミングダウンロード

Livewireでもストリーミングダウンロードが可能ですが、実際には「ストリーミング」されるわけではありません。ファイルの内容がすべて収集されてから、ブラウザに配信されてダウンロードが開始されます。

```php
public function download()
{
    return response()->streamDownload(function () {
        echo '...'; // ダウンロード内容を直接echoします
    }, 'invoice.pdf');
}
```

## ファイルダウンロードのテスト

Livewireでは、指定したファイル名でダウンロードが行われたかどうかを簡単にテストできる`->assertFileDownloaded()`メソッドも用意されています。

```php
use App\Models\Invoice;

public function test_can_download_invoice()
{
    $invoice = Invoice::factory();

    Livewire::test(ShowInvoice::class)
        ->call('download')
        ->assertFileDownloaded('invoice.pdf');
}
```

また、`->assertNoFileDownloaded()`メソッドを使えば、ファイルがダウンロードされなかったこともテストできます。

```php
use App\Models\Invoice;

public function test_does_not_download_invoice_if_unauthorised()
{
    $invoice = Invoice::factory();

    Livewire::test(ShowInvoice::class)
        ->call('download')
        ->assertNoFileDownloaded();
}
```
