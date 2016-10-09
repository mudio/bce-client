/**
 * Build config for electron 'Renderer Process' file
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import baseConfig from './webpack.config.base';

export default merge(baseConfig, {

    devtool: 'source-map',

    entry: './app/bce/index',

    output: {
        publicPath: '../../static/'
    },

    module: {
        loaders: [
            ...baseConfig.module.loaders,

            // Extract all .global.css to style.css as is
            {
                test: /\.global\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style-loader',
                    'css-loader'
                )
            },

            // Pipe other styles through css modules and apend to style.css
            {
                test: /^((?!\.global).)*\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style-loader',
                    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
                )
            },

            // Extract all .png
            {
                test: /\.png$/,
                loaders: [
                    'url-loader'
                ]
            }
        ]
    },

    plugins: [
        ...baseConfig.plugins,

        // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
        // https://github.com/webpack/webpack/issues/864
        new webpack.optimize.OccurrenceOrderPlugin(),

        // NODE_ENV should be production so that modules do not perform certain development checks
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),

        // Minify without warning messages
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        }),

        // Set the ExtractTextPlugin output filename
        new ExtractTextPlugin('style.css', {allChunks: true}),

        new HtmlWebpackPlugin({
            filename: 'app.html',
            template: 'app/app.html',
            inject: false
        })
    ],

    // https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
    target: 'electron-renderer'
});
