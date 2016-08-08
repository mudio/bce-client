/* eslint import/no-extraneous-dependencies: 0 */
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import baseConfig from './webpack.config.base';


const config = {
    ...baseConfig,

    devtool: 'cheap-module-source-map',

    entry: './app/bce/index',

    output: {
        ...baseConfig.output,

        publicPath: '../../static/'
    },

    module: {
        ...baseConfig.module,

        loaders: [
            ...baseConfig.module.loaders,

            {
                test: /\.global\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style-loader',
                    'css-loader'
                )
            },

            {
                test: /^((?!\.global).)*\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style-loader',
                    'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
                )
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
        ...baseConfig.plugins,
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                screw_ie8: true,
                warnings: false
            }
        }),
        new ExtractTextPlugin('style.css', {allChunks: true}),
        new HtmlWebpackPlugin({
            filename: 'app.html',
            template: 'app/app.html',
            inject: false
        })
    ],

    target: 'electron-renderer'
};

export default config;
