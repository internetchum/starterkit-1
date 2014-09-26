var util         = require('gulp-util');
var prettyHrTime = require('pretty-hrtime');
var startTime;

module.exports = {
	start: function() {
		startTime = process.hrtime();
		util.log('Running', util.colors.cyan("'bundle'")+"...");
	},
	end: function() {
		var taskTime = prettyHrTime(process.hrtime(startTime));
		util.log('Finished', util.colors.cyan("'bundle'"), 'in', util.colors.green(taskTime));
	}
};