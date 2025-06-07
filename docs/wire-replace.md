LivewireのDOM差分更新（DOM diffing）は、ページ上の既存要素を効率的に更新するのに便利ですが、場合によっては内部状態をリセットするために、要素を一から再描画したいことがあります。

このようなケースでは、`wire:replace`ディレクティブを使うことで、Livewireに対して要素の子要素のDOM差分更新をスキップし、サーバーから新しい要素で完全に置き換えるよう指示できます。

特に、サードパーティ製のJavaScriptライブラリやカスタムWebコンポーネントと連携する場合、または要素の再利用によって状態管理に問題が生じる場合に有効です。

以下は、シャドウDOMを持つWebコンポーネントを`wire:replace`でラップし、Livewireが要素全体を置き換えることで、カスタム要素が独自のライフサイクルを管理できるようにする例です。

```blade
<form>
    <!-- ... -->

    <div wire:replace>
        <!-- このカスタム要素は独自の内部状態を持ちます -->
        <json-viewer>@json($someProperty)</json-viewer>
    </div>

    <!-- ... -->
</form>
```

また、`wire:replace.self`を使うと、対象要素自身とその子要素すべてを置き換えるようLivewireに指示できます。

```blade
<div x-data="{open: false}" wire:replace.self>
  <!-- レンダリングごとに「open」状態が必ずfalseにリセットされます -->
</div>
```
