Webアプリケーションで「ポーリング」とは、サーバーに定期的にリクエストを送り、最新情報を取得する手法です。より高度な技術（[WebSockets](/docs/events#real-time-events-using-laravel-echo)など）を使わずに、ページの内容を最新の状態に保つシンプルな方法です。

## 基本的な使い方

Livewireでポーリングを利用するには、要素に`wire:poll`を追加するだけです。

以下は、ユーザーの購読者数を表示する`SubscriberCount`コンポーネントの例です。

```php
<?php

namespace App\Livewire;

use Illuminate\Support\Facades\Auth;
use Livewire\Component;

class SubscriberCount extends Component
{
    public function render()
    {
        return view('livewire.subscriber-count', [
            'count' => Auth::user()->subscribers->count(),
        ]);
    }
}
```

```blade
<div wire:poll> <!-- [tl! highlight] -->
    Subscribers: {{ $count }}
</div>
```

通常、このコンポーネントはユーザーの購読者数を表示しますが、ページをリロードしない限り値は更新されません。しかし、テンプレートに`wire:poll`を追加することで、このコンポーネントは`2.5`秒ごとに自動で再描画され、購読者数が常に最新の状態に保たれます。

また、`wire:poll`に値を渡すことで、ポーリングのタイミングで特定のアクションを実行することもできます。

```blade
<div wire:poll="refreshSubscribers">
    Subscribers: {{ $count }}
</div>
```

この場合、コンポーネントの`refreshSubscribers()`メソッドが`2.5`秒ごとに呼び出されます。

## ポーリング間隔の調整

ポーリングの主な欠点は、サーバーへの負荷が高くなりやすい点です。たとえば、1,000人の訪問者が同じページでポーリングを利用している場合、`2.5`秒ごとに1,000件のネットワークリクエストが発生します。

このような場合は、ポーリングの間隔を長くすることでリクエスト数を減らすのが効果的です。

ポーリングの間隔は、`wire:poll`に希望する時間を指定することで調整できます。

```blade
<div wire:poll.15s> <!-- 秒単位の指定 -->

<div wire:poll.15000ms> <!-- ミリ秒単位の指定 -->
```

## バックグラウンド時の間引き

さらにサーバーへのリクエストを減らすため、Livewireはページがバックグラウンド（他のタブなど）にある場合、自動的にポーリングの頻度を95%削減します。ユーザーがタブに戻るまで、ポーリングの回数が大幅に減ります。

この挙動を無効にして、バックグラウンドでも常にポーリングを続けたい場合は、`wire:poll`に`.keep-alive`修飾子を追加してください。

```blade
<div wire:poll.keep-alive>
```

## ビューポート時のみポーリング

必要なときだけポーリングを行いたい場合は、`wire:poll`に`.visible`修飾子を追加できます。`.visible`を付けると、その要素がページ上で表示されているときだけポーリングが実行されます。

```blade
<div wire:poll.visible>
```

たとえば、`wire:visible`を使ったコンポーネントが長いページの一番下にある場合、ユーザーがその部分までスクロールしない限りポーリングは始まりません。ユーザーがスクロールして見えなくなると、再びポーリングが停止します。
