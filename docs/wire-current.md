`wire:current` ディレクティブを使うと、ページ内で現在アクティブなリンクを簡単に検出し、スタイルを適用できます。

例えば、ナビゲーションバーのリンクに `wire:current` を追加し、現在のページのリンクだけフォントを太くする例です。

```blade
<nav>
    <a href="/dashboard" ... wire:current="font-bold text-zinc-800">Dashboard</a>
    <a href="/posts" ... wire:current="font-bold text-zinc-800">Posts</a>
    <a href="/users" ... wire:current="font-bold text-zinc-800">Users</a>
</nav>
```

この場合、ユーザーが `/posts` にアクセスしているときは「Posts」リンクだけが強調表示されます。

`wire:current` は `wire:navigate` リンクやページ遷移にもそのまま対応しています。

## 厳密一致（Exact matching）

デフォルトでは、`wire:current` は部分一致で判定します。つまり、リンクのパスと現在のページのパスが先頭で一致していれば適用されます。

例えば、リンクが `/posts` で現在のページが `/posts/1` の場合も `wire:current` が適用されます。

完全一致でのみ適用したい場合は `.exact` モディファイアを追加します。

```blade
<nav>
    <a href="/" wire:current.exact="font-bold">Dashboard</a>
</nav>
```

## 厳格一致（Strict matching）

デフォルトでは、`wire:current` は比較時に末尾のスラッシュ（`/`）を無視します。

この動作を無効にしてパス文字列を厳格に比較したい場合は `.strict` モディファイアを付与します。

```blade
<nav>
    <a href="/posts/" wire:current.strict="font-bold">Dashboard</a>
</nav>
```

## トラブルシューティング

`wire:current` で現在のリンクが正しく検出されない場合は、以下を確認してください。

* ページ内に少なくとも1つのLivewireコンポーネントがある、またはレイアウトに `@livewireScripts` を記述している
* リンクに `href` 属性が設定されている
