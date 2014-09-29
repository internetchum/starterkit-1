var changed		=	require('gulp-changed');
var gulp 			=	require('gulp');
var imagemin	=	require('gulp-imagemin');
var config 		=	require('../config').images;

gulp.task('images', function() {
	return gulp.src(config.src)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}]
		}))
		.pipe(gulp.dest(config.dest));
});