---
title: wire:transition ディレクティブ
---

## 基本的な使い方

Livewireでコンテンツの表示・非表示を切り替えるには、Bladeの`@if`などの条件ディレクティブを使うのが一般的です。さらにユーザー体験を高めるため、Livewireは`wire:transition`ディレクティブを提供しており、条件付き要素の出現・消失をなめらかにトランジションできます。

たとえば、コメントの表示・非表示を切り替える`ShowPost`コンポーネントの例です。

```php
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post;

    public $showComments = false;
}
```

```blade
<div>
    <!-- ... -->

    <button wire:click="$set('showComments', true)">Show comments</button>

    @if ($showComments)
        <!-- highlight-next-line -->
        <div wire:transition>
            @foreach ($post->comments as $comment)
                <!-- ... -->
            @endforeach
        </div>
    @endif
</div>
```
`wire:transition`をコメント部分の`<div>`に追加することで、「Show comments」ボタンを押すと`$showComments`が`true`になり、コメントがフェードインで表示されます。

## 制限事項

現時点で`wire:transition`は、`@if`などの条件分岐内の単一要素にのみ対応しています。兄弟要素のリストに使うと、期待通りに動作しません。たとえば、次のような使い方は正しく動作しません。

```blade
<!-- 注意: 以下のコードは正しく動作しません -->
<ul>
    @foreach ($post->comments as $comment)
        <li wire:transition wire:key="{{ $comment->id }}">{{ $comment->content }}</li>
    @endforeach
</ul>
```

上記のようなリストで要素が削除された場合、Livewireの内部的な「morph」機構の制約により、トランジションで消えることはありません。現状、`wire:transition`で動的リストのトランジションはできません。

## デフォルトのトランジションスタイル

デフォルトで、`wire:transition`を付けた要素には不透明度とスケールのCSSトランジションが適用されます。以下はそのビジュアル例です。

```blade
<div x-data="{ show: false }" x-cloak class="border border-gray-700 rounded-xl p-6 w-full flex justify-between">
    <a href="#" x-on:click.prevent="show = ! show" class="py-2.5 outline-none">
        Preview transition <span x-text="show ? 'out' : 'in →'">in</span>
    </a>
    <div class="hey">
        <div
            x-show="show"
            x-transition
            class="inline-flex px-16 py-2.5 rounded-[10px] bg-pink-400 text-white uppercase font-medium transition focus-visible:outline-none focus-visible:!ring-1 focus-visible:!ring-white"
            style="
                background: linear-gradient(109.48deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%), #EE5D99;
                box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.5), inset 0px 1px 0px rgba(255, 255, 255, 0.1);
            "
        >
            &nbsp;
        </div>
    </div>
</div>
```

デフォルトのトランジション値は次の通りです：

| トランジションin | トランジションout |
| --- | --- |
| `duration: 150ms` | `duration: 75ms` |
| `opacity: [0 - 100]` | `opacity: [100 - 0]` |
| `transform: scale([0.95 - 1])` | `transform: scale([1 - 0.95])` |

## トランジションのカスタマイズ

Livewireが内部的に使うCSSは、以下の修飾子を組み合わせて自由にカスタマイズできます。

| 修飾子 | 説明 |
| --- | --- |
| `.in` | 「表示時」だけトランジション |
| `.out` | 「非表示時」だけトランジション |
| `.duration.[?]ms` | ミリ秒単位でトランジション時間を指定 |
| `.duration.[?]s` | 秒単位でトランジション時間を指定 |
| `.delay.[?]ms` | ミリ秒単位で遅延を指定 |
| `.delay.[?]s` | 秒単位で遅延を指定 |
| `.opacity` | 不透明度のみトランジション |
| `.scale` | スケールのみトランジション |
| `.origin.[top\|bottom\|left\|right]` | スケールの基準位置を指定 |

さまざまなトランジションの組み合わせ例を紹介します。

**フェードのみのトランジション**

デフォルトではフェードとスケール両方が適用されますが、`.opacity`修飾子を付けるとスケールなしのフェードだけになります。全画面オーバーレイなどに最適です。

```html
<div wire:transition.opacity>
```

```blade
<div x-data="{ show: false }" x-cloak class="border border-gray-700 rounded-xl p-6 w-full flex justify-between">
    <a href="#" x-on:click.prevent="show = ! show" class="py-2.5 outline-none">
        Preview transition <span x-text="show ? 'out' : 'in →'">in</span>
    </a>
    <div class="hey">
        <div
            x-show="show"
            x-transition.opacity
            class="inline-flex px-16 py-2.5 rounded-[10px] bg-pink-400 text-white uppercase font-medium transition focus-visible:outline-none focus-visible:!ring-1 focus-visible:!ring-white"
            style="
                background: linear-gradient(109.48deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%), #EE5D99;
                box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.5), inset 0px 1px 0px rgba(255, 255, 255, 0.1);
            "
        >
            ...
        </div>
    </div>
</div>
```

**フェードアウトトランジション**

表示時は即座に表示し、非表示時だけフェードアウトするパターンもよく使われます。MacOSのドロップダウンやメニューでよく見られる効果です。

```html
<div wire:transition.out.opacity.duration.200ms>
```

```blade
<div x-data="{ show: false }" x-cloak class="border border-gray-700 rounded-xl p-6 w-full flex justify-between">
    <a href="#" x-on:click.prevent="show = ! show" class="py-2.5 outline-none">
        Preview transition <span x-text="show ? 'out' : 'in →'">in</span>
    </a>
    <div class="hey">
        <div
            x-show="show"
            x-transition.out.opacity.duration.200ms
            class="inline-flex px-16 py-2.5 rounded-[10px] bg-pink-400 text-white uppercase font-medium transition focus-visible:outline-none focus-visible:!ring-1 focus-visible:!ring-white"
            style="
                background: linear-gradient(109.48deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%), #EE5D99;
                box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.5), inset 0px 1px 0px rgba(255, 255, 255, 0.1);
            "
        >
            ...
        </div>
    </div>
</div>
```

**origin-topトランジション**

ドロップダウンメニューなどでは、中央ではなく上端を基準にスケールインさせると自然です。

```html
<div wire:transition.scale.origin.top>
```

```blade
<div x-data="{ show: false }" x-cloak class="border border-gray-700 rounded-xl p-6 w-full flex justify-between">
    <a href="#" x-on:click.prevent="show = ! show" class="py-2.5 outline-none">
        Preview transition <span x-text="show ? 'out' : 'in →'">in</span>
    </a>
    <div class="hey">
        <div
            x-show="show"
            x-transition.origin.top
            class="inline-flex px-16 py-2.5 rounded-[10px] bg-pink-400 text-white uppercase font-medium transition focus-visible:outline-none focus-visible:!ring-1 focus-visible:!ring-white"
            style="
                background: linear-gradient(109.48deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%), #EE5D99;
                box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.5), inset 0px 1px 0px rgba(255, 255, 255, 0.1);
            "
        >
            ...
        </div>
    </div>
</div>

:::tip Livewireは内部的にAlpineのトランジションを利用
`wire:transition`を使うと、Livewireは内部的にAlpineの`x-transition`ディレクティブを適用します。Alpineのトランジション構文もほぼそのまま使えるので、[Alpine公式ドキュメント](https://alpinejs.dev/directives/transition)も参考にしてください。

