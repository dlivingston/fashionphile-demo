var gulp = require('gulp');
var replace = require('gulp-replace');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var env = require('gulp-environments');
var uglifyify = require('uglifyify');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var watchify = require('watchify');
var exorcist = require('exorcist');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var fs = require('fs');
var sass = require('gulp-sass');
var reload = browserSync.reload;
var dev = env.development;
var prod = env.production;

var src = {
    scss: 'src/scss/*.scss',
    html: 'src/*.html',
    fonts: 'src/fonts/*.*',
    images: 'src/images/**/*.*',
    json: 'src/js/*.json'
};
var dist = {
    css: 'dist/css',
    html: 'dist',
    fonts: 'dist/fonts',
    images: 'dist/images',
    json: 'dist/js'
}

// set @__PATHVAR__@ Here
var deployPath = '/';

watchify.args.debug = true;
var devBundler = watchify(browserify('./src/js/main.js', watchify.args));
devBundler.transform(babelify.configure({
    sourceMapRelative: 'src/js',
    presets: ["es2015"]
}));
devBundler.transform('uglifyify', { global: true });
devBundler.on('update', devBundle);

var prodBundler = browserify('./src/js/main.js', { debug: true });
prodBundler.transform(babelify.configure({
    sourceMapRelative: 'src/js',
    presets: ["es2015"]
}));
prodBundler.transform('uglifyify', { global: true });

function devBundle() {
    gutil.log('Compiling JS...');
    return devBundler.bundle()
        .on('error', function (err) {
            gutil.log(err.message);
            browserSync.notify("Browserify Error!");
            this.emit("end");
        })
        .pipe(exorcist('dist/js/bundle-js.map'))
        .pipe(source('bundle.js'))
        .pipe(dev(replace('@__PATHVAR__@', '')))
        .pipe(prod(replace('@__PATHVAR__@', deployPath)))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream({ once: true }));
}

function prodBundle() {
    gutil.log('Compiling JS...');
    return prodBundler.bundle()
        .on('error', function (err) {
            gutil.log(err.message);
            browserSync.notify("Browserify Error!");
            this.emit("end");
        })
        .pipe(exorcist('dist/js/bundle-js.map'))
        .pipe(source('bundle.js'))
        .pipe(dev(replace('@__PATHVAR__@', '')))
        .pipe(prod(replace('@__PATHVAR__@', deployPath)))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream({ once: true }));
}

gulp.task('html', function () {
    gulp.src(src.html)
        .pipe(dev(replace('@__PATHVAR__@', '')))
        .pipe(prod(replace('@__PATHVAR__@', deployPath)))
        .pipe(gulp.dest(dist.html))
        .pipe(reload({ stream: true }));
});

gulp.task('fonts', function () {
    gulp.src(src.fonts)
        .pipe(gulp.dest(dist.fonts));
});

gulp.task('json', function () {
    gulp.src(src.json)
        .pipe(dev(replace('@__PATHVAR__@', '')))
        .pipe(prod(replace('@__PATHVAR__@', deployPath)))
        .pipe(gulp.dest(dist.json))
        .pipe(reload({ stream: true }));
});

gulp.task('images', function () {
    gulp.src(src.images)
        .pipe(gulp.dest(dist.images));
});

gulp.task('sass', function () {
    return gulp.src(src.scss)
        .pipe(sass()).on('error', sass.logError)
        .pipe(cssmin())
        .pipe(rename({ suffix: '-min' }))
        .pipe(dev(replace('@__PATHVAR__@', '../')))
        .pipe(prod(replace('@__PATHVAR__@', deployPath)))
        .pipe(gulp.dest(dist.css))
        .pipe(reload({ stream: true }));
});

gulp.task('devBundle', function () {
    return devBundle();
});

gulp.task('prodBundle', function () {
    return prodBundle();
});

gulp.task('serve', ['sass'], function () {
    browserSync.init({
        server: "./dist"
    });
    gulp.watch(src.scss, ['sass']);
    gulp.watch(src.html, ['html']);
    gulp.watch(src.json, ['json']);
});

gulp.task('default', ['html', 'images', 'fonts', 'json', 'devBundle', 'serve']);
gulp.task('build', ['html', 'images', 'fonts', 'json', 'sass', 'prodBundle']);