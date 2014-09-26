var browserify	= require('browserify');
var watchify 		= require('watchify');
var gulp				=	require('gulp');
var source			=	require('vinyl-source-stream');
var logger			=	require('../util/logger');
var errors			=	require('../util/errors');
var config			=	require('../config').browserify;

gulp.task('browserify', function(callback)
{
	var bundleQueue = config.bundleConfigs.length;
	var browserifyThis = function(bundleConfig)
	{
		var bundler = browserify({
			cache: {},
			packageCache: {},
			fullPaths: true,
			entries: bundleConfig.entries,
			extensions: config.extensions,
			debug: config.debug
		});

		var bundle = function()
		{
			logger.start(bundleConfig.outputName);

			return bundler
				.bundle()
				.on('error', errors)
				.pipe(source(bundleConfig.outputName))
				.pipe(gulp.dest(bundleConfig.dest))
				.on('end',finished);
		}

		if(global.isWatching)
		{
			bundler = watchify(bundler);
			bundler.on('update', bundle);
		}

		var finished = function()
		{
			logger.end(bundleConfig.outputName);
			if(bundleQueue)
			{
				bundleQueue--;
				if (bundleQueue === 0)
				{
					callback();
				}
			}
		}
		return bundle();
	};

	config.bundleConfigs.forEach(browserifyThis);
});