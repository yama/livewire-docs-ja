<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/wire-ignore.md -->
Livewireはページの内容を動的に更新できるのが特徴ですが、場合によってはページの一部だけLivewireによる更新を無効化したいことがあります。

このような場合は、`wire:ignore` ディレクティブを使うことで、特定の要素の内容がリクエストごとに変化してもLivewireが無視するように指示できます。

特に、サードパーティ製のJavaScriptライブラリでカスタムフォーム入力などを扱う際に便利です。

以下は、サードパーティ製ライブラリが利用する要素を `wire:ignore` でラップし、LivewireがそのHTMLを変更しないようにする例です。

```blade
<form>
    <!-- ... -->

    <div wire:ignore>
        <!-- この要素はサードパーティ製ライブラリで初期化されます... -->
        <input id="id-for-date-picker-library">
    </div>

    <!-- ... -->
</form>
```

また、`wire:ignore.self` を使うと、ルート要素の属性変更のみをLivewireが無視し、内部の内容は監視対象にできます。

```blade
<div wire:ignore.self>
    <!-- ... -->
</div>
```
