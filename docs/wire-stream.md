---
title: wire:stream ディレクティブ
---

<!-- filepath: /home/yamamoto/oss/translations/livewire/docs/wire-stream.md -->
Livewireでは、`wire:stream` APIを使ってリクエスト完了前にコンテンツをWebページへストリーミングできます。AIチャットボットのように、生成されるレスポンスをリアルタイムで表示したい場合に非常に便利です。

:::warning Laravel Octaneとの非互換
`wire:stream`の基本的な使い方として、ボタンを押すと「3」から「0」までカウントダウンを表示するシンプルなCountDownコンポーネントの例を紹介します。
:::

```php
use Livewire\Component;

class CountDown extends Component
{
    public $start = 3;

    public function begin()
    {
        while ($this->start >= 0) {
            // 現在のカウントをブラウザへストリーミング
            $this->stream(  // [tl! highlight:4]
                to: 'count',
                content: $this->start,
                replace: true,
            );

            // 数字ごとに1秒待機
            sleep(1);

            // カウンターをデクリメント
            $this->start = $this->start - 1;
        };
    }

    public function render()
    {
        return <<<'HTML'
        <div>
            <button wire:click="begin">Start count-down</button>

            <h1>Count: <span wire:stream="count">{{ $start }}</span></h1> <!-- [tl! highlight] -->
        </div>
        HTML;
    }
}
```

ユーザーが「Start count-down」ボタンを押すと、
* ページ上に「Count: 3」が表示される
* ボタンを押すと1秒ごとに「Count: 2」「Count: 1」…と表示が変わる
* 最後に「Count: 0」までカウントダウンされる

これらはすべて1回のネットワークリクエスト中に行われます。

システム側の流れは次の通りです：
* Livewireに`begin()`メソッド呼び出しのリクエストが送信される
* `begin()`メソッドが呼ばれ、`while`ループが開始
* `$this->stream()`が呼ばれ、即座に「ストリーミングレスポンス」がブラウザへ送信される
* ブラウザは`wire:stream="count"`の要素を見つけ、受信した値（最初は「3」）で内容を置き換える
* `sleep(1)`で1秒待機
* ループが繰り返され、毎秒新しい数字がストリーミングされる
* すべてのカウントが送信されると、Livewireのリクエストライフサイクルが完了し、最終的なレスポンスが返る

## チャットボットのストリーミング応答

`wire:stream`の代表的な用途として、ChatGPTのようなAPIからストリーミングで応答を受け取り、チャットボットの回答をリアルタイムで表示するケースがあります。

以下は、`wire:stream`を使ってChatGPT風のインターフェースを実現する例です。

```php
use Livewire\Component;

class ChatBot extends Component
{
    public $prompt = '';

    public $question = '';

    public $answer = '';

    function submitPrompt()
    {
        $this->question = $this->prompt;

        $this->prompt = '';

        $this->js('$wire.ask()');
    }

    function ask()
    {
        $this->answer = OpenAI::ask($this->question, function ($partial) {
            $this->stream(to: 'answer', content: $partial); // [tl! highlight]
        });
    }

    public function render()
    {
        return <<<'HTML'
        <div>
            <section>
                <div>ChatBot</div>

                @if ($question)
                    <article>
                        <hgroup>
                            <h3>User</h3>
                            <p>{{ $question }}</p>
                        </hgroup>

                        <hgroup>
                            <h3>ChatBot</h3>
                            <p wire:stream="answer">{{ $answer }}</p> <!-- [tl! highlight] -->
                        </hgroup>
                    </article>
                @endif
            </section>

            <form wire:submit="submitPrompt">
                <input wire:model="prompt" type="text" placeholder="Send a message" autofocus>
            </form>
        </div>
        HTML;
    }
}
```

この例では、
* ユーザーが「Send a message」欄に質問を入力し、Enterキーを押す
* サーバーにリクエストが送信され、`$question`プロパティにセット、`$prompt`はクリアされる
* レスポンスで入力欄がクリアされ、`$this->js('...')`により`ask()`メソッドが呼ばれる
* `ask()`でChatBot APIに問い合わせ、ストリーミングで部分的な応答（$partial）を受け取る
* 各$partialが`wire:stream="answer"`の要素に順次ストリーミングされ、回答がリアルタイムで表示される
* 全文受信後、Livewireのリクエストが完了し、最終的な回答が表示される

## 置き換えと追加

`$this->stream()`で要素にコンテンツをストリーミングする際、既存の内容を置き換えるか、追加するかを選べます。

どちらが適切かは用途によります。たとえばチャットボットの応答は通常「追加」（デフォルト）ですが、カウントダウンのような場合は「置き換え」が適しています。

`replace:`パラメータに真偽値を渡すことで切り替えられます。

```php
// 追加（append）
$this->stream(to: 'target', content: '...');

// 置き換え（replace）
$this->stream(to: 'target', content: '...', replace: true);
```

また、ターゲット要素側で`.replace`修飾子を付けることで、追加・置き換えを指定できます。

```blade
// 追加（append）
<div wire:stream="target">

// 置き換え（replace）
<div wire:stream.replace="target">
```
