---
title: バンドル
---

Livewireでは、各コンポーネントの更新ごとにネットワークリクエストが発生します。デフォルトでは、複数のコンポーネントが同時に更新された場合、それらのリクエストはひとつにまとめて送信されます。

これにより、サーバーへの接続数が減り、サーバー負荷を大幅に軽減できます。

さらに、この仕組みによって複数コンポーネント間の連携が必要な内部機能（[リアクティブプロパティ](/docs/nesting#reactive-props)、[Modelableプロパティ](/docs/nesting#binding-to-child-data-using-wiremodel)など）も利用できるようになります。

ただし、パフォーマンス上の理由から、このバンドル機能を無効にしたい場合もあります。このページでは、Livewireでこの挙動をカスタマイズする方法を紹介します。

## コンポーネントごとのリクエスト分離

Livewireの `#[Isolate]` クラス属性を使うことで、コンポーネントを「分離」状態にできます。これを付与したコンポーネントは、サーバーへのリクエスト時に他のコンポーネントのリクエストと分離して処理されます。

更新処理が重い場合や、他のコンポーネントと並行して個別に処理したい場合に便利です。たとえば、複数のコンポーネントが `wire:poll` を使っていたり、ページ上のイベントをリッスンしている場合、特定のコンポーネントの更新だけを分離して、全体のリクエストを遅らせないようにできます。

```php
use Livewire\Attributes\Isolate;
use Livewire\Component;

#[Isolate] // [tl! highlight]
class ShowPost extends Component
{
    // ...
}
```

`#[Isolate]` 属性を追加すると、このコンポーネントのリクエストは他のコンポーネントの更新とバンドルされなくなります。

## Lazyコンポーネントはデフォルトで分離される

1ページに多数のコンポーネントを「遅延（lazy）」読み込みする場合（`#[Lazy]` 属性を利用）、それぞれのリクエストを分離して並行送信したいケースが多くなります。そのため、LivewireではLazyな更新はデフォルトで分離されます。

この挙動を無効にしたい場合は、`#[Lazy]` 属性に `isolate: false` パラメータを指定してください。

```php
<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Lazy;

#[Lazy(isolate: false)] // [tl! highlight]
class Revenue extends Component
{
    // ...
}
```

このように設定すると、同じページに複数の `Revenue` コンポーネントがあっても、すべての更新がひとつのlazy-loadリクエストとしてまとめて送信されます。
