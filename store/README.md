# はじめに

以前は、Vue.jsアプリケーションにおいてTypeScriptを導入する最大の障壁となるのがVuexでした。

TypeScriptとVuexの相性は良くなく、コンポーネントからstoreを呼び出したときに型安全が守られない、インテリセンスが効かないといった問題がありました。

Vuexの型課題を解決するために様々な方法が考案されており、`Tree`と称される型定義を使用したりそもそもVuexを利用しないで独自の状態管理を行うなど様々です。

今回はその中でも、Nuxt.js公式で推奨されている[vuex-module-decorators](https://github.com/championswimmer/vuex-module-decorators)を使用します。

# セットアップ

Nuxt.jsでVuexを通常利用する場合には、`store`ディレクトリにモジュールと対応するファイルを設置します。
例えば、`myModule.js`というファイルを`store`ディレクトリに設置すれば、myModuleといモジュールで自動的に作成され、コンポーネントからアクセスすることができます。

ただし、今回のようにvuex-module-decoratorsを使用する場合には、下準備が必要です。

## vuex-module-decoratorsをインストール

ます初めに、vuex-module-decoratorsを使用するためにインストールをします。

```sh
yarn add -D vuex-module-decorators
# OR
npm install -D vuex-module-decorators
```

## store/index.ts

ここからはNuxt.jsで使用するために必要な手順です。[公式のREAD ME](https://github.com/championswimmer/vuex-module-decorators#accessing-modules-with-nuxtjs)の手順に従って実装していきます。

まずは、`~/store/index.ts`ファイルを作成し、以下のコードを記述します。


```typescript:~/store/index.ts
import { Store } from 'vuex'
import { initialiseStores } from '~/utils/store-accessor'
const initializer = (store: Store<any>) => initialiseStores(store)
export const plugins = [initializer]
export * from '~/utils/store-accessor'
```

このファイルは一度作成したら、基本編集しません。
コンポーネントから`import { todoStore } from '~/store`のようにできるようにするためここで初期化します。

## utils/store-accsessor

次に、`store/index.ts`の中で利用されている`~/utils/store-accsessor.ts`です。

```typescript:~/utils/store-accsessor.ts

/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import Todo from '~/store/todo'

let TodoStore: Todo
function initialiseStores(store: Store<any>): void {
  TodoStore = getModule(Todo, store)
}

export { initialiseStores, TodoStore }
```

ここでは、作成したモジュールをインポートしてstoreに登録します。
新たにモジュールを作成するたびに、作成したモジュールをこのファイルに追加していきます。

これでVuexのセットアップは完了です。実際にモジュールを作成して使用してみましょう。

# モジュールの作成

今回は[みんな大好きTODOリスト](http://todomvc.com/)を作成して、vuex-module-decoratorsを体感します。

まずは、storeの作成です。`todo`というモジュールで作成するので、`~/store/todo.ts`という構造でファイルを作成します。

```typescript:~/store/todo.ts
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { $axios } from '~/utils/api'

type Todo = {
  id?: Number
  title: String
  description: String
  done: Boolean
}

@Module({
  name: 'todo',
  stateFactory: true,
  namespaced: true
})
export default class Todos extends VuexModule {
  private todos: Todo[] = []

  public get getTodos() {
    return this.todos
  }

  public get getTodo() {
    return (id: Number) => this.todos.find((todo) => todo.id === id)
  }

  public get getTodoCount() {
    return this.todos.length
  }

  @Mutation
  private add(todo: Todo) {
    this.todos.push(todo)
  }

  @Mutation
  private remove(id: Number) {
    this.todos = this.todos.filter((todo) => todo.id !== id)
  }

  @Mutation set(todos: Todo[]) {
    this.todos = todos
  }

  @Action({ rawError: true })
  public async fetchTodos() {
    const { data } = await $axios.get<Todo[]>('/api/todos')
    this.set(data)
  }

  @Action({ rawError: true })
  public async createTodo(payload: Todo) {
    const { data } = await $axios.post<Todo>('/api/todo', payload)
    this.add(data)
  }

  @Action({ rawError: true })
  async deleteTodo(id: Number) {
    await $axios.delete(`/api/todo/${id}`)
    this.remove(id)
  }
}
```

こんな感じで作成してみました。
Vuexをクラスベースで作成するのが特徴です。
さらに、[デコレータ](http://js.studio-kingdom.com/typescript/handbook/decorators)を使用してモジュールであることや、`Mutation`・`Action`メソッドであることを伝えます。
クラス内でなら、他のプロパティの要素には`this`でアクセスすることができます。

モジュールについて、一つづつ詳しく見てみましょう。

## デコレータ、Nuxt アプリケーションインスタンスインポート

まずはファイルの先頭で必要なものをインストールします。

```typescript
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { $axios } from '~/utils/api'
```

クラスの作成に必要なものをvuex-module-decoratorsからインポートします。
また、VuexのモジュールからはNuxtアプリケーションインスタンスにアクセスできないので、`axios`などを使用したいときには一手間必要です。

### Vuexで$axiosを使用する方法

まずは、プラグインを作成します。`plugins/axios-accessor.ts`ファイルを作成します。

```typescript
import { Plugin } from '@nuxt/types'
import { initializeAxios } from '~/utils/api'

const accessor: Plugin = ({ $axios }) => {
  initializeAxios($axios)
}

export default accessor
```

`nuxt.config.js`の`plugins`に忘れずに追加します。

```javascript
plugins: [
    '~/plugins/axios-accessor',
  ]
```

`utils/api.ts`ファイルを作成して、そこからインポートする必要があります。

```typescript
/* eslint-disable import/no-mutable-exports */
import { NuxtAxiosInstance } from '@nuxtjs/axios'

let $axios: NuxtAxiosInstance

export function initializeAxios(axiosInstance: NuxtAxiosInstance) {
  $axios = axiosInstance
}

export { $axios }
```

## 型宣言

モジュールで使用する独自の型を宣言しています。
`types`フォルダを作成して、そこから型定義をインポートするのでもよいでしょう。

```typescript

type Todo = {
  id: number
  title: string
  description: string
  done: boolean
}
```

## クラス作成

モジュールクラスを作成します。
クラス宣言の前に`@module`デコレータを付与する必要があります。
また、`stateFactory: true`を渡すことで、Nuxt.jsのモジュールであることを宣言します。
クラスは`VuexModule`を継承して作成されます。

```typescript
@Module({
  name: 'todo',
  stateFactory: true,
  namespaced: true
})
export default class Todos extends VuexModule {
```

## state

`state`は、クラスのプロパティとして作成します。

```typescript
private todos: Todo[] = []
```

アクセス修飾子は必須ではありませんが、Vuexの流儀の従うのなら、外部から`state`にアクセスさせたくないので`private`で宣言しておくのがよいでしょう。
`state`クラス内部でのみ扱うようにします。

## getters

`getters`はそのままクラスの`get`構文として作成します。
`get`構文には引数を渡すことができないので、関数を`return`することで渡してあげることができます。

```typescript
public get getTodos() {
    return this.todos
  }

  public get getTodo() {
    return (id: number) => this.todos.find((todo) => todo.id === id)
  }

  public get getTodoCount() {
    return this.todos.length
  }
```

## mutasions

`mutations`には、`@Mutations`デコレータを付与します。

```typescript
@Mutation
  private add(todo: Todo) {
    this.todos.push(todo)
  }

  @Mutation
  private remove(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id)
  }

  @Mutation
  private set(todos: Todo[]) {
    this.todos = todos
  }
```

`mutations`には本来外部から直接アクセスしても構わないですが、非同期の有無にかかわらず、`actions`経由での更新に統一するというルールにしたがってアクセス修飾子は`private`としています。

## actions

最後に、`actions`です。`@Action`デコレータを付与して作成します。

```typescript
@Action({ rawError: true })
public async fetchTodos() {
  const { data } = await $axios.get<Todo[]>('/api/todos')
  this.set(data)
}

@Action({ rawError: true })
public async createTodo(payload: Todo) {
  const { data } = await $axios.post<Todo>('/api/todo', payload)
  this.add(data)
}

@Action({ rawError: true })
public async deleteTodo(id: number) {
  await $axios.delete(`/api/todo/${id}`)
  this.remove(id)
}
```

`mutations`のアクセスに`this`が使えるので、インテリセンスが使えるのでいい感じです。

# コンポーネントから呼び出す

それでは、実際に作成したモジュールをコンポーネントから呼び出してみます。
従来のようなインテリセンスの効かない`mapActions`や`mapGetters`は使用せずに、`methods`、`computed`に定義して使用します。

```vue:~/pages/todo.vue
<template>
  <div>
    <h1>TODOリスト</h1>
    <table>
      <tr>
        <th>ID</th>
        <th>TITLE</th>
        <th>DONE</th>
      </tr>
      <tr v-for="todo in todos" :key="todo.id">
        <td>{{ todo.id }}</td>
        <td>{{ todo.title }}</td>
        <td v-if="todo.done">✔</td>
        <td v-else></td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TodoStore } from '~/store'

export default Vue.extend({
  async asyncData({ error }) {
    try {
      await TodoStore.fetchTodos()
    } catch (e) {
      console.log(e)
      error({
        statusCode: e.response.status,
        message: e.response.message
      })
    }
  },
  computed: {
    todos() {
      return TodoStore.getTodos
    }
  }
})
</script>
```

`import { TodoStore } from '~/store'`でモジュールをインポートして使用します。
下記の通り、インテリセンスがよく効いています。

![スクリーンショット 20200624 22.49.42.png](https://firebasestorage.googleapis.com/v0/b/app-blog-1ef41.appspot.com/o/articles%2FHOOw6Z73SkXSBe3GsMO9%2Fb8b7b8a62f0889057923affaaef12e61.png?alt=media&token=7f156222-4e7d-4c8a-aed5-f041d42cb377)

`computed`プロパティにも型が効いています。

![スクリーンショット 20200624 22.51.20.png](https://firebasestorage.googleapis.com/v0/b/app-blog-1ef41.appspot.com/o/articles%2FHOOw6Z73SkXSBe3GsMO9%2Fc971c84671e90a3a59c978f8bfad7de0.png?alt=media&token=bfa11281-3686-4561-a153-3ecfa3e63c95)

実際に正しく動作させるよう、`/api/todos`エンドポイントを作成する必要があります。
試しに適当にリストを返すものを作成しました。

```typescript
router.use('/todos', (_req, res) => {
  res.json([
    {
      id: 1,
      title: 'リスト1',
      description: 'lorem ipsum',
      done: true
    },
    {
      id: 2,
      title: 'リスト2',
      description: 'lorem ipsum',
      done: false
    },
    {
      id: 3,
      title: 'リスト3',
      description: 'lorem ipsum',
      done: true
    }
  ])
})
```

ページを表示すると、全てが正しく動作していることがわかります。

![スクリーンショット 20200624 22.54.42.png](https://firebasestorage.googleapis.com/v0/b/app-blog-1ef41.appspot.com/o/articles%2FHOOw6Z73SkXSBe3GsMO9%2Ff790e734653be1b83174232998420288.png?alt=media&token=ad705955-7d9a-4cb6-ad6d-2df513deb8d2)

# 注意する点

## @Actionの{ rawError: true }を忘れると正しいエラーが得られない

`Actions`メソッド内では、エラーを非同期処理などエラーを捕捉したい場面が多いかと思います。

例えば、次のようなこコードは`Axios`のエラーを捕捉することを期待しています。

```typescript
@Action
  public async createTodo(payload: Todo) {
    const { data } = await $axios.post<Todo>('/api/todo', payload)
    this.add(data)
  }
```

```typescript
async asyncData({ error }) {
    try {
      await TodoStore.fetchTodos()
    } catch (e) {
      console.log(e)
      error({
        statusCode: e.response.status,
        message: e.response.message
      })
    }
  },
```

しかし、このままだと実際に補足するエラーは次のようになってしまいます。

```
ERR_ACTION_ACCESS_UNDEFINED: Are you trying to access this.someMutation() or this.someGetter inside an @action?
That works only in dynamic modules.
```

`ERR_ACTION_ACCESS_UNDEFINED`と全く身に覚えがないエラーが補足されていますが、これは一体何のエラーなのでしょうか? 

実は、**@Actionの{ rawError: true }を指定しないと、デフォルトですべてのエラーはライブラリ内部で定義されている固定文言がthrowされます。**

デフォルトでエラーを握りつぶしてしまう動作は予期しづらく、かつエラーメッセージも分かりづらいものになっているのでハマりどころだと思います。

## 他のモジュールがVuexを使用すると競合が発生する

`ERR_STORE_NOT_PROVIDED`というエラーに悩まされていたのですが、原因は[Auth-Module](https://auth.nuxtjs.org/)というモジュールを追加したことでした。

このモジュールに限らず、Vuexを使用しているモジュールを使用すると同様のエラーが発生すると思われます。

解決策は、nuxt.config.jsのモジュールの設定で`vuex:false`を追加します。

```typescript
  auth: {
    redirect: {
      login: '/login',
      logout: '/',
      callback: '/login',
      home: '/'
    },
    strategies: { 
       // 省略
    },
    vuex: false // これを追加
  },
```

このエラーのたちの悪いところは`@Actionの{ rawError: true }`を指定しないとさらにわけがわからなくなるところですね。

# おわりに

はじめは、今までのVuexの記法と大きく違うクラス記法で慣れない部分もありましたが、いざ使ってみるとインテリセンス効きまくりで完全に虜になりました。普段からtypoしまくってる私にとってもうTypeScriptは手放せない存在になりつつあります。

Vuex + TypeScriptはまだ発展途上で、情報もあまり多くなくもしかしたら1年もしないうちにベストプラクティスが変わってしまう可能性はありますが、それを差し置いても導入するメリットはあると感じられました。
