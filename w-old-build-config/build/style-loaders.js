const ExtractTextPlugin = require('extract-text-webpack-plugin')
const config = require('./config')
const isProduction = process.env.NODE_ENV === 'production'
const {sourceMap, extract} = isProduction ? config.pro : config.dev

const cssLoader = {
  loader: 'css-loader',
  options: {
    minimize: false,
    sourceMap
  }
}

const postcssLoader = cssLoader

const lessLoader = {
  loader: 'less-loader',
  options: {
    sourceMap
  }
}

const stylusLoader = {
  loader: 'stylus-loader',
  options: {
    sourceMap
  }
}

const sassLoader = {
  loader: 'sass-loader',
  options: {
    indentedSyntax: true,
    sourceMap
  }
}

const scssLoader = {
  loader: 'sass-loader',
  options: {
    sourceMap
  }
}

const loaderMap = {
  css: [cssLoader],
  postcss: [cssLoader],
  less: [cssLoader, lessLoader],
  stylus: [cssLoader, stylusLoader],
  sass: [cssLoader, sassLoader],
  scss: [cssLoader, scssLoader]
}

function createLoaders(ext) {
  const loaders = loaderMap[ext]

  return extract
    ? ExtractTextPlugin.extract({
      use: loaders,
      fallback: 'vue-style-loader'
    })
    : ['vue-style-loader', ...loaders]

}

module.exports = {
  cssLoader, postcssLoader, lessLoader,
  stylusLoader, sassLoader, scssLoader,
  createLoaders
}
