const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
const AssetsPlugin = require('assets-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

/*
 * Webpack Constants
 */
const METADATA = {
  title: 'Data Management Platform',
  baseUrl: '/',
  isDevServer: helpers.isWebpackDevServer()
};

/*
 * Webpack configuration
 */
module.exports = function(options) {
  isProd = options.env === 'production';
  return {

    /*
     * Cache generated modules and chunks to improve performance for multiple incremental builds.
     * This is enabled by default in watch mode.
     * You can pass false to disable it.
     *
     * cache: false,
     */
    entry: {
      'polyfills': './src/polyfills.browser.ts',
      'vendor': './src/vendor.browser.ts',
      'main': './src/main.browser.ts'
    },

    resolve: {
      extensions: ['.ts', '.js', '.json'],

      // An array of directory names to be resolved to the current directory
      modules: [
        helpers.root('src'),
        helpers.root('node_modules')
      ],

      alias: {
        assets: helpers.root('src/assets'),
        app: helpers.root('src/app')
      }
    },

    module: {

      rules: [{
          test: /\.ts$/,
          loaders: [
            'awesome-typescript-loader',
            'angular2-template-loader'
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },

        { test: /\.json$/, loader: 'json-loader' },

        {
          test: /\.css$/,
          loaders: [
            'to-string-loader', 'css-loader'
          ],
          include: [helpers.root('src/app')]
        },

        {
          test: /\.scss$/,
          loaders: [
            'to-string-loader', 'css-loader', 'postcss-loader', 'sass-loader'
          ],
          include: [helpers.root('src/app')]
        },

        // static and module provided stylesheets
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader'
          }),
          include: [helpers.root('src/assets'), helpers.root('node_modules')]
        },

        { test: /\.html$/, loader: 'raw-loader', exclude: [helpers.root('src/index.html')] },

        { test: /\.(jpg|png|gif)$/, loader: 'file-loader' },
        { test: /\.(woff2?|svg)$/, loader: 'url-loader?limit=10000' },
        { test: /\.(ttf|eot)$/, loader: 'file-loader' },
        {
          test: /\.scss$/,
          loaders: [
            'style-loader', 'css-loader', 'postcss-loader', 'sass-loader'
          ],
          include: [helpers.root('node_modules')]
        },

        { test: require.resolve('jquery'), loader: 'expose-loader?jQuery!expose-loader?$' }
      ]
    },

    plugins: [
      new AssetsPlugin({
        path: helpers.root('dist'),
        filename: 'webpack-assets.json',
        prettyPrint: true
      }),

      new ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        jquery: 'jquery',
      }),

      /*
       * Plugin: ForkCheckerPlugin
       * Description: Do type checking in a separate process, so webpack don't need to wait.
       */
      new ForkCheckerPlugin(),

      /*
       * Plugin: OccurrenceOrderPlugin
       * Description: Varies the distribution of the ids to get the smallest id length
       * for often used ids.
       */
      new webpack.optimize.OccurrenceOrderPlugin(true),

      /*
       * Plugin: CommonsChunkPlugin
       * Description: Shares common code between the pages.
       * It identifies common modules and put them into a commons chunk.
       */
      new CommonsChunkPlugin({
        name: ['polyfills', 'vendor'].reverse()
      }),

      new ExtractTextPlugin("[name].css"),

      /**
       * Plugin: ContextReplacementPlugin
       * Description: Provides context to Angular's use of System.import
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
       * See: https://github.com/angular/angular/issues/11580
       */
      new ContextReplacementPlugin(
        // The (\\|\/) piece accounts for path separators in *nix and Windows
        /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
        helpers.root('src') // location of your src
      ),

      /*
       * Plugin: CopyWebpackPlugin
       * Description: Copy files and directories in webpack.
       *
       * Copies project static assets.
       */
      new CopyWebpackPlugin([{
        from: 'src/assets',
        to: 'assets'
      }, {
        from: 'src/meta'
      }]),

      /*
       * Plugin: HtmlWebpackPlugin
       * Description: Simplifies creation of HTML files to serve your webpack bundles.
       * This is especially useful for webpack bundles that include a hash in the filename
       * which changes every compilation.
       */
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        title: METADATA.title,
        chunksSortMode: 'dependency',
        metadata: METADATA
      }),

      // new webpack.ProvidePlugin({
      //   $: "jquery",
      //   jQuery: "jquery"
      // }),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       */
      new LoaderOptionsPlugin({
        options: {
          context: helpers.root(),
          output: {
            path: helpers.root('dist')
          },
          sassLoader: {
            includePaths: [helpers.root('src')]
          }
        }
      })
    ],

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      fs: 'empty',
      clearImmediate: false,
      setImmediate: false
    }
  };
}