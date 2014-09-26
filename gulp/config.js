var dest = "./public/assets";
var src  = "./app/assets";

module.exports = {
	// port: 3000,
	sass: {
		src: src+"/sass/styles.scss",
		dest: dest+'/css'
	},
	coffee: {
		src: [src+"/coffee/**/*.coffee", "!"+src+"/coffee/app/**"],
		dest: dest+'/js'
	},
	images: {
		src: src+"/images/**",
		dest: dest+"/images"
	},
	dist: {
		root: dest
	},
	browserify: {
		debug: true,
		extensions: ['.coffee', '.hbs'],
		bundleConfigs: [
		{
			entries: './app/assets/coffee/app/backend/app.coffee',
			dest: dest+'/js/backend',
			outputName: 'app.js'
		}]
	}
};