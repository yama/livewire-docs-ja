ウェブアプリケーションで「ポーリング」とは、サーバーに定期的にリクエストを送り、最新情報を取得する手法です。より高度な技術である[WebSockets](/docs/events#real-time-events-using-laravel-echo)を使わずに、ページの内容を常に最新の状態に保つシンプルな方法です。

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
<div wire:poll>
    Subscribers: {{ $count }}
</div>
```

通常、このコンポーネントはユーザーの購読者数を表示しますが、ページをリロードしない限り値は更新されません。しかし、テンプレート内で`wire:poll`を使うことで、このコンポーネントは`2.5`秒ごとに自動で再描画され、購読者数が常に最新の状態に保たれます。

また、`wire:poll`に値を渡すことで、ポーリングのたびに特定のアクションを実行することもできます。

```blade
<div wire:poll="refreshSubscribers">
    Subscribers: {{ $count }}
</div>
```

この場合、コンポーネント内の`refreshSubscribers()`メソッドが`2.5`秒ごとに呼び出されます。

## ポーリング間隔の調整

ポーリングの主なデメリットは、サーバーへのリクエストが多くなりやすい点です。たとえば、1,000人の訪問者が同じページを開いている場合、`2.5`秒ごとに1,000件のリクエストが発生します。

このような場合は、ポーリングの間隔を長く設定することで、リクエスト数を減らすのが効果的です。

ポーリングの間隔は、`wire:poll`に時間を指定することで調整できます。

```blade
<div wire:poll.15s> <!-- 秒単位の指定 -->

<div wire:poll.15000ms> <!-- ミリ秒単位の指定 -->
```

## バックグラウンド時の自動間引き

さらにサーバーへのリクエストを減らすため、Livewireはページがバックグラウンド（他のタブなど）にある場合、自動的にポーリングの頻度を95%削減します。つまり、ユーザーが別のタブを見ている間は、ポーリングの回数が大幅に減ります。

この挙動を無効にして、タブがバックグラウンドでも常にポーリングを続けたい場合は、`wire:poll`に`.keep-alive`修飾子を追加してください。

```blade
<div wire:poll.keep-alive>
```

## ビューポート（画面表示領域）での間引き

必要なときだけポーリングを行いたい場合は、`wire:poll`に`.visible`修飾子を追加できます。`.visible`を付けると、その要素が画面上に表示されているときだけポーリングが実行されます。

```blade
<div wire:poll.visible>
```

たとえば、ページの一番下にあるコンポーネントに`wire:poll.visible`を付けた場合、ユーザーがその部分までスクロールして初めてポーリングが始まり、画面外にスクロールすると再び停止します。
