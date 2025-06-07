---
title: wire:confirm ディレクティブ
---

Livewireで危険な操作を行う前に、ユーザーに確認ダイアログを表示したい場合があります。

Livewireでは、`wire:click` や `wire:submit` などのアクションに加えて `wire:confirm` を追加するだけで、簡単に確認ダイアログを実装できます。

「投稿を削除」ボタンに確認ダイアログを追加する例は以下の通りです。

```blade
<button
    type="button"
    wire:click="delete"
    wire:confirm="本当にこの投稿を削除しますか？"
>
    Delete post <!-- [tl! highlight:-2,1] -->
</button>
```

ユーザーが「Delete post」をクリックすると、Livewireがブラウザの標準の確認ダイアログを表示します。Escキーやキャンセルを押すと操作は実行されず、「OK」を押すとアクションが実行されます。

## 入力を求めるプロンプト

アカウント削除など、さらに慎重な確認が必要な操作では、特定の文字列を入力させて確認するプロンプトを表示することもできます。

Livewireの `.prompt` モディファイアを `wire:confirm` に付与すると、指定した文字列と一致した場合のみアクションが実行されます（大文字・小文字は区別されます）。

```blade
<button
    type="button"
    wire:click="delete"
    wire:confirm.prompt="本当に実行しますか？\n\n確認のため DELETE と入力してください|DELETE"
>
    Delete account <!-- [tl! highlight:-2,1] -->
</button>
```

この例では、「Delete account」ボタンを押した際、「DELETE」と正しく入力された場合のみアクションが実行され、それ以外はキャンセルされます。

