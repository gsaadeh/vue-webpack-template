'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
var vueTemplateLoaderConfig = require('./vue-template-loader.conf')
{{#if_eq compiler "typescript"}}
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
{{/if_eq}}

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  {{#unless_eq projectType "lib"}}entry: {
    app: './src/main.{{#if_eq compiler "typescript"}}ts{{else}}js{{/if_eq}}'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },{{/unless_eq}}
  {{#if_eq compiler "typescript"}}
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      watch: {{#unless_eq projectType "lib"}}'./src'{{/unless_eq}}{{#if_eq projectType "lib"}}['./src', './app']{{/if_eq}} // optional but improves performance (less stat calls)
    })
  ],{{/if_eq}}
  resolve: {
    extensions: ['.js', '.vue', {{#if_eq compiler "typescript"}}'.ts', {{/if_eq}}'.json'],
    alias: {
      {{#if_eq build "standalone"}}
      'vue$': 'vue/dist/vue.esm.js'
      {{/if_eq}}
    },
    modules: [
      resolve('src'),{{#if_eq projectType "lib"}}
      resolve('app'),{{/if_eq}}
      "node_modules"
    ]
  },
  module: {
    rules: [
      {{#eslint}}
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'),{{#if_eq projectType "lib"}} resolve('app'),{{/if_eq}} resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {{/eslint}}
      {{#tslint}}
      {
        test: /\.ts$/, // tslint doesn't support vue files
        enforce: 'pre',
        loader: 'tslint-loader',
        include: [resolve('src'),{{#if_eq projectType "lib"}} resolve('app'),{{/if_eq}} resolve('test')],
        options: {
          formatter: 'grouped',
          formattersDirectory: 'node_modules/custom-tslint-formatters/formatters'
        }
      },
      {{/tslint}}
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.html$/,
        loader: 'vue-template-loader',
        exclude: resolve('index.html'),
        options: vueTemplateLoaderConfig
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: utils.buildBabelOptions()
        },
        include: [resolve('src'),{{#if_eq projectType "lib"}} resolve('app'),{{/if_eq}} resolve('test')]
      },
      {{#if_eq compiler "typescript"}}
      {
        test: /\.ts$/,
        use: [{
          loader: 'babel-loader',
          options: utils.buildBabelOptions()
          }, {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: true // Disable type checking to run it in fork
          },
        }],
        include: [resolve('src'),{{#if_eq projectType "lib"}} resolve('app'),{{/if_eq}} resolve('test')]
      },
      {{/if_eq}}
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  }
}
