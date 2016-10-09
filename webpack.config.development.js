/**
* Build config for development process that uses Hot-Module-Replacement
* https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
*/

/* eslint max-len: 0 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

export default merge(baseConfig, {

    debug: true,

    devtool: 'source-map',

    entry: [
        'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
        './app/bce/index'
    ],

    output: {
        publicPath: 'http://localhost:3000/static/'
    },

    module: {
        loaders: [
            {
                test: /\.global\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader?sourceMap'
                ]
            },
            {
                test: /^((?!\.global).)*\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
                ]
            },
            {
                test: /\.png$/,
                loaders: [
                    'url-loader'
                ]
            }
        ]
    },

    plugins: [
        // https://webpack.github.io/docs/hot-module-replacement-with-webpack.html
        new webpack.HotModuleReplacementPlugin(),

        // “If you are using the CLI, the webpack process will not exit with an error code by enabling this plugin.”
        // https://github.com/webpack/docs/wiki/list-of-plugins#noerrorsplugin
        new webpack.NoErrorsPlugin(),

        // NODE_ENV should be production so that modules do not perform certain development checks
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],

    // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
    target: 'electron-renderer'
});
