---
title: wire:model ディレクティブ
---

Livewireでは、`wire:model` を使ってコンポーネントのプロパティとフォーム入力値を簡単にバインドできます。

例えば、「Create Post」コンポーネントで `$title` と `$content` プロパティをフォーム入力とバインドする例です。

```php
use Livewire\Component;
use App\Models\Post;

class CreatePost extends Component
{
    public $title = '';

    public $content = '';

    public function save()
    {
		$post = Post::create([
			'title' => $this->title
			'content' => $this->content
		]);

        // ...
    }
}
```

```blade
<form wire:submit="save">
    <label>
        <span>Title</span>

        <input type="text" wire:model="title"> <!-- [tl! highlight] -->
    </label>

    <label>
        <span>Content</span>

        <textarea wire:model="content"></textarea> <!-- [tl! highlight] -->
    </label>

	<button type="submit">Save</button>
</form>
```

両方の入力欄に `wire:model` を使うことで、「Save」ボタン押下時に値がサーバー側のプロパティと同期されます。

:::warning なぜ入力中に自動で更新されないの？
ブラウザで試して「タイトルが入力中に自動で更新されない」と疑問に思った場合、Livewireは「アクション」（送信ボタン押下など）が発生したときのみコンポーネントを更新する仕様です。これによりネットワークリクエストが減り、パフォーマンスが向上します。入力中も即時反映したい場合は `wire:model.live` を使ってください。[データバインディングの詳細はこちら](/docs/properties#data-binding)。
:::

## 更新タイミングのカスタマイズ

デフォルトでは、Livewireはアクション（`wire:click` や `wire:submit` など）が発生したときのみネットワークリクエストを送信します。`wire:model` の入力更新時には送信しません。

この仕様により、Livewireのパフォーマンスが大幅に向上し、ユーザー体験もスムーズになります。

ただし、リアルタイムバリデーションなど、より頻繁にサーバーを更新したい場合もあります。

### ライブ更新

入力欄の値を入力中に即時サーバーへ反映したい場合は、`wire:model` に `.live` モディファイアを付与します。

```html
<input type="text" wire:model.live="title">
```

#### デバウンスのカスタマイズ

`wire:model.live` を使うと、デフォルトで150ミリ秒のデバウンス（入力が止まってから送信）がかかります。

デバウンス時間は `.debounce.Xms` で変更できます。下記は250ミリ秒に設定した例です。

```html
<input type="text" wire:model.live.debounce.250ms="title">
```

### blurイベントでの更新

`.blur` モディファイアを付与すると、入力欄からフォーカスが外れたタイミングやTabキーで次の入力欄に移動したときだけサーバーに反映されます。

リアルタイムバリデーションなど、入力中は送信せず、適度なタイミングで更新したい場合に便利です。

```html
<input type="text" wire:model.blur="title">
```

### changeイベントでの更新

`.blur` の動作では不十分な場合、`.change` を使うこともできます。

例えば、セレクト入力が変更されたときにバリデーションを実行したい場合、`.change` を追加することで、ユーザーが新しいオプションを選択した瞬間にネットワークリクエストが送信され、バリデーションが実行されます。`.blur` の場合は、ユーザーがセレクト入力からタブで移動した後にサーバーが更新されます。

```html
<select wire:model.change="title">
    <!-- ... -->
</select>
```

テキスト入力に加えられた変更は、自動的にLivewireコンポーネントの `$title` プロパティと同期されます。

## 利用可能なモディファイア一覧

 モディファイア          | 説明
-------------------|-------------------------------------------------------------------------
 `.live`           | 入力中に更新を送信
 `.blur`           | `blur` イベント時のみ更新を送信
 `.change`         | `change` イベント時のみ更新を送信
 `.lazy`           | `.change` のエイリアス
 `.debounce.[?]ms` | 指定ミリ秒遅延して更新を送信
 `.throttle.[?]ms` | 指定ミリ秒間隔でネットワークリクエストを制限
 `.number`         | 入力のテキスト値をサーバー側で `int` にキャスト
 `.boolean`        | 入力のテキスト値をサーバー側で `bool` にキャスト
 `.fill`           | ページロード時に "value" HTML 属性で提供された初期値を使用

## 入力フィールド

Livewireは、ほとんどのネイティブ入力要素を標準でサポートしています。つまり、ブラウザで任意の入力要素に `wire:model` を簡単に追加してプロパティをバインドできます。

以下は、Livewireコンテキスト内で利用可能なさまざまな入力タイプとその使用方法の包括的なリストです。

### テキスト入力

まず第一に、テキスト入力はほとんどのフォームの基盤です。プロパティ名 "title" をひとつのテキスト入力にバインドする方法は以下の通りです。

```blade
<input type="text" wire:model="title">
```

### テキストエリア入力

テキストエリア要素も同様に簡単です。テキストエリアに `wire:model` を追加するだけで、その値がバインドされます。

```blade
<textarea type="text" wire:model="content"></textarea>
```

もし "content" の値が文字列で初期化されている場合、Livewireはその値でテキストエリアを自動的に埋めます。以下のようにする必要はありません。

```blade
<!-- 警告: このスニペットは、絶対にやってはいけないことを示しています... -->

<textarea type="text" wire:model="content">{{ $content }}</textarea>
```

### チェックボックス

チェックボックスは、単一の値（例えば、メール更新のオプトイン）をトグルするために使用できます。また、一連の関連する値の中から単一の値をトグルするためにも使用できます。両方のシナリオについて説明します。

#### 単一チェックボックス

サインアップフォームの最後に、ユーザーがメール更新を受け取るかどうかを選択できるチェックボックスがあるとします。このプロパティを `$receiveUpdates` と呼ぶとしましょう。`wire:model` を使ってこの値をチェックボックスに簡単にバインドできます。

```blade
<input type="checkbox" wire:model="receiveUpdates">
```

これで、`$receiveUpdates` の値が `false` のとき、チェックボックスはオフになります。もちろん、値が `true` のときはチェックボックスはオンになります。

#### 複数チェックボックス

ユーザーに更新を受け取るかどうかを選択させるだけでなく、さまざまな更新タイプから選択できるように `$updateTypes` という配列プロパティを用意したとします。

```php
public $updateTypes = [];
```

複数のチェックボックスを `$updateTypes` プロパティにバインドすることで、ユーザーは複数の更新タイプを選択でき、それらは `$updateTypes` 配列プロパティに追加されます。

```blade
<input type="checkbox" value="email" wire:model="updateTypes">
<input type="checkbox" value="sms" wire:model="updateTypes">
<input type="checkbox" value="notification" wire:model="updateTypes">
```

例えば、ユーザーが最初の2つのボックスにチェックを入れ、3つ目には入れなかった場合、`$updateTypes` の値は `["email", "sms"]` になります。

### ラジオボタン

2つの異なる値の間で単一のプロパティを切り替えるには、ラジオボタンを使用します。

```blade
<input type="radio" value="yes" wire:model="receiveUpdates">
<input type="radio" value="no" wire:model="receiveUpdates">
```

### セレクトドロップダウン

Livewireは、`<select>` ドロップダウンとの連携を簡単にします。ドロップダウンに `wire:model` を追加すると、現在選択されている値が自動的に指定されたプロパティ名にバインドされます。

さらに、選択されるオプションに手動で `selected` を追加する必要はありません。Livewireが自動的にそれを処理します。

以下は、静的な州のリストで満たされたセレクトドロップダウンの例です。

```blade
<select wire:model="state">
    <option value="AL">Alabama</option>
    <option value="AK">Alaska</option>
    <option value="AZ">Arizona</option>
    ...
</select>
```

特定の州が選択されると、例えば「Alaska」の場合、コンポーネントの `$state` プロパティは `AK` に設定されます。もし値を「AK」ではなく「Alaska」にしたい場合は、`<option>` 要素から `value=""` 属性を省略できます。

しばしば、Bladeを使用してドロップダウンオプションを動的に構築します。

```blade
<select wire:model="state">
    @foreach (\App\Models\State::all() as $state)
        <option value="{{ $state->id }}">{{ $state->label }}</option>
    @endforeach
</select>
```

デフォルトで特定のオプションが選択されていない場合、「州を選択」などの控えめなプレースホルダーオプションをデフォルトで表示したいことがあります。

```blade
<select wire:model="state">
    <option disabled value="">州を選択...</option>

    @foreach (\App\Models\State::all() as $state)
        <option value="{{ $state->id }}">{{ $state->label }}</option>
    @endforeach
</select>
```

ご覧の通り、テキスト入力にはプレースホルダー属性がありますが、セレクトメニューにはありません。代わりに、リストの最初のオプション要素として `disabled` オプションを追加する必要があります。

### 依存セレクトドロップダウン

時には、ひとつのセレクトメニューが別のセレクトメニューに依存することがあります。例えば、選択された州に基づいて変わる都市のリストなどです。

ほとんどの場合、これは予想通りに機能しますが、ひとつだけ重要な注意点があります: 値が変わるときにLivewireが正しくリフレッシュできるように、変化するセレクトに `wire:key` を追加する必要があります。

以下は、州用と都市用の2つのセレクトの例です。州のセレクトが変更されると、都市のセレクトのオプションも適切に変更されます。

```blade
<!-- States select menu... -->
<select wire:model.live="selectedState">
    @foreach (State::all() as $state)
        <option value="{{ $state->id }}">{{ $state->label }}</option>
    @endforeach
</select>

<!-- Cities dependent select menu... -->
<select wire:model.live="selectedCity" wire:key="{{ $selectedState }}"> <!-- [tl! highlight] -->
    @foreach (City::whereStateId($selectedState->id)->get() as $city)
        <option value="{{ $city->id }}">{{ $city->label }}</option>
    @endforeach
</select>
```

再度、ここでの唯一の非標準な点は、州が変更されたときに "selectedCity" の値が正しくリセットされることを保証するために追加された `wire:key` です。

### 複数選択ドロップダウン

「multiple」セレクトメニューを使用している場合、Livewireは予想通りに動作します。この例では、選択された州が `$states` 配列プロパティに追加され、選択解除されます。

```blade
<select wire:model="states" multiple>
    <option value="AL">Alabama</option>
    <option value="AK">Alaska</option>
    <option value="AZ">Arizona</option>
    ...
</select>
```

## さらに詳しく

HTMLフォームのコンテキスト内での `wire:model` の使用に関する完全なドキュメントについては、[Livewireフォームドキュメントページ](/docs/forms)をご覧ください。
