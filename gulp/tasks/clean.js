var gulp 	= require('gulp');
var clean = require('gulp-clean');

gulp.task('clean', function() {
	return gulp.src(['./public/assets/css/styles.css','./public/assets/js'], {read: false})
		.pipe(clean());
});