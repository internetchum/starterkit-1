var gulp 		= require('gulp');
var config 	= require('../config');

gulp.task('watch', function() {
	gulp.watch(config.browserify.bundleConfigs.entries, ['browserify']);
	gulp.watch('./public/assets/sass/**/*.scss', ['sass']);
	gulp.watch(config.coffee.src, ['coffee']);
	gulp.watch(config.images.src, ['images']);
});