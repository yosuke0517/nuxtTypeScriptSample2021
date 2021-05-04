<template>
  <div>
    <v-btn
      elevation="2"
      :color="color"
    >{{title}}</v-btn>
  </div>
</template>

<script lang="ts">
  import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class HogeButton extends Vue {
  @Prop(String) color: string | undefined
  @Prop(String) title: string | undefined

}
</script>

<style lang="scss" scoped>
h1 {
  color: #3b8070;
}
</style>
