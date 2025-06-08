---
title: wire:loading ディレクティブ
---

ローディングインジケーターは、良いユーザーインターフェースを作る上で重要な要素です。サーバーへのリクエスト中に視覚的なフィードバックを与えることで、処理中であることをユーザーに伝えられます。

## 基本的な使い方

Livewireでは、`wire:loading` を使うことでローディングインジケーターを簡単かつ強力に制御できます。`wire:loading` を要素に追加すると、その要素はデフォルトで非表示（CSSの `display: none`）になり、サーバーへのリクエスト時に表示されます。

以下は、`CreatePost` コンポーネントのフォームで `wire:loading` を使ってローディングメッセージを表示する基本例です。

```blade
<form wire:submit="save">
    <!-- ... -->

    <button type="submit">保存</button>

    <div wire:loading> <!-- [tl! highlight:2] -->
        投稿を保存中...
    </div>
</form>
```

「保存」ボタンが押されると、「投稿を保存中...」メッセージがボタンの下に表示され、`save` アクションの実行中のみ表示されます。レスポンスが返ってくると自動的に非表示になります。

### 要素の非表示（remove）

逆に、`.remove` を付与すると、デフォルトで要素を表示し、サーバーへのリクエスト中だけ非表示にできます。

```blade
<div wire:loading.remove>...</div>
```

## クラスのトグル

要素全体の表示・非表示だけでなく、リクエスト中に特定のCSSクラスを付与・削除してスタイルを変えることも可能です。例えば、フォーム送信中に「保存」ボタンの透明度を下げる例です。

