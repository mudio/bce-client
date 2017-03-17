/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import {dependencies as externals} from './static/package.json';

export default {
    module: {
        rules: [{
            test: /\.jsx?$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },

    output: {
        path: path.join(__dirname, 'static'),
        filename: 'bundle.js',
    // https://github.com/webpack/webpack/issues/1114
        libraryTarget: 'commonjs2'
    },

    /**
     * Determine the array of extensions that should be used to resolve modules.
     */
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        modules: [
            path.join(__dirname, 'static'),
            'node_modules',
        ],
    },

    plugins: [
        new webpack.NamedModulesPlugin(),
    ],

    externals: Object.keys(externals || {})
};
