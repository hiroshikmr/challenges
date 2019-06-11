const path = require('path');

const config = {
    entry: './src/index.js',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        publicPath: 'build',
    },
    watch: true,

    devtool: 'inline-source-map',

    devServer: {
        inline: true,
        host: '0.0.0.0',
        port: 3000,
        historyApiFallback: true,
        disableHostCheck: true,
        contentBase: 'public',
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: [/node_modules/],
            use: {
                loader: 'babel-loader',
            },
        }, {
            test: /\.scss$/,
            use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                },
                {
                    loader: "css-loader" // translates CSS into CommonJS
                },
                {
                    loader: "sass-loader" // compiles Sass to CSS
                }
            ]
        }],
    }
};

module.exports = config;