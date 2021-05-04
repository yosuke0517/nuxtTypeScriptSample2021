import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { $axios } from '~/utils/api'

type Todo = {
  userId: Number
  id?: Number
  title: String
  completed: Boolean
}

@Module({
  name: 'todo',
  stateFactory: true,
  namespaced: true
})
export default class Todoes extends VuexModule {
  private todoes: Todo[] = []

  public get getTodoes() {
    return this.todoes
  }
  // get構文には引数を渡すことができないので、関数をreturnすることで渡してあげる
  public get getTodo() {
    return (id: Number) => this.todoes.find((todo) => todo.id === id)
  }

  public get getTodoCount() {
    return this.todoes.length
  }

  @Mutation
  private add(todo: Todo) {
    this.todoes.push(todo)
  }

  @Mutation
  private remove(id: Number) {
    this.todoes = this.todoes.filter((todo) => todo.id !== id)
  }

  @Mutation set(todoes: Todo[]) {
    this.todoes = todoes
  }

  // { rawError: true }を指定しないと正しくエラーが補足できない
  @Action({ rawError: true })
  public async fetchTodoes() {
    const { data } = await $axios.get<Todo[]>('https://jsonplaceholder.typicode.com/todos/')
    console.log(data)
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
