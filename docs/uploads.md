---
title: アップロード
---

Livewireは、コンポーネント内でファイルアップロードを強力にサポートしています。

まず、コンポーネントに `WithFileUploads` トレイトを追加してください。このトレイトを追加すると、ファイル入力にも他の入力と同じように `wire:model` を使うことができ、Livewireがアップロード処理を自動で行います。

以下は、写真のアップロードを扱うシンプルなコンポーネントの例です。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\Attributes\Validate;

class UploadPhoto extends Component
{
    use WithFileUploads;

    #[Validate('image|max:1024')] // 1MB Max
    public $photo;

    public function save()
    {
        $this->photo->store(path: 'photos');
    }
}
```

```blade
<form wire:submit="save">
    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save photo</button>
</form>
```

> [!warning] 「upload」メソッドは予約語です
> 上記の例では「save」メソッドを使っていますが、「upload」という名前はLivewireで予約されているため、メソッドやプロパティ名として使用できません。

開発者の視点では、ファイル入力の扱いは他の入力と変わりません。`<input>`タグに `wire:model` を付与するだけで、あとはLivewireが処理してくれます。

ただし、ファイルアップロードの裏側では、Livewireがさまざまな処理を行っています。ユーザーがファイルを選択した際の流れは次の通りです。

1. 新しいファイルが選択されると、LivewireのJavaScriptがサーバー上のコンポーネントに一時的な「署名付き」アップロードURLをリクエストします。
2. URLを受け取ると、JavaScriptが実際のアップロードを行い、Livewireが指定する一時ディレクトリにファイルを保存し、新しい一時ファイルのユニークなハッシュIDを返します。
3. ファイルのアップロードとハッシュIDの生成が完了すると、LivewireのJavaScriptがサーバー上のコンポーネントに最終リクエストを送り、対象のパブリックプロパティに新しい一時ファイルをセットします。
4. これで、パブリックプロパティ（この例では `$photo`）に一時ファイルがセットされ、いつでも保存やバリデーションが可能になります。

## アップロードしたファイルの保存

前述の例は、アップロードされたファイルをアプリケーションのデフォルトファイルシステムの「photos」ディレクトリに移動する最も基本的な保存方法です。

ファイル名をカスタマイズしたり、特定のストレージ「ディスク」（例：S3）を指定したい場合もあるでしょう。

> [!tip] 元のファイル名の取得
> 一時アップロードファイルの元のファイル名は、`->getClientOriginalName()` メソッドで取得できます。

LivewireはLaravelのファイルアップロードAPIと同じものを利用しているため、[Laravelのファイルアップロードドキュメント](https://laravel.com/docs/filesystem#file-uploads)も参考にしてください。以下によくある保存パターンの例を示します。

```php
public function save()
{
    // Store the file in the "photos" directory of the default filesystem disk
    $this->photo->store(path: 'photos');

    // Store the file in the "photos" directory in a configured "s3" disk
    $this->photo->store(path: 'photos', options: 's3');

    // Store the file in the "photos" directory with the filename "avatar.png"
    $this->photo->storeAs(path: 'photos', name: 'avatar');

    // Store the file in the "photos" directory in a configured "s3" disk with the filename "avatar.png"
    $this->photo->storeAs(path: 'photos', name: 'avatar', options: 's3');

    // Store the file in the "photos" directory, with "public" visibility in a configured "s3" disk
    $this->photo->storePublicly(path: 'photos', options: 's3');

    // Store the file in the "photos" directory, with the name "avatar.png", with "public" visibility in a configured "s3" disk
    $this->photo->storePubliclyAs(path: 'photos', name: 'avatar', options: 's3');
}
```

## 複数ファイルの扱い

`<input>`タグに `multiple` 属性を付与すると、Livewireは自動的に複数ファイルのアップロードをサポートします。

例えば、`$photos` という配列プロパティを持つコンポーネントで、フォームのファイル入力に `multiple` を付けると、新しいファイルが自動的にこの配列に追加されます。

```php
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\Attributes\Validate;

class UploadPhotos extends Component
{
    use WithFileUploads;

    #[Validate(['photos.*' => 'image|max:1024'])]
    public $photos = [];

    public function save()
    {
        foreach ($this->photos as $photo) {
            $photo->store(path: 'photos');
        }
    }
}
```

```blade
<form wire:submit="save">
    <input type="file" wire:model="photos" multiple>

    @error('photos.*') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save photo</button>
