let {
	src,
	dest
} = require("gulp");
let gulp = require("gulp");
let browsersync = require("browser-sync").create();
let fileinclude = require("gulp-file-include");
let del = require("del");
let scss = require("gulp-sass");
let autoprefixer = require("gulp-autoprefixer");
let group_media = require("gulp-group-css-media-queries");
let clean_css = require("gulp-clean-css");
let rename = require("gulp-rename");
let uglify = require("gulp-uglify-es").default;
let plumber = require("gulp-plumber");

let newer = require('gulp-newer');
let imagemin = require("gulp-imagemin");
let webp = require('imagemin-webp');

let result_folder = require("path").basename(__dirname);
let source_folder = "#src";



let path = {
	build: {
		html: result_folder + "/",
		css: result_folder + "/css/",
		js: result_folder + "/js/",
		img: result_folder + "/img/",
		fonts: result_folder + "/fonts/"
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.{woff,woff2}"
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/**/*.{woff,woff2}"
	},
	clean: "./" + result_folder + "/"
}



function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: "./" + result_folder + "/"
		},
		notify: false,
		port: 3000,
	});
}

function html() {
	return src(path.src.html, {})
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
}

function css() {
	return src(path.src.css, {})
		.pipe(plumber())
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(dest(path.build.css))
		.pipe(
			clean_css()
		)
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
}

function js() {
	return src(path.src.js, {})
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(
			uglify()
		)
		.pipe(
			rename({
				suffix: ".min",
				extname: ".js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
}

function img() {
	return src(path.src.img)
		.pipe(newer(path.build.img))
		.pipe(
			imagemin([
				webp({
					quality: 75
				})
			])
		)
		.pipe(
			rename({
				extname: ".webp"
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(newer(path.build.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{
					removeViewBox: false
				}],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
}

function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
		.pipe(browsersync.stream());
}

function clean() {
	return del(path.clean);
}

function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.fonts], fonts);
}



let build = gulp.series(clean, gulp.parallel(html, css, js, img, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);



exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;