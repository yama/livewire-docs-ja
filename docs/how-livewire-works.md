* コンポーネント
    * カウンターコンポーネント
* コンポーネントのレンダリング
    * マウント
        * クラスのインスタンス化
        * ステートのデハイドレート
        * HTMLへの埋め込み
        * HTMLを返す
* JSでのコンポーネント初期化
    * wire:id要素の検出
    * idとスナップショットの抽出
    * オブジェクトの生成
* 更新の送信
    * イベントリスナーの登録
    * 更新内容とスナップショットを含むfetchリクエストの送信
* 更新の受信
    * スナップショットからコンポーネントへ変換（ハイドレート）
    * 更新の適用
    * コンポーネントのレンダリング
    * HTMLと新しいスナップショットを返す
* 更新の処理
    * 新しいスナップショットで置き換え
    * 新しいHTMLで置き換え
        * モーフィング

## コンポーネント

```php
<?php

use Livewire\Component;

class Counter extends Component
{
    public $count = 1;

    public function increment()
    {
        $this->count++;
    }

    public function render()
    {
        return view('livewire.counter');
    }
}
```

```blade
<div>
    <button wire:click="increment">Increment</button>

    <span>{{ $count }}</span>
</div>
```

## コンポーネントのレンダリング

```blade
<livewire:counter />
```

```php
<?php echo Livewire::mount('counter'); ?>
```

```php
public function mount($name)
{
    $class = Livewire::getComponentClassByName();

    $component = new $class;

    $id = str()->random(20);

    $component->setId($id);

    $data = $component->getData();

    $view = $component->render();

    $html = $view->render($data);

    $snapshot = [
        'data' => $data,
        'memo' => [
            'id' => $component->getId(),
            'name' => $component->getName(),
        ]
    ];

    return Livewire::embedSnapshotInsideHtml($html, $snapshot);
}
```

```blade
<div wire:id="123456789" wire:snapshot="{ data: { count: 0 }, memo: { 'id': '123456789', 'name': 'counter' }">
    <button wire:click="increment">Increment</button>

    <span>1</span>
</div>
```

## JavaScript初期化

```js
let el = document.querySelector('wire\\:id')

let id = el.getAttribute('wire:id')
let jsonSnapshot = el.getAttribute('wire:snapshot')
let snapshot = JSON.parse(jsonSnapshot)

let component = { id, snapshot }

walk(el, el => {
    el.hasAttribute('wire:click') {
        let action = el.getAttribute('wire:click')

        el.addEventListener('click', e => {
            updateComponent(el, component, action)
        })
    }
})

function updateComponent(el, component, action) {
    let response fetch('/livewire/update', {
        body: JSON.stringify({
            "snapshot": snapshot,
            "calls": [
                ["method": action, "params": []],
            ]
        })
    })

    // To be continued...
}
```

## 更新の受信

```php
Route::post('/livewire/update', function () {
    $snapshot = request('snapshot');
    $calls = request('calls');

    $component = Livewire::fromSnapshot($snapshot);

    foreach ($calls as $call) {
        $component->{$call['method']}(...$call['params']);
    }

    [$html, $snapshot] = Livewire::snapshot($component);

    return [
        'snapshot' => $snapshot,
        'html' => $html,
    ];
});
```

## 更新の処理

```js
function updateComponent(el, component, action) {
    fetch('/livewire/update', {
        body: JSON.stringify({
            "snapshot": snapshot,
            "calls": [
                ["method": action, "params": []],
            ]
        })
    }).then(i => i.json()).then(response => {
        let { html, snapshot } = response

        component.snapshot = snapshot

        el.outerHTML = html
    })
}
```