</form>
```

## ファイルバリデーション

Livewireでのファイルアップロードのバリデーションは、通常のLaravelコントローラーでのファイルバリデーションと同じです。

> [!warning] S3の設定に注意
> ファイル関連のバリデーションルールの多くは、ファイルへのアクセスが必要です。[S3へ直接アップロード](#uploading-directly-to-amazon-s3)する場合、S3のファイルオブジェクトが公開設定でないとバリデーションが失敗します。

詳細は [Laravelのファイルバリデーションドキュメント](https://laravel.com/docs/validation#available-validation-rules) をご覧ください。

## 一時プレビューURL

ユーザーがファイルを選択した後、フォーム送信前にプレビューを表示したい場合が多いでしょう。

Livewireでは、アップロードファイルの `->temporaryUrl()` メソッドを使うことで簡単にプレビューが可能です。

> [!info] 一時URLは画像のみ対応
> セキュリティ上の理由から、一時プレビューURLは画像MIMEタイプのファイルのみサポートされています。

以下は画像プレビュー付きファイルアップロードの例です。

```php
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\Attributes\Validate;

class UploadPhoto extends Component
{
    use WithFileUploads;

    #[Validate('image|max:1024')]
    public $photo;

    // ...
}
```

```blade
<form wire:submit="save">
    @if ($photo) <!-- [tl! highlight:2] -->
        <img src="{{ $photo->temporaryUrl() }}">
    @endif

    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    <button type="submit">Save photo</button>
</form>
```

Livewireは一時ファイルを非公開ディレクトリに保存するため、通常は一時的な公開URLを簡単に発行できません。

しかし、Livewireは一時的な署名付きURLを発行し、アップロード画像のプレビューをページ上で表示できるようにしています。

このURLは一時ディレクトリより上の階層のファイルを表示できないよう保護されており、署名付きのため他のファイルのプレビューに悪用される心配もありません。

> [!tip] S3の一時署名付きURL
> 一時ファイル保存先をS3に設定している場合、`->temporaryUrl()` を呼び出すとS3の署名付き一時URLが発行され、画像プレビューがLaravelアプリケーションサーバーを経由せず直接S3から読み込まれます。

## ファイルアップロードのテスト

Laravelのファイルアップロード用テストヘルパーを使って、Livewireのファイルアップロードもテストできます。

以下は `UploadPhoto` コンポーネントのテスト例です。

```php
<?php

namespace Tests\Feature\Livewire;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Livewire\UploadPhoto;
use Livewire\Livewire;
use Tests\TestCase;

class UploadPhotoTest extends TestCase
{
    public function test_can_upload_photo()
    {
        Storage::fake('avatars');

        $file = UploadedFile::fake()->image('avatar.png');

        Livewire::test(UploadPhoto::class)
            ->set('photo', $file)
            ->call('upload', 'uploaded-avatar.png');

        Storage::disk('avatars')->assertExists('uploaded-avatar.png');
    }
}
```

次は、上記テストをパスさせるための `UploadPhoto` コンポーネント例です。

```php
use Livewire\Component;
use Livewire\WithFileUploads;

class UploadPhoto extends Component
{
    use WithFileUploads;

    public $photo;

    public function upload($name)
    {
        $this->photo->storeAs('/', $name, disk: 'avatars');
    }

    // ...
}
```

ファイルアップロードのテストについては [Laravelのファイルアップロードテストドキュメント](https://laravel.com/docs/http-tests#testing-file-uploads) もご参照ください。

## Amazon S3への直接アップロード

前述の通り、Livewireはすべてのファイルアップロードを一時ディレクトリに保存します。

デフォルトでは、Livewireはデフォルトのファイルシステムディスク（通常は `local`）の `livewire-tmp/` ディレクトリにファイルを保存します。

そのため、アップロードは常にアプリケーションサーバーを経由しますが、後でS3バケットに保存することも可能です。

もしアップロードをアプリケーションサーバー経由ではなく、直接S3バケットに保存したい場合は、`config/livewire.php` で `livewire.temporary_file_upload.disk` を `s3`（または `s3` ドライバを使うカスタムディスク）に設定してください。

```php
return [
    // ...
    'temporary_file_upload' => [
        'disk' => 's3',
        // ...
    ],
];
```

これで、ユーザーがファイルをアップロードした際、ファイルはサーバーには保存されず、直接S3バケットの `livewire-tmp/` サブディレクトリに保存されます。

> [!info] Livewireの設定ファイル公開
> ファイルアップロードディスクをカスタマイズする前に、以下のコマンドでLivewireの設定ファイルを `/config` ディレクトリに公開してください。
> ```shell
> php artisan livewire:publish --config
> ```

### 自動ファイルクリーンアップの設定

Livewireの一時アップロードディレクトリはすぐにファイルでいっぱいになるため、S3で24時間以上経過したファイルを自動削除する設定が重要です。

S3を利用している環境で、以下のArtisanコマンドを実行してください。

```shell
php artisan livewire:configure-s3-upload-cleanup
```

これで、24時間以上経過した一時ファイルはS3側で自動的に削除されます。

> [!info]
> S3以外のストレージを使っている場合は、Livewireが自動でクリーンアップを行うため、上記コマンドは不要です。

## ローディングインジケーター

ファイルアップロードの `wire:model` は内部的には他の入力と異なる動作をしますが、ローディングインジケーターの表示方法は同じです。

ファイルアップロード専用のローディングインジケーターは次のように記述できます。

```blade
<input type="file" wire:model="photo">

