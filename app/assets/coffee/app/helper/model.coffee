Core 	= require './core'
bb 		= Core.Backbone()

module.exports.User = bb.Model.extend
	adminLoginUrl: window.location.origin+'/dashboard/login'