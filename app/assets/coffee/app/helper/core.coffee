module.exports.Backbone 				= require 'backbone'
module.exports.Handlebars 			= require 'hbsfy/runtime'
module.exports.Underscore 			= require 'underscore'

module.exports.Core = ->
	$('html,body *').removeAttr 'disabled'

	unless window.location.origin
		window.location.origin = window.location.protocol+"//"+window.location.host

	$.fn.extend disable: (state) ->
		@each ->
			unless state
				$(this).attr('disabled', 'disabled')
			else
				$(this).prop('disabled', false)
			return

	if $('form.crypt').length
		$('form.crypt').jCryption
			getKeysURL: window.baseURL+'/auth/gen'
			handshakeURL: window.baseURL+'/auth/handshake'

	$.ajaxSetup
		statusCode:
			403: (e) ->
				window.alert 'Forbidden content!'
			404: (e) ->
				window.alert 'Requested route not found!'
			500: (e) ->
				window.alert 'Internal server error!'
		crossDomain: false
		dataType: 'json'
		timeout: 30000
		headers:
			'X-CSRF-Token': $("meta[name=\"_t\"]").attr("content")
		xhr: ->
			xhr = new window.XMLHttpRequest()
			if $('div[role=progressbar]').length
				xhr.upload.addEventListener "progress", ((evt) ->
					if evt.lengthComputable
						percentComplete = evt.loaded / evt.total
						percentComplete = Math.round percentComplete*100
						el = $('div[role=progressbar]')
						el.css 'width', percentComplete+'%'
						el.text percentComplete+'%'
						return
				), false
			xhr

module.exports.ShowMessage = (message, type, el) ->
	$(".status-message").remove()
	html = "<div class='row status-message'><div class='col-lg-12'><div class='alert alert-" + type + "''>" + message + "</div></div></div>"
	$(html).appendTo(el).hide().fadeIn 900