<div wire:loading wire:target="photo">Uploading...</div>
```

アップロード中は「Uploading...」のメッセージが表示され、完了すると非表示になります。

ローディング状態の詳細は [ローディング状態のドキュメント](/docs/wire-loading) をご覧ください。

## 進捗インジケーター

Livewireのファイルアップロード操作では、対応する `<input>` 要素上でJavaScriptイベントが発火します。これにより、カスタムJavaScriptで進捗状況を取得できます。

イベント | 説明
--- | ---
`livewire-upload-start` | アップロード開始時に発火
`livewire-upload-finish` | アップロード完了時に発火
`livewire-upload-cancel` | アップロードがキャンセルされた場合に発火
`livewire-upload-error` | アップロード失敗時に発火
`livewire-upload-progress` | アップロード進行中に進捗率を含んで発火

以下は、AlpineコンポーネントでLivewireファイルアップロードの進捗バーを表示する例です。

```blade
<form wire:submit="save">
    <div
        x-data="{ uploading: false, progress: 0 }"
        x-on:livewire-upload-start="uploading = true"
        x-on:livewire-upload-finish="uploading = false"
        x-on:livewire-upload-cancel="uploading = false"
        x-on:livewire-upload-error="uploading = false"
        x-on:livewire-upload-progress="progress = $event.detail.progress"
    >
        <!-- File Input -->
        <input type="file" wire:model="photo">

        <!-- Progress Bar -->
        <div x-show="uploading">
            <progress max="100" x-bind:value="progress"></progress>
        </div>
    </div>

    <!-- ... -->
</form>
```

## アップロードのキャンセル

アップロードに時間がかかる場合、ユーザーがキャンセルしたいこともあります。Livewireの `$cancelUpload()` 関数を使えば、これが可能です。

以下は、`wire:click` でキャンセルボタンを作成する例です。

```blade
<form wire:submit="save">
    <!-- File Input -->
    <input type="file" wire:model="photo">

    <!-- Cancel upload button -->
    <button type="button" wire:click="$cancelUpload('photo')">Cancel Upload</button>

    <!-- ... -->
</form>
```

「Cancel upload」ボタンが押されると、アップロードリクエストが中断され、ファイル入力がクリアされます。ユーザーは別のファイルで再度アップロードを試みることができます。

また、Alpineから `cancelUpload(...)` を呼び出すことも可能です。

```blade
<button type="button" x-on:click="$wire.cancelUpload('photo')">Cancel Upload</button>
```

## JavaScriptアップロードAPI

サードパーティのファイルアップロードライブラリと連携する場合、単純な `<input type="file" wire:model="...">` だけでは制御が足りないことがあります。

そのような場合のために、Livewireは専用のJavaScript関数を提供しています。

これらの関数は、Livewireコンポーネントのテンプレート内で `$wire` オブジェクト経由で利用できます。

```blade
@script
<script>
    let file = $wire.el.querySelector('input[type="file"]').files[0]

    // Upload a file...
    $wire.upload('photo', file, (uploadedFilename) => {
        // Success callback...
    }, () => {
        // Error callback...
    }, (event) => {
        // Progress callback...
        // event.detail.progress contains a number between 1 and 100 as the upload progresses
    }, () => {
        // Cancelled callback...
    })

    // Upload multiple files...
    $wire.uploadMultiple('photos', [file], successCallback, errorCallback, progressCallback, cancelledCallback)

    // Remove single file from multiple uploaded files...
    $wire.removeUpload('photos', uploadedFilename, successCallback)

    // Cancel an upload...
    $wire.cancelUpload('photos')
</script>
@endscript
```

## 設定

Livewireは、ファイルアップロードを一時的に保存してからバリデーションや保存を行うため、すべてのファイルアップロードに対してデフォルトの処理を想定しています。

### グローバルバリデーション

デフォルトでは、Livewireはすべての一時ファイルアップロードに `file|max:12288`（12MB未満のファイル）というルールでバリデーションを行います。

このルールをカスタマイズしたい場合は、`config/livewire.php` で設定できます。

```php
'temporary_file_upload' => [
    // ...
    'rules' => 'file|mimes:png,jpg,pdf|max:102400', // (100MB max, and only accept PNGs, JPEGs, and PDFs)
],
```

### グローバルミドルウェア

一時ファイルアップロード用エンドポイントには、デフォルトでスロットリングミドルウェアが割り当てられています。どのミドルウェアを使うかは、以下の設定でカスタマイズ可能です。

```php
'temporary_file_upload' => [
    // ...
    'middleware' => 'throttle:5,1', // Only allow 5 uploads per user per minute
],
```

### 一時アップロードディレクトリ

一時ファイルは、指定したディスクの `livewire-tmp/` ディレクトリにアップロードされます。このディレクトリは以下の設定で変更できます。

```php
'temporary_file_upload' => [
    // ...
    'directory' => 'tmp',
],
```
