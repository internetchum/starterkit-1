var gulp 				= require('gulp');
var minifyhtml 	= require('gulp-htmlmin');
var minifyjs 		= require('gulp-uglify');
var minifycss 	= require('gulp-minify-css');
var config			=	require('../config');

gulp.task('minify-css', function() {
	return gulp.src(config.sass.dest+'/**/*.css')
		.pipe(minifycss())
		.pipe(gulp.dest(config.sass.dest));
});

gulp.task('minify-js', function() {
	return gulp.src(config.coffee.dest+'/**/*.js')
		.pipe(minifyjs())
		.pipe(gulp.dest(config.coffee.dest));
});

gulp.task('minify-html', function() {
	return gulp.src('app/views/**/*.blade.php')
		.pipe(minifyhtml({collapseWhitespace: true}))
		.pipe(gulp.dest('app/views'));
});

gulp.task('minify', ['minify-css', 'minify-js', 'minify-html']);