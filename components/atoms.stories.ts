import HogeButton from './hoge-button'

export default {
  title: 'Atoms'
}

export const button = () => ({
  components: { HogeButton },
  template: `<div>
    <hoge-button :title="\`accent\`" :color="\`accent\`"/>
    <hoge-button :title="\`primary\`" :color="\`primary\`"/>
    <hoge-button :title="\`secondary\`" :color="\`secondary\`"/>
  </div>`
})
