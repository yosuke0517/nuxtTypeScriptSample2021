# はじめに

[こちら記事](https://qiita.com/azukiazusa/items/a50b1ffe05d9937a4db0)では、vuex-module-decoratorsを使用してストア記述することによって、Nuxt.js + TypeScriptにおける型課題を解決しました。
今回は、前回作成したストアをもとに、テストコードを書いていきます。

# 前提条件

- create-nuxt-app で言語にTypeScript、テストフレームワークにJestを選択してプロジェクトを作成済
- vuex-module-decoratorsで作成したストアがある
- Jestに対する基礎的な理解

## 前回作成したコードの再掲

```typescript:~/store/todo.ts
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { $axios } from '~/utils/api'

interface Todo {
  id: number
  title: string
  description: string
  done: boolean
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
    return (id: number) => this.todos.find((todo) => todo.id === id)
  }

  public get getTodoCount() {
    return this.todos.length
  }

  @Mutation
  private add(todo: Todo) {
    this.todos.push(todo)
  }

  @Mutation
  private remove(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id)
  }

  @Mutation
  set(todos: Todo[]) {
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
  async deleteTodo(id: number) {
    await $axios.delete(`/api/todo/${id}`)
    this.remove(id)
  }
}

```

# @types/jestの追加とtsconfig.tsに追記

最新の`create-nuxt-app`（今回はv2.15.0)を使用しているのなら、言語にTypeScript、テストフレームワークにJestを選択している場合テスト環境を自動で構築してくれます。

ただし、一点変更を加えなければいけない箇所があるのでそこを修正します。
テストコードをTypeScriptで記述するために、`yarn add -D @types/jest`を実行し`tsconfig.ts`ファイルに、`"@types/jest"`を追加します。
- `yarn add -D @types/jest`

```json:tsconfig.json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["esnext", "esnext.asynciterable", "dom"],
    "esModuleInterop": true,
    "allowJs": true,
    "sourceMap": true,
    "strict": true,
    "noEmit": true,
    "experimentalDecorators": true,
    "baseUrl": ".",
    "paths": {
      "~/*": ["./*"],
      "@/*": ["./*"]
    },
    "types": [
      "@types/node",
      "@nuxt/types",
      "@nuxtjs/axios",
++    "@types/jest"
    ],
  },
  "exclude": ["node_modules", ".nuxt", "dist"]
}

```

これを追加すると、Jestの`describe()`などのメソッドを使用したときvscodeに怒られなくなります。
変更が反映されないときには、一度vscodeを再起動してみてください。

# ~/test/store/todo.tsファイルを作成

テストコードは、基本的に`test`フォルダ配下に作成していくことになります。`test`フォルダ配下にまずは`store`フォルダを作成し、その下に今回のテスト対象である`~/store/todo.ts`に対する`todo.spec.ts`を作成します。

Jestはデフォルトで`*.test.js`、`*.spec.js`もしくは`__tests__`という名前のディレクトリ以下のファイルをテストファイルとみなします。

ファイル名に*.spec.*を使用してテストファイルだということを表現します。

# テストを記述していく

## どのようなテストを書くか

Vuexのテストでは、`Actions`と`Getters`を対象にテストを記述してきます。なぜなら、`Mutations`は`Actions`で、`State`は`Getters`でテストの担保が取れているからです。(また今回のケースにおいては、`Mutations`と`State`は`private`で実装したという側面もあります。)

また、`Getters`のテストに関しても、ただ単位`State`の値を返しているようなテストを記述する必要はないでしょう。もし`Getters`が複雑な計算を行っているならば、テストコードを書く価値があります。


テストの中心は、`Actions`に対するテストになります。
`Actions`に対するテストは複雑になりがちです。`Actions`は、非同期でAPIを呼び出すことが多いので、モックを作る必要があるでしょう。さらに、APIが常に結果を返すとも限らないですから、その点も考慮する必要があるでしょう。APIから受け取ったレスポンスを正しくコミットできているかがテストの中心となります。

幸いなことに、今回はTypeScriptを使用しているため、しっかりと実装されているのならば`payload`が正しいかの観点は既に担保されていることになります。

## ストアを初期化する

それでは、実際にテストコードを記述していきます。
まずは、ストアをインポートして`beforeEach()`メソッドで各テストの前にストアが初期化されるようにします。


```typescript:~/test/store/todo.spec.ts
import { createStore } from '~/.nuxt/store'
import { initialiseStores, TodoStore } from '~/utils/store-accessor'

describe('store/todo', () => {
  beforeEach(() => {
    initialiseStores(createStore())
  })
})
```

これで、テストの中でコンポーネントで使用するようにストアを利用することができます。

## モックを作成する

`Actions`のテストを書いていく前に、モックを作成しましょう。テストのたびAPIに接続していると、壊れやすく時間のかかるものになってしまいます。

`axios`をモック化して、APIに接続する代わりに、ダミーデータを返すようにします。

