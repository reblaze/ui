// Add in the top of the file
const StyleLintPlugin = require('stylelint-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
  devServer: {
    // proxy: 'http://localhost:5000'
    proxy: {
      '^/conf/api': {
        pathRewrite: {'^/conf/api': '/api'},
        target: 'http://localhost:5000',
      },
      '^/reblaze/api': {
        pathRewrite: {'^/reblaze/api': '/api'},
        target: 'http://localhost:8911',
      },
      '^/datalayer/api': {
        pathRewrite: {'^/datalayer/api': '/api'},
        target: 'http://localhost:8911',
      },
    },
  },
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new StyleLintPlugin({
        files: 'src/**/*.{vue, scss}',
      }),
      new NodePolyfillPlugin(),
    ],
  },
}


