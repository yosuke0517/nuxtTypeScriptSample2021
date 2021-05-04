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

  export default Vue.extend({
    async asyncData({ error }) {
        await TodoStore.fetchTodoes().catch((error: AxiosError) => {
          console.log(error)
          // error({
          //   statusCode: error.response?.status,
          //   message: error.response?.statusText
          // })
        })
      },
    computed: {
      todos() {
        return TodoStore.getTodoes
      }
    }
  })
</script>
<style lang="scss" scoped>
  h1 {
    color: $BaseColor_Button_Main;
  }
</style>
