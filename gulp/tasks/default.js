var gulp 				= require('gulp');
var runSequence = require('run-sequence');

gulp.task('default', function() {
	runSequence('coffee', 'browserify', 'sass', 'watch');
});

gulp.task('dist', function() {
	runSequence('clean', 'coffee', 'browserify', 'sass', 'minify');
});