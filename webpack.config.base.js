/**
* Base webpack config used across other specific configs
*/

import path from 'path';
import {dependencies as externals} from './static/package.json';

export default {
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader'],
                exclude: /node_modules/
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }]
    },

    output: {
        path: path.join(__dirname, 'static'),
        filename: 'bundle.js',

        // https://github.com/webpack/webpack/issues/1114
        libraryTarget: 'commonjs2'
    },

    // https://webpack.github.io/docs/configuration.html#resolve
    resolve: {
        extensions: ['', '.js', '.jsx', '.json'],
        packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
    },

    plugins: [],

    externals: Object.keys(externals || {})
};
