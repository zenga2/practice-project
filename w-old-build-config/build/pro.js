const path = require('path')
const {createLoaders} = require('./style-loaders')
const config = require('./config')
const webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const rm = require('rimraf')
const ora = require('ora')
const chalk = require('chalk')

process.env.NODE_ENV = 'production'

function resolve(subPath) {
  return path.join(__dirname, '..', subPath)
}

const webpackConfig = {
  // 入口
  // 如果只有一个，可简化为entry:'./src/main.js'
  entry: {
    // app将作为包名
    app: './src/main.js'
  },
  output: {
    // 输出存放的目录
    path: resolve('dist'),
    // 文件名(可包含子目录)
    filename: 'static/js/[name].[chunkhash].js',
    chunkFilename: 'js/[id].[chunkhash].js',
    publicPath: './'
  },
  resolve: {
    // 可省略的后缀
    extensions: ['.js', '.vue', '.json'],
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
          },
          transformToRequire: {
            video: 'src',
            source: 'src',
            img: 'src',
            image: 'xlink:href'
          }
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
  devtool: config.pro.sourceMap ? '#source-map' : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {NODE_ENV: JSON.stringify('production')}
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    new ExtractTextPlugin({
      filename: 'static/css/[name].[contenthash].css'
    }),
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    new HtmlWebpackPlugin({
      filename: resolve('dist/index.html'),
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module, count) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            resolve('node_modules')
          ) === 0
        )
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    }),
    new CopyWebpackPlugin([
      {
        from: resolve('static'),
        to: resolve('dist/static'),
        ignore: ['.*']
      }
    ])
  ]
}

if (process.env.npm_config_report) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

const spinner = ora('building for production...')
spinner.start()

rm(resolve('dist'), err => {
  if (err) throw err

  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err

    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if(stats.hasErrors()){
      console.log(chalk.red(' Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan(' Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
