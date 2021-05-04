const path = require('path');

module.exports = {
  stories: ['../**/*.stories.ts'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async config => {
    config.module.rules.push({
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true
          }
        }
      ]
    })
    config.resolve.extensions.push('.ts')

    const rootPath = path.resolve(__dirname, '..')
    config.resolve.alias['@'] = rootPath
    config.resolve.alias['~'] = rootPath

    return config
  }
};