以下は、フォーム送信中に「保存」ボタンを薄く表示するために [Tailwind](https://tailwindcss.com/) の `opacity-50` クラスを使うシンプルな例です：

```blade
<button wire:loading.class="opacity-50">保存</button>
```

逆に、`.remove` を付与すると、リクエスト中だけクラスを削除できます。下記の例では、ボタンの `bg-blue-500` クラスが「保存」ボタン押下時に一時的に外れます。

```blade
<button class="bg-blue-500" wire:loading.class.remove="bg-blue-500">
    保存
</button>
```

## 属性のトグル

デフォルトで、フォーム送信時はLivewireが自動的に送信ボタンを無効化し、各入力欄に `readonly` 属性を付与します。

さらに、`.attr` モディファイアを使えば、他の属性もトグルしたり、フォーム外の要素にも属性を付与できます。

```blade
<button
    type="button"
    wire:click="remove"
    wire:loading.attr="disabled"
>
    削除
</button>
```

上記のボタンは送信ボタンではないため、Livewireのデフォルト動作では無効化されませんが、`wire:loading.attr="disabled"` を追加することで同様の挙動を実現できます。

## 特定のアクションを対象にする

デフォルトでは、`wire:loading` はコンポーネントがサーバーにリクエストを送るたびにトリガーされます。

しかし、サーバーリクエストをトリガーする要素が複数あるコンポーネントでは、ローディングインジケーターを個々のアクションにスコープするべきです。

例えば、以下の「投稿を保存」フォームを考えてみてください。「保存」ボタンの他に、コンポーネントの「remove」アクションを実行する「削除」ボタンもあります。

以下のように `wire:target` を追加することで、特定のアクションにのみローディングメッセージを表示できます。

```blade
<form wire:submit="save">
    <!-- ... -->

    <button type="submit">保存</button>

    <button type="button" wire:click="remove">削除</button>

    <div wire:loading wire:target="remove">  <!-- [tl! highlight:2] -->
        投稿を削除中...
    </div>
</form>
```

上記の「削除」ボタンが押されると、「投稿を削除中...」メッセージが表示されますが、「保存」ボタンが押されたときには表示されません。

### 複数のアクションを対象にする

ページ上のいくつかのアクションに対してのみ `wire:loading` を反応させたい場合、カンマで区切って複数のアクションを `wire:target` に渡すことができます。例えば：

```blade
<form wire:submit="save">
    <input type="text" wire:model.blur="title">

    <!-- ... -->

    <button type="submit">保存</button>

    <button type="button" wire:click="remove">削除</button>

    <div wire:loading wire:target="save, remove">  <!-- [tl! highlight:2] -->
        投稿を更新中...
    </div>
</form>
```

ローディングインジケーター（「投稿を更新中...」）は、今や「削除」または「保存」ボタンが押されたときのみ表示され、`$title` フィールドがサーバーに送信されるときには表示されません。

### アクションのパラメータを対象にする

同じアクションがページ上の複数の場所から異なるパラメータでトリガーされる場合、追加のパラメータを渡すことで `wire:target` を特定のアクションにさらにスコープできます。例えば、ページ上の各投稿に「削除」ボタンがあるシナリオを考えてみてください。

```blade
<div>
    @foreach ($posts as $post)
        <div wire:key="{{ $post->id }}">
            <h2>{{ $post->title }}</h2>

            <button wire:click="remove({{ $post->id }})">削除</button>

            <div wire:loading wire:target="remove({{ $post->id }})">  <!-- [tl! highlight:2] -->
                投稿を削除中...
            </div>
        </div>
    @endforeach
</div>
```

`wire:target="remove"` に `{{ $post->id }}` を渡さなければ、「投稿を削除中...」メッセージはページ上の任意のボタンがクリックされたときに表示されます。

しかし、各インスタンスの `wire:target` にユニークなパラメータを渡すことで、Livewire はマッチするパラメータが「削除」アクションに渡されたときのみローディングメッセージを表示します。

### プロパティの更新を対象にする

Livewire は、プロパティの名前を `wire:target` ディレクティブに渡すことで、特定のコンポーネントプロパティの更新を対象にすることも可能です。

例えば、ユーザーが入力するたびにリアルタイムでバリデーションを行う `username` という名前のフォーム入力を考えてみてください。

```blade
<form wire:submit="save">
    <input type="text" wire:model.live="username">
    @error('username') <span>{{ $message }}</span> @enderror

    <div wire:loading wire:target="username"> <!-- [tl! highlight:2] -->
        ユーザー名の使用可能性を確認中...
    </div>

    <!-- ... -->
</form>
```

サーバーがユーザー名の新しい値で更新されると、入力フィールドにユーザーがタイプするたびに「確認中...」メッセージが表示されます。

### 特定のローディングターゲットを除外する

すべてのLivewireリクエストに対してローディングインジケーターを表示したいが、特定のプロパティやアクションに対しては表示したくない場合、`wire:target.except` モディファイアを次のように使用できます。

```blade
<div wire:loading wire:target.except="download">...</div>
```

上記のローディングインジケーターは、コンポーネント上のすべてのLivewire更新リクエストに対して表示されますが、「download」アクションに対しては表示されません。

## CSSのdisplayプロパティのカスタマイズ

`wire:loading` が要素に追加されると、Livewire はその要素のCSS `display` プロパティを更新して表示・非表示を切り替えます。デフォルトでは、Livewire は非表示にするために `none` を、表示するために `inline-block` を使用します。

`inline-block` 以外の表示値を持つ要素をトグルする場合、例えば以下のように `.flex` を `wire:loading` に追加できます。

```blade
<div class="flex" wire:loading.flex>...</div>
```

以下は、利用可能な表示値の完全なリストです。

```blade
<div wire:loading.inline-flex>...</div>
<div wire:loading.inline>...</div>
<div wire:loading.block>...</div>
<div wire:loading.table>...</div>
<div wire:loading.flex>...</div>
<div wire:loading.grid>...</div>
```

## ローディングインジケーターの遅延

高速な接続では、更新が非常に迅速に行われるため、ローディングインジケーターが画面に一瞬だけ表示されてすぐに消えてしまうことがあります。この場合、インジケーターは役に立つ手がかりというよりは、むしろ気を散らすものになってしまいます。

このため、Livewire では `.delay` モディファイアを提供しており、インジケーターの表示を遅らせることができます。例えば、次のように要素に `wire:loading.delay` を追加すると：

```blade
<div wire:loading.delay>...</div>
```

上記の要素は、リクエストに200ミリ秒以上かかる場合にのみ表示されます。それよりも早くリクエストが完了した場合、ユーザーはインジケーターを見ることはありません。

ローディングインジケーターの遅延時間をカスタマイズするには、Livewire の便利なインターバルエイリアスのいずれかを使用できます。

```blade
<div wire:loading.delay.shortest>...</div> <!-- 50ms -->
<div wire:loading.delay.shorter>...</div>  <!-- 100ms -->
<div wire:loading.delay.short>...</div>    <!-- 150ms -->
<div wire:loading.delay>...</div>          <!-- 200ms -->
<div wire:loading.delay.long>...</div>     <!-- 300ms -->
<div wire:loading.delay.longer>...</div>   <!-- 500ms -->
<div wire:loading.delay.longest>...</div>  <!-- 1000ms -->
```
