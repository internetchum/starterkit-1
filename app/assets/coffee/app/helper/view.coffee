Core 	= require './core'
bb 		= Core.Backbone()
Model = require './model'

user 	= new Model.User()

BaseView = bb.View.extend
						handleProgress: (evt) ->
							percentComplete = 0
							if evt.lengthComputable
								percentComplete = evt.loaded / evt.total
								##console.log(Math.round(percentComplete * 100)+"%")
						initialize: ->
							@render()

module.exports.LoginView = BaseView.extend
		template: require "../../../templates/backend/login"
		# loadStuff: ->
		# 	someModel.fetch
		# 		xhr: ->
		# 			xhr = $.ajaxSettings.xhr()
		# 			xhr.onprogress = @handleProgress
		# 			xhr
		render: ->
			@$el.html @template
		events:
			"click button[data-action=submit]": (e) ->
				e.preventDefault()
				e.stopPropagation()
				@attemptLogin $(e.target).serializeArray()
		attemptLogin: (formData) ->
			$.ajax
				type		: 'POST'
				url			: user.adminLoginUrl
				data 		: formData
				success : (e) ->
					if e.type is 'success'
						newView  = new DashboardView(el: '#app-content')