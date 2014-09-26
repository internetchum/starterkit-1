var gulp 		= require('gulp');
var plumber =	require('gulp-plumber');
var coffee	= require('gulp-coffee');
var errors	= require('../util/errors');
var config 	= require('../config').coffee;

gulp.task('coffee', function() {
	return gulp.src(config.src)
		.pipe(coffee())
		.on('error',errors)
		.pipe(plumber({errorHandler:errors}))
		.pipe(gulp.dest(config.dest));
});