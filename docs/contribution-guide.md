---
title: コントリビューションガイド
---

こんにちは、Livewireへのコントリビューションガイドへようこそ。このガイドでは、新機能の追加、不具合の修正、テストの失敗対応など、Livewireへの貢献方法について説明します。

## LivewireとAlpineのローカル環境構築
コントリビュートするには、LivewireとAlpineのリポジトリをローカル環境にセットアップするのが最も簡単です。これにより、変更を加えたりテストスイートを手軽に実行できるようになります。

### リポジトリのフォークとクローン
まず最初に、リポジトリをフォークしてクローンします。最も簡単な方法は[GitHub CLI](https://cli.github.com/)を使うことですが、GitHubの[リポジトリページ](https://github.com/livewire/livewire)で「Fork」ボタンをクリックして手動で行うこともできます。

```shell
# Livewireをフォークしてクローン
gh repo fork livewire/livewire --default-branch-only --clone=true --remote=false -- livewire

# 作業ディレクトリをlivewireに移動
cd livewire

# composer依存パッケージをインストール
composer install

# Duskの設定を確認
vendor/bin/dusk-updater detect --no-interaction
```

Alpineのセットアップには、[NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)がインストールされている必要があります。以下のコマンドを実行してください。手動でフォークする場合は[リポジトリページ](https://github.com/alpinejs/alpine)を参照してください。

```shell
# Alpineをフォークしてクローン
gh repo fork alpinejs/alpine --default-branch-only --clone=true --remote=false -- alpine

# 作業ディレクトリをalpineに移動
cd alpine

# すべてのnpm依存パッケージをインストール
npm install

# すべてのAlpineパッケージをビルド
npm run build

# すべてのAlpineパッケージをローカルリンク
cd packages/alpinejs && npm link && cd ../../
cd packages/anchor && npm link && cd ../../
cd packages/collapse && npm link && cd ../../
cd packages/csp && npm link && cd ../../
cd packages/docs && npm link && cd ../../
cd packages/focus && npm link && cd ../../
cd packages/history && npm link && cd ../../
cd packages/intersect && npm link && cd ../../
cd packages/mask && npm link && cd ../../
cd packages/morph && npm link && cd ../../
cd packages/navigate && npm link && cd ../../
cd packages/persist && npm link && cd ../../
cd packages/sort && npm link && cd ../../
cd packages/ui && npm link && cd ../../

# 作業ディレクトリをlivewireに戻す
cd ../livewire

# すべてのパッケージをリンク
npm link alpinejs @alpinejs/anchor @alpinejs/collapse @alpinejs/csp @alpinejs/docs @alpinejs/focus @alpinejs/history @alpinejs/intersect @alpinejs/mask @alpinejs/morph @alpinejs/navigate @alpinejs/persist @alpinejs/sort @alpinejs/ui

# Livewireをビルド
npm run build
```

## テスト失敗のコントリビュート

バグに遭遇して解決方法がわからない場合、特にLivewireコアの複雑さを考えると、どこから始めればよいのか悩むかもしれません。そのような場合、最も簡単なアプローチは、失敗するテストをコントリビュートすることです。こうすることで、より経験豊富な誰かがバグの特定と修正を手伝ってくれるでしょう。それでも、Livewireの動作をよりよく理解するためにコアを探ることをお勧めします。

ステップバイステップで進めてみましょう。

#### 1. テストを追加する場所を決定
Livewireコアは、特定のLivewire機能に対応する異なるフォルダーに分かれています。例えば：

```shell
src/Features/SupportAccessingParent
src/Features/SupportAttributes
src/Features/SupportAutoInjectedAssets
src/Features/SupportBladeAttributes
src/Features/SupportChecksumErrorDebugging
src/Features/SupportComputed
src/Features/SupportConsoleCommands
src/Features/SupportDataBinding
//...
```

自分が経験しているバグに関連する機能を見つけてみてください。適切なフォルダーが見つからない場合や、どれを選べばよいかわからない場合は、単に1つを選択し、プルリクエストでテストを正しい機能セットに配置するのを手伝ってもらうように記載してください。

#### 2. テストの種類を決定
Livewireのテストスイートは、2種類のテストで構成されています。

1. **ユニットテスト**: これらのテストは、LivewireのPHP実装に焦点を当てています。
2. **ブラウザテスト**: これらのテストは、実際のブラウザ内で一連のステップを実行し、正しい結果をアサートします。主にLivewireのJavascript実装に焦点を当てています。

どのテストタイプを選択すべきかわからない場合や、Livewireのテストを書くことに不慣れな場合は、ブラウザテストから始めることをお勧めします。バグを再現するためにアプリケーションやブラウザで実行するステップを実装してください。

ユニットテストは`UnitTest.php`ファイルに、ブラウザテストは`BrowserTest.php`ファイルに追加する必要があります。これらのファイルの1つまたは両方が存在しない場合は、自分で作成できます。

**ユニットテスト**

```php
use Tests\TestCase;

class UnitTest extends TestCase
{
    public function test_livewire_can_run_action(): void
    {
       // ...
    }
}
```

**ブラウザテスト**

```php
use Tests\BrowserTestCase;

class BrowserTest extends BrowserTestCase
{
    public function test_livewire_can_run_action()
    {
        // ...
    }
}
```

> [!tip] テストの書き方がわからない？
> 既存のユニットテストやブラウザテストを探検することで、多くのことを学ぶことができます。既存のテストをコピー＆ペーストするだけでも、自分のテストを書くための素晴らしい出発点になります。

#### 3. プルリクエスト用ブランチの準備
機能や失敗したテストの追加が完了したら、Livewireリポジトリにプルリクエスト（PR）を送信する準備が整いました。まず、変更を別のブランチにコミットしていることを確認してください（`main`の使用は避けてください）。新しいブランチを作成するには、`git`コマンドを使用します。

```shell
git checkout -b my-feature
```

ブランチには任意の名前を付けることができますが、将来的な参照のために、機能や失敗したテストを反映した説明的な名前を使用することをお勧めします。

次に、変更をブランチにコミットします。`git add .`を使用してすべての変更をステージし、`git commit -m "Add my feature"`を使用して説明的なコミットメッセージとともにすべての変更をコミットできます。

ただし、現在あなたのブランチはローカルマシンにのみ存在します。プルリクエストを作成するには、`git push`を使用してブランチをフォークしたLivewireリポジトリにプッシュする必要があります。

```shell
git push origin my-feature

Enumerating objects: 13, done.
Counting objects: 100% (13/13), done.
Delta compression using up to 8 threads
Compressing objects: 100% (6/6), done.

To github.com:Username/livewire.git
 * [new branch]        my-feature -> my-feature
```

#### 4. プルリクエストの送信
もう少しです！ウェブブラウザを開いて、フォークしたLivewireリポジトリ（`https://github.com/<your-username>/livewire`）に移動します。画面の中央に「**my-featureは1分前にプッシュされました**」という新しい通知と「**Compare & pull request**」というボタンが表示されます。ボタンをクリックしてプルリクエストフォームを開きます。

フォームに、プルリクエストを説明するタイトルを入力し、次に説明セクションに進みます。テキストエリアには、あらかじめ定義されたテンプレートが含まれています。すべての質問に答えるようにしてください：

```
まずはコントリビューションガイドを確認してください: https://livewire.laravel.com/docs/contribution-guide

1️⃣ これは必要とされているものですか？最初に議論を作成しましたか？
はい、議論はここにあります: https://github.com/livewire/livewire/discussions/999999

2️⃣ 修正/機能のためのブランチを作成しましたか？ (メインブランチへのPRはクローズされます)
はい、ブランチ名は`my-feature`です

3️⃣ 複数の無関係な変更が含まれていますか？PRを分けてください。
いいえ、変更は私の機能に関連しています。

4️⃣ テストは含まれていますか？ (必須)
はい

5️⃣ 改善点とその有用性について、詳細な説明（可能であれば小さなコードスニペットを含む）を含めてください。

これらの変更により、メモリ使用量が改善されます。ベンチマーク結果はここにあります：

// ...

```

すべて準備できましたか？ **プルリクエストを作成**をクリックしてください🚀 おめでとうございます！初めてのコントリビューションが成功しました🎉

メンテイナーがあなたのPRをレビューし、フィードバックを提供したり、変更をリクエストしたりすることがあります。フィードバックにはできるだけ早く対処するよう努めてください。

Livewireへのコントリビューションに感謝します！
