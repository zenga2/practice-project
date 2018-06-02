const path = require('path')
const {createLoaders} = require('./style-loaders')
const config = require('./config')
const webpack = require('webpack')
const express = require('express')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const opn = require('opn')

process.env.NODE_ENV = 'development'

function resolve(subPath) {
  return path.join(__dirname, '..', subPath)
}

const webpackConfig = {
  // 入口
  // 如果只有一个，可简化为entry:'./src/main.js'
  entry: {
    // app将作为包名
    app: [
      './build/dev-client',
      './src/main.js'
    ]
  },
  output: {
    // 输出存放的目录
    path: resolve('dist'),
    // 文件名(可包含子目录)
    filename: '[name].js',
    publicPath: './'
  },
  resolve: {
    // 可省略的后缀
    extensions: ['.js', '.vue', '.json'],
    //
    alias: {
      // 全部功能的Vue(包含编译模块)
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        // All loaders are sorted in the order pre, inline, normal, post and used in this order.
        // 在本配置中，意味着该loader最先执行
        enforce: 'pre',
        // 优先考虑使用include
        // 验证同时使用include和exclude的效果
        include: [resolve('src')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            css: createLoaders('css'),
            stylus: createLoaders('stylus')
          }
        },
        transformToRequire: {
          video: 'src',
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: resolve('static/img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: resolve('static/media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: resolve('static/fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.css$/,
        use: createLoaders('css')
      },
      {
        test: /\.stylus$/,
        // 从右往左执行
        use: createLoaders('stylus')
      }
    ]
  },
  // cheap-module-eval-source-map is faster for development
  // 生成一个没有列信息（column-mappings）的 SourceMaps 文件，
  // 同时 loader 的 sourcemap 也被简化为只包含对应行的。
  // 每个 module 会封装到 eval 里包裹起来执行，并且会在末尾追加注释
  // https://juejin.im/post/58293502a0bb9f005767ba2f
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {NODE_ENV: JSON.stringify('development')}
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
}

const app = express()
const compiler = webpack(webpackConfig)

// proxy api requests
Object.keys(config.dev.proxyTable).forEach(context => {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = {target: options}
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// webpack-dev-middleware
const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: '/',
  quiet: true
})
app.use(devMiddleware)

// webpack-hot-middleware
const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
compiler.plugin('compilation', compilation => {
  compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
    hotMiddleware.publish({action: 'reload'})
  })
})
app.use(hotMiddleware)

// 处理静态资源
app.use('/static', express.static('./static'))

// 输出一些日志
const port = '8080'
const uri = `http://localhost:${port}`
console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log(`> Listening at ${uri} \n`)
  opn(uri)
})

// 开启服务器
app.listen(port)
