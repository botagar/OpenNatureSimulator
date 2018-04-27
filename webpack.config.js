const path = require("path")
const webpack = require('webpack')

var config = {
  mode: 'development',
  target: 'electron-renderer',

  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    './src/app.tsx'
  ],

  output: {
    path: path.resolve(__dirname, "build"),
    filename: "app.bundle.js"
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },

  devServer: {
    inline: true,
    port: 9001,
    compress: true,
    historyApiFallback: true,
    contentBase: './',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(?:jpg|gif|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'media/images'
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new webpack.NamedModulesPlugin()
  ]
};

module.exports = config
