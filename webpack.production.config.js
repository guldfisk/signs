const keysTransformer = require('ts-transformer-keys/transformer').default;

module.exports = {

  entry: {
    app: './frontend/src/index.ts'
  },

  mode: 'production',

  output: {
    filename: 'main.js',
    path: __dirname + '/frontend/static/frontend'

  },

  module: {

    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: program => ({
            before: [
              keysTransformer(program)
            ]
          })
        }
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        }
      },

      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      }

    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }

};