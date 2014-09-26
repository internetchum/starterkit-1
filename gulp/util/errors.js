var notify  = require("gulp-notify");

module.exports = function() {
	var args = Array.prototype.slice.call(arguments);

	error = notify.onError({
						title: "Compile Error",
						message: "<%= error.message %>"
					}).apply(this, args);

	this.emit('end');
}