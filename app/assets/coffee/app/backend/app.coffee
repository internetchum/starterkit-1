Core 	= require '../helper/core'
Core.Core()

View = require '../helper/view'

###*
# Landing view
# @property {Backbone} view
###
if $('meta[name=_uT]').length
	$.post(window.location.origin+'/dashboard/auth-check',
		_t: $('meta[name=_uT]').attr 'content'
	).done (e) ->
		if e.type is 'success'
			view = new View.DashboardView(el: '#app-content')
		else
			view = new View.LoginView(el: '#app-content')
else
	view = new View.LoginView(el: '#app-content')