---
title: ロック
---

Livewireのプロパティは、`wire:model`などのユーティリティを使ってフロントエンド・バックエンドの両方から自由に変更できます。しかし、例えばモデルIDのように、フロントエンドからプロパティが変更されるのを防ぎたい場合は、Livewireの`#[Locked]`属性を利用できます。

## 基本的な使い方

以下は、`Post`モデルのIDを`$id`というパブリックプロパティとして保持する`ShowPost`コンポーネントの例です。このプロパティが好奇心旺盛なユーザーや悪意のあるユーザーによって変更されないようにするには、プロパティに`#[Locked]`属性を追加します。

:::warning 属性クラスのインポートを忘れずに
属性クラスは必ずインポートしてください。たとえば、下記の`#[Locked]`属性を使う場合は、`use Livewire\Attributes\Locked;`のインポートが必要です。
:::

```php
use Livewire\Attributes\Locked;
use Livewire\Component;

class ShowPost extends Component
{
    // highlight-next-line
	#[Locked]
    public $id;

    public function mount($postId)
    {
        $this->id = $postId;
    }

	// ...
}
```

`#[Locked]`属性を追加することで、`$id`プロパティが改ざんされる心配がなくなります。

:::tip モデルプロパティはデフォルトで安全です

パブリックプロパティにモデルIDだけでなくEloquentモデル自体を格納した場合、Livewireは`#[Locked]`属性を明示的に追加しなくてもIDが改ざんされないよう自動的に保護します。多くの場合、`#[Locked]`を使うよりもこの方法がおすすめです:
```php
class ShowPost extends Component
{
    // highlight-next-line
   public Post $post;

   public function mount($postId)
   {
       $this->post = Post::find($postId);
   }

   // ...
}
```
:::

### なぜprotectedプロパティではダメなのか？

「機密データならprotectedプロパティにすればいいのでは？」と思うかもしれません。

ただし、Livewireがネットワークリクエスト間で値を保持できるのはパブリックプロパティだけです。静的でハードコードされたデータならprotectedプロパティでも問題ありませんが、実行時に保持したいデータはパブリックプロパティにする必要があります。

### Livewireが自動でロックしてくれればいいのでは？

理想を言えば、Livewireがデフォルトでプロパティをロックし、`wire:model`が使われている場合のみ変更を許可するのがベストです。

しかし、そのためにはLivewireがすべてのBladeテンプレートを解析し、どのプロパティが`wire:model`や類似APIで変更されているかを把握する必要があります。

これは技術的・パフォーマンス的な負荷が大きいだけでなく、Alpineや独自のJavaScriptなどでプロパティが変更されている場合は検出が不可能です。

そのため、Livewireは今後もパブリックプロパティをデフォルトで自由に変更可能なままにし、必要に応じて開発者がロックできる仕組みを提供します。
