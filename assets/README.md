# ASSETS
### グローバルscssの設定

- `yarn add -D sass-loader node-sass @nuxtjs/style-resources`

- vuetifyを使う場合、2021/5時点で`sass-loader`のバージョンを8系系にしないとエラーになる

```json
"@nuxtjs/style-resources": "^1.0.0",
"node-sass": "^5.0.0",
"sass-loader": "^8.0.2",
```

- nuxt.config.jsへ登録(styleResourcesとmodules)

```json
styleResources: {
    // mixinとかも随時追加していく
    scss: [
      '~/assets/scss/variable.scss',
    ]
  },
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/style-resources'
  ],
```

- `~/assets/scss/variable.scss`を作って変数などを定義

```scss
// 色定義
// Baseカラー(ボタン)
$BaseColor_Button_Main: #FF8308;
$BaseColor_Button_Select: #276FEA;
$BaseColor_Button_Special: #279FEA;
$BaseColor_Button_Main_Line: #CC6906;
$BaseColor_Button_Select_Line: #9FC2FF;
$BaseColor_Button_Special_Line: #84D0FF;
$BaseColor_Button_Disabled: #E0E0E0;
$BaseColor_Button_Disabled_Line: #BFBFBF;
```

### 使うとき

```vue
<style lang="scss" scoped>
h1 {
  color: $BaseColor_Button_Main;
}
</style>
```

