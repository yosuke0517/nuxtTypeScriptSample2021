import Logo from './Logo.vue'
import VuetifyLogo from './VuetifyLogo.vue'

export default {
  title: 'Components'
}

export const logo = () => ({
  components: { Logo },
  template: '<logo />'
})

export const vuetifyLogo = () => ({
  components: { VuetifyLogo },
  template: '<vuetify-logo />'
})