### モジュールをモックする

Jestを使用して、モジュールをモックするのは簡単です。テスト元のファイル`todo.ts`では、`axios`を以下のように呼び出していました。

```typescript:~/store/todo.ts
import { $axios } from '~/utils/api'
```

このモジュールを`jest.mock()`メソッドを使用することで乗っ取ることができます。

```typescript:~/test/store/todo.spec.ts
jest.mock('~/utils/api')
```

`~/utils/api`は`{ $axios }`関数をexportしていますが、`jest.fn()`に置き換えられている状態になります。すごい。

### モックを実装する

モジュールのモックができたので、モックを実装していきます。

`~/utils/api`モジュールは`$axios`関数をexportしており、`$axios`関数は`get()`メソッドを持っているので次のようになります。

```typescript:~/test/store/todo.spec.ts
jest.mock('~/utils/api', () => ({
  $axios: {
    get: jest.fn(() =>
      Promise.resolve({
        data: res
      })
    )
  }
```

`jest.fn()`メソッドでモック関数を作成できます。`axios`は非同期に動作するので、`get()`メソッドの返り値は`Promise.resoleve()`を渡しています。

ダミーデータも作成しておきましょう。

```typescript:~/test/store/todo.spec.ts
const res = [
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
]

```

これで準備は整いました。テストを書いていきましょう。

## fetchTodosをテストする

それでは、実際に`fetchTodos()`に対するテストコードを書いてきます。
`fetchTodos()`アクションを実行した結果、`state`に正しく反映されているかを見ていきます。


```typescript:~/test/store/todo.spec.ts

describe('TodosModule', () => {
  beforeEach(() => {
    initialiseStores(createStore())
  })

  describe('Actions', () => {
    test('fetchTodos', async () => {
      await TodoStore.fetchTodos()
      expect(TodoStore.getTodos).toEqual(res)
    })
  })
})
```

`fetchTodos()`アクションは非同期に実行されるので、`async/await`で呼び出す必要があります。

テストを実行するには、`yarn test <ファイル名>`です。<ファイル名>を省略した場合には、すべてのテストが実行されます。

```shell script
yarn test test/store/todos.spec.ts
yarn run v1.22.0
$ jest test/store/todos.spec.ts
 PASS  test/store/todos.spec.ts
  store/todo
    Actions
      ✓ fetchTodos (12ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        5.116s
Ran all test suites matching /test\/store\/todos.spec.ts/i.
✨  Done in 6.46s.
```

テストが無事成功しましたね。


## Gettersテスト

次に、`Getters`もテストしておきましょう。`getTodo()`と`getTodoCount()`をテスト対象とします。冒頭で述べたとおり、`getTodos()`はただ値を返しているだけなので、テスト対象からは外します。

```typescript
describe('Getters', () => {
    beforeEach(async () => {
      await TodoStore.fetchTodos()
    })

    test('getTodo 存在するID', () => {
      expect(TodoStore.getTodo(2)).toEqual(res[1])
    })

    test('getTodo 存在しないID', () => {
      expect(TodoStore.getTodo(4)).toBeUndefined()
    })

    test('getTodoCount', () => {
      expect(TodoStore.getTodoCount).toEqual(3)
    })
  })
```

ストアの初期状態は空の配列なので、適切にテストを実施できるように`beforeEach()`で各`Getters`テストの前には`fetchTodos()`が実行されるようにします。

正しくテストされているか実施してみましょう。

```shell script
yarn test test/store/todos.spec.ts
yarn run v1.22.0
$ jest test/store/todos.spec.ts
 PASS  test/store/todos.spec.ts
  store/todo
    Actions
      ✓ fetchTodos (9ms)
    Getters
      ✓ getTodo 存在するID (1ms)
      ✓ getTodo 存在しないID (2ms)
      ✓ getTodoCount (1ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.554s
Ran all test suites matching /test\/store\/todos.spec.ts/i.
✨  Done in 4.33s.
```

最後に、コードの全体像です。

```typescript:~/test/store/todo.spec.ts
import { createStore } from '~/.nuxt/store'
import { initialiseStores, TodoStore } from '~/utils/store-accessor'

const res = [
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
    initialiseStores(createStore())
  })

  describe('Actions', () => {
    test('fetchTodos', async () => {
      await TodoStore.fetchTodos()
      expect(TodoStore.getTodos).toEqual(res)
    })
  })

  describe('Getters', () => {
    beforeEach(async () => {
      await TodoStore.fetchTodos()
    })

    test('getTodo 存在するID', () => {
      expect(TodoStore.getTodo(2)).toEqual(res[1])
    })

    test('getTodo 存在しないID', () => {
      expect(TodoStore.getTodo(4)).toBeUndefined()
    })

    test('getTodoCount', () => {
      expect(TodoStore.getTodoCount).toEqual(3)
    })
  })
})
```

# 終わりに

vuex-module-decoratorsを使用したストアでも、変わりなくテストを実行することができました。
