const mode = process.env.NODE_ENV
const isDev = mode === 'development'
const isProd = mode === 'production'

module.exports = {
	PORT: 8080,
	PUBLIC_PATH: "/public",
	BUILD: {
		DIST: "dist",
		ASSET: "assets", 
		VIEW: "views",
		STYLE: "css",
		SCRIPT: "js",
		FONT: "fonts",
		IMAGE: "imgs",
	},
	SERVER: {
		ASSET: "assets",
	},
	EXT: "ejs"
}
