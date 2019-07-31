const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./assets/game.js", // bundle's entry point
    output: {
        path: path.resolve(__dirname, 'dist'), // output directory
        filename: "[name].js" // name of the generated bundle
    },
    plugins : [
        new HtmlWebpackPlugin({
            template: "index.html",
            inject : "body"
        })
    ]
};
