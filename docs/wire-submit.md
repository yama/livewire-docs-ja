---
title: wire:submit ディレクティブ
---

<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/wire-submit.md -->
Livewireでは、`wire:submit`ディレクティブを使うことでフォーム送信を簡単に処理できます。`<form>`要素に`wire:submit`を追加すると、Livewireが送信イベントを受け取り、ブラウザのデフォルト動作を防いだ上で、任意のLivewireコンポーネントメソッドを呼び出します。

「投稿作成」フォーム送信を`wire:submit`で処理する基本例を紹介します。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $title = '';

    public $content = '';

    public function save()
    {
        Post::create([
            'title' => $this->title,
            'content' => $this->content,
        ]);

        $this->redirect('/posts');
    }

    public function render()
    {
        return view('livewire.create-post');
    }
}
```

```blade
<!-- highlight-next-line -->
<form wire:submit="save">
    <input type="text" wire:model="title">

    <textarea wire:model="content"></textarea>

    <button type="submit">Save</button>
</form>
```

この例では、ユーザーが「Save」ボタンでフォームを送信すると、`wire:submit`が`submit`イベントを受け取り、サーバー側の`save()`アクションを呼び出します。

:::info Livewireは自動でpreventDefault()を呼び出します
`wire:submit`は他のLivewireイベントハンドラと異なり、内部的に`event.preventDefault()`を自動で実行します。これは、`submit`イベントを監視する場合、ほとんどのケースでブラウザのデフォルト動作（通常のフォーム送信）を防ぎたいからです。
:::

:::info 送信中はフォームが自動で無効化されます
Livewireはフォーム送信中、送信ボタンを無効化し、すべての入力を`readonly`にします。これにより、送信完了まで同じフォームが二重送信されるのを防げます。
:::

## さらに詳しく

`wire:submit`はLivewireが提供する多くのイベントリスナーのひとつです。より詳しい使い方は、以下のページもご参照ください。

* [Livewireでブラウザイベントに応答する](/docs/actions)
* [Livewireでフォームを作成する](/docs/forms)
