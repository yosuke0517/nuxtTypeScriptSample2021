import { createStore } from '~/.nuxt/store'
import { initialiseStores, TodoStore } from '~/utils/store-accsessor'

// ダミーデータ
const res = [
  {
    "userId": 1,
    "id": 1,
    "title": "delectus aut autem",
    "completed": false
  },
  {
    "userId": 1,
    "id": 2,
    "title": "quis ut nam facilis et officia qui",
    "completed": false
  },
  {
    "userId": 1,
    "id": 3,
    "title": "fugiat veniam minus",
    "completed": false
  },
  {
    "userId": 1,
    "id": 4,
    "title": "et porro tempora",
    "completed": true
  },
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
      await TodoStore.fetchTodoes()
      expect(TodoStore.getTodoes).toEqual(res)
    })
  })

  describe('Getters', () => {
    beforeEach(async () => {
      // 初期状態は空の配列なのでtestの前にmockAPIを叩いておく
      await TodoStore.fetchTodoes()
    })

    test('getTodo 存在するID', () => {
      expect(TodoStore.getTodo(2)).toEqual(res[1])
    })

    test('getTodo 存在しないID', () => {
      expect(TodoStore.getTodo(5)).toBeUndefined()
    })

    test('getTodoCount', () => {
      expect(TodoStore.getTodoCount).toEqual(4)
    })
  })
})

