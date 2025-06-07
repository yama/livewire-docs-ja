<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/wire-show.md -->
Livewireの`wire:show`ディレクティブを使えば、式の結果に応じて要素の表示・非表示を簡単に切り替えられます。

`wire:show`はBladeの`@if`と異なり、要素自体をDOMから削除するのではなく、CSS（`display: none`）で表示・非表示を切り替えます。これにより、要素はページ上に残ったまま非表示となり、サーバーとの通信なしでスムーズなトランジションが可能です。

## 基本的な使い方

「投稿作成」モーダルの表示・非表示を`wire:show`で切り替える実用例を紹介します。

```php
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $showModal = false;

    public $content = '';

    public function save()
    {
        Post::create(['content' => $this->content]);

        $this->reset('content');

        $this->showModal = false;
    }
}
```

```blade
<div>
    <button x-on:click="$wire.showModal = true">New Post</button>

    <div wire:show="showModal">
        <form wire:submit="save">
            <textarea wire:model="content"></textarea>

            <button type="submit">Save Post</button>
        </form>
    </div>
</div>
```

「Create New Post」ボタンをクリックすると、サーバーとの通信なしでモーダルが表示されます。投稿の保存が完了すると、モーダルが非表示になりフォームもリセットされます。

## トランジションの利用

`wire:show`はAlpine.jsのトランジションと組み合わせて、なめらかな表示・非表示アニメーションを実現できます。`wire:show`はCSSの`display`プロパティのみを切り替えるため、Alpineの`x-transition`ディレクティブと相性抜群です。

```blade
<div>
    <button x-on:click="$wire.showModal = true">New Post</button>

    <div wire:show="showModal" x-transition.duration.500ms>
        <form wire:submit="save">
            <textarea wire:model="content"></textarea>
            <button type="submit">Save Post</button>
        </form>
    </div>
</div>
```

上記のAlpine.jsトランジションにより、モーダルの表示・非表示時にフェードやスケールの効果が加わります。

[Alpine.jsのx-transition公式ドキュメントはこちら →](https://alpinejs.dev/directives/transition)
