import { addDecorator } from '@storybook/vue'
import 'vuetify/dist/vuetify.css'

import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

Vue.component('nuxt-link', {
  props: ['to'],
  methods: {
    log() {
      action('link target')(this.to)
    }
  },
  template: '<a href="#" @click.prevent="log()"><slot>NuxtLink</slot></a>'
})

const vuetifyConfig = new Vuetify({
  icons: { iconfont: 'fa' },
  theme: { dark: false }
})

addDecorator(() => {
  return {
    vuetify: vuetifyConfig,
    template: '<v-app><div><story/></div></v-app>'
  }
})
