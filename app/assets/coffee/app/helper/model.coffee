Core 	= require './core'
bb 		= Core.Backbone
bb.$ 	= require 'jquery'

module.exports.User = bb.Model.extend
	defaults:
		'name'	: '',
		'email'	:	'',
		'token'	: ''
	adminLoginUrl: window.location.origin+'/dashboard/user/login'