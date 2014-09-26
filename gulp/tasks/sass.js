var gulp 		= require('gulp');
var plumber =	require('gulp-plumber');
var sass 		= require('gulp-sass');
var errors	= require('../util/errors');
var config 	= require('../config').sass;

gulp.task('sass', ['images'], function() {
	return gulp.src(config.src)
		.pipe(sass())
		.on('error',errors)
		.pipe(plumber({errorHandler:errors}))
		.pipe(gulp.dest(config.dest));
});