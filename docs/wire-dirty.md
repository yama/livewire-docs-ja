---
title: wire:dirty ディレクティブ
---

従来のHTMLページでは、フォームは「送信」ボタンが押されたときだけ送信されます。

しかし、Livewireでは従来のフォーム送信にとどまらず、リアルタイムでの入力検証や、ユーザーが入力するたびに自動保存することも可能です。

このような「リアルタイム」更新のシナリオでは、フォームやその一部が未保存の状態（＝"dirty"）であることをユーザーに分かりやすく伝えることが重要です。未保存の入力がある場合、そのフォームは「dirty」とみなされ、サーバーとクライアントの状態が同期されたときに「clean」になります。

## 基本的な使い方

Livewireでは、`wire:dirty` ディレクティブを使って、ページ上の要素を簡単にトグル表示できます。

`wire:dirty` を要素に追加すると、クライアント側の状態がサーバー側と異なる場合のみ、その要素が表示されます。

例えば、未保存の変更があることを示す「Unsaved changes...」メッセージを表示する `UpdatePost` フォームの例です。

例として、未保存の入力がある場合に「Unsaved changes...（未保存の変更があります）」という視覚的な表示でユーザーに知らせる `UpdatePost` フォームの例を示します。

```blade
<form wire:submit="update">
    <input type="text" wire:model="title">

    <!-- ... -->

    <button type="submit">Update</button>

    <!-- highlight-next-line -->
    <div wire:dirty>Unsaved changes...</div>
</form>
```

`wire:dirty` を「Unsaved changes...」メッセージに付与することで、デフォルトでは非表示になり、フォームの入力が変更されると自動的に表示されます。

フォームを送信すると、サーバーとクライアントのデータが再び同期され、メッセージは非表示に戻ります。

### 要素の非表示（remove）

`wire:dirty` に `.remove` モディファイアを付与すると、デフォルトで要素を表示し、「dirty」状態のときだけ非表示にできます。

```blade
<div wire:dirty.remove>The data is in-sync...</div>
```

## プロパティ単位での監視

例えば、`wire:model.blur` を使って、入力欄からフォーカスが外れたタイミングでサーバーにプロパティを即時反映させる場合、`wire:target` を `wire:dirty` と組み合わせて、特定のプロパティだけ「dirty」表示を出すこともできます。

たとえば、titleプロパティが変更された場合にのみ「未保存」の表示を出す例を示します：

```blade
<form wire:submit="update">
    <input wire:model.blur="title">

    <!-- highlight-next-line -->
    <div wire:dirty wire:target="title">Unsaved title...</div>

    <button type="submit">Update</button>
</form>
```

## クラスのトグル

要素全体の表示・非表示ではなく、入力欄が「dirty」状態のときだけ特定のCSSクラスを付与したい場合にも活用できます。

以下は、ユーザーが入力欄に文字を入力すると枠線が黄色になり「未保存」状態を示し、その後フィールドからフォーカスが外れると枠線が消えてサーバー側で保存された状態になる例です：

```blade
<input wire:model.blur="title" wire:dirty.class="border-yellow-500">
```

