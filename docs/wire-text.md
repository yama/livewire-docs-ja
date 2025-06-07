---
title: wire:text ディレクティブ
---

`wire:text`は、コンポーネントのプロパティや式に基づいて要素のテキスト内容を動的に更新するディレクティブです。Bladeの`{{ }}`構文と異なり、`wire:text`はコンポーネントの再描画やネットワークリクエストなしで内容を即座に更新できます。

Alpineの`x-text`ディレクティブに馴染みがある方は、ほぼ同じ感覚で使えます。

## 基本的な使い方

Livewireプロパティの値をネットワークリクエストを待たずに楽観的に表示したい場合、`wire:text`が便利です。

```php
use Livewire\Component;
use App\Models\Post;

class ShowPost extends Component
{
    public Post $post;

    public $likes;

    public function mount()
    {
        $this->likes = $this->post->like_count;
    }

    public function like()
    {
        $this->post->like();

        $this->likes = $this->post->fresh()->like_count;
    }
}
```

```blade
<div>
    <button x-on:click="$wire.likes++" wire:click="like">❤️ Like</button>

    Likes: <span wire:text="likes"></span>
</div>
```

ボタンをクリックすると、`$wire.likes++`によって`wire:text`経由で表示が即座に更新され、`wire:click="like"`で裏側のデータベースも更新されます。

このように、`wire:text`はLivewireで楽観的UIを構築するのに最適です。
