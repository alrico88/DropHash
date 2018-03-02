const gulp = require('gulp');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');

gulp.task('scripts', function() {
	return gulp
		.src('./public/javascripts/index.js')
		.pipe(named())
		.pipe(webpack())
		.pipe(gulp.dest('./public/dist/'));
});

gulp.task('styles', function() {
	gulp
		.src('./scss/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('public/css'));
});

gulp.task('develop', function() {
	gulp.start('default');
	nodemon({
		script: './app.js',
		ignore: ['public/dist/'],
	}).on('start', ['watch-public']);
});

gulp.task('watch-public', function() {
	gulp.watch(
		[
			'public/javascripts//*.js',
			'public/javascripts//*/*.js',
			'!public/dist/*.js',
		],
		['scripts']
	);
});

gulp.task('setup', function() {
	gulp.start('scripts', 'styles');
});
