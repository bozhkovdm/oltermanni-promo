let preprocessor = 'sass', // Preprocessor (sass, less, styl)
		fileswatch   = 'html,htm,txt,json,md,woff2' // List of files extensions for watching & hard reload

import pkg from 'gulp'
const { gulp, src, dest, parallel, series, watch } = pkg

import browserSync   from 'browser-sync'
import bssi          from 'browsersync-ssi'
import ssi           from 'ssi'
import webpackStream from 'webpack-stream'
import webpack       from 'webpack'
import TerserPlugin  from 'terser-webpack-plugin'
import gulpSass      from 'gulp-sass'
import dartSass      from 'sass'
const  sass          = gulpSass(dartSass)
import postCss       from 'gulp-postcss'
import cssnano       from 'cssnano'
import autoprefixer  from 'autoprefixer'
import imagemin      from 'gulp-imagemin'
import imageResize   from 'gulp-image-resize'
import changed       from 'gulp-changed'
import concat        from 'gulp-concat'
import rsync         from 'gulp-rsync'
import {deleteAsync} from 'del'

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/',
			middleware: bssi({ baseDir: 'app/', ext: '.html' })
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		open: false,
	})
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'node_modules/slick-carousel/slick/slick.js',
		'app/js/*.js', '!app/js/*.min.js'
	])
		.pipe(webpackStream({
			mode: 'production',
			performance: { hints: false },
			plugins: [
				new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery' }),
			],
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env'],
								plugins: ['babel-plugin-root-import']
							}
						}
					}
				]
			},
			optimization: {
				minimize: true,
				minimizer: [
					new TerserPlugin({
						terserOptions: { format: { comments: false } },
						extractComments: false
					})
				]
			},
		}, webpack)).on('error', (err) => {
			this.emit('end')
		})
		.pipe(concat('app.min.js'))
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function extstyles_dev() {
	return src([
		`app/styles/conf-extstyles.sass`,
		`node_modules/slick-carousel/slick/slick.css`,
		`node_modules/slick-carousel/slick/slick-theme.css`,
	])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)({ 'include css': true }))
		.pipe(postCss([
			autoprefixer({ grid: 'autoplace' }),
			cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
		]))
		.pipe(concat('bundle.min.css'))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function styles_dev() {
	return src([
		`app/styles/${preprocessor}/*.*`, `!app/styles/${preprocessor}/_*.*`
	])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)({ 'include css': true }))
		.pipe(postCss([
			autoprefixer({ grid: 'autoplace' }),
			// cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
		]))
		.pipe(concat('dev.css'))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function images() {
	return src(['app/images/src/**/*', '!app/images/src/**/*.svg'])
		.pipe(changed('app/images/dist/2x'))
		.pipe(imagemin())
		.pipe(dest('app/images/dist/2x'))
		.pipe(imageResize({ width: '50%', imageMagick: true }))
		.pipe(dest('app/images/dist'))
		.pipe(browserSync.stream())
}

function images_svgs() {
	return src(['app/images/src/**/*.svg'])
	.pipe(changed('app/images/dist'))
	.pipe(imagemin())
	.pipe(dest('app/images/dist'))
	.pipe(browserSync.stream())
}

function buildcopy() {
	return src([
		'{app/js,app/css}/*.min.*',
		'app/images/**/*.*',
		'!app/images/src/**/*',
		'app/fonts/**/*'
	], { base: 'app/' })
	.pipe(dest('dist'))
}

async function buildhtml() {
	let includes = new ssi('app/', 'dist/', '/**/*.html')
	includes.compile()
	await deleteAsync('dist/parts', { force: true })
}

async function cleandist() {
	await deleteAsync('dist/**/*', { force: true })
}

function deploy() {
	return src('dist/')
		.pipe(rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// clean: true, // Mirror copy with file deletion
			include: [/* '*.htaccess' */], // Included files to deploy,
			exclude: [ '**/Thumbs.db', '**/*.DS_Store' ],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch(`app/styles/${preprocessor}/**/*`, { usePolling: false }, styles_dev)
	watch(['app/js/**/*.js', '!app/js/**/*.min.js'], { usePolling: false }, scripts)
	watch('app/images/src/**/*', { usePolling: false }, images)
	watch('app/images/src/**/*.svg', { usePolling: false }, images_svgs)
	watch(`app/**/*.{${fileswatch}}`, { usePolling: false }).on('change', browserSync.reload)
}

export { scripts, styles_dev, extstyles_dev, images, images_svgs, deploy }
export let assets = series(scripts, styles_dev, images, images_svgs)
export let build = series(cleandist, images, images_svgs, scripts, styles_dev, buildcopy, buildhtml)

export default series(scripts, styles_dev, extstyles_dev, images, images_svgs, parallel(browsersync, startwatch))
