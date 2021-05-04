<template>
  <div>
    <h1>TODOリスト</h1>
    <hoge-button :color="`primary`" :title="`test`"/>
    <table>
      <tr>
        <th>ID</th>
        <th>TITLE</th>
        <th>DONE</th>
      </tr>
      <tr v-for="todo in todos" :key="todo.id">
        <td>{{ todo.id }}</td>
        <td>{{ todo.title }}</td>
        <td v-if="todo.completed">✔</td>
        <td v-else></td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { AxiosError } from 'axios'
import { TodoStore } from '~/store'
import HogeButton from '~/components/hoge-button.vue'
import { Component } from 'vue-property-decorator'

@Component({
  components: {
    HogeButton
  }
})
export default class Todo extends Vue {

  mounted (): void {
    this.fetchData()
  }

  async fetchData() {
    await TodoStore.fetchTodoes().catch((error: AxiosError) => {
      console.log(error)
      // error({
      //   statusCode: error.response?.status,
      //   message: error.response?.statusText
      // })
    })
  }
  get todos() {
    return TodoStore.getTodoes
  }
}

</script>
<style lang="scss" scoped>
  h1 {
    color: $BaseColor_Button_Main;
  }
</style>
