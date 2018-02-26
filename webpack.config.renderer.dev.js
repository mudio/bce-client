/* eslint-disable no-console */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.js.org/concepts/hot-module-replacement/
 */
import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import {spawn} from 'child_process';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import baseConfig from './webpack.config.base';

const port = process.env.PORT || 3000;
const publicPath = `http://localhost:${port}/static`;

export default merge(baseConfig, {
    /**
     * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
     */
    target: 'electron-renderer',

    devtool: 'inline-source-map',

    entry: [
        'react-hot-loader/patch',
        `webpack-dev-server/client?http://localhost:${port}/`,
        'webpack/hot/only-dev-server',
        path.join(__dirname, './app/renderer'),
    ],

    output: {
        filename: 'renderer.dev.js',
        publicPath: `http://localhost:${port}/static/`
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        plugins: [
                            // Here, we include babel plugins that are only required for the
                            // renderer process. The 'transform-*' plugins must be included
                            // before react-hot-loader/babel
                            'transform-class-properties',
                            'transform-es2015-classes',
                            'react-hot-loader/babel'
                        ],
                    }
                }
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader' // translates CSS into CommonJS
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            modifyVars: {
                                'font-size-base': '12px',
                                'btn-height-base': '30px'
                            }
                        }
                    }
                ]
            },
            {
                test: /\.global\.css$/,
                use: [
                    {loader: 'style-loader'},
                    {
                        loader: 'css-loader',
                        options: {sourceMap: true},
                    }
                ]
            },
            {
                test: /^((?!\.global).)*\.css$/,
                use: [
                    {loader: 'style-loader'},
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            sourceMap: true,
                            importLoaders: 1,
                            localIdentName: '[name]__[local]__[hash:base64:5]',
                        }
                    },
                ]
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff',
                    }
                },
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff',
                    }
                }
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/octet-stream'
                    }
                }
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: 'file-loader',
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'image/svg+xml',
                    }
                }
            },
            {
                test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
                use: 'url-loader',
            }
        ]
    },

    plugins: [
        // https://webpack.js.org/concepts/hot-module-replacement/
        new webpack.HotModuleReplacementPlugin(),

        new webpack.NoEmitOnErrorsPlugin(),

        /**
         * Create global constants which can be configured at compile time.
         *
         * Useful for allowing different behaviour between development builds and
         * release builds
         *
         * NODE_ENV should be production so that modules do not perform certain
         * development checks
         */
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        // turn debug mode on.
        new webpack.LoaderOptionsPlugin({
            debug: true
        }),

        new ExtractTextPlugin({
            filename: '[name].css'
        }),
    ],

    devServer: {
        port,
        publicPath,
        compress: true,
        noInfo: true,
        stats: 'errors-only',
        inline: true,
        lazy: false,
        hot: true,
        headers: {'Access-Control-Allow-Origin': '*'},
        contentBase: path.join(__dirname, 'static'),
        watchOptions: {
            aggregateTimeout: 300,
            ignored: /node_modules/,
            poll: 100
        },
        historyApiFallback: {
            verbose: true,
            disableDotRule: false,
        },
        before() {
            if (process.env.START_HOT) {
                console.log('Staring Main Process...');
                spawn('npm', ['run', 'start'], {shell: true, env: process.env, stdio: 'inherit'})
                    .on('close', code => process.exit(code))
                    .on('error', spawnError => console.error(spawnError));
            }
        }
    },
});
