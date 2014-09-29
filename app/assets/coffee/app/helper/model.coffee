Core 	= require './core'
bb 		= Core.Backbone
bb.$ 	= require 'jquery'

module.exports.User = bb.Model.extend
	defaults:
		'name'	: '',
		'email'	:	'',
		'token'	: ''
	adminLoginUrl: window.location.origin+'/dashboard/user/login'

module.exports.Util = bb.Model.extend
	logo:
		initialize: ->
			$.get(window.location.origin+'/asset',
				_t: 'logo'
			).done (e) ->
				return