# 本プロジェクトの目的
- Nuxt + TypeScriptの2021時点でのベストプラクティスを検証する

# storeと型定義
- `vuex-module-decorators`を使用する。使用方法は[公式](https://typescript.nuxtjs.org/ja/cookbook/store/) 参照
- `stateFactory: true,`とすることでモジュールモードでstoreを作ってくれる。

```typescript

import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'mymodule',
  stateFactory: true,
  namespaced: true,
})
class MyModule extends VuexModule {
  wheels = 2

  @Mutation
  incrWheels(extra) {
    this.wheels += extra
  }

  get axles() {
    return this.wheels / 2
  }
}

```
- その他参考にした記事
  - [Nuxt.js + TypeScript + Vuexをvuex-module-decoratorsでがっちりインテリセンスを効かせる](https://qiita.com/azukiazusa/items/a50b1ffe05d9937a4db0#)
- APIは[JSON Placeholder](https://jsonplaceholder.typicode.com/) を使用

# JestによるVuexのテスト
- 何をテストするか
  - Vuexのテストでは、ActionsとGettersを対象にテストを記述していく。なぜなら、MutationsはActionsで、StateはGettersでテストの担保が取れているから
- `@types/jest`をyarn add -D する必要がある（tsconfig.jsonへの追加も忘れずに）
- 参考資料
  - [そのNuxt、TypeScriptで。](https://qiita.com/okmt_okmt_/items/a95c9aef4024f2f695cf#jest%E3%82%92%E3%82%BB%E3%83%83%E3%83%88%E3%82%A2%E3%83%83%E3%83%97%E3%81%97%E3%82%88%E3%81%86)

```typescript
"types": [
      "@nuxt/types", // 追加
      "@nuxtjs/axios",
      "@types/node",
      "@types/jest"
    ]
```  
- `jest.mock('~/utils/api')`とすることでモックすることができる（共通なのでdescribeの上に書く）

```typescript

const res = [
  // 擬似的なレスポンスを用意する
]

jest.mock('~/utils/api', () => ({
  $axios: {
    get: jest.fn(() =>
      Promise.resolve({
        data: res
      })
    )
  }
}))

describe('store/todo', () => {
  beforeEach(() => {
    //
  })
})
```
- 参考資料
  - [Nuxt.js vuex-module-decoratorsで書かれたストアをJestを使ってテストする](https://qiita.com/azukiazusa/items/8a158913c870bc0c8ba9)

# SCSSの導入
- assets内のREADME.mdへ記載してます

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
# nuxtTypeScriptSample2021
