const webpack = require('webpack')
const { merge } = require('webpack-merge')
const OptimizeCss = require('css-minimizer-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin');
const CONFIG = require('./config')
const webpackBaseConfig = require('./webpack.base.config')

module.exports = merge(webpackBaseConfig, {
	module: {
		rules: [
			{
				test: /\.less|\.css$/,
				use: [
					{ 
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 2
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									["postcss-preset-env"]
								]
							}
						}
					},
					'less-loader'
				]
			}
		]
	},

	plugins: [
		new FileManagerPlugin({
			// destination 相對 webpack context
			events: {
				onStart: {
					delete: [
						`../server/${CONFIG.BUILD.VIEW}`,
						`../server/${CONFIG.SERVER.ASSET}`
					]
				},
				onEnd: [
					{
						move: [{
							source: `../${CONFIG.BUILD.DIST}/${CONFIG.BUILD.VIEW}`,
							destination: `../server/${CONFIG.BUILD.VIEW}`
						}]
					},
					{
						move: [{
							source: `../${CONFIG.BUILD.DIST}`,
							destination: `../server/${CONFIG.SERVER.ASSET}`
						}]
					},
					{
						copy: [{
							source: '../src/css/lib',
							destination: '../server/assets/css/lib'
						}]
					},
				]
			}
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
		}),

		new MiniCssExtractPlugin({
			filename: `${CONFIG.BUILD.STYLE}/[name].[contenthash:5].min.css`
		}),

		new OptimizeCss()
	],

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					minChunks: 1,
					chunks: 'all',
					priority: 100
				}
			}
		},
		runtimeChunk: {
			name: 'manifest'
		}
	},

	devtool: 'cheap-module-source-map',

	mode: 'production'
})
