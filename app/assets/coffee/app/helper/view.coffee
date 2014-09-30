Core 							= require './core'
bb 								= Core.Backbone
_									= Core.Underscore
Handlebars 				= Core.Handlebars

bb.$ 							= require 'jquery'
Model 						= require './model'

Handlebars.registerPartial 'header', require '../templates/backend/inc/header'

BaseView = bb.View.extend
						handleProgress: (evt) ->
							percentComplete = 0
							if evt.lengthComputable
								percentComplete = evt.loaded / evt.total
								##console.log(Math.round(percentComplete * 100)+"%")
						initialize: ->
							@render = _.wrap(@render, (render) ->
								@beforeRender()
								render.apply this
								@afterRender()
								return
							)
							@render()
						beforeRender: ->
							return
						afterRender: ->
							return

LoginView = BaseView.extend
		template: require "../templates/backend/login"
		# loadStuff: ->
		# 	someModel.fetch
		# 		xhr: ->
		# 			xhr = $.ajaxSettings.xhr()
		# 			xhr.onprogress = @handleProgress
		# 			xhr
		render: ->
			@$el.html @template
			this
		afterRender: ->
			$('form#loginForm').jCryption
				getKeysURL: window.location.origin+'/dashboard/auth-gen'
				handshakeURL: window.location.origin+'/dashboard/auth-handshake'

			$('form#loginForm').on 'submit', ->
				$this = $(this)
				$.ajax
					type		: 'POST'
					url			: window.location.origin+'/dashboard/user/admin-login'
					data 		: 
						'jCryption': $this.find('input[name=jCryption]').val()
					success : (e) ->
						if e.type is 'success'
							newView  = new DashboardView(el: '#app-content')
							return

						if e.is_reload is true
							if confirm e.message
								window.location.reload()
								return

						Core.ShowMessage '<i class="fa fa-warning"></i> '+e.message, e.type, $this
						$('html,body *').removeAttr 'disabled'
					error		:	(e) ->
						$('html,body *').removeAttr 'disabled'
						console.log e

DashboardView = BaseView.extend
	template: require "../templates/backend/dashboard"
	render: ->
		@$el.html @template
		this

module.exports.LoginView = LoginView
module.exports.DashboardView = DashboardView