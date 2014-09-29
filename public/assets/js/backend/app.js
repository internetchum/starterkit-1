(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./app/assets/coffee/app/backend/app.coffee":[function(require,module,exports){
var Core, View, view;

Core = require('../helper/core');

Core.Core();

View = require('../helper/view');


/**
 * Landing view
 * @property {Backbone} view
 */

if ($('meta[name=_uT]').length) {
  $.post(window.location.origin + '/dashboard/auth-check', {
    _t: $('meta[name=_uT]').attr('content')
  }).done(function(e) {
    var view;
    if (e.type === 'success') {
      return view = new View.DashboardView({
        el: '#app-content'
      });
    } else {
      return view = new View.LoginView({
        el: '#app-content'
      });
    }
  });
} else {
  view = new View.LoginView({
    el: '#app-content'
  });
}



},{"../helper/core":"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/core.coffee","../helper/view":"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/view.coffee"}],"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/core.coffee":[function(require,module,exports){
module.exports.Backbone = require('backbone');

module.exports.Handlebars = require('hbsfy/runtime');

module.exports.Underscore = require('underscore');

module.exports.Core = function() {
  $('html,body *').removeAttr('disabled');
  if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.host;
  }
  $.fn.extend({
    disable: function(state) {
      return this.each(function() {
        if (!state) {
          $(this).attr('disabled', 'disabled');
        } else {
          $(this).prop('disabled', false);
        }
      });
    }
  });
  if ($('form.crypt').length) {
    $('form.crypt').jCryption({
      getKeysURL: window.baseURL + '/auth/gen',
      handshakeURL: window.baseURL + '/auth/handshake'
    });
  }
  return $.ajaxSetup({
    statusCode: {
      403: function(e) {
        return window.alert('Forbidden content!');
      },
      404: function(e) {
        return window.alert('Requested route not found!');
      },
      500: function(e) {
        return window.alert('Internal server error!');
      }
    },
    crossDomain: false,
    dataType: 'json',
    timeout: 30000,
    headers: {
      'X-CSRF-Token': $("meta[name=\"_t\"]").attr("content")
    },
    xhr: function() {
      var xhr;
      xhr = new window.XMLHttpRequest();
      if ($('div[role=progressbar]').length) {
        xhr.upload.addEventListener("progress", (function(evt) {
          var el, percentComplete;
          if (evt.lengthComputable) {
            percentComplete = evt.loaded / evt.total;
            percentComplete = Math.round(percentComplete * 100);
            el = $('div[role=progressbar]');
            el.css('width', percentComplete + '%');
            el.text(percentComplete + '%');
          }
        }), false);
      }
      return xhr;
    }
  });
};

module.exports.ShowMessage = function(message, type, el) {
  var html;
  $(".status-message").remove();
  html = "<div class='row status-message'><div class='col-lg-12'><div class='alert alert-" + type + "''>" + message + "</div></div></div>";
  return $(html).appendTo(el).hide().fadeIn(900);
};



},{"backbone":"/home/ford/web/www-surberbo/node_modules/backbone/backbone.js","hbsfy/runtime":"/home/ford/web/www-surberbo/node_modules/hbsfy/runtime.js","underscore":"/home/ford/web/www-surberbo/node_modules/backbone/node_modules/underscore/underscore.js"}],"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/model.coffee":[function(require,module,exports){
var Core, bb;

Core = require('./core');

bb = Core.Backbone;

bb.$ = require('jquery');

module.exports.User = bb.Model.extend({
  defaults: {
    'name': '',
    'email': '',
    'token': ''
  },
  adminLoginUrl: window.location.origin + '/dashboard/user/login'
});

module.exports.Util = bb.Model.extend({
  logo: {
    initialize: function() {
      return $.get(window.location.origin + '/asset', {
        _t: 'logo'
      }).done(function(e) {});
    }
  }
});



},{"./core":"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/core.coffee","jquery":"/home/ford/web/www-surberbo/public/plugins/jquery.min.js"}],"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/view.coffee":[function(require,module,exports){
var BaseView, Core, DashboardView, Handlebars, LoginView, Model, Util, bb, _;

Core = require('./core');

bb = Core.Backbone;

_ = Core.Underscore;

Handlebars = Core.Handlebars;

bb.$ = require('jquery');

Model = require('./model');

Handlebars.registerPartial('header', require('../templates/backend/inc/header'));

Util = new Model.Util();

BaseView = bb.View.extend({
  handleProgress: function(evt) {
    var percentComplete;
    percentComplete = 0;
    if (evt.lengthComputable) {
      return percentComplete = evt.loaded / evt.total;
    }
  },
  logo: Util.logo.initialize(),
  initialize: function() {
    this.render = _.wrap(this.render, function(render) {
      this.beforeRender();
      render.apply(this);
      this.afterRender();
    });
    return this.render();
  },
  beforeRender: function() {},
  afterRender: function() {}
});

LoginView = BaseView.extend({
  template: require("../templates/backend/login"),
  render: function() {
    this.$el.html(this.template);
    return this;
  },
  afterRender: function() {
    $('form#loginForm').jCryption({
      getKeysURL: window.location.origin + '/dashboard/auth-gen',
      handshakeURL: window.location.origin + '/dashboard/auth-handshake'
    });
    return $('form#loginForm').on('submit', function() {
      var $this;
      $this = $(this);
      return $.ajax({
        type: 'POST',
        url: window.location.origin + '/dashboard/user/admin-login',
        data: {
          'jCryption': $this.find('input[name=jCryption]').val()
        },
        success: function(e) {
          var newView;
          if (e.type === 'success') {
            newView = new DashboardView({
              el: '#app-content'
            });
            return;
          }
          if (e.is_reload === true) {
            if (confirm(e.message)) {
              window.location.reload();
              return;
            }
          }
          Core.ShowMessage('<i class="fa fa-warning"></i> ' + e.message, e.type, $this);
          return $('html,body *').removeAttr('disabled');
        },
        error: function(e) {
          $('html,body *').removeAttr('disabled');
          return console.log(e);
        }
      });
    });
  }
});

DashboardView = BaseView.extend({
  template: require("../templates/backend/dashboard"),
  render: function() {
    this.$el.html(this.template({
      logo: this.logo.responseText
    }));
    return this;
  }
});

module.exports.LoginView = LoginView;

module.exports.DashboardView = DashboardView;



},{"../templates/backend/dashboard":"/home/ford/web/www-surberbo/app/assets/coffee/app/templates/backend/dashboard.hbs","../templates/backend/inc/header":"/home/ford/web/www-surberbo/app/assets/coffee/app/templates/backend/inc/header.hbs","../templates/backend/login":"/home/ford/web/www-surberbo/app/assets/coffee/app/templates/backend/login.hbs","./core":"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/core.coffee","./model":"/home/ford/web/www-surberbo/app/assets/coffee/app/helper/model.coffee","jquery":"/home/ford/web/www-surberbo/public/plugins/jquery.min.js"}],"/home/ford/web/www-surberbo/app/assets/coffee/app/templates/backend/dashboard.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "<div class=\"container-fluid\">\n	<div id=\"content\">\n		";
  stack1 = self.invokePartial(partials.header, 'header', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	</div>\n</div>";
  return buffer;
  });

},{"hbsfy/runtime":"/home/ford/web/www-surberbo/node_modules/hbsfy/runtime.js"}],"/home/ford/web/www-surberbo/app/assets/coffee/app/templates/backend/inc/header.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"navbar navbar-default\" role=\"navigation\">\n	<div class=\"container\">\n		<div class=\"navbar-header\">\n			<a href=\"/dashboard\">\n				<img src=\"";
  if (helper = helpers.logo) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.logo); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" width=\"55\" title=\"Logo\" />\n			</a>\n		</div>\n		\n		<div class=\"collapse navbar-collapse\">\n			<ul class=\"nav navbar-nav\">\n				<!-- Admin Modules -->\n				<li class=\"dropdown\">\n					<a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n						Admin <i class=\"fa fa-caret-down\"></i>\n					</a>\n					<ul class=\"dropdown-menu\" role=\"menu\">\n						<li><a href=\"/dashboard/user/logout\"><i class=\"fa fa-signout\"></i> Logout</a></li>\n						<li><a href=\"#\">Menu 2</a></li>\n						<li class=\"divider\"></li>\n						<li><a href=\"#\">Menu 3</a></li>\n					</ul>\n				</li>\n\n				<!-- Frontend Modules -->\n				<li class=\"dropdown\">\n					<a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n						Website <i class=\"fa fa-caret-down\"></i>\n					</a>\n					<ul class=\"dropdown-menu\" role=\"menu\">\n						<li><a href=\"#\">Menu 1</a></li>\n						<li><a href=\"#\">Menu 2</a></li>\n						<li class=\"divider\"></li>\n						<li><a href=\"#\">Menu 3</a></li>\n					</ul>\n				</li>\n			</ul>\n\n			<ul class=\"nav navbar-nav notifications pull-right hidden-xs\">\n				<li class=\"dropdown notif\">\n					<a class=\"dropdown-toggle dropdown-hover\" data-toggle=\"dropdown\" href=\"#\" onclick=\"return false;\">\n						<i class=\"fa fa-to-center fa-comments-o\"></i>\n						<span class=\"badge palette-green-sea\">7</span>\n					</a>\n					<ul class=\"dropdown-menu chat-media-list\">\n						<li class=\"media\">\n							<a class=\"pull-left\" href=\"#\">\n								<img class=\"media-object thumb\" width=\"50\" alt=\"50x50\" src=\"assets/images/av_default.png\" />\n							</a>\n							<div class=\"media-body\">\n								<span class=\"label palette-orange pull-right\">10 minutes ago</span>\n								<h5 class=\"media-heading\">Person 1 Name</h5>\n								<p class=\"margin-none\">\n									Lorem ipsum dolor sit amet...\n								</p>\n							</div>\n						</li>\n\n						<li class=\"media\">\n							<a class=\"pull-left\" href=\"#\">\n								<img class=\"media-object thumb\" width=\"50\" alt=\"50x50\" src=\"assets/images/av_default.png\" />\n							</a>\n							<div class=\"media-body\">\n								<span class=\"label palette-orange pull-right\">2 days ago</span>\n								<h5 class=\"media-heading\">Person 2 Name</h5>\n								<p class=\"margin-none\">\n									Lorem ipsum dolor sit amet...\n								</p>\n							</div>\n						</li>\n\n						<li class=\"media\">\n							<a class=\"pull-left\" href=\"#\">\n								<img class=\"media-object thumb\" width=\"50\" alt=\"50x50\" src=\"assets/images/av_default.png\" />\n							</a>\n							<div class=\"media-body\">\n								<span class=\"label palette-orange pull-right\">10 days ago</span>\n								<h5 class=\"media-heading\">Person 3 Name</h5>\n								<p class=\"margin-none\">\n									Lorem ipsum dolor sit amet...\n								</p>\n							</div>\n						</li>\n\n						<li>\n							<a class=\"btn btn-success\" href=\"#\">\n								<i class=\"fa fa-list\"></i>\n								<span>View All Messages</span>\n							</a>\n						</li>\n					</ul>\n				</li>\n				<li><a href=\"#\">Other Menu</a></li>\n				<li><a href=\"#\">Other Menu 2</a></li>\n			</ul>\n		</div>\n	</div>\n</div>";
  return buffer;
  });

},{"hbsfy/runtime":"/home/ford/web/www-surberbo/node_modules/hbsfy/runtime.js"}],"/home/ford/web/www-surberbo/app/assets/coffee/app/templates/backend/login.hbs":[function(require,module,exports){
// hbsfy compiled Handlebars template
var HandlebarsCompiler = require('hbsfy/runtime');
module.exports = HandlebarsCompiler.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<br />\n<div class=\"container\">\n	<div class=\"row\">\n		<div class=\"dashboard-login\">\n			<p class=\"title to-center\"><b><i class=\"fa fa-lock\"></i> Login to your Account</b></p>\n			\n			<div class=\"page-icon to-center\">\n				<i class=\"fa fa-lock\"></i>\n			</div>\n\n			<div class=\"panel panel-default col-md-6 col-md-offset-3\">\n				<div class=\"panel-body\">\n					<form role=\"form\" id=\"loginForm\" class=\"form-horizontal\" onsubmit=\"return false;\">\n						<div class=\"form-group\">\n							<label class=\"col-md-4 control-label\" for=\"textinput\">Email address</label>  \n							<div class=\"col-md-12\">\n								<input id=\"textinput\" name=\"email\" placeholder=\"email\" class=\"form-control\" type=\"text\" />\n							</div>\n						</div>\n\n						<div class=\"form-group\">\n							<label class=\"col-md-4 control-label\" for=\"passwordinput\">Password</label>\n							<div class=\"col-md-12\">\n								<input id=\"passwordinput\" name=\"password\" placeholder=\"password\" class=\"form-control\" type=\"password\" />\n							</div>\n						</div>\n\n						<div class=\"form-group\">\n							<div class=\"col-md-12\">\n								<button class=\"btn btn-success btn-block\" type=\"submit\">Login</button>\n							</div>\n						</div>\n\n						<div class=\"form-group\">\n							<div class=\"col-md-12\">\n								<div class=\"checkbox no-pad left\">\n									<label for=\"checkboxes-0\" class=\"checkbox\">\n										<input name=\"remember\" class=\"custom-checkbox\" id=\"checkboxes-0\" value=\"1\" type=\"checkbox\" data-toggle=\"checkbox\" />\n										<span class=\"icons\">\n											<span class=\"icon-unchecked\"></span>\n											<span class=\"icon-checked\"></span>\n										</span>\n										<span class=\"text\">\n											Remember my details\n										</span>\n									</label>\n								</div>\n							</div>\n						</div>\n					</form>\n				</div>\n			</div>\n		</div>\n	</div>\n</div>";
  });

},{"hbsfy/runtime":"/home/ford/web/www-surberbo/node_modules/hbsfy/runtime.js"}],"/home/ford/web/www-surberbo/node_modules/backbone/backbone.js":[function(require,module,exports){
//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));

},{"underscore":"/home/ford/web/www-surberbo/node_modules/backbone/node_modules/underscore/underscore.js"}],"/home/ford/web/www-surberbo/node_modules/backbone/node_modules/underscore/underscore.js":[function(require,module,exports){
//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars.runtime.js":[function(require,module,exports){
"use strict";
/*globals Handlebars: true */
var base = require("./handlebars/base");

// Each of these augment the Handlebars object. No need to setup here.
// (This is done to easily share code between commonjs and browse envs)
var SafeString = require("./handlebars/safe-string")["default"];
var Exception = require("./handlebars/exception")["default"];
var Utils = require("./handlebars/utils");
var runtime = require("./handlebars/runtime");

// For compatibility and usage outside of module systems, make the Handlebars object a namespace
var create = function() {
  var hb = new base.HandlebarsEnvironment();

  Utils.extend(hb, base);
  hb.SafeString = SafeString;
  hb.Exception = Exception;
  hb.Utils = Utils;

  hb.VM = runtime;
  hb.template = function(spec) {
    return runtime.template(spec, hb);
  };

  return hb;
};

var Handlebars = create();
Handlebars.create = create;

exports["default"] = Handlebars;
},{"./handlebars/base":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/base.js","./handlebars/exception":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/exception.js","./handlebars/runtime":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/runtime.js","./handlebars/safe-string":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/safe-string.js","./handlebars/utils":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/base.js":[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];

var VERSION = "1.3.0";
exports.VERSION = VERSION;var COMPILER_REVISION = 4;
exports.COMPILER_REVISION = COMPILER_REVISION;
var REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};
exports.REVISION_CHANGES = REVISION_CHANGES;
var isArray = Utils.isArray,
    isFunction = Utils.isFunction,
    toString = Utils.toString,
    objectType = '[object Object]';

function HandlebarsEnvironment(helpers, partials) {
  this.helpers = helpers || {};
  this.partials = partials || {};

  registerDefaultHelpers(this);
}

exports.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
  constructor: HandlebarsEnvironment,

  logger: logger,
  log: log,

  registerHelper: function(name, fn, inverse) {
    if (toString.call(name) === objectType) {
      if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
      Utils.extend(this.helpers, name);
    } else {
      if (inverse) { fn.not = inverse; }
      this.helpers[name] = fn;
    }
  },

  registerPartial: function(name, str) {
    if (toString.call(name) === objectType) {
      Utils.extend(this.partials,  name);
    } else {
      this.partials[name] = str;
    }
  }
};

function registerDefaultHelpers(instance) {
  instance.registerHelper('helperMissing', function(arg) {
    if(arguments.length === 2) {
      return undefined;
    } else {
      throw new Exception("Missing helper: '" + arg + "'");
    }
  });

  instance.registerHelper('blockHelperMissing', function(context, options) {
    var inverse = options.inverse || function() {}, fn = options.fn;

    if (isFunction(context)) { context = context.call(this); }

    if(context === true) {
      return fn(this);
    } else if(context === false || context == null) {
      return inverse(this);
    } else if (isArray(context)) {
      if(context.length > 0) {
        return instance.helpers.each(context, options);
      } else {
        return inverse(this);
      }
    } else {
      return fn(context);
    }
  });

  instance.registerHelper('each', function(context, options) {
    var fn = options.fn, inverse = options.inverse;
    var i = 0, ret = "", data;

    if (isFunction(context)) { context = context.call(this); }

    if (options.data) {
      data = createFrame(options.data);
    }

    if(context && typeof context === 'object') {
      if (isArray(context)) {
        for(var j = context.length; i<j; i++) {
          if (data) {
            data.index = i;
            data.first = (i === 0);
            data.last  = (i === (context.length-1));
          }
          ret = ret + fn(context[i], { data: data });
        }
      } else {
        for(var key in context) {
          if(context.hasOwnProperty(key)) {
            if(data) { 
              data.key = key; 
              data.index = i;
              data.first = (i === 0);
            }
            ret = ret + fn(context[key], {data: data});
            i++;
          }
        }
      }
    }

    if(i === 0){
      ret = inverse(this);
    }

    return ret;
  });

  instance.registerHelper('if', function(conditional, options) {
    if (isFunction(conditional)) { conditional = conditional.call(this); }

    // Default behavior is to render the positive path if the value is truthy and not empty.
    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
    if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  instance.registerHelper('unless', function(conditional, options) {
    return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
  });

  instance.registerHelper('with', function(context, options) {
    if (isFunction(context)) { context = context.call(this); }

    if (!Utils.isEmpty(context)) return options.fn(context);
  });

  instance.registerHelper('log', function(context, options) {
    var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
    instance.log(level, context);
  });
}

var logger = {
  methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

  // State enum
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  level: 3,

  // can be overridden in the host environment
  log: function(level, obj) {
    if (logger.level <= level) {
      var method = logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};
exports.logger = logger;
function log(level, obj) { logger.log(level, obj); }

exports.log = log;var createFrame = function(object) {
  var obj = {};
  Utils.extend(obj, object);
  return obj;
};
exports.createFrame = createFrame;
},{"./exception":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/exception.js":[function(require,module,exports){
"use strict";

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

function Exception(message, node) {
  var line;
  if (node && node.firstLine) {
    line = node.firstLine;

    message += ' - ' + line + ':' + node.firstColumn;
  }

  var tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  if (line) {
    this.lineNumber = line;
    this.column = node.firstColumn;
  }
}

Exception.prototype = new Error();

exports["default"] = Exception;
},{}],"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/runtime.js":[function(require,module,exports){
"use strict";
var Utils = require("./utils");
var Exception = require("./exception")["default"];
var COMPILER_REVISION = require("./base").COMPILER_REVISION;
var REVISION_CHANGES = require("./base").REVISION_CHANGES;

function checkRevision(compilerInfo) {
  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
      currentRevision = COMPILER_REVISION;

  if (compilerRevision !== currentRevision) {
    if (compilerRevision < currentRevision) {
      var runtimeVersions = REVISION_CHANGES[currentRevision],
          compilerVersions = REVISION_CHANGES[compilerRevision];
      throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
            "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
    } else {
      // Use the embedded version info since the runtime doesn't know about this revision yet
      throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
            "Please update your runtime to a newer version ("+compilerInfo[1]+").");
    }
  }
}

exports.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

function template(templateSpec, env) {
  if (!env) {
    throw new Exception("No environment passed to template");
  }

  // Note: Using env.VM references rather than local var references throughout this section to allow
  // for external users to override these as psuedo-supported APIs.
  var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
    var result = env.VM.invokePartial.apply(this, arguments);
    if (result != null) { return result; }

    if (env.compile) {
      var options = { helpers: helpers, partials: partials, data: data };
      partials[name] = env.compile(partial, { data: data !== undefined }, env);
      return partials[name](context, options);
    } else {
      throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    }
  };

  // Just add water
  var container = {
    escapeExpression: Utils.escapeExpression,
    invokePartial: invokePartialWrapper,
    programs: [],
    program: function(i, fn, data) {
      var programWrapper = this.programs[i];
      if(data) {
        programWrapper = program(i, fn, data);
      } else if (!programWrapper) {
        programWrapper = this.programs[i] = program(i, fn);
      }
      return programWrapper;
    },
    merge: function(param, common) {
      var ret = param || common;

      if (param && common && (param !== common)) {
        ret = {};
        Utils.extend(ret, common);
        Utils.extend(ret, param);
      }
      return ret;
    },
    programWithDepth: env.VM.programWithDepth,
    noop: env.VM.noop,
    compilerInfo: null
  };

  return function(context, options) {
    options = options || {};
    var namespace = options.partial ? options : env,
        helpers,
        partials;

    if (!options.partial) {
      helpers = options.helpers;
      partials = options.partials;
    }
    var result = templateSpec.call(
          container,
          namespace, context,
          helpers,
          partials,
          options.data);

    if (!options.partial) {
      env.VM.checkRevision(container.compilerInfo);
    }

    return result;
  };
}

exports.template = template;function programWithDepth(i, fn, data /*, $depth */) {
  var args = Array.prototype.slice.call(arguments, 3);

  var prog = function(context, options) {
    options = options || {};

    return fn.apply(this, [context, options.data || data].concat(args));
  };
  prog.program = i;
  prog.depth = args.length;
  return prog;
}

exports.programWithDepth = programWithDepth;function program(i, fn, data) {
  var prog = function(context, options) {
    options = options || {};

    return fn(context, options.data || data);
  };
  prog.program = i;
  prog.depth = 0;
  return prog;
}

exports.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
  var options = { partial: true, helpers: helpers, partials: partials, data: data };

  if(partial === undefined) {
    throw new Exception("The partial " + name + " could not be found");
  } else if(partial instanceof Function) {
    return partial(context, options);
  }
}

exports.invokePartial = invokePartial;function noop() { return ""; }

exports.noop = noop;
},{"./base":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/base.js","./exception":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/exception.js","./utils":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/utils.js"}],"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/safe-string.js":[function(require,module,exports){
"use strict";
// Build out our basic SafeString type
function SafeString(string) {
  this.string = string;
}

SafeString.prototype.toString = function() {
  return "" + this.string;
};

exports["default"] = SafeString;
},{}],"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/utils.js":[function(require,module,exports){
"use strict";
/*jshint -W004 */
var SafeString = require("./safe-string")["default"];

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

function escapeChar(chr) {
  return escape[chr] || "&amp;";
}

function extend(obj, value) {
  for(var key in value) {
    if(Object.prototype.hasOwnProperty.call(value, key)) {
      obj[key] = value[key];
    }
  }
}

exports.extend = extend;var toString = Object.prototype.toString;
exports.toString = toString;
// Sourced from lodash
// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
var isFunction = function(value) {
  return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
  isFunction = function(value) {
    return typeof value === 'function' && toString.call(value) === '[object Function]';
  };
}
var isFunction;
exports.isFunction = isFunction;
var isArray = Array.isArray || function(value) {
  return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
};
exports.isArray = isArray;

function escapeExpression(string) {
  // don't escape SafeStrings, since they're already safe
  if (string instanceof SafeString) {
    return string.toString();
  } else if (!string && string !== 0) {
    return "";
  }

  // Force a string conversion as this will be done by the append regardless and
  // the regex test will do this transparently behind the scenes, causing issues if
  // an object's to string has escaped characters in it.
  string = "" + string;

  if(!possible.test(string)) { return string; }
  return string.replace(badChars, escapeChar);
}

exports.escapeExpression = escapeExpression;function isEmpty(value) {
  if (!value && value !== 0) {
    return true;
  } else if (isArray(value) && value.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.isEmpty = isEmpty;
},{"./safe-string":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars/safe-string.js"}],"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/runtime.js":[function(require,module,exports){
// Create a simple path alias to allow browserify to resolve
// the runtime on a supported path.
module.exports = require('./dist/cjs/handlebars.runtime');

},{"./dist/cjs/handlebars.runtime":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/dist/cjs/handlebars.runtime.js"}],"/home/ford/web/www-surberbo/node_modules/hbsfy/runtime.js":[function(require,module,exports){
module.exports = require("handlebars/runtime")["default"];

},{"handlebars/runtime":"/home/ford/web/www-surberbo/node_modules/hbsfy/node_modules/handlebars/runtime.js"}],"/home/ford/web/www-surberbo/public/plugins/jquery.min.js":[function(require,module,exports){
/*! jQuery v2.1.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.1",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C="undefined",D=1<<31,E={}.hasOwnProperty,F=[],G=F.pop,H=F.push,I=F.push,J=F.slice,K=F.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",N="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=N.replace("w","w#"),P="\\["+M+"*("+N+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+O+"))|)"+M+"*\\]",Q=":("+N+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+P+")*)|.*)\\)|)",R=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),S=new RegExp("^"+M+"*,"+M+"*"),T=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),V=new RegExp(Q),W=new RegExp("^"+O+"$"),X={ID:new RegExp("^#("+N+")"),CLASS:new RegExp("^\\.("+N+")"),TAG:new RegExp("^("+N.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+Q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{I.apply(F=J.call(v.childNodes),v.childNodes),F[v.childNodes.length].nodeType}catch(eb){I={apply:F.length?function(a,b){H.apply(a,J.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],!a||"string"!=typeof a)return d;if(1!==(k=b.nodeType)&&9!==k)return[];if(p&&!e){if(f=_.exec(a))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return I.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return I.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=ab.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return I.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||D)-(~a.sourceIndex||D);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&typeof a.getElementsByTagName!==C&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,o=e.documentElement,p=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()})),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(e.getElementsByClassName)&&ib(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=ib(function(a){return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==C&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c=typeof a.getAttributeNode!==C&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==C&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(e.querySelectorAll))&&(ib(function(a){a.innerHTML="<select msallowclip=''><option selected=''></option></select>",a.querySelectorAll("[msallowclip^='']").length&&q.push("[*^$]="+M+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+M+"*(?:value|"+L+")"),a.querySelectorAll(":checked").length||q.push(":checked")}),ib(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+M+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",Q)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?K.call(k,a)-K.call(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?K.call(k,a)-K.call(k,b):0;if(f===g)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&E.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[3]||a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+M+")"+a+"("+M+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=K.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return W.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?K.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):I.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return K.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=G.call(i));s=ub(s)}I.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}return h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return I.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(L,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fb}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+Math.random()}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)
},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var ab=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,bb=/<([\w:]+)/,cb=/<|&#?\w+;/,db=/<(?:script|style|link)/i,eb=/checked\s*(?:[^=]|=\s*.checked.)/i,fb=/^$|\/(?:java|ecma)script/i,gb=/^true\/(.*)/,hb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ib={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ib.optgroup=ib.option,ib.tbody=ib.tfoot=ib.colgroup=ib.caption=ib.thead,ib.th=ib.td;function jb(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function kb(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function lb(a){var b=gb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function mb(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function nb(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function ob(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pb(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=ob(h),f=ob(a),d=0,e=f.length;e>d;d++)pb(f[d],g[d]);if(b)if(c)for(f=f||ob(a),g=g||ob(h),d=0,e=f.length;e>d;d++)nb(f[d],g[d]);else nb(a,h);return g=ob(h,"script"),g.length>0&&mb(g,!i&&ob(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(cb.test(e)){f=f||k.appendChild(b.createElement("div")),g=(bb.exec(e)||["",""])[1].toLowerCase(),h=ib[g]||ib._default,f.innerHTML=h[1]+e.replace(ab,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=ob(k.appendChild(e),"script"),i&&mb(f),c)){j=0;while(e=f[j++])fb.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=jb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(ob(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&mb(ob(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(ob(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!db.test(a)&&!ib[(bb.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(ab,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(ob(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(ob(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&eb.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(ob(c,"script"),kb),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,ob(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,lb),j=0;g>j;j++)h=f[j],fb.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(hb,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qb,rb={};function sb(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function tb(a){var b=l,c=rb[a];return c||(c=sb(a,b),"none"!==c&&c||(qb=(qb||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qb[0].contentDocument,b.write(),b.close(),c=sb(a,b),qb.detach()),rb[a]=c),c}var ub=/^margin/,vb=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wb=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)};function xb(a,b,c){var d,e,f,g,h=a.style;return c=c||wb(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),vb.test(g)&&ub.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function yb(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var zb=/^(none|table(?!-c[ea]).+)/,Ab=new RegExp("^("+Q+")(.*)$","i"),Bb=new RegExp("^([+-])=("+Q+")","i"),Cb={position:"absolute",visibility:"hidden",display:"block"},Db={letterSpacing:"0",fontWeight:"400"},Eb=["Webkit","O","Moz","ms"];function Fb(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Eb.length;while(e--)if(b=Eb[e]+c,b in a)return b;return d}function Gb(a,b,c){var d=Ab.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Hb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ib(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wb(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xb(a,b,f),(0>e||null==e)&&(e=a.style[b]),vb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Hb(a,b,c||(g?"border":"content"),d,f)+"px"}function Jb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",tb(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fb(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Bb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fb(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xb(a,b,d)),"normal"===e&&b in Db&&(e=Db[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?zb.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Cb,function(){return Ib(a,b,d)}):Ib(a,b,d):void 0},set:function(a,c,d){var e=d&&wb(a);return Gb(a,c,d?Hb(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=yb(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xb,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ub.test(a)||(n.cssHooks[a+b].set=Gb)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wb(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Jb(this,!0)},hide:function(){return Jb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Kb(a,b,c,d,e){return new Kb.prototype.init(a,b,c,d,e)}n.Tween=Kb,Kb.prototype={constructor:Kb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Kb.propHooks[this.prop];return a&&a.get?a.get(this):Kb.propHooks._default.get(this)},run:function(a){var b,c=Kb.propHooks[this.prop];return this.pos=b=this.options.duration?n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Kb.propHooks._default.set(this),this}},Kb.prototype.init.prototype=Kb.prototype,Kb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Kb.propHooks.scrollTop=Kb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Kb.prototype.init,n.fx.step={};var Lb,Mb,Nb=/^(?:toggle|show|hide)$/,Ob=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pb=/queueHooks$/,Qb=[Vb],Rb={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Ob.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Ob.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sb(){return setTimeout(function(){Lb=void 0}),Lb=n.now()}function Tb(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ub(a,b,c){for(var d,e=(Rb[b]||[]).concat(Rb["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Vb(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||tb(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Nb.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?tb(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ub(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wb(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xb(a,b,c){var d,e,f=0,g=Qb.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Lb||Sb(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Lb||Sb(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wb(k,j.opts.specialEasing);g>f;f++)if(d=Qb[f].call(j,a,k,j.opts))return d;return n.map(k,Ub,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xb,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Rb[c]=Rb[c]||[],Rb[c].unshift(b)},prefilter:function(a,b){b?Qb.unshift(a):Qb.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xb(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pb.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Tb(b,!0),a,d,e)}}),n.each({slideDown:Tb("show"),slideUp:Tb("hide"),slideToggle:Tb("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Lb=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Lb=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Mb||(Mb=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Mb),Mb=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Yb,Zb,$b=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Zb:Yb)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))
},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Zb={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$b[b]||n.find.attr;$b[b]=function(a,b,d){var e,f;return d||(f=$b[b],$b[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$b[b]=f),e}});var _b=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_b.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ac=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ac," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ac," ").indexOf(b)>=0)return!0;return!1}});var bc=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bc,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cc=n.now(),dc=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var ec,fc,gc=/#.*$/,hc=/([?&])_=[^&]*/,ic=/^(.*?):[ \t]*([^\r\n]*)$/gm,jc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,kc=/^(?:GET|HEAD)$/,lc=/^\/\//,mc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,nc={},oc={},pc="*/".concat("*");try{fc=location.href}catch(qc){fc=l.createElement("a"),fc.href="",fc=fc.href}ec=mc.exec(fc.toLowerCase())||[];function rc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function sc(a,b,c,d){var e={},f=a===oc;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function tc(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function uc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function vc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:fc,type:"GET",isLocal:jc.test(ec[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":pc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?tc(tc(a,n.ajaxSettings),b):tc(n.ajaxSettings,a)},ajaxPrefilter:rc(nc),ajaxTransport:rc(oc),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=ic.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||fc)+"").replace(gc,"").replace(lc,ec[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=mc.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===ec[1]&&h[2]===ec[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(ec[3]||("http:"===ec[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),sc(nc,k,b,v),2===t)return v;i=k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!kc.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(dc.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=hc.test(d)?d.replace(hc,"$1_="+cc++):d+(dc.test(d)?"&":"?")+"_="+cc++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+pc+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=sc(oc,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=uc(k,v,f)),u=vc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var wc=/%20/g,xc=/\[\]$/,yc=/\r?\n/g,zc=/^(?:submit|button|image|reset|file)$/i,Ac=/^(?:input|select|textarea|keygen)/i;function Bc(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||xc.test(a)?d(a,e):Bc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Bc(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Bc(c,a[c],b,e);return d.join("&").replace(wc,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Ac.test(this.nodeName)&&!zc.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(yc,"\r\n")}}):{name:b.name,value:c.replace(yc,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Cc=0,Dc={},Ec={0:200,1223:204},Fc=n.ajaxSettings.xhr();a.ActiveXObject&&n(a).on("unload",function(){for(var a in Dc)Dc[a]()}),k.cors=!!Fc&&"withCredentials"in Fc,k.ajax=Fc=!!Fc,n.ajaxTransport(function(a){var b;return k.cors||Fc&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Cc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Dc[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Ec[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Dc[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Gc=[],Hc=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Gc.pop()||n.expando+"_"+cc++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Hc.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Hc.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Hc,"$1"+e):b.jsonp!==!1&&(b.url+=(dc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Gc.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Ic=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Ic)return Ic.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Jc=a.document.documentElement;function Kc(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Kc(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Jc;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Jc})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Kc(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=yb(k.pixelPosition,function(a,c){return c?(c=xb(a,b),vb.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Lc=a.jQuery,Mc=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Mc),b&&a.jQuery===n&&(a.jQuery=Lc),n},typeof b===U&&(a.jQuery=a.$=n),n});
//# sourceMappingURL=jquery.min.map
},{}]},{},["./app/assets/coffee/app/backend/app.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2ZvcmQvd2ViL3d3dy1zdXJiZXJiby9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZm9yZC93ZWIvd3d3LXN1cmJlcmJvL2FwcC9hc3NldHMvY29mZmVlL2FwcC9iYWNrZW5kL2FwcC5jb2ZmZWUiLCIvaG9tZS9mb3JkL3dlYi93d3ctc3VyYmVyYm8vYXBwL2Fzc2V0cy9jb2ZmZWUvYXBwL2hlbHBlci9jb3JlLmNvZmZlZSIsIi9ob21lL2ZvcmQvd2ViL3d3dy1zdXJiZXJiby9hcHAvYXNzZXRzL2NvZmZlZS9hcHAvaGVscGVyL21vZGVsLmNvZmZlZSIsIi9ob21lL2ZvcmQvd2ViL3d3dy1zdXJiZXJiby9hcHAvYXNzZXRzL2NvZmZlZS9hcHAvaGVscGVyL3ZpZXcuY29mZmVlIiwiL2hvbWUvZm9yZC93ZWIvd3d3LXN1cmJlcmJvL2FwcC9hc3NldHMvY29mZmVlL2FwcC90ZW1wbGF0ZXMvYmFja2VuZC9kYXNoYm9hcmQuaGJzIiwiL2hvbWUvZm9yZC93ZWIvd3d3LXN1cmJlcmJvL2FwcC9hc3NldHMvY29mZmVlL2FwcC90ZW1wbGF0ZXMvYmFja2VuZC9pbmMvaGVhZGVyLmhicyIsIi9ob21lL2ZvcmQvd2ViL3d3dy1zdXJiZXJiby9hcHAvYXNzZXRzL2NvZmZlZS9hcHAvdGVtcGxhdGVzL2JhY2tlbmQvbG9naW4uaGJzIiwiL2hvbWUvZm9yZC93ZWIvd3d3LXN1cmJlcmJvL25vZGVfbW9kdWxlcy9iYWNrYm9uZS9iYWNrYm9uZS5qcyIsIi9ob21lL2ZvcmQvd2ViL3d3dy1zdXJiZXJiby9ub2RlX21vZHVsZXMvYmFja2JvbmUvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIi9ob21lL2ZvcmQvd2ViL3d3dy1zdXJiZXJiby9ub2RlX21vZHVsZXMvaGJzZnkvbm9kZV9tb2R1bGVzL2hhbmRsZWJhcnMvZGlzdC9janMvaGFuZGxlYmFycy5ydW50aW1lLmpzIiwiL2hvbWUvZm9yZC93ZWIvd3d3LXN1cmJlcmJvL25vZGVfbW9kdWxlcy9oYnNmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL2Jhc2UuanMiLCIvaG9tZS9mb3JkL3dlYi93d3ctc3VyYmVyYm8vbm9kZV9tb2R1bGVzL2hic2Z5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvZXhjZXB0aW9uLmpzIiwiL2hvbWUvZm9yZC93ZWIvd3d3LXN1cmJlcmJvL25vZGVfbW9kdWxlcy9oYnNmeS9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy9kaXN0L2Nqcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCIvaG9tZS9mb3JkL3dlYi93d3ctc3VyYmVyYm8vbm9kZV9tb2R1bGVzL2hic2Z5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvc2FmZS1zdHJpbmcuanMiLCIvaG9tZS9mb3JkL3dlYi93d3ctc3VyYmVyYm8vbm9kZV9tb2R1bGVzL2hic2Z5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL2Rpc3QvY2pzL2hhbmRsZWJhcnMvdXRpbHMuanMiLCIvaG9tZS9mb3JkL3dlYi93d3ctc3VyYmVyYm8vbm9kZV9tb2R1bGVzL2hic2Z5L25vZGVfbW9kdWxlcy9oYW5kbGViYXJzL3J1bnRpbWUuanMiLCIvaG9tZS9mb3JkL3dlYi93d3ctc3VyYmVyYm8vbm9kZV9tb2R1bGVzL2hic2Z5L3J1bnRpbWUuanMiLCIvaG9tZS9mb3JkL3dlYi93d3ctc3VyYmVyYm8vcHVibGljL3BsdWdpbnMvanF1ZXJ5Lm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsZ0JBQUE7O0FBQUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxnQkFBUixDQUFSLENBQUE7O0FBQUEsSUFDSSxDQUFDLElBQUwsQ0FBQSxDQURBLENBQUE7O0FBQUEsSUFHQSxHQUFPLE9BQUEsQ0FBUSxnQkFBUixDQUhQLENBQUE7O0FBS0E7QUFBQTs7O0dBTEE7O0FBU0EsSUFBRyxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxNQUF2QjtBQUNDLEVBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLEdBQXVCLHVCQUE5QixFQUNDO0FBQUEsSUFBQSxFQUFBLEVBQUksQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsU0FBekIsQ0FBSjtHQURELENBRUMsQ0FBQyxJQUZGLENBRU8sU0FBQyxDQUFELEdBQUE7QUFDTixRQUFBLElBQUE7QUFBQSxJQUFBLElBQUcsQ0FBQyxDQUFDLElBQUYsS0FBVSxTQUFiO2FBQ0MsSUFBQSxHQUFXLElBQUEsSUFBSSxDQUFDLGFBQUwsQ0FBbUI7QUFBQSxRQUFBLEVBQUEsRUFBSSxjQUFKO09BQW5CLEVBRFo7S0FBQSxNQUFBO2FBR0MsSUFBQSxHQUFXLElBQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZTtBQUFBLFFBQUEsRUFBQSxFQUFJLGNBQUo7T0FBZixFQUhaO0tBRE07RUFBQSxDQUZQLENBQUEsQ0FERDtDQUFBLE1BQUE7QUFTQyxFQUFBLElBQUEsR0FBVyxJQUFBLElBQUksQ0FBQyxTQUFMLENBQWU7QUFBQSxJQUFBLEVBQUEsRUFBSSxjQUFKO0dBQWYsQ0FBWCxDQVREO0NBVEE7Ozs7O0FDQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFmLEdBQThCLE9BQUEsQ0FBUSxVQUFSLENBQTlCLENBQUE7O0FBQUEsTUFDTSxDQUFDLE9BQU8sQ0FBQyxVQUFmLEdBQStCLE9BQUEsQ0FBUSxlQUFSLENBRC9CLENBQUE7O0FBQUEsTUFFTSxDQUFDLE9BQU8sQ0FBQyxVQUFmLEdBQStCLE9BQUEsQ0FBUSxZQUFSLENBRi9CLENBQUE7O0FBQUEsTUFJTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLFNBQUEsR0FBQTtBQUNyQixFQUFBLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsVUFBakIsQ0FBNEIsVUFBNUIsQ0FBQSxDQUFBO0FBRUEsRUFBQSxJQUFBLENBQUEsTUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUF2QjtBQUNDLElBQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixHQUF5QixNQUFNLENBQUMsUUFBUSxDQUFDLFFBQWhCLEdBQXlCLElBQXpCLEdBQThCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBdkUsQ0FERDtHQUZBO0FBQUEsRUFLQSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQUwsQ0FBWTtBQUFBLElBQUEsT0FBQSxFQUFTLFNBQUMsS0FBRCxHQUFBO2FBQ3BCLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBQSxHQUFBO0FBQ0wsUUFBQSxJQUFBLENBQUEsS0FBQTtBQUNDLFVBQUEsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBYSxVQUFiLEVBQXlCLFVBQXpCLENBQUEsQ0FERDtTQUFBLE1BQUE7QUFHQyxVQUFBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsVUFBYixFQUF5QixLQUF6QixDQUFBLENBSEQ7U0FESztNQUFBLENBQU4sRUFEb0I7SUFBQSxDQUFUO0dBQVosQ0FMQSxDQUFBO0FBYUEsRUFBQSxJQUFHLENBQUEsQ0FBRSxZQUFGLENBQWUsQ0FBQyxNQUFuQjtBQUNDLElBQUEsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLFNBQWhCLENBQ0M7QUFBQSxNQUFBLFVBQUEsRUFBWSxNQUFNLENBQUMsT0FBUCxHQUFlLFdBQTNCO0FBQUEsTUFDQSxZQUFBLEVBQWMsTUFBTSxDQUFDLE9BQVAsR0FBZSxpQkFEN0I7S0FERCxDQUFBLENBREQ7R0FiQTtTQWtCQSxDQUFDLENBQUMsU0FBRixDQUNDO0FBQUEsSUFBQSxVQUFBLEVBQ0M7QUFBQSxNQUFBLEdBQUEsRUFBSyxTQUFDLENBQUQsR0FBQTtlQUNKLE1BQU0sQ0FBQyxLQUFQLENBQWEsb0JBQWIsRUFESTtNQUFBLENBQUw7QUFBQSxNQUVBLEdBQUEsRUFBSyxTQUFDLENBQUQsR0FBQTtlQUNKLE1BQU0sQ0FBQyxLQUFQLENBQWEsNEJBQWIsRUFESTtNQUFBLENBRkw7QUFBQSxNQUlBLEdBQUEsRUFBSyxTQUFDLENBQUQsR0FBQTtlQUNKLE1BQU0sQ0FBQyxLQUFQLENBQWEsd0JBQWIsRUFESTtNQUFBLENBSkw7S0FERDtBQUFBLElBT0EsV0FBQSxFQUFhLEtBUGI7QUFBQSxJQVFBLFFBQUEsRUFBVSxNQVJWO0FBQUEsSUFTQSxPQUFBLEVBQVMsS0FUVDtBQUFBLElBVUEsT0FBQSxFQUNDO0FBQUEsTUFBQSxjQUFBLEVBQWdCLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLElBQXZCLENBQTRCLFNBQTVCLENBQWhCO0tBWEQ7QUFBQSxJQVlBLEdBQUEsRUFBSyxTQUFBLEdBQUE7QUFDSixVQUFBLEdBQUE7QUFBQSxNQUFBLEdBQUEsR0FBVSxJQUFBLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFHLENBQUEsQ0FBRSx1QkFBRixDQUEwQixDQUFDLE1BQTlCO0FBQ0MsUUFBQSxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFYLENBQTRCLFVBQTVCLEVBQXdDLENBQUMsU0FBQyxHQUFELEdBQUE7QUFDeEMsY0FBQSxtQkFBQTtBQUFBLFVBQUEsSUFBRyxHQUFHLENBQUMsZ0JBQVA7QUFDQyxZQUFBLGVBQUEsR0FBa0IsR0FBRyxDQUFDLE1BQUosR0FBYSxHQUFHLENBQUMsS0FBbkMsQ0FBQTtBQUFBLFlBQ0EsZUFBQSxHQUFrQixJQUFJLENBQUMsS0FBTCxDQUFXLGVBQUEsR0FBZ0IsR0FBM0IsQ0FEbEIsQ0FBQTtBQUFBLFlBRUEsRUFBQSxHQUFLLENBQUEsQ0FBRSx1QkFBRixDQUZMLENBQUE7QUFBQSxZQUdBLEVBQUUsQ0FBQyxHQUFILENBQU8sT0FBUCxFQUFnQixlQUFBLEdBQWdCLEdBQWhDLENBSEEsQ0FBQTtBQUFBLFlBSUEsRUFBRSxDQUFDLElBQUgsQ0FBUSxlQUFBLEdBQWdCLEdBQXhCLENBSkEsQ0FERDtXQUR3QztRQUFBLENBQUQsQ0FBeEMsRUFRRyxLQVJILENBQUEsQ0FERDtPQURBO2FBV0EsSUFaSTtJQUFBLENBWkw7R0FERCxFQW5CcUI7QUFBQSxDQUp0QixDQUFBOztBQUFBLE1Ba0RNLENBQUMsT0FBTyxDQUFDLFdBQWYsR0FBNkIsU0FBQyxPQUFELEVBQVUsSUFBVixFQUFnQixFQUFoQixHQUFBO0FBQzVCLE1BQUEsSUFBQTtBQUFBLEVBQUEsQ0FBQSxDQUFFLGlCQUFGLENBQW9CLENBQUMsTUFBckIsQ0FBQSxDQUFBLENBQUE7QUFBQSxFQUNBLElBQUEsR0FBTyxpRkFBQSxHQUFvRixJQUFwRixHQUEyRixLQUEzRixHQUFtRyxPQUFuRyxHQUE2RyxvQkFEcEgsQ0FBQTtTQUVBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxRQUFSLENBQWlCLEVBQWpCLENBQW9CLENBQUMsSUFBckIsQ0FBQSxDQUEyQixDQUFDLE1BQTVCLENBQW1DLEdBQW5DLEVBSDRCO0FBQUEsQ0FsRDdCLENBQUE7Ozs7O0FDQUEsSUFBQSxRQUFBOztBQUFBLElBQUEsR0FBUSxPQUFBLENBQVEsUUFBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxHQUFPLElBQUksQ0FBQyxRQURaLENBQUE7O0FBQUEsRUFFRSxDQUFDLENBQUgsR0FBUSxPQUFBLENBQVEsUUFBUixDQUZSLENBQUE7O0FBQUEsTUFJTSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBVCxDQUNyQjtBQUFBLEVBQUEsUUFBQSxFQUNDO0FBQUEsSUFBQSxNQUFBLEVBQVMsRUFBVDtBQUFBLElBQ0EsT0FBQSxFQUFVLEVBRFY7QUFBQSxJQUVBLE9BQUEsRUFBVSxFQUZWO0dBREQ7QUFBQSxFQUlBLGFBQUEsRUFBZSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLEdBQXVCLHVCQUp0QztDQURxQixDQUp0QixDQUFBOztBQUFBLE1BV00sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixFQUFFLENBQUMsS0FBSyxDQUFDLE1BQVQsQ0FDckI7QUFBQSxFQUFBLElBQUEsRUFDQztBQUFBLElBQUEsVUFBQSxFQUFZLFNBQUEsR0FBQTthQUNYLENBQUMsQ0FBQyxHQUFGLENBQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixHQUF1QixRQUE3QixFQUNDO0FBQUEsUUFBQSxFQUFBLEVBQUksTUFBSjtPQURELENBRUMsQ0FBQyxJQUZGLENBRU8sU0FBQyxDQUFELEdBQUEsQ0FGUCxFQURXO0lBQUEsQ0FBWjtHQUREO0NBRHFCLENBWHRCLENBQUE7Ozs7O0FDQUEsSUFBQSx3RUFBQTs7QUFBQSxJQUFBLEdBQWMsT0FBQSxDQUFRLFFBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsR0FBYSxJQUFJLENBQUMsUUFEbEIsQ0FBQTs7QUFBQSxDQUVBLEdBQVksSUFBSSxDQUFDLFVBRmpCLENBQUE7O0FBQUEsVUFHQSxHQUFpQixJQUFJLENBQUMsVUFIdEIsQ0FBQTs7QUFBQSxFQUtFLENBQUMsQ0FBSCxHQUFjLE9BQUEsQ0FBUSxRQUFSLENBTGQsQ0FBQTs7QUFBQSxLQU1BLEdBQWMsT0FBQSxDQUFRLFNBQVIsQ0FOZCxDQUFBOztBQUFBLFVBUVUsQ0FBQyxlQUFYLENBQTJCLFFBQTNCLEVBQXFDLE9BQUEsQ0FBUSxpQ0FBUixDQUFyQyxDQVJBLENBQUE7O0FBQUEsSUFVQSxHQUFXLElBQUEsS0FBSyxDQUFDLElBQU4sQ0FBQSxDQVZYLENBQUE7O0FBQUEsUUFZQSxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBUixDQUNMO0FBQUEsRUFBQSxjQUFBLEVBQWdCLFNBQUMsR0FBRCxHQUFBO0FBQ2YsUUFBQSxlQUFBO0FBQUEsSUFBQSxlQUFBLEdBQWtCLENBQWxCLENBQUE7QUFDQSxJQUFBLElBQUcsR0FBRyxDQUFDLGdCQUFQO2FBQ0MsZUFBQSxHQUFrQixHQUFHLENBQUMsTUFBSixHQUFhLEdBQUcsQ0FBQyxNQURwQztLQUZlO0VBQUEsQ0FBaEI7QUFBQSxFQUtBLElBQUEsRUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVYsQ0FBQSxDQUxOO0FBQUEsRUFNQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1gsSUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLE1BQVIsRUFBZ0IsU0FBQyxNQUFELEdBQUE7QUFDekIsTUFBQSxJQUFDLENBQUEsWUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFiLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUZBLENBRHlCO0lBQUEsQ0FBaEIsQ0FBVixDQUFBO1dBTUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQVBXO0VBQUEsQ0FOWjtBQUFBLEVBY0EsWUFBQSxFQUFjLFNBQUEsR0FBQSxDQWRkO0FBQUEsRUFnQkEsV0FBQSxFQUFhLFNBQUEsR0FBQSxDQWhCYjtDQURLLENBWlgsQ0FBQTs7QUFBQSxTQWdDQSxHQUFZLFFBQVEsQ0FBQyxNQUFULENBQ1Y7QUFBQSxFQUFBLFFBQUEsRUFBVSxPQUFBLENBQVEsNEJBQVIsQ0FBVjtBQUFBLEVBT0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNQLElBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLFFBQVgsQ0FBQSxDQUFBO1dBQ0EsS0FGTztFQUFBLENBUFI7QUFBQSxFQVVBLFdBQUEsRUFBYSxTQUFBLEdBQUE7QUFDWixJQUFBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLFNBQXBCLENBQ0M7QUFBQSxNQUFBLFVBQUEsRUFBWSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLEdBQXVCLHFCQUFuQztBQUFBLE1BQ0EsWUFBQSxFQUFjLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBaEIsR0FBdUIsMkJBRHJDO0tBREQsQ0FBQSxDQUFBO1dBSUEsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsRUFBcEIsQ0FBdUIsUUFBdkIsRUFBaUMsU0FBQSxHQUFBO0FBQ2hDLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLENBQUEsQ0FBRSxJQUFGLENBQVIsQ0FBQTthQUNBLENBQUMsQ0FBQyxJQUFGLENBQ0M7QUFBQSxRQUFBLElBQUEsRUFBUSxNQUFSO0FBQUEsUUFDQSxHQUFBLEVBQVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixHQUF1Qiw2QkFEL0I7QUFBQSxRQUVBLElBQUEsRUFDQztBQUFBLFVBQUEsV0FBQSxFQUFhLEtBQUssQ0FBQyxJQUFOLENBQVcsdUJBQVgsQ0FBbUMsQ0FBQyxHQUFwQyxDQUFBLENBQWI7U0FIRDtBQUFBLFFBSUEsT0FBQSxFQUFVLFNBQUMsQ0FBRCxHQUFBO0FBQ1QsY0FBQSxPQUFBO0FBQUEsVUFBQSxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsU0FBYjtBQUNDLFlBQUEsT0FBQSxHQUFlLElBQUEsYUFBQSxDQUFjO0FBQUEsY0FBQSxFQUFBLEVBQUksY0FBSjthQUFkLENBQWYsQ0FBQTtBQUNBLGtCQUFBLENBRkQ7V0FBQTtBQUlBLFVBQUEsSUFBRyxDQUFDLENBQUMsU0FBRixLQUFlLElBQWxCO0FBQ0MsWUFBQSxJQUFHLE9BQUEsQ0FBUSxDQUFDLENBQUMsT0FBVixDQUFIO0FBQ0MsY0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLENBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FGRDthQUREO1dBSkE7QUFBQSxVQVNBLElBQUksQ0FBQyxXQUFMLENBQWlCLGdDQUFBLEdBQWlDLENBQUMsQ0FBQyxPQUFwRCxFQUE2RCxDQUFDLENBQUMsSUFBL0QsRUFBcUUsS0FBckUsQ0FUQSxDQUFBO2lCQVVBLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsVUFBakIsQ0FBNEIsVUFBNUIsRUFYUztRQUFBLENBSlY7QUFBQSxRQWdCQSxLQUFBLEVBQVMsU0FBQyxDQUFELEdBQUE7QUFDUixVQUFBLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsVUFBakIsQ0FBNEIsVUFBNUIsQ0FBQSxDQUFBO2lCQUNBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWixFQUZRO1FBQUEsQ0FoQlQ7T0FERCxFQUZnQztJQUFBLENBQWpDLEVBTFk7RUFBQSxDQVZiO0NBRFUsQ0FoQ1osQ0FBQTs7QUFBQSxhQXVFQSxHQUFnQixRQUFRLENBQUMsTUFBVCxDQUNmO0FBQUEsRUFBQSxRQUFBLEVBQVUsT0FBQSxDQUFRLGdDQUFSLENBQVY7QUFBQSxFQUNBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFDUCxJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxRQUFELENBQ1Q7QUFBQSxNQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVo7S0FEUyxDQUFWLENBQUEsQ0FBQTtXQUVBLEtBSE87RUFBQSxDQURSO0NBRGUsQ0F2RWhCLENBQUE7O0FBQUEsTUE4RU0sQ0FBQyxPQUFPLENBQUMsU0FBZixHQUEyQixTQTlFM0IsQ0FBQTs7QUFBQSxNQStFTSxDQUFDLE9BQU8sQ0FBQyxhQUFmLEdBQStCLGFBL0UvQixDQUFBOzs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hrREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3Y0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkNvcmUgXHQ9IHJlcXVpcmUgJy4uL2hlbHBlci9jb3JlJ1xuQ29yZS5Db3JlKClcblxuVmlldyA9IHJlcXVpcmUgJy4uL2hlbHBlci92aWV3J1xuXG4jIyMqXG4jIExhbmRpbmcgdmlld1xuIyBAcHJvcGVydHkge0JhY2tib25lfSB2aWV3XG4jIyNcbmlmICQoJ21ldGFbbmFtZT1fdVRdJykubGVuZ3RoXG5cdCQucG9zdCh3aW5kb3cubG9jYXRpb24ub3JpZ2luKycvZGFzaGJvYXJkL2F1dGgtY2hlY2snLFxuXHRcdF90OiAkKCdtZXRhW25hbWU9X3VUXScpLmF0dHIgJ2NvbnRlbnQnXG5cdCkuZG9uZSAoZSkgLT5cblx0XHRpZiBlLnR5cGUgaXMgJ3N1Y2Nlc3MnXG5cdFx0XHR2aWV3ID0gbmV3IFZpZXcuRGFzaGJvYXJkVmlldyhlbDogJyNhcHAtY29udGVudCcpXG5cdFx0ZWxzZVxuXHRcdFx0dmlldyA9IG5ldyBWaWV3LkxvZ2luVmlldyhlbDogJyNhcHAtY29udGVudCcpXG5lbHNlXG5cdHZpZXcgPSBuZXcgVmlldy5Mb2dpblZpZXcoZWw6ICcjYXBwLWNvbnRlbnQnKSIsIm1vZHVsZS5leHBvcnRzLkJhY2tib25lIFx0XHRcdFx0PSByZXF1aXJlICdiYWNrYm9uZSdcbm1vZHVsZS5leHBvcnRzLkhhbmRsZWJhcnMgXHRcdFx0PSByZXF1aXJlICdoYnNmeS9ydW50aW1lJ1xubW9kdWxlLmV4cG9ydHMuVW5kZXJzY29yZSBcdFx0XHQ9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5cbm1vZHVsZS5leHBvcnRzLkNvcmUgPSAtPlxuXHQkKCdodG1sLGJvZHkgKicpLnJlbW92ZUF0dHIgJ2Rpc2FibGVkJ1xuXG5cdHVubGVzcyB3aW5kb3cubG9jYXRpb24ub3JpZ2luXG5cdFx0d2luZG93LmxvY2F0aW9uLm9yaWdpbiA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCtcIi8vXCIrd2luZG93LmxvY2F0aW9uLmhvc3RcblxuXHQkLmZuLmV4dGVuZCBkaXNhYmxlOiAoc3RhdGUpIC0+XG5cdFx0QGVhY2ggLT5cblx0XHRcdHVubGVzcyBzdGF0ZVxuXHRcdFx0XHQkKHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJylcblx0XHRcdGVsc2Vcblx0XHRcdFx0JCh0aGlzKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKVxuXHRcdFx0cmV0dXJuXG5cblx0aWYgJCgnZm9ybS5jcnlwdCcpLmxlbmd0aFxuXHRcdCQoJ2Zvcm0uY3J5cHQnKS5qQ3J5cHRpb25cblx0XHRcdGdldEtleXNVUkw6IHdpbmRvdy5iYXNlVVJMKycvYXV0aC9nZW4nXG5cdFx0XHRoYW5kc2hha2VVUkw6IHdpbmRvdy5iYXNlVVJMKycvYXV0aC9oYW5kc2hha2UnXG5cblx0JC5hamF4U2V0dXBcblx0XHRzdGF0dXNDb2RlOlxuXHRcdFx0NDAzOiAoZSkgLT5cblx0XHRcdFx0d2luZG93LmFsZXJ0ICdGb3JiaWRkZW4gY29udGVudCEnXG5cdFx0XHQ0MDQ6IChlKSAtPlxuXHRcdFx0XHR3aW5kb3cuYWxlcnQgJ1JlcXVlc3RlZCByb3V0ZSBub3QgZm91bmQhJ1xuXHRcdFx0NTAwOiAoZSkgLT5cblx0XHRcdFx0d2luZG93LmFsZXJ0ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3IhJ1xuXHRcdGNyb3NzRG9tYWluOiBmYWxzZVxuXHRcdGRhdGFUeXBlOiAnanNvbidcblx0XHR0aW1lb3V0OiAzMDAwMFxuXHRcdGhlYWRlcnM6XG5cdFx0XHQnWC1DU1JGLVRva2VuJzogJChcIm1ldGFbbmFtZT1cXFwiX3RcXFwiXVwiKS5hdHRyKFwiY29udGVudFwiKVxuXHRcdHhocjogLT5cblx0XHRcdHhociA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKVxuXHRcdFx0aWYgJCgnZGl2W3JvbGU9cHJvZ3Jlc3NiYXJdJykubGVuZ3RoXG5cdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lciBcInByb2dyZXNzXCIsICgoZXZ0KSAtPlxuXHRcdFx0XHRcdGlmIGV2dC5sZW5ndGhDb21wdXRhYmxlXG5cdFx0XHRcdFx0XHRwZXJjZW50Q29tcGxldGUgPSBldnQubG9hZGVkIC8gZXZ0LnRvdGFsXG5cdFx0XHRcdFx0XHRwZXJjZW50Q29tcGxldGUgPSBNYXRoLnJvdW5kIHBlcmNlbnRDb21wbGV0ZSoxMDBcblx0XHRcdFx0XHRcdGVsID0gJCgnZGl2W3JvbGU9cHJvZ3Jlc3NiYXJdJylcblx0XHRcdFx0XHRcdGVsLmNzcyAnd2lkdGgnLCBwZXJjZW50Q29tcGxldGUrJyUnXG5cdFx0XHRcdFx0XHRlbC50ZXh0IHBlcmNlbnRDb21wbGV0ZSsnJSdcblx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHQpLCBmYWxzZVxuXHRcdFx0eGhyXG5cbm1vZHVsZS5leHBvcnRzLlNob3dNZXNzYWdlID0gKG1lc3NhZ2UsIHR5cGUsIGVsKSAtPlxuXHQkKFwiLnN0YXR1cy1tZXNzYWdlXCIpLnJlbW92ZSgpXG5cdGh0bWwgPSBcIjxkaXYgY2xhc3M9J3JvdyBzdGF0dXMtbWVzc2FnZSc+PGRpdiBjbGFzcz0nY29sLWxnLTEyJz48ZGl2IGNsYXNzPSdhbGVydCBhbGVydC1cIiArIHR5cGUgKyBcIicnPlwiICsgbWVzc2FnZSArIFwiPC9kaXY+PC9kaXY+PC9kaXY+XCJcblx0JChodG1sKS5hcHBlbmRUbyhlbCkuaGlkZSgpLmZhZGVJbiA5MDAiLCJDb3JlIFx0PSByZXF1aXJlICcuL2NvcmUnXG5iYiBcdFx0PSBDb3JlLkJhY2tib25lXG5iYi4kIFx0PSByZXF1aXJlICdqcXVlcnknXG5cbm1vZHVsZS5leHBvcnRzLlVzZXIgPSBiYi5Nb2RlbC5leHRlbmRcblx0ZGVmYXVsdHM6XG5cdFx0J25hbWUnXHQ6ICcnLFxuXHRcdCdlbWFpbCdcdDpcdCcnLFxuXHRcdCd0b2tlbidcdDogJydcblx0YWRtaW5Mb2dpblVybDogd2luZG93LmxvY2F0aW9uLm9yaWdpbisnL2Rhc2hib2FyZC91c2VyL2xvZ2luJ1xuXG5tb2R1bGUuZXhwb3J0cy5VdGlsID0gYmIuTW9kZWwuZXh0ZW5kXG5cdGxvZ286XG5cdFx0aW5pdGlhbGl6ZTogLT5cblx0XHRcdCQuZ2V0KHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4rJy9hc3NldCcsXG5cdFx0XHRcdF90OiAnbG9nbydcblx0XHRcdCkuZG9uZSAoZSkgLT5cblx0XHRcdFx0cmV0dXJuIiwiQ29yZSBcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZSAnLi9jb3JlJ1xuYmIgXHRcdFx0XHRcdFx0XHRcdD0gQ29yZS5CYWNrYm9uZVxuX1x0XHRcdFx0XHRcdFx0XHRcdD0gQ29yZS5VbmRlcnNjb3JlXG5IYW5kbGViYXJzIFx0XHRcdFx0PSBDb3JlLkhhbmRsZWJhcnNcblxuYmIuJCBcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZSAnanF1ZXJ5J1xuTW9kZWwgXHRcdFx0XHRcdFx0PSByZXF1aXJlICcuL21vZGVsJ1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCAnaGVhZGVyJywgcmVxdWlyZSAnLi4vdGVtcGxhdGVzL2JhY2tlbmQvaW5jL2hlYWRlcidcblxuVXRpbCA9IG5ldyBNb2RlbC5VdGlsKClcblxuQmFzZVZpZXcgPSBiYi5WaWV3LmV4dGVuZFxuXHRcdFx0XHRcdFx0aGFuZGxlUHJvZ3Jlc3M6IChldnQpIC0+XG5cdFx0XHRcdFx0XHRcdHBlcmNlbnRDb21wbGV0ZSA9IDBcblx0XHRcdFx0XHRcdFx0aWYgZXZ0Lmxlbmd0aENvbXB1dGFibGVcblx0XHRcdFx0XHRcdFx0XHRwZXJjZW50Q29tcGxldGUgPSBldnQubG9hZGVkIC8gZXZ0LnRvdGFsXG5cdFx0XHRcdFx0XHRcdFx0IyNjb25zb2xlLmxvZyhNYXRoLnJvdW5kKHBlcmNlbnRDb21wbGV0ZSAqIDEwMCkrXCIlXCIpXG5cdFx0XHRcdFx0XHRsb2dvOiBVdGlsLmxvZ28uaW5pdGlhbGl6ZSgpXG5cdFx0XHRcdFx0XHRpbml0aWFsaXplOiAtPlxuXHRcdFx0XHRcdFx0XHRAcmVuZGVyID0gXy53cmFwKEByZW5kZXIsIChyZW5kZXIpIC0+XG5cdFx0XHRcdFx0XHRcdFx0QGJlZm9yZVJlbmRlcigpXG5cdFx0XHRcdFx0XHRcdFx0cmVuZGVyLmFwcGx5IHRoaXNcblx0XHRcdFx0XHRcdFx0XHRAYWZ0ZXJSZW5kZXIoKVxuXHRcdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdEByZW5kZXIoKVxuXHRcdFx0XHRcdFx0YmVmb3JlUmVuZGVyOiAtPlxuXHRcdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHRcdGFmdGVyUmVuZGVyOiAtPlxuXHRcdFx0XHRcdFx0XHRyZXR1cm5cblxuTG9naW5WaWV3ID0gQmFzZVZpZXcuZXh0ZW5kXG5cdFx0dGVtcGxhdGU6IHJlcXVpcmUgXCIuLi90ZW1wbGF0ZXMvYmFja2VuZC9sb2dpblwiXG5cdFx0IyBsb2FkU3R1ZmY6IC0+XG5cdFx0IyBcdHNvbWVNb2RlbC5mZXRjaFxuXHRcdCMgXHRcdHhocjogLT5cblx0XHQjIFx0XHRcdHhociA9ICQuYWpheFNldHRpbmdzLnhocigpXG5cdFx0IyBcdFx0XHR4aHIub25wcm9ncmVzcyA9IEBoYW5kbGVQcm9ncmVzc1xuXHRcdCMgXHRcdFx0eGhyXG5cdFx0cmVuZGVyOiAtPlxuXHRcdFx0QCRlbC5odG1sIEB0ZW1wbGF0ZVxuXHRcdFx0dGhpc1xuXHRcdGFmdGVyUmVuZGVyOiAtPlxuXHRcdFx0JCgnZm9ybSNsb2dpbkZvcm0nKS5qQ3J5cHRpb25cblx0XHRcdFx0Z2V0S2V5c1VSTDogd2luZG93LmxvY2F0aW9uLm9yaWdpbisnL2Rhc2hib2FyZC9hdXRoLWdlbidcblx0XHRcdFx0aGFuZHNoYWtlVVJMOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luKycvZGFzaGJvYXJkL2F1dGgtaGFuZHNoYWtlJ1xuXG5cdFx0XHQkKCdmb3JtI2xvZ2luRm9ybScpLm9uICdzdWJtaXQnLCAtPlxuXHRcdFx0XHQkdGhpcyA9ICQodGhpcylcblx0XHRcdFx0JC5hamF4XG5cdFx0XHRcdFx0dHlwZVx0XHQ6ICdQT1NUJ1xuXHRcdFx0XHRcdHVybFx0XHRcdDogd2luZG93LmxvY2F0aW9uLm9yaWdpbisnL2Rhc2hib2FyZC91c2VyL2FkbWluLWxvZ2luJ1xuXHRcdFx0XHRcdGRhdGEgXHRcdDogXG5cdFx0XHRcdFx0XHQnakNyeXB0aW9uJzogJHRoaXMuZmluZCgnaW5wdXRbbmFtZT1qQ3J5cHRpb25dJykudmFsKClcblx0XHRcdFx0XHRzdWNjZXNzIDogKGUpIC0+XG5cdFx0XHRcdFx0XHRpZiBlLnR5cGUgaXMgJ3N1Y2Nlc3MnXG5cdFx0XHRcdFx0XHRcdG5ld1ZpZXcgID0gbmV3IERhc2hib2FyZFZpZXcoZWw6ICcjYXBwLWNvbnRlbnQnKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm5cblxuXHRcdFx0XHRcdFx0aWYgZS5pc19yZWxvYWQgaXMgdHJ1ZVxuXHRcdFx0XHRcdFx0XHRpZiBjb25maXJtIGUubWVzc2FnZVxuXHRcdFx0XHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuXHRcdFx0XHRcdFx0XHRcdHJldHVyblxuXG5cdFx0XHRcdFx0XHRDb3JlLlNob3dNZXNzYWdlICc8aSBjbGFzcz1cImZhIGZhLXdhcm5pbmdcIj48L2k+ICcrZS5tZXNzYWdlLCBlLnR5cGUsICR0aGlzXG5cdFx0XHRcdFx0XHQkKCdodG1sLGJvZHkgKicpLnJlbW92ZUF0dHIgJ2Rpc2FibGVkJ1xuXHRcdFx0XHRcdGVycm9yXHRcdDpcdChlKSAtPlxuXHRcdFx0XHRcdFx0JCgnaHRtbCxib2R5IConKS5yZW1vdmVBdHRyICdkaXNhYmxlZCdcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nIGVcblxuRGFzaGJvYXJkVmlldyA9IEJhc2VWaWV3LmV4dGVuZFxuXHR0ZW1wbGF0ZTogcmVxdWlyZSBcIi4uL3RlbXBsYXRlcy9iYWNrZW5kL2Rhc2hib2FyZFwiXG5cdHJlbmRlcjogLT5cblx0XHRAJGVsLmh0bWwgQHRlbXBsYXRlXG5cdFx0XHRsb2dvOiBAbG9nby5yZXNwb25zZVRleHRcblx0XHR0aGlzXG5cbm1vZHVsZS5leHBvcnRzLkxvZ2luVmlldyA9IExvZ2luVmlld1xubW9kdWxlLmV4cG9ydHMuRGFzaGJvYXJkVmlldyA9IERhc2hib2FyZFZpZXciLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgcGFydGlhbHMgPSB0aGlzLm1lcmdlKHBhcnRpYWxzLCBIYW5kbGViYXJzLnBhcnRpYWxzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIHZhciBidWZmZXIgPSBcIlwiLCBzdGFjazEsIHNlbGY9dGhpcztcblxuXG4gIGJ1ZmZlciArPSBcIjxkaXYgY2xhc3M9XFxcImNvbnRhaW5lci1mbHVpZFxcXCI+XFxuXHQ8ZGl2IGlkPVxcXCJjb250ZW50XFxcIj5cXG5cdFx0XCI7XG4gIHN0YWNrMSA9IHNlbGYuaW52b2tlUGFydGlhbChwYXJ0aWFscy5oZWFkZXIsICdoZWFkZXInLCBkZXB0aDAsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKTtcbiAgaWYoc3RhY2sxIHx8IHN0YWNrMSA9PT0gMCkgeyBidWZmZXIgKz0gc3RhY2sxOyB9XG4gIGJ1ZmZlciArPSBcIlxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIHJldHVybiBidWZmZXI7XG4gIH0pO1xuIiwiLy8gaGJzZnkgY29tcGlsZWQgSGFuZGxlYmFycyB0ZW1wbGF0ZVxudmFyIEhhbmRsZWJhcnNDb21waWxlciA9IHJlcXVpcmUoJ2hic2Z5L3J1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFyc0NvbXBpbGVyLnRlbXBsYXRlKGZ1bmN0aW9uIChIYW5kbGViYXJzLGRlcHRoMCxoZWxwZXJzLHBhcnRpYWxzLGRhdGEpIHtcbiAgdGhpcy5jb21waWxlckluZm8gPSBbNCwnPj0gMS4wLjAnXTtcbmhlbHBlcnMgPSB0aGlzLm1lcmdlKGhlbHBlcnMsIEhhbmRsZWJhcnMuaGVscGVycyk7IGRhdGEgPSBkYXRhIHx8IHt9O1xuICB2YXIgYnVmZmVyID0gXCJcIiwgc3RhY2sxLCBoZWxwZXIsIGZ1bmN0aW9uVHlwZT1cImZ1bmN0aW9uXCIsIGVzY2FwZUV4cHJlc3Npb249dGhpcy5lc2NhcGVFeHByZXNzaW9uO1xuXG5cbiAgYnVmZmVyICs9IFwiPGRpdiBjbGFzcz1cXFwibmF2YmFyIG5hdmJhci1kZWZhdWx0XFxcIiByb2xlPVxcXCJuYXZpZ2F0aW9uXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcImNvbnRhaW5lclxcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcIm5hdmJhci1oZWFkZXJcXFwiPlxcblx0XHRcdDxhIGhyZWY9XFxcIi9kYXNoYm9hcmRcXFwiPlxcblx0XHRcdFx0PGltZyBzcmM9XFxcIlwiO1xuICBpZiAoaGVscGVyID0gaGVscGVycy5sb2dvKSB7IHN0YWNrMSA9IGhlbHBlci5jYWxsKGRlcHRoMCwge2hhc2g6e30sZGF0YTpkYXRhfSk7IH1cbiAgZWxzZSB7IGhlbHBlciA9IChkZXB0aDAgJiYgZGVwdGgwLmxvZ28pOyBzdGFjazEgPSB0eXBlb2YgaGVscGVyID09PSBmdW5jdGlvblR5cGUgPyBoZWxwZXIuY2FsbChkZXB0aDAsIHtoYXNoOnt9LGRhdGE6ZGF0YX0pIDogaGVscGVyOyB9XG4gIGJ1ZmZlciArPSBlc2NhcGVFeHByZXNzaW9uKHN0YWNrMSlcbiAgICArIFwiXFxcIiB3aWR0aD1cXFwiNTVcXFwiIHRpdGxlPVxcXCJMb2dvXFxcIiAvPlxcblx0XHRcdDwvYT5cXG5cdFx0PC9kaXY+XFxuXHRcdFxcblx0XHQ8ZGl2IGNsYXNzPVxcXCJjb2xsYXBzZSBuYXZiYXItY29sbGFwc2VcXFwiPlxcblx0XHRcdDx1bCBjbGFzcz1cXFwibmF2IG5hdmJhci1uYXZcXFwiPlxcblx0XHRcdFx0PCEtLSBBZG1pbiBNb2R1bGVzIC0tPlxcblx0XHRcdFx0PGxpIGNsYXNzPVxcXCJkcm9wZG93blxcXCI+XFxuXHRcdFx0XHRcdDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJkcm9wZG93bi10b2dnbGVcXFwiIGRhdGEtdG9nZ2xlPVxcXCJkcm9wZG93blxcXCI+XFxuXHRcdFx0XHRcdFx0QWRtaW4gPGkgY2xhc3M9XFxcImZhIGZhLWNhcmV0LWRvd25cXFwiPjwvaT5cXG5cdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8dWwgY2xhc3M9XFxcImRyb3Bkb3duLW1lbnVcXFwiIHJvbGU9XFxcIm1lbnVcXFwiPlxcblx0XHRcdFx0XHRcdDxsaT48YSBocmVmPVxcXCIvZGFzaGJvYXJkL3VzZXIvbG9nb3V0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtc2lnbm91dFxcXCI+PC9pPiBMb2dvdXQ8L2E+PC9saT5cXG5cdFx0XHRcdFx0XHQ8bGk+PGEgaHJlZj1cXFwiI1xcXCI+TWVudSAyPC9hPjwvbGk+XFxuXHRcdFx0XHRcdFx0PGxpIGNsYXNzPVxcXCJkaXZpZGVyXFxcIj48L2xpPlxcblx0XHRcdFx0XHRcdDxsaT48YSBocmVmPVxcXCIjXFxcIj5NZW51IDM8L2E+PC9saT5cXG5cdFx0XHRcdFx0PC91bD5cXG5cdFx0XHRcdDwvbGk+XFxuXFxuXHRcdFx0XHQ8IS0tIEZyb250ZW5kIE1vZHVsZXMgLS0+XFxuXHRcdFx0XHQ8bGkgY2xhc3M9XFxcImRyb3Bkb3duXFxcIj5cXG5cdFx0XHRcdFx0PGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcImRyb3Bkb3duLXRvZ2dsZVxcXCIgZGF0YS10b2dnbGU9XFxcImRyb3Bkb3duXFxcIj5cXG5cdFx0XHRcdFx0XHRXZWJzaXRlIDxpIGNsYXNzPVxcXCJmYSBmYS1jYXJldC1kb3duXFxcIj48L2k+XFxuXHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0PHVsIGNsYXNzPVxcXCJkcm9wZG93bi1tZW51XFxcIiByb2xlPVxcXCJtZW51XFxcIj5cXG5cdFx0XHRcdFx0XHQ8bGk+PGEgaHJlZj1cXFwiI1xcXCI+TWVudSAxPC9hPjwvbGk+XFxuXHRcdFx0XHRcdFx0PGxpPjxhIGhyZWY9XFxcIiNcXFwiPk1lbnUgMjwvYT48L2xpPlxcblx0XHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwiZGl2aWRlclxcXCI+PC9saT5cXG5cdFx0XHRcdFx0XHQ8bGk+PGEgaHJlZj1cXFwiI1xcXCI+TWVudSAzPC9hPjwvbGk+XFxuXHRcdFx0XHRcdDwvdWw+XFxuXHRcdFx0XHQ8L2xpPlxcblx0XHRcdDwvdWw+XFxuXFxuXHRcdFx0PHVsIGNsYXNzPVxcXCJuYXYgbmF2YmFyLW5hdiBub3RpZmljYXRpb25zIHB1bGwtcmlnaHQgaGlkZGVuLXhzXFxcIj5cXG5cdFx0XHRcdDxsaSBjbGFzcz1cXFwiZHJvcGRvd24gbm90aWZcXFwiPlxcblx0XHRcdFx0XHQ8YSBjbGFzcz1cXFwiZHJvcGRvd24tdG9nZ2xlIGRyb3Bkb3duLWhvdmVyXFxcIiBkYXRhLXRvZ2dsZT1cXFwiZHJvcGRvd25cXFwiIGhyZWY9XFxcIiNcXFwiIG9uY2xpY2s9XFxcInJldHVybiBmYWxzZTtcXFwiPlxcblx0XHRcdFx0XHRcdDxpIGNsYXNzPVxcXCJmYSBmYS10by1jZW50ZXIgZmEtY29tbWVudHMtb1xcXCI+PC9pPlxcblx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJiYWRnZSBwYWxldHRlLWdyZWVuLXNlYVxcXCI+Nzwvc3Bhbj5cXG5cdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHQ8dWwgY2xhc3M9XFxcImRyb3Bkb3duLW1lbnUgY2hhdC1tZWRpYS1saXN0XFxcIj5cXG5cdFx0XHRcdFx0XHQ8bGkgY2xhc3M9XFxcIm1lZGlhXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxhIGNsYXNzPVxcXCJwdWxsLWxlZnRcXFwiIGhyZWY9XFxcIiNcXFwiPlxcblx0XHRcdFx0XHRcdFx0XHQ8aW1nIGNsYXNzPVxcXCJtZWRpYS1vYmplY3QgdGh1bWJcXFwiIHdpZHRoPVxcXCI1MFxcXCIgYWx0PVxcXCI1MHg1MFxcXCIgc3JjPVxcXCJhc3NldHMvaW1hZ2VzL2F2X2RlZmF1bHQucG5nXFxcIiAvPlxcblx0XHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwibWVkaWEtYm9keVxcXCI+XFxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJsYWJlbCBwYWxldHRlLW9yYW5nZSBwdWxsLXJpZ2h0XFxcIj4xMCBtaW51dGVzIGFnbzwvc3Bhbj5cXG5cdFx0XHRcdFx0XHRcdFx0PGg1IGNsYXNzPVxcXCJtZWRpYS1oZWFkaW5nXFxcIj5QZXJzb24gMSBOYW1lPC9oNT5cXG5cdFx0XHRcdFx0XHRcdFx0PHAgY2xhc3M9XFxcIm1hcmdpbi1ub25lXFxcIj5cXG5cdFx0XHRcdFx0XHRcdFx0XHRMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldC4uLlxcblx0XHRcdFx0XHRcdFx0XHQ8L3A+XFxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdFx0XHQ8L2xpPlxcblxcblx0XHRcdFx0XHRcdDxsaSBjbGFzcz1cXFwibWVkaWFcXFwiPlxcblx0XHRcdFx0XHRcdFx0PGEgY2xhc3M9XFxcInB1bGwtbGVmdFxcXCIgaHJlZj1cXFwiI1xcXCI+XFxuXHRcdFx0XHRcdFx0XHRcdDxpbWcgY2xhc3M9XFxcIm1lZGlhLW9iamVjdCB0aHVtYlxcXCIgd2lkdGg9XFxcIjUwXFxcIiBhbHQ9XFxcIjUweDUwXFxcIiBzcmM9XFxcImFzc2V0cy9pbWFnZXMvYXZfZGVmYXVsdC5wbmdcXFwiIC8+XFxuXHRcdFx0XHRcdFx0XHQ8L2E+XFxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJtZWRpYS1ib2R5XFxcIj5cXG5cdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImxhYmVsIHBhbGV0dGUtb3JhbmdlIHB1bGwtcmlnaHRcXFwiPjIgZGF5cyBhZ288L3NwYW4+XFxuXHRcdFx0XHRcdFx0XHRcdDxoNSBjbGFzcz1cXFwibWVkaWEtaGVhZGluZ1xcXCI+UGVyc29uIDIgTmFtZTwvaDU+XFxuXHRcdFx0XHRcdFx0XHRcdDxwIGNsYXNzPVxcXCJtYXJnaW4tbm9uZVxcXCI+XFxuXHRcdFx0XHRcdFx0XHRcdFx0TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQuLi5cXG5cdFx0XHRcdFx0XHRcdFx0PC9wPlxcblx0XHRcdFx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHRcdFx0PC9saT5cXG5cXG5cdFx0XHRcdFx0XHQ8bGkgY2xhc3M9XFxcIm1lZGlhXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxhIGNsYXNzPVxcXCJwdWxsLWxlZnRcXFwiIGhyZWY9XFxcIiNcXFwiPlxcblx0XHRcdFx0XHRcdFx0XHQ8aW1nIGNsYXNzPVxcXCJtZWRpYS1vYmplY3QgdGh1bWJcXFwiIHdpZHRoPVxcXCI1MFxcXCIgYWx0PVxcXCI1MHg1MFxcXCIgc3JjPVxcXCJhc3NldHMvaW1hZ2VzL2F2X2RlZmF1bHQucG5nXFxcIiAvPlxcblx0XHRcdFx0XHRcdFx0PC9hPlxcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwibWVkaWEtYm9keVxcXCI+XFxuXHRcdFx0XHRcdFx0XHRcdDxzcGFuIGNsYXNzPVxcXCJsYWJlbCBwYWxldHRlLW9yYW5nZSBwdWxsLXJpZ2h0XFxcIj4xMCBkYXlzIGFnbzwvc3Bhbj5cXG5cdFx0XHRcdFx0XHRcdFx0PGg1IGNsYXNzPVxcXCJtZWRpYS1oZWFkaW5nXFxcIj5QZXJzb24gMyBOYW1lPC9oNT5cXG5cdFx0XHRcdFx0XHRcdFx0PHAgY2xhc3M9XFxcIm1hcmdpbi1ub25lXFxcIj5cXG5cdFx0XHRcdFx0XHRcdFx0XHRMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldC4uLlxcblx0XHRcdFx0XHRcdFx0XHQ8L3A+XFxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdFx0XHQ8L2xpPlxcblxcblx0XHRcdFx0XHRcdDxsaT5cXG5cdFx0XHRcdFx0XHRcdDxhIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiIGhyZWY9XFxcIiNcXFwiPlxcblx0XHRcdFx0XHRcdFx0XHQ8aSBjbGFzcz1cXFwiZmEgZmEtbGlzdFxcXCI+PC9pPlxcblx0XHRcdFx0XHRcdFx0XHQ8c3Bhbj5WaWV3IEFsbCBNZXNzYWdlczwvc3Bhbj5cXG5cdFx0XHRcdFx0XHRcdDwvYT5cXG5cdFx0XHRcdFx0XHQ8L2xpPlxcblx0XHRcdFx0XHQ8L3VsPlxcblx0XHRcdFx0PC9saT5cXG5cdFx0XHRcdDxsaT48YSBocmVmPVxcXCIjXFxcIj5PdGhlciBNZW51PC9hPjwvbGk+XFxuXHRcdFx0XHQ8bGk+PGEgaHJlZj1cXFwiI1xcXCI+T3RoZXIgTWVudSAyPC9hPjwvbGk+XFxuXHRcdFx0PC91bD5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cIjtcbiAgcmV0dXJuIGJ1ZmZlcjtcbiAgfSk7XG4iLCIvLyBoYnNmeSBjb21waWxlZCBIYW5kbGViYXJzIHRlbXBsYXRlXG52YXIgSGFuZGxlYmFyc0NvbXBpbGVyID0gcmVxdWlyZSgnaGJzZnkvcnVudGltZScpO1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzQ29tcGlsZXIudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGJyIC8+XFxuPGRpdiBjbGFzcz1cXFwiY29udGFpbmVyXFxcIj5cXG5cdDxkaXYgY2xhc3M9XFxcInJvd1xcXCI+XFxuXHRcdDxkaXYgY2xhc3M9XFxcImRhc2hib2FyZC1sb2dpblxcXCI+XFxuXHRcdFx0PHAgY2xhc3M9XFxcInRpdGxlIHRvLWNlbnRlclxcXCI+PGI+PGkgY2xhc3M9XFxcImZhIGZhLWxvY2tcXFwiPjwvaT4gTG9naW4gdG8geW91ciBBY2NvdW50PC9iPjwvcD5cXG5cdFx0XHRcXG5cdFx0XHQ8ZGl2IGNsYXNzPVxcXCJwYWdlLWljb24gdG8tY2VudGVyXFxcIj5cXG5cdFx0XHRcdDxpIGNsYXNzPVxcXCJmYSBmYS1sb2NrXFxcIj48L2k+XFxuXHRcdFx0PC9kaXY+XFxuXFxuXHRcdFx0PGRpdiBjbGFzcz1cXFwicGFuZWwgcGFuZWwtZGVmYXVsdCBjb2wtbWQtNiBjb2wtbWQtb2Zmc2V0LTNcXFwiPlxcblx0XHRcdFx0PGRpdiBjbGFzcz1cXFwicGFuZWwtYm9keVxcXCI+XFxuXHRcdFx0XHRcdDxmb3JtIHJvbGU9XFxcImZvcm1cXFwiIGlkPVxcXCJsb2dpbkZvcm1cXFwiIGNsYXNzPVxcXCJmb3JtLWhvcml6b250YWxcXFwiIG9uc3VibWl0PVxcXCJyZXR1cm4gZmFsc2U7XFxcIj5cXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxsYWJlbCBjbGFzcz1cXFwiY29sLW1kLTQgY29udHJvbC1sYWJlbFxcXCIgZm9yPVxcXCJ0ZXh0aW5wdXRcXFwiPkVtYWlsIGFkZHJlc3M8L2xhYmVsPiAgXFxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJjb2wtbWQtMTJcXFwiPlxcblx0XHRcdFx0XHRcdFx0XHQ8aW5wdXQgaWQ9XFxcInRleHRpbnB1dFxcXCIgbmFtZT1cXFwiZW1haWxcXFwiIHBsYWNlaG9sZGVyPVxcXCJlbWFpbFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgLz5cXG5cdFx0XHRcdFx0XHRcdDwvZGl2Plxcblx0XHRcdFx0XHRcdDwvZGl2Plxcblxcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcblx0XHRcdFx0XHRcdFx0PGxhYmVsIGNsYXNzPVxcXCJjb2wtbWQtNCBjb250cm9sLWxhYmVsXFxcIiBmb3I9XFxcInBhc3N3b3JkaW5wdXRcXFwiPlBhc3N3b3JkPC9sYWJlbD5cXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XFxcImNvbC1tZC0xMlxcXCI+XFxuXHRcdFx0XHRcdFx0XHRcdDxpbnB1dCBpZD1cXFwicGFzc3dvcmRpbnB1dFxcXCIgbmFtZT1cXFwicGFzc3dvcmRcXFwiIHBsYWNlaG9sZGVyPVxcXCJwYXNzd29yZFxcXCIgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCIgdHlwZT1cXFwicGFzc3dvcmRcXFwiIC8+XFxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cXG5cXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVxcXCJmb3JtLWdyb3VwXFxcIj5cXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XFxcImNvbC1tZC0xMlxcXCI+XFxuXHRcdFx0XHRcdFx0XHRcdDxidXR0b24gY2xhc3M9XFxcImJ0biBidG4tc3VjY2VzcyBidG4tYmxvY2tcXFwiIHR5cGU9XFxcInN1Ym1pdFxcXCI+TG9naW48L2J1dHRvbj5cXG5cdFx0XHRcdFx0XHRcdDwvZGl2Plxcblx0XHRcdFx0XHRcdDwvZGl2Plxcblxcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XFxcImZvcm0tZ3JvdXBcXFwiPlxcblx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwiY29sLW1kLTEyXFxcIj5cXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cXFwiY2hlY2tib3ggbm8tcGFkIGxlZnRcXFwiPlxcblx0XHRcdFx0XHRcdFx0XHRcdDxsYWJlbCBmb3I9XFxcImNoZWNrYm94ZXMtMFxcXCIgY2xhc3M9XFxcImNoZWNrYm94XFxcIj5cXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxpbnB1dCBuYW1lPVxcXCJyZW1lbWJlclxcXCIgY2xhc3M9XFxcImN1c3RvbS1jaGVja2JveFxcXCIgaWQ9XFxcImNoZWNrYm94ZXMtMFxcXCIgdmFsdWU9XFxcIjFcXFwiIHR5cGU9XFxcImNoZWNrYm94XFxcIiBkYXRhLXRvZ2dsZT1cXFwiY2hlY2tib3hcXFwiIC8+XFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiaWNvbnNcXFwiPlxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8c3BhbiBjbGFzcz1cXFwiaWNvbi11bmNoZWNrZWRcXFwiPjwvc3Bhbj5cXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcImljb24tY2hlY2tlZFxcXCI+PC9zcGFuPlxcblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9zcGFuPlxcblx0XHRcdFx0XHRcdFx0XHRcdFx0PHNwYW4gY2xhc3M9XFxcInRleHRcXFwiPlxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRSZW1lbWJlciBteSBkZXRhaWxzXFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3NwYW4+XFxuXHRcdFx0XHRcdFx0XHRcdFx0PC9sYWJlbD5cXG5cdFx0XHRcdFx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cXG5cdFx0XHRcdFx0PC9mb3JtPlxcblx0XHRcdFx0PC9kaXY+XFxuXHRcdFx0PC9kaXY+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuPC9kaXY+XCI7XG4gIH0pO1xuIiwiLy8gICAgIEJhY2tib25lLmpzIDEuMS4yXG5cbi8vICAgICAoYykgMjAxMC0yMDE0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgQmFja2JvbmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyAgICAgRm9yIGFsbCBkZXRhaWxzIGFuZCBkb2N1bWVudGF0aW9uOlxuLy8gICAgIGh0dHA6Ly9iYWNrYm9uZWpzLm9yZ1xuXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuXG4gIC8vIFNldCB1cCBCYWNrYm9uZSBhcHByb3ByaWF0ZWx5IGZvciB0aGUgZW52aXJvbm1lbnQuIFN0YXJ0IHdpdGggQU1ELlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFsndW5kZXJzY29yZScsICdqcXVlcnknLCAnZXhwb3J0cyddLCBmdW5jdGlvbihfLCAkLCBleHBvcnRzKSB7XG4gICAgICAvLyBFeHBvcnQgZ2xvYmFsIGV2ZW4gaW4gQU1EIGNhc2UgaW4gY2FzZSB0aGlzIHNjcmlwdCBpcyBsb2FkZWQgd2l0aFxuICAgICAgLy8gb3RoZXJzIHRoYXQgbWF5IHN0aWxsIGV4cGVjdCBhIGdsb2JhbCBCYWNrYm9uZS5cbiAgICAgIHJvb3QuQmFja2JvbmUgPSBmYWN0b3J5KHJvb3QsIGV4cG9ydHMsIF8sICQpO1xuICAgIH0pO1xuXG4gIC8vIE5leHQgZm9yIE5vZGUuanMgb3IgQ29tbW9uSlMuIGpRdWVyeSBtYXkgbm90IGJlIG5lZWRlZCBhcyBhIG1vZHVsZS5cbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcbiAgICBmYWN0b3J5KHJvb3QsIGV4cG9ydHMsIF8pO1xuXG4gIC8vIEZpbmFsbHksIGFzIGEgYnJvd3NlciBnbG9iYWwuXG4gIH0gZWxzZSB7XG4gICAgcm9vdC5CYWNrYm9uZSA9IGZhY3Rvcnkocm9vdCwge30sIHJvb3QuXywgKHJvb3QualF1ZXJ5IHx8IHJvb3QuWmVwdG8gfHwgcm9vdC5lbmRlciB8fCByb290LiQpKTtcbiAgfVxuXG59KHRoaXMsIGZ1bmN0aW9uKHJvb3QsIEJhY2tib25lLCBfLCAkKSB7XG5cbiAgLy8gSW5pdGlhbCBTZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tXG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBCYWNrYm9uZWAgdmFyaWFibGUsIHNvIHRoYXQgaXQgY2FuIGJlXG4gIC8vIHJlc3RvcmVkIGxhdGVyIG9uLCBpZiBgbm9Db25mbGljdGAgaXMgdXNlZC5cbiAgdmFyIHByZXZpb3VzQmFja2JvbmUgPSByb290LkJhY2tib25lO1xuXG4gIC8vIENyZWF0ZSBsb2NhbCByZWZlcmVuY2VzIHRvIGFycmF5IG1ldGhvZHMgd2UnbGwgd2FudCB0byB1c2UgbGF0ZXIuXG4gIHZhciBhcnJheSA9IFtdO1xuICB2YXIgcHVzaCA9IGFycmF5LnB1c2g7XG4gIHZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xuICB2YXIgc3BsaWNlID0gYXJyYXkuc3BsaWNlO1xuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgbGlicmFyeS4gS2VlcCBpbiBzeW5jIHdpdGggYHBhY2thZ2UuanNvbmAuXG4gIEJhY2tib25lLlZFUlNJT04gPSAnMS4xLjInO1xuXG4gIC8vIEZvciBCYWNrYm9uZSdzIHB1cnBvc2VzLCBqUXVlcnksIFplcHRvLCBFbmRlciwgb3IgTXkgTGlicmFyeSAoa2lkZGluZykgb3duc1xuICAvLyB0aGUgYCRgIHZhcmlhYmxlLlxuICBCYWNrYm9uZS4kID0gJDtcblxuICAvLyBSdW5zIEJhY2tib25lLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBCYWNrYm9uZWAgdmFyaWFibGVcbiAgLy8gdG8gaXRzIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmFja2JvbmUgb2JqZWN0LlxuICBCYWNrYm9uZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5CYWNrYm9uZSA9IHByZXZpb3VzQmFja2JvbmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gVHVybiBvbiBgZW11bGF0ZUhUVFBgIHRvIHN1cHBvcnQgbGVnYWN5IEhUVFAgc2VydmVycy4gU2V0dGluZyB0aGlzIG9wdGlvblxuICAvLyB3aWxsIGZha2UgYFwiUEFUQ0hcImAsIGBcIlBVVFwiYCBhbmQgYFwiREVMRVRFXCJgIHJlcXVlc3RzIHZpYSB0aGUgYF9tZXRob2RgIHBhcmFtZXRlciBhbmRcbiAgLy8gc2V0IGEgYFgtSHR0cC1NZXRob2QtT3ZlcnJpZGVgIGhlYWRlci5cbiAgQmFja2JvbmUuZW11bGF0ZUhUVFAgPSBmYWxzZTtcblxuICAvLyBUdXJuIG9uIGBlbXVsYXRlSlNPTmAgdG8gc3VwcG9ydCBsZWdhY3kgc2VydmVycyB0aGF0IGNhbid0IGRlYWwgd2l0aCBkaXJlY3RcbiAgLy8gYGFwcGxpY2F0aW9uL2pzb25gIHJlcXVlc3RzIC4uLiB3aWxsIGVuY29kZSB0aGUgYm9keSBhc1xuICAvLyBgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkYCBpbnN0ZWFkIGFuZCB3aWxsIHNlbmQgdGhlIG1vZGVsIGluIGFcbiAgLy8gZm9ybSBwYXJhbSBuYW1lZCBgbW9kZWxgLlxuICBCYWNrYm9uZS5lbXVsYXRlSlNPTiA9IGZhbHNlO1xuXG4gIC8vIEJhY2tib25lLkV2ZW50c1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBBIG1vZHVsZSB0aGF0IGNhbiBiZSBtaXhlZCBpbiB0byAqYW55IG9iamVjdCogaW4gb3JkZXIgdG8gcHJvdmlkZSBpdCB3aXRoXG4gIC8vIGN1c3RvbSBldmVudHMuIFlvdSBtYXkgYmluZCB3aXRoIGBvbmAgb3IgcmVtb3ZlIHdpdGggYG9mZmAgY2FsbGJhY2tcbiAgLy8gZnVuY3Rpb25zIHRvIGFuIGV2ZW50OyBgdHJpZ2dlcmAtaW5nIGFuIGV2ZW50IGZpcmVzIGFsbCBjYWxsYmFja3MgaW5cbiAgLy8gc3VjY2Vzc2lvbi5cbiAgLy9cbiAgLy8gICAgIHZhciBvYmplY3QgPSB7fTtcbiAgLy8gICAgIF8uZXh0ZW5kKG9iamVjdCwgQmFja2JvbmUuRXZlbnRzKTtcbiAgLy8gICAgIG9iamVjdC5vbignZXhwYW5kJywgZnVuY3Rpb24oKXsgYWxlcnQoJ2V4cGFuZGVkJyk7IH0pO1xuICAvLyAgICAgb2JqZWN0LnRyaWdnZXIoJ2V4cGFuZCcpO1xuICAvL1xuICB2YXIgRXZlbnRzID0gQmFja2JvbmUuRXZlbnRzID0ge1xuXG4gICAgLy8gQmluZCBhbiBldmVudCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uIFBhc3NpbmcgYFwiYWxsXCJgIHdpbGwgYmluZFxuICAgIC8vIHRoZSBjYWxsYmFjayB0byBhbGwgZXZlbnRzIGZpcmVkLlxuICAgIG9uOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHRoaXMuX2V2ZW50cyB8fCAodGhpcy5fZXZlbnRzID0ge30pO1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSB8fCAodGhpcy5fZXZlbnRzW25hbWVdID0gW10pO1xuICAgICAgZXZlbnRzLnB1c2goe2NhbGxiYWNrOiBjYWxsYmFjaywgY29udGV4dDogY29udGV4dCwgY3R4OiBjb250ZXh0IHx8IHRoaXN9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBCaW5kIGFuIGV2ZW50IHRvIG9ubHkgYmUgdHJpZ2dlcmVkIGEgc2luZ2xlIHRpbWUuIEFmdGVyIHRoZSBmaXJzdCB0aW1lXG4gICAgLy8gdGhlIGNhbGxiYWNrIGlzIGludm9rZWQsIGl0IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICBvbmNlOiBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgaWYgKCFldmVudHNBcGkodGhpcywgJ29uY2UnLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSB8fCAhY2FsbGJhY2spIHJldHVybiB0aGlzO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIG9uY2UgPSBfLm9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYub2ZmKG5hbWUsIG9uY2UpO1xuICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgICBvbmNlLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgcmV0dXJuIHRoaXMub24obmFtZSwgb25jZSwgY29udGV4dCk7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBvbmUgb3IgbWFueSBjYWxsYmFja3MuIElmIGBjb250ZXh0YCBpcyBudWxsLCByZW1vdmVzIGFsbFxuICAgIC8vIGNhbGxiYWNrcyB3aXRoIHRoYXQgZnVuY3Rpb24uIElmIGBjYWxsYmFja2AgaXMgbnVsbCwgcmVtb3ZlcyBhbGxcbiAgICAvLyBjYWxsYmFja3MgZm9yIHRoZSBldmVudC4gSWYgYG5hbWVgIGlzIG51bGwsIHJlbW92ZXMgYWxsIGJvdW5kXG4gICAgLy8gY2FsbGJhY2tzIGZvciBhbGwgZXZlbnRzLlxuICAgIG9mZjogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXRhaW4sIGV2LCBldmVudHMsIG5hbWVzLCBpLCBsLCBqLCBrO1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCAnb2ZmJywgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkpIHJldHVybiB0aGlzO1xuICAgICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB2b2lkIDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgbmFtZXMgPSBuYW1lID8gW25hbWVdIDogXy5rZXlzKHRoaXMuX2V2ZW50cyk7XG4gICAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lc1tpXTtcbiAgICAgICAgaWYgKGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXSkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xuICAgICAgICAgIGlmIChjYWxsYmFjayB8fCBjb250ZXh0KSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwLCBrID0gZXZlbnRzLmxlbmd0aDsgaiA8IGs7IGorKykge1xuICAgICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgICAgaWYgKChjYWxsYmFjayAmJiBjYWxsYmFjayAhPT0gZXYuY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrLl9jYWxsYmFjaykgfHxcbiAgICAgICAgICAgICAgICAgIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGV2LmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0YWluLnB1c2goZXYpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghcmV0YWluLmxlbmd0aCkgZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gVHJpZ2dlciBvbmUgb3IgbWFueSBldmVudHMsIGZpcmluZyBhbGwgYm91bmQgY2FsbGJhY2tzLiBDYWxsYmFja3MgYXJlXG4gICAgLy8gcGFzc2VkIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyBgdHJpZ2dlcmAgaXMsIGFwYXJ0IGZyb20gdGhlIGV2ZW50IG5hbWVcbiAgICAvLyAodW5sZXNzIHlvdSdyZSBsaXN0ZW5pbmcgb24gYFwiYWxsXCJgLCB3aGljaCB3aWxsIGNhdXNlIHlvdXIgY2FsbGJhY2sgdG9cbiAgICAvLyByZWNlaXZlIHRoZSB0cnVlIG5hbWUgb2YgdGhlIGV2ZW50IGFzIHRoZSBmaXJzdCBhcmd1bWVudCkuXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBpZiAoIWV2ZW50c0FwaSh0aGlzLCAndHJpZ2dlcicsIG5hbWUsIGFyZ3MpKSByZXR1cm4gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHNbbmFtZV07XG4gICAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcbiAgICAgIGlmIChldmVudHMpIHRyaWdnZXJFdmVudHMoZXZlbnRzLCBhcmdzKTtcbiAgICAgIGlmIChhbGxFdmVudHMpIHRyaWdnZXJFdmVudHMoYWxsRXZlbnRzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFRlbGwgdGhpcyBvYmplY3QgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gZWl0aGVyIHNwZWNpZmljIGV2ZW50cyAuLi4gb3JcbiAgICAvLyB0byBldmVyeSBvYmplY3QgaXQncyBjdXJyZW50bHkgbGlzdGVuaW5nIHRvLlxuICAgIHN0b3BMaXN0ZW5pbmc6IGZ1bmN0aW9uKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBsaXN0ZW5pbmdUbyA9IHRoaXMuX2xpc3RlbmluZ1RvO1xuICAgICAgaWYgKCFsaXN0ZW5pbmdUbykgcmV0dXJuIHRoaXM7XG4gICAgICB2YXIgcmVtb3ZlID0gIW5hbWUgJiYgIWNhbGxiYWNrO1xuICAgICAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIGNhbGxiYWNrID0gdGhpcztcbiAgICAgIGlmIChvYmopIChsaXN0ZW5pbmdUbyA9IHt9KVtvYmouX2xpc3RlbklkXSA9IG9iajtcbiAgICAgIGZvciAodmFyIGlkIGluIGxpc3RlbmluZ1RvKSB7XG4gICAgICAgIG9iaiA9IGxpc3RlbmluZ1RvW2lkXTtcbiAgICAgICAgb2JqLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICAgIGlmIChyZW1vdmUgfHwgXy5pc0VtcHR5KG9iai5fZXZlbnRzKSkgZGVsZXRlIHRoaXMuX2xpc3RlbmluZ1RvW2lkXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICB9O1xuXG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIHNwbGl0IGV2ZW50IHN0cmluZ3MuXG4gIHZhciBldmVudFNwbGl0dGVyID0gL1xccysvO1xuXG4gIC8vIEltcGxlbWVudCBmYW5jeSBmZWF0dXJlcyBvZiB0aGUgRXZlbnRzIEFQSSBzdWNoIGFzIG11bHRpcGxlIGV2ZW50XG4gIC8vIG5hbWVzIGBcImNoYW5nZSBibHVyXCJgIGFuZCBqUXVlcnktc3R5bGUgZXZlbnQgbWFwcyBge2NoYW5nZTogYWN0aW9ufWBcbiAgLy8gaW4gdGVybXMgb2YgdGhlIGV4aXN0aW5nIEFQSS5cbiAgdmFyIGV2ZW50c0FwaSA9IGZ1bmN0aW9uKG9iaiwgYWN0aW9uLCBuYW1lLCByZXN0KSB7XG4gICAgaWYgKCFuYW1lKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIEhhbmRsZSBldmVudCBtYXBzLlxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW2tleSwgbmFtZVtrZXldXS5jb25jYXQocmVzdCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBzcGFjZSBzZXBhcmF0ZWQgZXZlbnQgbmFtZXMuXG4gICAgaWYgKGV2ZW50U3BsaXR0ZXIudGVzdChuYW1lKSkge1xuICAgICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChldmVudFNwbGl0dGVyKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW25hbWVzW2ldXS5jb25jYXQocmVzdCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIEEgZGlmZmljdWx0LXRvLWJlbGlldmUsIGJ1dCBvcHRpbWl6ZWQgaW50ZXJuYWwgZGlzcGF0Y2ggZnVuY3Rpb24gZm9yXG4gIC8vIHRyaWdnZXJpbmcgZXZlbnRzLiBUcmllcyB0byBrZWVwIHRoZSB1c3VhbCBjYXNlcyBzcGVlZHkgKG1vc3QgaW50ZXJuYWxcbiAgLy8gQmFja2JvbmUgZXZlbnRzIGhhdmUgMyBhcmd1bWVudHMpLlxuICB2YXIgdHJpZ2dlckV2ZW50cyA9IGZ1bmN0aW9uKGV2ZW50cywgYXJncykge1xuICAgIHZhciBldiwgaSA9IC0xLCBsID0gZXZlbnRzLmxlbmd0aCwgYTEgPSBhcmdzWzBdLCBhMiA9IGFyZ3NbMV0sIGEzID0gYXJnc1syXTtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4KTsgcmV0dXJuO1xuICAgICAgY2FzZSAxOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEpOyByZXR1cm47XG4gICAgICBjYXNlIDI6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIpOyByZXR1cm47XG4gICAgICBjYXNlIDM6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIsIGEzKTsgcmV0dXJuO1xuICAgICAgZGVmYXVsdDogd2hpbGUgKCsraSA8IGwpIChldiA9IGV2ZW50c1tpXSkuY2FsbGJhY2suYXBwbHkoZXYuY3R4LCBhcmdzKTsgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbGlzdGVuTWV0aG9kcyA9IHtsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG4gIC8vIEludmVyc2lvbi1vZi1jb250cm9sIHZlcnNpb25zIG9mIGBvbmAgYW5kIGBvbmNlYC4gVGVsbCAqdGhpcyogb2JqZWN0IHRvXG4gIC8vIGxpc3RlbiB0byBhbiBldmVudCBpbiBhbm90aGVyIG9iamVjdCAuLi4ga2VlcGluZyB0cmFjayBvZiB3aGF0IGl0J3NcbiAgLy8gbGlzdGVuaW5nIHRvLlxuICBfLmVhY2gobGlzdGVuTWV0aG9kcywgZnVuY3Rpb24oaW1wbGVtZW50YXRpb24sIG1ldGhvZCkge1xuICAgIEV2ZW50c1ttZXRob2RdID0gZnVuY3Rpb24ob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgICAgdmFyIGxpc3RlbmluZ1RvID0gdGhpcy5fbGlzdGVuaW5nVG8gfHwgKHRoaXMuX2xpc3RlbmluZ1RvID0ge30pO1xuICAgICAgdmFyIGlkID0gb2JqLl9saXN0ZW5JZCB8fCAob2JqLl9saXN0ZW5JZCA9IF8udW5pcXVlSWQoJ2wnKSk7XG4gICAgICBsaXN0ZW5pbmdUb1tpZF0gPSBvYmo7XG4gICAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgY2FsbGJhY2sgPSB0aGlzO1xuICAgICAgb2JqW2ltcGxlbWVudGF0aW9uXShuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9KTtcblxuICAvLyBBbGlhc2VzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgRXZlbnRzLmJpbmQgICA9IEV2ZW50cy5vbjtcbiAgRXZlbnRzLnVuYmluZCA9IEV2ZW50cy5vZmY7XG5cbiAgLy8gQWxsb3cgdGhlIGBCYWNrYm9uZWAgb2JqZWN0IHRvIHNlcnZlIGFzIGEgZ2xvYmFsIGV2ZW50IGJ1cywgZm9yIGZvbGtzIHdob1xuICAvLyB3YW50IGdsb2JhbCBcInB1YnN1YlwiIGluIGEgY29udmVuaWVudCBwbGFjZS5cbiAgXy5leHRlbmQoQmFja2JvbmUsIEV2ZW50cyk7XG5cbiAgLy8gQmFja2JvbmUuTW9kZWxcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBCYWNrYm9uZSAqKk1vZGVscyoqIGFyZSB0aGUgYmFzaWMgZGF0YSBvYmplY3QgaW4gdGhlIGZyYW1ld29yayAtLVxuICAvLyBmcmVxdWVudGx5IHJlcHJlc2VudGluZyBhIHJvdyBpbiBhIHRhYmxlIGluIGEgZGF0YWJhc2Ugb24geW91ciBzZXJ2ZXIuXG4gIC8vIEEgZGlzY3JldGUgY2h1bmsgb2YgZGF0YSBhbmQgYSBidW5jaCBvZiB1c2VmdWwsIHJlbGF0ZWQgbWV0aG9kcyBmb3JcbiAgLy8gcGVyZm9ybWluZyBjb21wdXRhdGlvbnMgYW5kIHRyYW5zZm9ybWF0aW9ucyBvbiB0aGF0IGRhdGEuXG5cbiAgLy8gQ3JlYXRlIGEgbmV3IG1vZGVsIHdpdGggdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGVzLiBBIGNsaWVudCBpZCAoYGNpZGApXG4gIC8vIGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGFuZCBhc3NpZ25lZCBmb3IgeW91LlxuICB2YXIgTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbCA9IGZ1bmN0aW9uKGF0dHJpYnV0ZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgYXR0cnMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgdGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCdjJyk7XG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XG4gICAgaWYgKG9wdGlvbnMuY29sbGVjdGlvbikgdGhpcy5jb2xsZWN0aW9uID0gb3B0aW9ucy5jb2xsZWN0aW9uO1xuICAgIGlmIChvcHRpb25zLnBhcnNlKSBhdHRycyA9IHRoaXMucGFyc2UoYXR0cnMsIG9wdGlvbnMpIHx8IHt9O1xuICAgIGF0dHJzID0gXy5kZWZhdWx0cyh7fSwgYXR0cnMsIF8ucmVzdWx0KHRoaXMsICdkZWZhdWx0cycpKTtcbiAgICB0aGlzLnNldChhdHRycywgb3B0aW9ucyk7XG4gICAgdGhpcy5jaGFuZ2VkID0ge307XG4gICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQXR0YWNoIGFsbCBpbmhlcml0YWJsZSBtZXRob2RzIHRvIHRoZSBNb2RlbCBwcm90b3R5cGUuXG4gIF8uZXh0ZW5kKE1vZGVsLnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cbiAgICAvLyBBIGhhc2ggb2YgYXR0cmlidXRlcyB3aG9zZSBjdXJyZW50IGFuZCBwcmV2aW91cyB2YWx1ZSBkaWZmZXIuXG4gICAgY2hhbmdlZDogbnVsbCxcblxuICAgIC8vIFRoZSB2YWx1ZSByZXR1cm5lZCBkdXJpbmcgdGhlIGxhc3QgZmFpbGVkIHZhbGlkYXRpb24uXG4gICAgdmFsaWRhdGlvbkVycm9yOiBudWxsLFxuXG4gICAgLy8gVGhlIGRlZmF1bHQgbmFtZSBmb3IgdGhlIEpTT04gYGlkYCBhdHRyaWJ1dGUgaXMgYFwiaWRcImAuIE1vbmdvREIgYW5kXG4gICAgLy8gQ291Y2hEQiB1c2VycyBtYXkgd2FudCB0byBzZXQgdGhpcyB0byBgXCJfaWRcImAuXG4gICAgaWRBdHRyaWJ1dGU6ICdpZCcsXG5cbiAgICAvLyBJbml0aWFsaXplIGlzIGFuIGVtcHR5IGZ1bmN0aW9uIGJ5IGRlZmF1bHQuIE92ZXJyaWRlIGl0IHdpdGggeW91ciBvd25cbiAgICAvLyBpbml0aWFsaXphdGlvbiBsb2dpYy5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cbiAgICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBtb2RlbCdzIGBhdHRyaWJ1dGVzYCBvYmplY3QuXG4gICAgdG9KU09OOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICByZXR1cm4gXy5jbG9uZSh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgIH0sXG5cbiAgICAvLyBQcm94eSBgQmFja2JvbmUuc3luY2AgYnkgZGVmYXVsdCAtLSBidXQgb3ZlcnJpZGUgdGhpcyBpZiB5b3UgbmVlZFxuICAgIC8vIGN1c3RvbSBzeW5jaW5nIHNlbWFudGljcyBmb3IgKnRoaXMqIHBhcnRpY3VsYXIgbW9kZWwuXG4gICAgc3luYzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gQmFja2JvbmUuc3luYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZS5cbiAgICBnZXQ6IGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNbYXR0cl07XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgSFRNTC1lc2NhcGVkIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZS5cbiAgICBlc2NhcGU6IGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgIHJldHVybiBfLmVzY2FwZSh0aGlzLmdldChhdHRyKSk7XG4gICAgfSxcblxuICAgIC8vIFJldHVybnMgYHRydWVgIGlmIHRoZSBhdHRyaWJ1dGUgY29udGFpbnMgYSB2YWx1ZSB0aGF0IGlzIG5vdCBudWxsXG4gICAgLy8gb3IgdW5kZWZpbmVkLlxuICAgIGhhczogZnVuY3Rpb24oYXR0cikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KGF0dHIpICE9IG51bGw7XG4gICAgfSxcblxuICAgIC8vIFNldCBhIGhhc2ggb2YgbW9kZWwgYXR0cmlidXRlcyBvbiB0aGUgb2JqZWN0LCBmaXJpbmcgYFwiY2hhbmdlXCJgLiBUaGlzIGlzXG4gICAgLy8gdGhlIGNvcmUgcHJpbWl0aXZlIG9wZXJhdGlvbiBvZiBhIG1vZGVsLCB1cGRhdGluZyB0aGUgZGF0YSBhbmQgbm90aWZ5aW5nXG4gICAgLy8gYW55b25lIHdobyBuZWVkcyB0byBrbm93IGFib3V0IHRoZSBjaGFuZ2UgaW4gc3RhdGUuIFRoZSBoZWFydCBvZiB0aGUgYmVhc3QuXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbCwgb3B0aW9ucykge1xuICAgICAgdmFyIGF0dHIsIGF0dHJzLCB1bnNldCwgY2hhbmdlcywgc2lsZW50LCBjaGFuZ2luZywgcHJldiwgY3VycmVudDtcbiAgICAgIGlmIChrZXkgPT0gbnVsbCkgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIEhhbmRsZSBib3RoIGBcImtleVwiLCB2YWx1ZWAgYW5kIGB7a2V5OiB2YWx1ZX1gIC1zdHlsZSBhcmd1bWVudHMuXG4gICAgICBpZiAodHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYXR0cnMgPSBrZXk7XG4gICAgICAgIG9wdGlvbnMgPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoYXR0cnMgPSB7fSlba2V5XSA9IHZhbDtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgICAgLy8gUnVuIHZhbGlkYXRpb24uXG4gICAgICBpZiAoIXRoaXMuX3ZhbGlkYXRlKGF0dHJzLCBvcHRpb25zKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBFeHRyYWN0IGF0dHJpYnV0ZXMgYW5kIG9wdGlvbnMuXG4gICAgICB1bnNldCAgICAgICAgICAgPSBvcHRpb25zLnVuc2V0O1xuICAgICAgc2lsZW50ICAgICAgICAgID0gb3B0aW9ucy5zaWxlbnQ7XG4gICAgICBjaGFuZ2VzICAgICAgICAgPSBbXTtcbiAgICAgIGNoYW5naW5nICAgICAgICA9IHRoaXMuX2NoYW5naW5nO1xuICAgICAgdGhpcy5fY2hhbmdpbmcgID0gdHJ1ZTtcblxuICAgICAgaWYgKCFjaGFuZ2luZykge1xuICAgICAgICB0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMgPSBfLmNsb25lKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IHt9O1xuICAgICAgfVxuICAgICAgY3VycmVudCA9IHRoaXMuYXR0cmlidXRlcywgcHJldiA9IHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlcztcblxuICAgICAgLy8gQ2hlY2sgZm9yIGNoYW5nZXMgb2YgYGlkYC5cbiAgICAgIGlmICh0aGlzLmlkQXR0cmlidXRlIGluIGF0dHJzKSB0aGlzLmlkID0gYXR0cnNbdGhpcy5pZEF0dHJpYnV0ZV07XG5cbiAgICAgIC8vIEZvciBlYWNoIGBzZXRgIGF0dHJpYnV0ZSwgdXBkYXRlIG9yIGRlbGV0ZSB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICAgIGZvciAoYXR0ciBpbiBhdHRycykge1xuICAgICAgICB2YWwgPSBhdHRyc1thdHRyXTtcbiAgICAgICAgaWYgKCFfLmlzRXF1YWwoY3VycmVudFthdHRyXSwgdmFsKSkgY2hhbmdlcy5wdXNoKGF0dHIpO1xuICAgICAgICBpZiAoIV8uaXNFcXVhbChwcmV2W2F0dHJdLCB2YWwpKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VkW2F0dHJdID0gdmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmNoYW5nZWRbYXR0cl07XG4gICAgICAgIH1cbiAgICAgICAgdW5zZXQgPyBkZWxldGUgY3VycmVudFthdHRyXSA6IGN1cnJlbnRbYXR0cl0gPSB2YWw7XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaWdnZXIgYWxsIHJlbGV2YW50IGF0dHJpYnV0ZSBjaGFuZ2VzLlxuICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoKSB0aGlzLl9wZW5kaW5nID0gb3B0aW9ucztcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGFuZ2VzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHRoaXMudHJpZ2dlcignY2hhbmdlOicgKyBjaGFuZ2VzW2ldLCB0aGlzLCBjdXJyZW50W2NoYW5nZXNbaV1dLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBZb3UgbWlnaHQgYmUgd29uZGVyaW5nIHdoeSB0aGVyZSdzIGEgYHdoaWxlYCBsb29wIGhlcmUuIENoYW5nZXMgY2FuXG4gICAgICAvLyBiZSByZWN1cnNpdmVseSBuZXN0ZWQgd2l0aGluIGBcImNoYW5nZVwiYCBldmVudHMuXG4gICAgICBpZiAoY2hhbmdpbmcpIHJldHVybiB0aGlzO1xuICAgICAgaWYgKCFzaWxlbnQpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMuX3BlbmRpbmcpIHtcbiAgICAgICAgICBvcHRpb25zID0gdGhpcy5fcGVuZGluZztcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKCdjaGFuZ2UnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fcGVuZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fY2hhbmdpbmcgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYW4gYXR0cmlidXRlIGZyb20gdGhlIG1vZGVsLCBmaXJpbmcgYFwiY2hhbmdlXCJgLiBgdW5zZXRgIGlzIGEgbm9vcFxuICAgIC8vIGlmIHRoZSBhdHRyaWJ1dGUgZG9lc24ndCBleGlzdC5cbiAgICB1bnNldDogZnVuY3Rpb24oYXR0ciwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0KGF0dHIsIHZvaWQgMCwgXy5leHRlbmQoe30sIG9wdGlvbnMsIHt1bnNldDogdHJ1ZX0pKTtcbiAgICB9LFxuXG4gICAgLy8gQ2xlYXIgYWxsIGF0dHJpYnV0ZXMgb24gdGhlIG1vZGVsLCBmaXJpbmcgYFwiY2hhbmdlXCJgLlxuICAgIGNsZWFyOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgYXR0cnMgPSB7fTtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmF0dHJpYnV0ZXMpIGF0dHJzW2tleV0gPSB2b2lkIDA7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoYXR0cnMsIF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB7dW5zZXQ6IHRydWV9KSk7XG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSBpZiB0aGUgbW9kZWwgaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3QgYFwiY2hhbmdlXCJgIGV2ZW50LlxuICAgIC8vIElmIHlvdSBzcGVjaWZ5IGFuIGF0dHJpYnV0ZSBuYW1lLCBkZXRlcm1pbmUgaWYgdGhhdCBhdHRyaWJ1dGUgaGFzIGNoYW5nZWQuXG4gICAgaGFzQ2hhbmdlZDogZnVuY3Rpb24oYXR0cikge1xuICAgICAgaWYgKGF0dHIgPT0gbnVsbCkgcmV0dXJuICFfLmlzRW1wdHkodGhpcy5jaGFuZ2VkKTtcbiAgICAgIHJldHVybiBfLmhhcyh0aGlzLmNoYW5nZWQsIGF0dHIpO1xuICAgIH0sXG5cbiAgICAvLyBSZXR1cm4gYW4gb2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBhdHRyaWJ1dGVzIHRoYXQgaGF2ZSBjaGFuZ2VkLCBvclxuICAgIC8vIGZhbHNlIGlmIHRoZXJlIGFyZSBubyBjaGFuZ2VkIGF0dHJpYnV0ZXMuIFVzZWZ1bCBmb3IgZGV0ZXJtaW5pbmcgd2hhdFxuICAgIC8vIHBhcnRzIG9mIGEgdmlldyBuZWVkIHRvIGJlIHVwZGF0ZWQgYW5kL29yIHdoYXQgYXR0cmlidXRlcyBuZWVkIHRvIGJlXG4gICAgLy8gcGVyc2lzdGVkIHRvIHRoZSBzZXJ2ZXIuIFVuc2V0IGF0dHJpYnV0ZXMgd2lsbCBiZSBzZXQgdG8gdW5kZWZpbmVkLlxuICAgIC8vIFlvdSBjYW4gYWxzbyBwYXNzIGFuIGF0dHJpYnV0ZXMgb2JqZWN0IHRvIGRpZmYgYWdhaW5zdCB0aGUgbW9kZWwsXG4gICAgLy8gZGV0ZXJtaW5pbmcgaWYgdGhlcmUgKndvdWxkIGJlKiBhIGNoYW5nZS5cbiAgICBjaGFuZ2VkQXR0cmlidXRlczogZnVuY3Rpb24oZGlmZikge1xuICAgICAgaWYgKCFkaWZmKSByZXR1cm4gdGhpcy5oYXNDaGFuZ2VkKCkgPyBfLmNsb25lKHRoaXMuY2hhbmdlZCkgOiBmYWxzZTtcbiAgICAgIHZhciB2YWwsIGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIHZhciBvbGQgPSB0aGlzLl9jaGFuZ2luZyA/IHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlcyA6IHRoaXMuYXR0cmlidXRlcztcbiAgICAgIGZvciAodmFyIGF0dHIgaW4gZGlmZikge1xuICAgICAgICBpZiAoXy5pc0VxdWFsKG9sZFthdHRyXSwgKHZhbCA9IGRpZmZbYXR0cl0pKSkgY29udGludWU7XG4gICAgICAgIChjaGFuZ2VkIHx8IChjaGFuZ2VkID0ge30pKVthdHRyXSA9IHZhbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFuZ2VkO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHByZXZpb3VzIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSwgcmVjb3JkZWQgYXQgdGhlIHRpbWUgdGhlIGxhc3RcbiAgICAvLyBgXCJjaGFuZ2VcImAgZXZlbnQgd2FzIGZpcmVkLlxuICAgIHByZXZpb3VzOiBmdW5jdGlvbihhdHRyKSB7XG4gICAgICBpZiAoYXR0ciA9PSBudWxsIHx8ICF0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuX3ByZXZpb3VzQXR0cmlidXRlc1thdHRyXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IGFsbCBvZiB0aGUgYXR0cmlidXRlcyBvZiB0aGUgbW9kZWwgYXQgdGhlIHRpbWUgb2YgdGhlIHByZXZpb3VzXG4gICAgLy8gYFwiY2hhbmdlXCJgIGV2ZW50LlxuICAgIHByZXZpb3VzQXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy5jbG9uZSh0aGlzLl9wcmV2aW91c0F0dHJpYnV0ZXMpO1xuICAgIH0sXG5cbiAgICAvLyBGZXRjaCB0aGUgbW9kZWwgZnJvbSB0aGUgc2VydmVyLiBJZiB0aGUgc2VydmVyJ3MgcmVwcmVzZW50YXRpb24gb2YgdGhlXG4gICAgLy8gbW9kZWwgZGlmZmVycyBmcm9tIGl0cyBjdXJyZW50IGF0dHJpYnV0ZXMsIHRoZXkgd2lsbCBiZSBvdmVycmlkZGVuLFxuICAgIC8vIHRyaWdnZXJpbmcgYSBgXCJjaGFuZ2VcImAgZXZlbnQuXG4gICAgZmV0Y2g6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gXy5jbG9uZShvcHRpb25zKSA6IHt9O1xuICAgICAgaWYgKG9wdGlvbnMucGFyc2UgPT09IHZvaWQgMCkgb3B0aW9ucy5wYXJzZSA9IHRydWU7XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzO1xuICAgICAgdmFyIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3M7XG4gICAgICBvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIGlmICghbW9kZWwuc2V0KG1vZGVsLnBhcnNlKHJlc3AsIG9wdGlvbnMpLCBvcHRpb25zKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcyhtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICAgIG1vZGVsLnRyaWdnZXIoJ3N5bmMnLCBtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICB9O1xuICAgICAgd3JhcEVycm9yKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHRoaXMuc3luYygncmVhZCcsIHRoaXMsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgYSBoYXNoIG9mIG1vZGVsIGF0dHJpYnV0ZXMsIGFuZCBzeW5jIHRoZSBtb2RlbCB0byB0aGUgc2VydmVyLlxuICAgIC8vIElmIHRoZSBzZXJ2ZXIgcmV0dXJucyBhbiBhdHRyaWJ1dGVzIGhhc2ggdGhhdCBkaWZmZXJzLCB0aGUgbW9kZWwnc1xuICAgIC8vIHN0YXRlIHdpbGwgYmUgYHNldGAgYWdhaW4uXG4gICAgc2F2ZTogZnVuY3Rpb24oa2V5LCB2YWwsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBhdHRycywgbWV0aG9kLCB4aHIsIGF0dHJpYnV0ZXMgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cbiAgICAgIC8vIEhhbmRsZSBib3RoIGBcImtleVwiLCB2YWx1ZWAgYW5kIGB7a2V5OiB2YWx1ZX1gIC1zdHlsZSBhcmd1bWVudHMuXG4gICAgICBpZiAoa2V5ID09IG51bGwgfHwgdHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgYXR0cnMgPSBrZXk7XG4gICAgICAgIG9wdGlvbnMgPSB2YWw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoYXR0cnMgPSB7fSlba2V5XSA9IHZhbDtcbiAgICAgIH1cblxuICAgICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHt2YWxpZGF0ZTogdHJ1ZX0sIG9wdGlvbnMpO1xuXG4gICAgICAvLyBJZiB3ZSdyZSBub3Qgd2FpdGluZyBhbmQgYXR0cmlidXRlcyBleGlzdCwgc2F2ZSBhY3RzIGFzXG4gICAgICAvLyBgc2V0KGF0dHIpLnNhdmUobnVsbCwgb3B0cylgIHdpdGggdmFsaWRhdGlvbi4gT3RoZXJ3aXNlLCBjaGVjayBpZlxuICAgICAgLy8gdGhlIG1vZGVsIHdpbGwgYmUgdmFsaWQgd2hlbiB0aGUgYXR0cmlidXRlcywgaWYgYW55LCBhcmUgc2V0LlxuICAgICAgaWYgKGF0dHJzICYmICFvcHRpb25zLndhaXQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNldChhdHRycywgb3B0aW9ucykpIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy5fdmFsaWRhdGUoYXR0cnMsIG9wdGlvbnMpKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0ZW1wb3JhcnkgYXR0cmlidXRlcyBpZiBge3dhaXQ6IHRydWV9YC5cbiAgICAgIGlmIChhdHRycyAmJiBvcHRpb25zLndhaXQpIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0gXy5leHRlbmQoe30sIGF0dHJpYnV0ZXMsIGF0dHJzKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWZ0ZXIgYSBzdWNjZXNzZnVsIHNlcnZlci1zaWRlIHNhdmUsIHRoZSBjbGllbnQgaXMgKG9wdGlvbmFsbHkpXG4gICAgICAvLyB1cGRhdGVkIHdpdGggdGhlIHNlcnZlci1zaWRlIHN0YXRlLlxuICAgICAgaWYgKG9wdGlvbnMucGFyc2UgPT09IHZvaWQgMCkgb3B0aW9ucy5wYXJzZSA9IHRydWU7XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzO1xuICAgICAgdmFyIHN1Y2Nlc3MgPSBvcHRpb25zLnN1Y2Nlc3M7XG4gICAgICBvcHRpb25zLnN1Y2Nlc3MgPSBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIC8vIEVuc3VyZSBhdHRyaWJ1dGVzIGFyZSByZXN0b3JlZCBkdXJpbmcgc3luY2hyb25vdXMgc2F2ZXMuXG4gICAgICAgIG1vZGVsLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuICAgICAgICB2YXIgc2VydmVyQXR0cnMgPSBtb2RlbC5wYXJzZShyZXNwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKG9wdGlvbnMud2FpdCkgc2VydmVyQXR0cnMgPSBfLmV4dGVuZChhdHRycyB8fCB7fSwgc2VydmVyQXR0cnMpO1xuICAgICAgICBpZiAoXy5pc09iamVjdChzZXJ2ZXJBdHRycykgJiYgIW1vZGVsLnNldChzZXJ2ZXJBdHRycywgb3B0aW9ucykpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHN1Y2Nlc3MobW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgICBtb2RlbC50cmlnZ2VyKCdzeW5jJywgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgfTtcbiAgICAgIHdyYXBFcnJvcih0aGlzLCBvcHRpb25zKTtcblxuICAgICAgbWV0aG9kID0gdGhpcy5pc05ldygpID8gJ2NyZWF0ZScgOiAob3B0aW9ucy5wYXRjaCA/ICdwYXRjaCcgOiAndXBkYXRlJyk7XG4gICAgICBpZiAobWV0aG9kID09PSAncGF0Y2gnKSBvcHRpb25zLmF0dHJzID0gYXR0cnM7XG4gICAgICB4aHIgPSB0aGlzLnN5bmMobWV0aG9kLCB0aGlzLCBvcHRpb25zKTtcblxuICAgICAgLy8gUmVzdG9yZSBhdHRyaWJ1dGVzLlxuICAgICAgaWYgKGF0dHJzICYmIG9wdGlvbnMud2FpdCkgdGhpcy5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcblxuICAgICAgcmV0dXJuIHhocjtcbiAgICB9LFxuXG4gICAgLy8gRGVzdHJveSB0aGlzIG1vZGVsIG9uIHRoZSBzZXJ2ZXIgaWYgaXQgd2FzIGFscmVhZHkgcGVyc2lzdGVkLlxuICAgIC8vIE9wdGltaXN0aWNhbGx5IHJlbW92ZXMgdGhlIG1vZGVsIGZyb20gaXRzIGNvbGxlY3Rpb24sIGlmIGl0IGhhcyBvbmUuXG4gICAgLy8gSWYgYHdhaXQ6IHRydWVgIGlzIHBhc3NlZCwgd2FpdHMgZm9yIHRoZSBzZXJ2ZXIgdG8gcmVzcG9uZCBiZWZvcmUgcmVtb3ZhbC5cbiAgICBkZXN0cm95OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IF8uY2xvbmUob3B0aW9ucykgOiB7fTtcbiAgICAgIHZhciBtb2RlbCA9IHRoaXM7XG4gICAgICB2YXIgc3VjY2VzcyA9IG9wdGlvbnMuc3VjY2VzcztcblxuICAgICAgdmFyIGRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbW9kZWwudHJpZ2dlcignZGVzdHJveScsIG1vZGVsLCBtb2RlbC5jb2xsZWN0aW9uLCBvcHRpb25zKTtcbiAgICAgIH07XG5cbiAgICAgIG9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMud2FpdCB8fCBtb2RlbC5pc05ldygpKSBkZXN0cm95KCk7XG4gICAgICAgIGlmIChzdWNjZXNzKSBzdWNjZXNzKG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKCFtb2RlbC5pc05ldygpKSBtb2RlbC50cmlnZ2VyKCdzeW5jJywgbW9kZWwsIHJlc3AsIG9wdGlvbnMpO1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuaXNOZXcoKSkge1xuICAgICAgICBvcHRpb25zLnN1Y2Nlc3MoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgd3JhcEVycm9yKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICB2YXIgeGhyID0gdGhpcy5zeW5jKCdkZWxldGUnLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgIGlmICghb3B0aW9ucy53YWl0KSBkZXN0cm95KCk7XG4gICAgICByZXR1cm4geGhyO1xuICAgIH0sXG5cbiAgICAvLyBEZWZhdWx0IFVSTCBmb3IgdGhlIG1vZGVsJ3MgcmVwcmVzZW50YXRpb24gb24gdGhlIHNlcnZlciAtLSBpZiB5b3UncmVcbiAgICAvLyB1c2luZyBCYWNrYm9uZSdzIHJlc3RmdWwgbWV0aG9kcywgb3ZlcnJpZGUgdGhpcyB0byBjaGFuZ2UgdGhlIGVuZHBvaW50XG4gICAgLy8gdGhhdCB3aWxsIGJlIGNhbGxlZC5cbiAgICB1cmw6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGJhc2UgPVxuICAgICAgICBfLnJlc3VsdCh0aGlzLCAndXJsUm9vdCcpIHx8XG4gICAgICAgIF8ucmVzdWx0KHRoaXMuY29sbGVjdGlvbiwgJ3VybCcpIHx8XG4gICAgICAgIHVybEVycm9yKCk7XG4gICAgICBpZiAodGhpcy5pc05ldygpKSByZXR1cm4gYmFzZTtcbiAgICAgIHJldHVybiBiYXNlLnJlcGxhY2UoLyhbXlxcL10pJC8sICckMS8nKSArIGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLmlkKTtcbiAgICB9LFxuXG4gICAgLy8gKipwYXJzZSoqIGNvbnZlcnRzIGEgcmVzcG9uc2UgaW50byB0aGUgaGFzaCBvZiBhdHRyaWJ1dGVzIHRvIGJlIGBzZXRgIG9uXG4gICAgLy8gdGhlIG1vZGVsLiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpcyBqdXN0IHRvIHBhc3MgdGhlIHJlc3BvbnNlIGFsb25nLlxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gcmVzcDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IG1vZGVsIHdpdGggaWRlbnRpY2FsIGF0dHJpYnV0ZXMgdG8gdGhpcyBvbmUuXG4gICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgfSxcblxuICAgIC8vIEEgbW9kZWwgaXMgbmV3IGlmIGl0IGhhcyBuZXZlciBiZWVuIHNhdmVkIHRvIHRoZSBzZXJ2ZXIsIGFuZCBsYWNrcyBhbiBpZC5cbiAgICBpc05ldzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXRoaXMuaGFzKHRoaXMuaWRBdHRyaWJ1dGUpO1xuICAgIH0sXG5cbiAgICAvLyBDaGVjayBpZiB0aGUgbW9kZWwgaXMgY3VycmVudGx5IGluIGEgdmFsaWQgc3RhdGUuXG4gICAgaXNWYWxpZDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRlKHt9LCBfLmV4dGVuZChvcHRpb25zIHx8IHt9LCB7IHZhbGlkYXRlOiB0cnVlIH0pKTtcbiAgICB9LFxuXG4gICAgLy8gUnVuIHZhbGlkYXRpb24gYWdhaW5zdCB0aGUgbmV4dCBjb21wbGV0ZSBzZXQgb2YgbW9kZWwgYXR0cmlidXRlcyxcbiAgICAvLyByZXR1cm5pbmcgYHRydWVgIGlmIGFsbCBpcyB3ZWxsLiBPdGhlcndpc2UsIGZpcmUgYW4gYFwiaW52YWxpZFwiYCBldmVudC5cbiAgICBfdmFsaWRhdGU6IGZ1bmN0aW9uKGF0dHJzLCBvcHRpb25zKSB7XG4gICAgICBpZiAoIW9wdGlvbnMudmFsaWRhdGUgfHwgIXRoaXMudmFsaWRhdGUpIHJldHVybiB0cnVlO1xuICAgICAgYXR0cnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5hdHRyaWJ1dGVzLCBhdHRycyk7XG4gICAgICB2YXIgZXJyb3IgPSB0aGlzLnZhbGlkYXRpb25FcnJvciA9IHRoaXMudmFsaWRhdGUoYXR0cnMsIG9wdGlvbnMpIHx8IG51bGw7XG4gICAgICBpZiAoIWVycm9yKSByZXR1cm4gdHJ1ZTtcbiAgICAgIHRoaXMudHJpZ2dlcignaW52YWxpZCcsIHRoaXMsIGVycm9yLCBfLmV4dGVuZChvcHRpb25zLCB7dmFsaWRhdGlvbkVycm9yOiBlcnJvcn0pKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gVW5kZXJzY29yZSBtZXRob2RzIHRoYXQgd2Ugd2FudCB0byBpbXBsZW1lbnQgb24gdGhlIE1vZGVsLlxuICB2YXIgbW9kZWxNZXRob2RzID0gWydrZXlzJywgJ3ZhbHVlcycsICdwYWlycycsICdpbnZlcnQnLCAncGljaycsICdvbWl0J107XG5cbiAgLy8gTWl4IGluIGVhY2ggVW5kZXJzY29yZSBtZXRob2QgYXMgYSBwcm94eSB0byBgTW9kZWwjYXR0cmlidXRlc2AuXG4gIF8uZWFjaChtb2RlbE1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIE1vZGVsLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGFyZ3MudW5zaGlmdCh0aGlzLmF0dHJpYnV0ZXMpO1xuICAgICAgcmV0dXJuIF9bbWV0aG9kXS5hcHBseShfLCBhcmdzKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBCYWNrYm9uZS5Db2xsZWN0aW9uXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBJZiBtb2RlbHMgdGVuZCB0byByZXByZXNlbnQgYSBzaW5nbGUgcm93IG9mIGRhdGEsIGEgQmFja2JvbmUgQ29sbGVjdGlvbiBpc1xuICAvLyBtb3JlIGFuYWxhZ291cyB0byBhIHRhYmxlIGZ1bGwgb2YgZGF0YSAuLi4gb3IgYSBzbWFsbCBzbGljZSBvciBwYWdlIG9mIHRoYXRcbiAgLy8gdGFibGUsIG9yIGEgY29sbGVjdGlvbiBvZiByb3dzIHRoYXQgYmVsb25nIHRvZ2V0aGVyIGZvciBhIHBhcnRpY3VsYXIgcmVhc29uXG4gIC8vIC0tIGFsbCBvZiB0aGUgbWVzc2FnZXMgaW4gdGhpcyBwYXJ0aWN1bGFyIGZvbGRlciwgYWxsIG9mIHRoZSBkb2N1bWVudHNcbiAgLy8gYmVsb25naW5nIHRvIHRoaXMgcGFydGljdWxhciBhdXRob3IsIGFuZCBzbyBvbi4gQ29sbGVjdGlvbnMgbWFpbnRhaW5cbiAgLy8gaW5kZXhlcyBvZiB0aGVpciBtb2RlbHMsIGJvdGggaW4gb3JkZXIsIGFuZCBmb3IgbG9va3VwIGJ5IGBpZGAuXG5cbiAgLy8gQ3JlYXRlIGEgbmV3ICoqQ29sbGVjdGlvbioqLCBwZXJoYXBzIHRvIGNvbnRhaW4gYSBzcGVjaWZpYyB0eXBlIG9mIGBtb2RlbGAuXG4gIC8vIElmIGEgYGNvbXBhcmF0b3JgIGlzIHNwZWNpZmllZCwgdGhlIENvbGxlY3Rpb24gd2lsbCBtYWludGFpblxuICAvLyBpdHMgbW9kZWxzIGluIHNvcnQgb3JkZXIsIGFzIHRoZXkncmUgYWRkZWQgYW5kIHJlbW92ZWQuXG4gIHZhciBDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgaWYgKG9wdGlvbnMubW9kZWwpIHRoaXMubW9kZWwgPSBvcHRpb25zLm1vZGVsO1xuICAgIGlmIChvcHRpb25zLmNvbXBhcmF0b3IgIT09IHZvaWQgMCkgdGhpcy5jb21wYXJhdG9yID0gb3B0aW9ucy5jb21wYXJhdG9yO1xuICAgIHRoaXMuX3Jlc2V0KCk7XG4gICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKG1vZGVscykgdGhpcy5yZXNldChtb2RlbHMsIF8uZXh0ZW5kKHtzaWxlbnQ6IHRydWV9LCBvcHRpb25zKSk7XG4gIH07XG5cbiAgLy8gRGVmYXVsdCBvcHRpb25zIGZvciBgQ29sbGVjdGlvbiNzZXRgLlxuICB2YXIgc2V0T3B0aW9ucyA9IHthZGQ6IHRydWUsIHJlbW92ZTogdHJ1ZSwgbWVyZ2U6IHRydWV9O1xuICB2YXIgYWRkT3B0aW9ucyA9IHthZGQ6IHRydWUsIHJlbW92ZTogZmFsc2V9O1xuXG4gIC8vIERlZmluZSB0aGUgQ29sbGVjdGlvbidzIGluaGVyaXRhYmxlIG1ldGhvZHMuXG4gIF8uZXh0ZW5kKENvbGxlY3Rpb24ucHJvdG90eXBlLCBFdmVudHMsIHtcblxuICAgIC8vIFRoZSBkZWZhdWx0IG1vZGVsIGZvciBhIGNvbGxlY3Rpb24gaXMganVzdCBhICoqQmFja2JvbmUuTW9kZWwqKi5cbiAgICAvLyBUaGlzIHNob3VsZCBiZSBvdmVycmlkZGVuIGluIG1vc3QgY2FzZXMuXG4gICAgbW9kZWw6IE1vZGVsLFxuXG4gICAgLy8gSW5pdGlhbGl6ZSBpcyBhbiBlbXB0eSBmdW5jdGlvbiBieSBkZWZhdWx0LiBPdmVycmlkZSBpdCB3aXRoIHlvdXIgb3duXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gbG9naWMuXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKXt9LFxuXG4gICAgLy8gVGhlIEpTT04gcmVwcmVzZW50YXRpb24gb2YgYSBDb2xsZWN0aW9uIGlzIGFuIGFycmF5IG9mIHRoZVxuICAgIC8vIG1vZGVscycgYXR0cmlidXRlcy5cbiAgICB0b0pTT046IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbihtb2RlbCl7IHJldHVybiBtb2RlbC50b0pTT04ob3B0aW9ucyk7IH0pO1xuICAgIH0sXG5cbiAgICAvLyBQcm94eSBgQmFja2JvbmUuc3luY2AgYnkgZGVmYXVsdC5cbiAgICBzeW5jOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBCYWNrYm9uZS5zeW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIG1vZGVsLCBvciBsaXN0IG9mIG1vZGVscyB0byB0aGUgc2V0LlxuICAgIGFkZDogZnVuY3Rpb24obW9kZWxzLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXQobW9kZWxzLCBfLmV4dGVuZCh7bWVyZ2U6IGZhbHNlfSwgb3B0aW9ucywgYWRkT3B0aW9ucykpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYSBtb2RlbCwgb3IgYSBsaXN0IG9mIG1vZGVscyBmcm9tIHRoZSBzZXQuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihtb2RlbHMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzaW5ndWxhciA9ICFfLmlzQXJyYXkobW9kZWxzKTtcbiAgICAgIG1vZGVscyA9IHNpbmd1bGFyID8gW21vZGVsc10gOiBfLmNsb25lKG1vZGVscyk7XG4gICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgICAgdmFyIGksIGwsIGluZGV4LCBtb2RlbDtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBtb2RlbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG1vZGVsID0gbW9kZWxzW2ldID0gdGhpcy5nZXQobW9kZWxzW2ldKTtcbiAgICAgICAgaWYgKCFtb2RlbCkgY29udGludWU7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9ieUlkW21vZGVsLmlkXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2J5SWRbbW9kZWwuY2lkXTtcbiAgICAgICAgaW5kZXggPSB0aGlzLmluZGV4T2YobW9kZWwpO1xuICAgICAgICB0aGlzLm1vZGVscy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLmxlbmd0aC0tO1xuICAgICAgICBpZiAoIW9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgb3B0aW9ucy5pbmRleCA9IGluZGV4O1xuICAgICAgICAgIG1vZGVsLnRyaWdnZXIoJ3JlbW92ZScsIG1vZGVsLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZW1vdmVSZWZlcmVuY2UobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNpbmd1bGFyID8gbW9kZWxzWzBdIDogbW9kZWxzO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgYSBjb2xsZWN0aW9uIGJ5IGBzZXRgLWluZyBhIG5ldyBsaXN0IG9mIG1vZGVscywgYWRkaW5nIG5ldyBvbmVzLFxuICAgIC8vIHJlbW92aW5nIG1vZGVscyB0aGF0IGFyZSBubyBsb25nZXIgcHJlc2VudCwgYW5kIG1lcmdpbmcgbW9kZWxzIHRoYXRcbiAgICAvLyBhbHJlYWR5IGV4aXN0IGluIHRoZSBjb2xsZWN0aW9uLCBhcyBuZWNlc3NhcnkuIFNpbWlsYXIgdG8gKipNb2RlbCNzZXQqKixcbiAgICAvLyB0aGUgY29yZSBvcGVyYXRpb24gZm9yIHVwZGF0aW5nIHRoZSBkYXRhIGNvbnRhaW5lZCBieSB0aGUgY29sbGVjdGlvbi5cbiAgICBzZXQ6IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IF8uZGVmYXVsdHMoe30sIG9wdGlvbnMsIHNldE9wdGlvbnMpO1xuICAgICAgaWYgKG9wdGlvbnMucGFyc2UpIG1vZGVscyA9IHRoaXMucGFyc2UobW9kZWxzLCBvcHRpb25zKTtcbiAgICAgIHZhciBzaW5ndWxhciA9ICFfLmlzQXJyYXkobW9kZWxzKTtcbiAgICAgIG1vZGVscyA9IHNpbmd1bGFyID8gKG1vZGVscyA/IFttb2RlbHNdIDogW10pIDogXy5jbG9uZShtb2RlbHMpO1xuICAgICAgdmFyIGksIGwsIGlkLCBtb2RlbCwgYXR0cnMsIGV4aXN0aW5nLCBzb3J0O1xuICAgICAgdmFyIGF0ID0gb3B0aW9ucy5hdDtcbiAgICAgIHZhciB0YXJnZXRNb2RlbCA9IHRoaXMubW9kZWw7XG4gICAgICB2YXIgc29ydGFibGUgPSB0aGlzLmNvbXBhcmF0b3IgJiYgKGF0ID09IG51bGwpICYmIG9wdGlvbnMuc29ydCAhPT0gZmFsc2U7XG4gICAgICB2YXIgc29ydEF0dHIgPSBfLmlzU3RyaW5nKHRoaXMuY29tcGFyYXRvcikgPyB0aGlzLmNvbXBhcmF0b3IgOiBudWxsO1xuICAgICAgdmFyIHRvQWRkID0gW10sIHRvUmVtb3ZlID0gW10sIG1vZGVsTWFwID0ge307XG4gICAgICB2YXIgYWRkID0gb3B0aW9ucy5hZGQsIG1lcmdlID0gb3B0aW9ucy5tZXJnZSwgcmVtb3ZlID0gb3B0aW9ucy5yZW1vdmU7XG4gICAgICB2YXIgb3JkZXIgPSAhc29ydGFibGUgJiYgYWRkICYmIHJlbW92ZSA/IFtdIDogZmFsc2U7XG5cbiAgICAgIC8vIFR1cm4gYmFyZSBvYmplY3RzIGludG8gbW9kZWwgcmVmZXJlbmNlcywgYW5kIHByZXZlbnQgaW52YWxpZCBtb2RlbHNcbiAgICAgIC8vIGZyb20gYmVpbmcgYWRkZWQuXG4gICAgICBmb3IgKGkgPSAwLCBsID0gbW9kZWxzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBhdHRycyA9IG1vZGVsc1tpXSB8fCB7fTtcbiAgICAgICAgaWYgKGF0dHJzIGluc3RhbmNlb2YgTW9kZWwpIHtcbiAgICAgICAgICBpZCA9IG1vZGVsID0gYXR0cnM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWQgPSBhdHRyc1t0YXJnZXRNb2RlbC5wcm90b3R5cGUuaWRBdHRyaWJ1dGUgfHwgJ2lkJ107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGR1cGxpY2F0ZSBpcyBmb3VuZCwgcHJldmVudCBpdCBmcm9tIGJlaW5nIGFkZGVkIGFuZFxuICAgICAgICAvLyBvcHRpb25hbGx5IG1lcmdlIGl0IGludG8gdGhlIGV4aXN0aW5nIG1vZGVsLlxuICAgICAgICBpZiAoZXhpc3RpbmcgPSB0aGlzLmdldChpZCkpIHtcbiAgICAgICAgICBpZiAocmVtb3ZlKSBtb2RlbE1hcFtleGlzdGluZy5jaWRdID0gdHJ1ZTtcbiAgICAgICAgICBpZiAobWVyZ2UpIHtcbiAgICAgICAgICAgIGF0dHJzID0gYXR0cnMgPT09IG1vZGVsID8gbW9kZWwuYXR0cmlidXRlcyA6IGF0dHJzO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMucGFyc2UpIGF0dHJzID0gZXhpc3RpbmcucGFyc2UoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgZXhpc3Rpbmcuc2V0KGF0dHJzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZSAmJiAhc29ydCAmJiBleGlzdGluZy5oYXNDaGFuZ2VkKHNvcnRBdHRyKSkgc29ydCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIG1vZGVsc1tpXSA9IGV4aXN0aW5nO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcsIHZhbGlkIG1vZGVsLCBwdXNoIGl0IHRvIHRoZSBgdG9BZGRgIGxpc3QuXG4gICAgICAgIH0gZWxzZSBpZiAoYWRkKSB7XG4gICAgICAgICAgbW9kZWwgPSBtb2RlbHNbaV0gPSB0aGlzLl9wcmVwYXJlTW9kZWwoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgICAgIGlmICghbW9kZWwpIGNvbnRpbnVlO1xuICAgICAgICAgIHRvQWRkLnB1c2gobW9kZWwpO1xuICAgICAgICAgIHRoaXMuX2FkZFJlZmVyZW5jZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEbyBub3QgYWRkIG11bHRpcGxlIG1vZGVscyB3aXRoIHRoZSBzYW1lIGBpZGAuXG4gICAgICAgIG1vZGVsID0gZXhpc3RpbmcgfHwgbW9kZWw7XG4gICAgICAgIGlmIChvcmRlciAmJiAobW9kZWwuaXNOZXcoKSB8fCAhbW9kZWxNYXBbbW9kZWwuaWRdKSkgb3JkZXIucHVzaChtb2RlbCk7XG4gICAgICAgIG1vZGVsTWFwW21vZGVsLmlkXSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBub25leGlzdGVudCBtb2RlbHMgaWYgYXBwcm9wcmlhdGUuXG4gICAgICBpZiAocmVtb3ZlKSB7XG4gICAgICAgIGZvciAoaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgIGlmICghbW9kZWxNYXBbKG1vZGVsID0gdGhpcy5tb2RlbHNbaV0pLmNpZF0pIHRvUmVtb3ZlLnB1c2gobW9kZWwpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b1JlbW92ZS5sZW5ndGgpIHRoaXMucmVtb3ZlKHRvUmVtb3ZlLCBvcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VlIGlmIHNvcnRpbmcgaXMgbmVlZGVkLCB1cGRhdGUgYGxlbmd0aGAgYW5kIHNwbGljZSBpbiBuZXcgbW9kZWxzLlxuICAgICAgaWYgKHRvQWRkLmxlbmd0aCB8fCAob3JkZXIgJiYgb3JkZXIubGVuZ3RoKSkge1xuICAgICAgICBpZiAoc29ydGFibGUpIHNvcnQgPSB0cnVlO1xuICAgICAgICB0aGlzLmxlbmd0aCArPSB0b0FkZC5sZW5ndGg7XG4gICAgICAgIGlmIChhdCAhPSBudWxsKSB7XG4gICAgICAgICAgZm9yIChpID0gMCwgbCA9IHRvQWRkLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5tb2RlbHMuc3BsaWNlKGF0ICsgaSwgMCwgdG9BZGRbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAob3JkZXIpIHRoaXMubW9kZWxzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgdmFyIG9yZGVyZWRNb2RlbHMgPSBvcmRlciB8fCB0b0FkZDtcbiAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gb3JkZXJlZE1vZGVscy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxzLnB1c2gob3JkZXJlZE1vZGVsc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbGVudGx5IHNvcnQgdGhlIGNvbGxlY3Rpb24gaWYgYXBwcm9wcmlhdGUuXG4gICAgICBpZiAoc29ydCkgdGhpcy5zb3J0KHtzaWxlbnQ6IHRydWV9KTtcblxuICAgICAgLy8gVW5sZXNzIHNpbGVuY2VkLCBpdCdzIHRpbWUgdG8gZmlyZSBhbGwgYXBwcm9wcmlhdGUgYWRkL3NvcnQgZXZlbnRzLlxuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkge1xuICAgICAgICBmb3IgKGkgPSAwLCBsID0gdG9BZGQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgKG1vZGVsID0gdG9BZGRbaV0pLnRyaWdnZXIoJ2FkZCcsIG1vZGVsLCB0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc29ydCB8fCAob3JkZXIgJiYgb3JkZXIubGVuZ3RoKSkgdGhpcy50cmlnZ2VyKCdzb3J0JywgdGhpcywgb3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiB0aGUgYWRkZWQgKG9yIG1lcmdlZCkgbW9kZWwgKG9yIG1vZGVscykuXG4gICAgICByZXR1cm4gc2luZ3VsYXIgPyBtb2RlbHNbMF0gOiBtb2RlbHM7XG4gICAgfSxcblxuICAgIC8vIFdoZW4geW91IGhhdmUgbW9yZSBpdGVtcyB0aGFuIHlvdSB3YW50IHRvIGFkZCBvciByZW1vdmUgaW5kaXZpZHVhbGx5LFxuICAgIC8vIHlvdSBjYW4gcmVzZXQgdGhlIGVudGlyZSBzZXQgd2l0aCBhIG5ldyBsaXN0IG9mIG1vZGVscywgd2l0aG91dCBmaXJpbmdcbiAgICAvLyBhbnkgZ3JhbnVsYXIgYGFkZGAgb3IgYHJlbW92ZWAgZXZlbnRzLiBGaXJlcyBgcmVzZXRgIHdoZW4gZmluaXNoZWQuXG4gICAgLy8gVXNlZnVsIGZvciBidWxrIG9wZXJhdGlvbnMgYW5kIG9wdGltaXphdGlvbnMuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKG1vZGVscywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5tb2RlbHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZVJlZmVyZW5jZSh0aGlzLm1vZGVsc1tpXSwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLnByZXZpb3VzTW9kZWxzID0gdGhpcy5tb2RlbHM7XG4gICAgICB0aGlzLl9yZXNldCgpO1xuICAgICAgbW9kZWxzID0gdGhpcy5hZGQobW9kZWxzLCBfLmV4dGVuZCh7c2lsZW50OiB0cnVlfSwgb3B0aW9ucykpO1xuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy50cmlnZ2VyKCdyZXNldCcsIHRoaXMsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIG1vZGVscztcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgbW9kZWwgdG8gdGhlIGVuZCBvZiB0aGUgY29sbGVjdGlvbi5cbiAgICBwdXNoOiBmdW5jdGlvbihtb2RlbCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkKG1vZGVsLCBfLmV4dGVuZCh7YXQ6IHRoaXMubGVuZ3RofSwgb3B0aW9ucykpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYSBtb2RlbCBmcm9tIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgcG9wOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICB2YXIgbW9kZWwgPSB0aGlzLmF0KHRoaXMubGVuZ3RoIC0gMSk7XG4gICAgICB0aGlzLnJlbW92ZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gbW9kZWw7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIG1vZGVsIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgdW5zaGlmdDogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiB0aGlzLmFkZChtb2RlbCwgXy5leHRlbmQoe2F0OiAwfSwgb3B0aW9ucykpO1xuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgYSBtb2RlbCBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNvbGxlY3Rpb24uXG4gICAgc2hpZnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIHZhciBtb2RlbCA9IHRoaXMuYXQoMCk7XG4gICAgICB0aGlzLnJlbW92ZShtb2RlbCwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gbW9kZWw7XG4gICAgfSxcblxuICAgIC8vIFNsaWNlIG91dCBhIHN1Yi1hcnJheSBvZiBtb2RlbHMgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICBzbGljZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2xpY2UuYXBwbHkodGhpcy5tb2RlbHMsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8vIEdldCBhIG1vZGVsIGZyb20gdGhlIHNldCBieSBpZC5cbiAgICBnZXQ6IGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgICAgcmV0dXJuIHRoaXMuX2J5SWRbb2JqXSB8fCB0aGlzLl9ieUlkW29iai5pZF0gfHwgdGhpcy5fYnlJZFtvYmouY2lkXTtcbiAgICB9LFxuXG4gICAgLy8gR2V0IHRoZSBtb2RlbCBhdCB0aGUgZ2l2ZW4gaW5kZXguXG4gICAgYXQ6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbHNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICAvLyBSZXR1cm4gbW9kZWxzIHdpdGggbWF0Y2hpbmcgYXR0cmlidXRlcy4gVXNlZnVsIGZvciBzaW1wbGUgY2FzZXMgb2ZcbiAgICAvLyBgZmlsdGVyYC5cbiAgICB3aGVyZTogZnVuY3Rpb24oYXR0cnMsIGZpcnN0KSB7XG4gICAgICBpZiAoXy5pc0VtcHR5KGF0dHJzKSkgcmV0dXJuIGZpcnN0ID8gdm9pZCAwIDogW107XG4gICAgICByZXR1cm4gdGhpc1tmaXJzdCA/ICdmaW5kJyA6ICdmaWx0ZXInXShmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgICBpZiAoYXR0cnNba2V5XSAhPT0gbW9kZWwuZ2V0KGtleSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBSZXR1cm4gdGhlIGZpcnN0IG1vZGVsIHdpdGggbWF0Y2hpbmcgYXR0cmlidXRlcy4gVXNlZnVsIGZvciBzaW1wbGUgY2FzZXNcbiAgICAvLyBvZiBgZmluZGAuXG4gICAgZmluZFdoZXJlOiBmdW5jdGlvbihhdHRycykge1xuICAgICAgcmV0dXJuIHRoaXMud2hlcmUoYXR0cnMsIHRydWUpO1xuICAgIH0sXG5cbiAgICAvLyBGb3JjZSB0aGUgY29sbGVjdGlvbiB0byByZS1zb3J0IGl0c2VsZi4gWW91IGRvbid0IG5lZWQgdG8gY2FsbCB0aGlzIHVuZGVyXG4gICAgLy8gbm9ybWFsIGNpcmN1bXN0YW5jZXMsIGFzIHRoZSBzZXQgd2lsbCBtYWludGFpbiBzb3J0IG9yZGVyIGFzIGVhY2ggaXRlbVxuICAgIC8vIGlzIGFkZGVkLlxuICAgIHNvcnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmICghdGhpcy5jb21wYXJhdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzb3J0IGEgc2V0IHdpdGhvdXQgYSBjb21wYXJhdG9yJyk7XG4gICAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgICAvLyBSdW4gc29ydCBiYXNlZCBvbiB0eXBlIG9mIGBjb21wYXJhdG9yYC5cbiAgICAgIGlmIChfLmlzU3RyaW5nKHRoaXMuY29tcGFyYXRvcikgfHwgdGhpcy5jb21wYXJhdG9yLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB0aGlzLm1vZGVscyA9IHRoaXMuc29ydEJ5KHRoaXMuY29tcGFyYXRvciwgdGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1vZGVscy5zb3J0KF8uYmluZCh0aGlzLmNvbXBhcmF0b3IsIHRoaXMpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFvcHRpb25zLnNpbGVudCkgdGhpcy50cmlnZ2VyKCdzb3J0JywgdGhpcywgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gUGx1Y2sgYW4gYXR0cmlidXRlIGZyb20gZWFjaCBtb2RlbCBpbiB0aGUgY29sbGVjdGlvbi5cbiAgICBwbHVjazogZnVuY3Rpb24oYXR0cikge1xuICAgICAgcmV0dXJuIF8uaW52b2tlKHRoaXMubW9kZWxzLCAnZ2V0JywgYXR0cik7XG4gICAgfSxcblxuICAgIC8vIEZldGNoIHRoZSBkZWZhdWx0IHNldCBvZiBtb2RlbHMgZm9yIHRoaXMgY29sbGVjdGlvbiwgcmVzZXR0aW5nIHRoZVxuICAgIC8vIGNvbGxlY3Rpb24gd2hlbiB0aGV5IGFycml2ZS4gSWYgYHJlc2V0OiB0cnVlYCBpcyBwYXNzZWQsIHRoZSByZXNwb25zZVxuICAgIC8vIGRhdGEgd2lsbCBiZSBwYXNzZWQgdGhyb3VnaCB0aGUgYHJlc2V0YCBtZXRob2QgaW5zdGVhZCBvZiBgc2V0YC5cbiAgICBmZXRjaDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG4gICAgICBpZiAob3B0aW9ucy5wYXJzZSA9PT0gdm9pZCAwKSBvcHRpb25zLnBhcnNlID0gdHJ1ZTtcbiAgICAgIHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuICAgICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzO1xuICAgICAgb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICB2YXIgbWV0aG9kID0gb3B0aW9ucy5yZXNldCA/ICdyZXNldCcgOiAnc2V0JztcbiAgICAgICAgY29sbGVjdGlvblttZXRob2RdKHJlc3AsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcyhjb2xsZWN0aW9uLCByZXNwLCBvcHRpb25zKTtcbiAgICAgICAgY29sbGVjdGlvbi50cmlnZ2VyKCdzeW5jJywgY29sbGVjdGlvbiwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICB9O1xuICAgICAgd3JhcEVycm9yKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHRoaXMuc3luYygncmVhZCcsIHRoaXMsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgYSBtb2RlbCBpbiB0aGlzIGNvbGxlY3Rpb24uIEFkZCB0aGUgbW9kZWwgdG8gdGhlXG4gICAgLy8gY29sbGVjdGlvbiBpbW1lZGlhdGVseSwgdW5sZXNzIGB3YWl0OiB0cnVlYCBpcyBwYXNzZWQsIGluIHdoaWNoIGNhc2Ugd2VcbiAgICAvLyB3YWl0IGZvciB0aGUgc2VydmVyIHRvIGFncmVlLlxuICAgIGNyZWF0ZTogZnVuY3Rpb24obW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gXy5jbG9uZShvcHRpb25zKSA6IHt9O1xuICAgICAgaWYgKCEobW9kZWwgPSB0aGlzLl9wcmVwYXJlTW9kZWwobW9kZWwsIG9wdGlvbnMpKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFvcHRpb25zLndhaXQpIHRoaXMuYWRkKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgIHZhciBjb2xsZWN0aW9uID0gdGhpcztcbiAgICAgIHZhciBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuICAgICAgb3B0aW9ucy5zdWNjZXNzID0gZnVuY3Rpb24obW9kZWwsIHJlc3ApIHtcbiAgICAgICAgaWYgKG9wdGlvbnMud2FpdCkgY29sbGVjdGlvbi5hZGQobW9kZWwsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoc3VjY2Vzcykgc3VjY2Vzcyhtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICB9O1xuICAgICAgbW9kZWwuc2F2ZShudWxsLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBtb2RlbDtcbiAgICB9LFxuXG4gICAgLy8gKipwYXJzZSoqIGNvbnZlcnRzIGEgcmVzcG9uc2UgaW50byBhIGxpc3Qgb2YgbW9kZWxzIHRvIGJlIGFkZGVkIHRvIHRoZVxuICAgIC8vIGNvbGxlY3Rpb24uIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIGp1c3QgdG8gcGFzcyBpdCB0aHJvdWdoLlxuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gcmVzcDtcbiAgICB9LFxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IGNvbGxlY3Rpb24gd2l0aCBhbiBpZGVudGljYWwgbGlzdCBvZiBtb2RlbHMgYXMgdGhpcyBvbmUuXG4gICAgY2xvbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMubW9kZWxzKTtcbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBtZXRob2QgdG8gcmVzZXQgYWxsIGludGVybmFsIHN0YXRlLiBDYWxsZWQgd2hlbiB0aGUgY29sbGVjdGlvblxuICAgIC8vIGlzIGZpcnN0IGluaXRpYWxpemVkIG9yIHJlc2V0LlxuICAgIF9yZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLm1vZGVscyA9IFtdO1xuICAgICAgdGhpcy5fYnlJZCAgPSB7fTtcbiAgICB9LFxuXG4gICAgLy8gUHJlcGFyZSBhIGhhc2ggb2YgYXR0cmlidXRlcyAob3Igb3RoZXIgbW9kZWwpIHRvIGJlIGFkZGVkIHRvIHRoaXNcbiAgICAvLyBjb2xsZWN0aW9uLlxuICAgIF9wcmVwYXJlTW9kZWw6IGZ1bmN0aW9uKGF0dHJzLCBvcHRpb25zKSB7XG4gICAgICBpZiAoYXR0cnMgaW5zdGFuY2VvZiBNb2RlbCkgcmV0dXJuIGF0dHJzO1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBfLmNsb25lKG9wdGlvbnMpIDoge307XG4gICAgICBvcHRpb25zLmNvbGxlY3Rpb24gPSB0aGlzO1xuICAgICAgdmFyIG1vZGVsID0gbmV3IHRoaXMubW9kZWwoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgaWYgKCFtb2RlbC52YWxpZGF0aW9uRXJyb3IpIHJldHVybiBtb2RlbDtcbiAgICAgIHRoaXMudHJpZ2dlcignaW52YWxpZCcsIHRoaXMsIG1vZGVsLnZhbGlkYXRpb25FcnJvciwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG1ldGhvZCB0byBjcmVhdGUgYSBtb2RlbCdzIHRpZXMgdG8gYSBjb2xsZWN0aW9uLlxuICAgIF9hZGRSZWZlcmVuY2U6IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLl9ieUlkW21vZGVsLmNpZF0gPSBtb2RlbDtcbiAgICAgIGlmIChtb2RlbC5pZCAhPSBudWxsKSB0aGlzLl9ieUlkW21vZGVsLmlkXSA9IG1vZGVsO1xuICAgICAgaWYgKCFtb2RlbC5jb2xsZWN0aW9uKSBtb2RlbC5jb2xsZWN0aW9uID0gdGhpcztcbiAgICAgIG1vZGVsLm9uKCdhbGwnLCB0aGlzLl9vbk1vZGVsRXZlbnQsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvLyBJbnRlcm5hbCBtZXRob2QgdG8gc2V2ZXIgYSBtb2RlbCdzIHRpZXMgdG8gYSBjb2xsZWN0aW9uLlxuICAgIF9yZW1vdmVSZWZlcmVuY2U6IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICBpZiAodGhpcyA9PT0gbW9kZWwuY29sbGVjdGlvbikgZGVsZXRlIG1vZGVsLmNvbGxlY3Rpb247XG4gICAgICBtb2RlbC5vZmYoJ2FsbCcsIHRoaXMuX29uTW9kZWxFdmVudCwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG1ldGhvZCBjYWxsZWQgZXZlcnkgdGltZSBhIG1vZGVsIGluIHRoZSBzZXQgZmlyZXMgYW4gZXZlbnQuXG4gICAgLy8gU2V0cyBuZWVkIHRvIHVwZGF0ZSB0aGVpciBpbmRleGVzIHdoZW4gbW9kZWxzIGNoYW5nZSBpZHMuIEFsbCBvdGhlclxuICAgIC8vIGV2ZW50cyBzaW1wbHkgcHJveHkgdGhyb3VnaC4gXCJhZGRcIiBhbmQgXCJyZW1vdmVcIiBldmVudHMgdGhhdCBvcmlnaW5hdGVcbiAgICAvLyBpbiBvdGhlciBjb2xsZWN0aW9ucyBhcmUgaWdub3JlZC5cbiAgICBfb25Nb2RlbEV2ZW50OiBmdW5jdGlvbihldmVudCwgbW9kZWwsIGNvbGxlY3Rpb24sIG9wdGlvbnMpIHtcbiAgICAgIGlmICgoZXZlbnQgPT09ICdhZGQnIHx8IGV2ZW50ID09PSAncmVtb3ZlJykgJiYgY29sbGVjdGlvbiAhPT0gdGhpcykgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50ID09PSAnZGVzdHJveScpIHRoaXMucmVtb3ZlKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgIGlmIChtb2RlbCAmJiBldmVudCA9PT0gJ2NoYW5nZTonICsgbW9kZWwuaWRBdHRyaWJ1dGUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2J5SWRbbW9kZWwucHJldmlvdXMobW9kZWwuaWRBdHRyaWJ1dGUpXTtcbiAgICAgICAgaWYgKG1vZGVsLmlkICE9IG51bGwpIHRoaXMuX2J5SWRbbW9kZWwuaWRdID0gbW9kZWw7XG4gICAgICB9XG4gICAgICB0aGlzLnRyaWdnZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gVW5kZXJzY29yZSBtZXRob2RzIHRoYXQgd2Ugd2FudCB0byBpbXBsZW1lbnQgb24gdGhlIENvbGxlY3Rpb24uXG4gIC8vIDkwJSBvZiB0aGUgY29yZSB1c2VmdWxuZXNzIG9mIEJhY2tib25lIENvbGxlY3Rpb25zIGlzIGFjdHVhbGx5IGltcGxlbWVudGVkXG4gIC8vIHJpZ2h0IGhlcmU6XG4gIHZhciBtZXRob2RzID0gWydmb3JFYWNoJywgJ2VhY2gnLCAnbWFwJywgJ2NvbGxlY3QnLCAncmVkdWNlJywgJ2ZvbGRsJyxcbiAgICAnaW5qZWN0JywgJ3JlZHVjZVJpZ2h0JywgJ2ZvbGRyJywgJ2ZpbmQnLCAnZGV0ZWN0JywgJ2ZpbHRlcicsICdzZWxlY3QnLFxuICAgICdyZWplY3QnLCAnZXZlcnknLCAnYWxsJywgJ3NvbWUnLCAnYW55JywgJ2luY2x1ZGUnLCAnY29udGFpbnMnLCAnaW52b2tlJyxcbiAgICAnbWF4JywgJ21pbicsICd0b0FycmF5JywgJ3NpemUnLCAnZmlyc3QnLCAnaGVhZCcsICd0YWtlJywgJ2luaXRpYWwnLCAncmVzdCcsXG4gICAgJ3RhaWwnLCAnZHJvcCcsICdsYXN0JywgJ3dpdGhvdXQnLCAnZGlmZmVyZW5jZScsICdpbmRleE9mJywgJ3NodWZmbGUnLFxuICAgICdsYXN0SW5kZXhPZicsICdpc0VtcHR5JywgJ2NoYWluJywgJ3NhbXBsZSddO1xuXG4gIC8vIE1peCBpbiBlYWNoIFVuZGVyc2NvcmUgbWV0aG9kIGFzIGEgcHJveHkgdG8gYENvbGxlY3Rpb24jbW9kZWxzYC5cbiAgXy5lYWNoKG1ldGhvZHMsIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIENvbGxlY3Rpb24ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgYXJncy51bnNoaWZ0KHRoaXMubW9kZWxzKTtcbiAgICAgIHJldHVybiBfW21ldGhvZF0uYXBwbHkoXywgYXJncyk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gVW5kZXJzY29yZSBtZXRob2RzIHRoYXQgdGFrZSBhIHByb3BlcnR5IG5hbWUgYXMgYW4gYXJndW1lbnQuXG4gIHZhciBhdHRyaWJ1dGVNZXRob2RzID0gWydncm91cEJ5JywgJ2NvdW50QnknLCAnc29ydEJ5JywgJ2luZGV4QnknXTtcblxuICAvLyBVc2UgYXR0cmlidXRlcyBpbnN0ZWFkIG9mIHByb3BlcnRpZXMuXG4gIF8uZWFjaChhdHRyaWJ1dGVNZXRob2RzLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBDb2xsZWN0aW9uLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciBpdGVyYXRvciA9IF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZSA6IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgIHJldHVybiBtb2RlbC5nZXQodmFsdWUpO1xuICAgICAgfTtcbiAgICAgIHJldHVybiBfW21ldGhvZF0odGhpcy5tb2RlbHMsIGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBCYWNrYm9uZS5WaWV3XG4gIC8vIC0tLS0tLS0tLS0tLS1cblxuICAvLyBCYWNrYm9uZSBWaWV3cyBhcmUgYWxtb3N0IG1vcmUgY29udmVudGlvbiB0aGFuIHRoZXkgYXJlIGFjdHVhbCBjb2RlLiBBIFZpZXdcbiAgLy8gaXMgc2ltcGx5IGEgSmF2YVNjcmlwdCBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgbG9naWNhbCBjaHVuayBvZiBVSSBpbiB0aGVcbiAgLy8gRE9NLiBUaGlzIG1pZ2h0IGJlIGEgc2luZ2xlIGl0ZW0sIGFuIGVudGlyZSBsaXN0LCBhIHNpZGViYXIgb3IgcGFuZWwsIG9yXG4gIC8vIGV2ZW4gdGhlIHN1cnJvdW5kaW5nIGZyYW1lIHdoaWNoIHdyYXBzIHlvdXIgd2hvbGUgYXBwLiBEZWZpbmluZyBhIGNodW5rIG9mXG4gIC8vIFVJIGFzIGEgKipWaWV3KiogYWxsb3dzIHlvdSB0byBkZWZpbmUgeW91ciBET00gZXZlbnRzIGRlY2xhcmF0aXZlbHksIHdpdGhvdXRcbiAgLy8gaGF2aW5nIHRvIHdvcnJ5IGFib3V0IHJlbmRlciBvcmRlciAuLi4gYW5kIG1ha2VzIGl0IGVhc3kgZm9yIHRoZSB2aWV3IHRvXG4gIC8vIHJlYWN0IHRvIHNwZWNpZmljIGNoYW5nZXMgaW4gdGhlIHN0YXRlIG9mIHlvdXIgbW9kZWxzLlxuXG4gIC8vIENyZWF0aW5nIGEgQmFja2JvbmUuVmlldyBjcmVhdGVzIGl0cyBpbml0aWFsIGVsZW1lbnQgb3V0c2lkZSBvZiB0aGUgRE9NLFxuICAvLyBpZiBhbiBleGlzdGluZyBlbGVtZW50IGlzIG5vdCBwcm92aWRlZC4uLlxuICB2YXIgVmlldyA9IEJhY2tib25lLlZpZXcgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCd2aWV3Jyk7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICBfLmV4dGVuZCh0aGlzLCBfLnBpY2sob3B0aW9ucywgdmlld09wdGlvbnMpKTtcbiAgICB0aGlzLl9lbnN1cmVFbGVtZW50KCk7XG4gICAgdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5kZWxlZ2F0ZUV2ZW50cygpO1xuICB9O1xuXG4gIC8vIENhY2hlZCByZWdleCB0byBzcGxpdCBrZXlzIGZvciBgZGVsZWdhdGVgLlxuICB2YXIgZGVsZWdhdGVFdmVudFNwbGl0dGVyID0gL14oXFxTKylcXHMqKC4qKSQvO1xuXG4gIC8vIExpc3Qgb2YgdmlldyBvcHRpb25zIHRvIGJlIG1lcmdlZCBhcyBwcm9wZXJ0aWVzLlxuICB2YXIgdmlld09wdGlvbnMgPSBbJ21vZGVsJywgJ2NvbGxlY3Rpb24nLCAnZWwnLCAnaWQnLCAnYXR0cmlidXRlcycsICdjbGFzc05hbWUnLCAndGFnTmFtZScsICdldmVudHMnXTtcblxuICAvLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuVmlldyoqIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMuXG4gIF8uZXh0ZW5kKFZpZXcucHJvdG90eXBlLCBFdmVudHMsIHtcblxuICAgIC8vIFRoZSBkZWZhdWx0IGB0YWdOYW1lYCBvZiBhIFZpZXcncyBlbGVtZW50IGlzIGBcImRpdlwiYC5cbiAgICB0YWdOYW1lOiAnZGl2JyxcblxuICAgIC8vIGpRdWVyeSBkZWxlZ2F0ZSBmb3IgZWxlbWVudCBsb29rdXAsIHNjb3BlZCB0byBET00gZWxlbWVudHMgd2l0aGluIHRoZVxuICAgIC8vIGN1cnJlbnQgdmlldy4gVGhpcyBzaG91bGQgYmUgcHJlZmVycmVkIHRvIGdsb2JhbCBsb29rdXBzIHdoZXJlIHBvc3NpYmxlLlxuICAgICQ6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gdGhpcy4kZWwuZmluZChzZWxlY3Rvcik7XG4gICAgfSxcblxuICAgIC8vIEluaXRpYWxpemUgaXMgYW4gZW1wdHkgZnVuY3Rpb24gYnkgZGVmYXVsdC4gT3ZlcnJpZGUgaXQgd2l0aCB5b3VyIG93blxuICAgIC8vIGluaXRpYWxpemF0aW9uIGxvZ2ljLlxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCl7fSxcblxuICAgIC8vICoqcmVuZGVyKiogaXMgdGhlIGNvcmUgZnVuY3Rpb24gdGhhdCB5b3VyIHZpZXcgc2hvdWxkIG92ZXJyaWRlLCBpbiBvcmRlclxuICAgIC8vIHRvIHBvcHVsYXRlIGl0cyBlbGVtZW50IChgdGhpcy5lbGApLCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBIVE1MLiBUaGVcbiAgICAvLyBjb252ZW50aW9uIGlzIGZvciAqKnJlbmRlcioqIHRvIGFsd2F5cyByZXR1cm4gYHRoaXNgLlxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIHRoaXMgdmlldyBieSB0YWtpbmcgdGhlIGVsZW1lbnQgb3V0IG9mIHRoZSBET00sIGFuZCByZW1vdmluZyBhbnlcbiAgICAvLyBhcHBsaWNhYmxlIEJhY2tib25lLkV2ZW50cyBsaXN0ZW5lcnMuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGVsLnJlbW92ZSgpO1xuICAgICAgdGhpcy5zdG9wTGlzdGVuaW5nKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQ2hhbmdlIHRoZSB2aWV3J3MgZWxlbWVudCAoYHRoaXMuZWxgIHByb3BlcnR5KSwgaW5jbHVkaW5nIGV2ZW50XG4gICAgLy8gcmUtZGVsZWdhdGlvbi5cbiAgICBzZXRFbGVtZW50OiBmdW5jdGlvbihlbGVtZW50LCBkZWxlZ2F0ZSkge1xuICAgICAgaWYgKHRoaXMuJGVsKSB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgIHRoaXMuJGVsID0gZWxlbWVudCBpbnN0YW5jZW9mIEJhY2tib25lLiQgPyBlbGVtZW50IDogQmFja2JvbmUuJChlbGVtZW50KTtcbiAgICAgIHRoaXMuZWwgPSB0aGlzLiRlbFswXTtcbiAgICAgIGlmIChkZWxlZ2F0ZSAhPT0gZmFsc2UpIHRoaXMuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBTZXQgY2FsbGJhY2tzLCB3aGVyZSBgdGhpcy5ldmVudHNgIGlzIGEgaGFzaCBvZlxuICAgIC8vXG4gICAgLy8gKntcImV2ZW50IHNlbGVjdG9yXCI6IFwiY2FsbGJhY2tcIn0qXG4gICAgLy9cbiAgICAvLyAgICAge1xuICAgIC8vICAgICAgICdtb3VzZWRvd24gLnRpdGxlJzogICdlZGl0JyxcbiAgICAvLyAgICAgICAnY2xpY2sgLmJ1dHRvbic6ICAgICAnc2F2ZScsXG4gICAgLy8gICAgICAgJ2NsaWNrIC5vcGVuJzogICAgICAgZnVuY3Rpb24oZSkgeyAuLi4gfVxuICAgIC8vICAgICB9XG4gICAgLy9cbiAgICAvLyBwYWlycy4gQ2FsbGJhY2tzIHdpbGwgYmUgYm91bmQgdG8gdGhlIHZpZXcsIHdpdGggYHRoaXNgIHNldCBwcm9wZXJseS5cbiAgICAvLyBVc2VzIGV2ZW50IGRlbGVnYXRpb24gZm9yIGVmZmljaWVuY3kuXG4gICAgLy8gT21pdHRpbmcgdGhlIHNlbGVjdG9yIGJpbmRzIHRoZSBldmVudCB0byBgdGhpcy5lbGAuXG4gICAgLy8gVGhpcyBvbmx5IHdvcmtzIGZvciBkZWxlZ2F0ZS1hYmxlIGV2ZW50czogbm90IGBmb2N1c2AsIGBibHVyYCwgYW5kXG4gICAgLy8gbm90IGBjaGFuZ2VgLCBgc3VibWl0YCwgYW5kIGByZXNldGAgaW4gSW50ZXJuZXQgRXhwbG9yZXIuXG4gICAgZGVsZWdhdGVFdmVudHM6IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgICAgaWYgKCEoZXZlbnRzIHx8IChldmVudHMgPSBfLnJlc3VsdCh0aGlzLCAnZXZlbnRzJykpKSkgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBldmVudHMpIHtcbiAgICAgICAgdmFyIG1ldGhvZCA9IGV2ZW50c1trZXldO1xuICAgICAgICBpZiAoIV8uaXNGdW5jdGlvbihtZXRob2QpKSBtZXRob2QgPSB0aGlzW2V2ZW50c1trZXldXTtcbiAgICAgICAgaWYgKCFtZXRob2QpIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBtYXRjaCA9IGtleS5tYXRjaChkZWxlZ2F0ZUV2ZW50U3BsaXR0ZXIpO1xuICAgICAgICB2YXIgZXZlbnROYW1lID0gbWF0Y2hbMV0sIHNlbGVjdG9yID0gbWF0Y2hbMl07XG4gICAgICAgIG1ldGhvZCA9IF8uYmluZChtZXRob2QsIHRoaXMpO1xuICAgICAgICBldmVudE5hbWUgKz0gJy5kZWxlZ2F0ZUV2ZW50cycgKyB0aGlzLmNpZDtcbiAgICAgICAgaWYgKHNlbGVjdG9yID09PSAnJykge1xuICAgICAgICAgIHRoaXMuJGVsLm9uKGV2ZW50TmFtZSwgbWV0aG9kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLiRlbC5vbihldmVudE5hbWUsIHNlbGVjdG9yLCBtZXRob2QpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQ2xlYXJzIGFsbCBjYWxsYmFja3MgcHJldmlvdXNseSBib3VuZCB0byB0aGUgdmlldyB3aXRoIGBkZWxlZ2F0ZUV2ZW50c2AuXG4gICAgLy8gWW91IHVzdWFsbHkgZG9uJ3QgbmVlZCB0byB1c2UgdGhpcywgYnV0IG1heSB3aXNoIHRvIGlmIHlvdSBoYXZlIG11bHRpcGxlXG4gICAgLy8gQmFja2JvbmUgdmlld3MgYXR0YWNoZWQgdG8gdGhlIHNhbWUgRE9NIGVsZW1lbnQuXG4gICAgdW5kZWxlZ2F0ZUV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRlbC5vZmYoJy5kZWxlZ2F0ZUV2ZW50cycgKyB0aGlzLmNpZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRW5zdXJlIHRoYXQgdGhlIFZpZXcgaGFzIGEgRE9NIGVsZW1lbnQgdG8gcmVuZGVyIGludG8uXG4gICAgLy8gSWYgYHRoaXMuZWxgIGlzIGEgc3RyaW5nLCBwYXNzIGl0IHRocm91Z2ggYCQoKWAsIHRha2UgdGhlIGZpcnN0XG4gICAgLy8gbWF0Y2hpbmcgZWxlbWVudCwgYW5kIHJlLWFzc2lnbiBpdCB0byBgZWxgLiBPdGhlcndpc2UsIGNyZWF0ZVxuICAgIC8vIGFuIGVsZW1lbnQgZnJvbSB0aGUgYGlkYCwgYGNsYXNzTmFtZWAgYW5kIGB0YWdOYW1lYCBwcm9wZXJ0aWVzLlxuICAgIF9lbnN1cmVFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5lbCkge1xuICAgICAgICB2YXIgYXR0cnMgPSBfLmV4dGVuZCh7fSwgXy5yZXN1bHQodGhpcywgJ2F0dHJpYnV0ZXMnKSk7XG4gICAgICAgIGlmICh0aGlzLmlkKSBhdHRycy5pZCA9IF8ucmVzdWx0KHRoaXMsICdpZCcpO1xuICAgICAgICBpZiAodGhpcy5jbGFzc05hbWUpIGF0dHJzWydjbGFzcyddID0gXy5yZXN1bHQodGhpcywgJ2NsYXNzTmFtZScpO1xuICAgICAgICB2YXIgJGVsID0gQmFja2JvbmUuJCgnPCcgKyBfLnJlc3VsdCh0aGlzLCAndGFnTmFtZScpICsgJz4nKS5hdHRyKGF0dHJzKTtcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50KCRlbCwgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRFbGVtZW50KF8ucmVzdWx0KHRoaXMsICdlbCcpLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIEJhY2tib25lLnN5bmNcbiAgLy8gLS0tLS0tLS0tLS0tLVxuXG4gIC8vIE92ZXJyaWRlIHRoaXMgZnVuY3Rpb24gdG8gY2hhbmdlIHRoZSBtYW5uZXIgaW4gd2hpY2ggQmFja2JvbmUgcGVyc2lzdHNcbiAgLy8gbW9kZWxzIHRvIHRoZSBzZXJ2ZXIuIFlvdSB3aWxsIGJlIHBhc3NlZCB0aGUgdHlwZSBvZiByZXF1ZXN0LCBhbmQgdGhlXG4gIC8vIG1vZGVsIGluIHF1ZXN0aW9uLiBCeSBkZWZhdWx0LCBtYWtlcyBhIFJFU1RmdWwgQWpheCByZXF1ZXN0XG4gIC8vIHRvIHRoZSBtb2RlbCdzIGB1cmwoKWAuIFNvbWUgcG9zc2libGUgY3VzdG9taXphdGlvbnMgY291bGQgYmU6XG4gIC8vXG4gIC8vICogVXNlIGBzZXRUaW1lb3V0YCB0byBiYXRjaCByYXBpZC1maXJlIHVwZGF0ZXMgaW50byBhIHNpbmdsZSByZXF1ZXN0LlxuICAvLyAqIFNlbmQgdXAgdGhlIG1vZGVscyBhcyBYTUwgaW5zdGVhZCBvZiBKU09OLlxuICAvLyAqIFBlcnNpc3QgbW9kZWxzIHZpYSBXZWJTb2NrZXRzIGluc3RlYWQgb2YgQWpheC5cbiAgLy9cbiAgLy8gVHVybiBvbiBgQmFja2JvbmUuZW11bGF0ZUhUVFBgIGluIG9yZGVyIHRvIHNlbmQgYFBVVGAgYW5kIGBERUxFVEVgIHJlcXVlc3RzXG4gIC8vIGFzIGBQT1NUYCwgd2l0aCBhIGBfbWV0aG9kYCBwYXJhbWV0ZXIgY29udGFpbmluZyB0aGUgdHJ1ZSBIVFRQIG1ldGhvZCxcbiAgLy8gYXMgd2VsbCBhcyBhbGwgcmVxdWVzdHMgd2l0aCB0aGUgYm9keSBhcyBgYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkYFxuICAvLyBpbnN0ZWFkIG9mIGBhcHBsaWNhdGlvbi9qc29uYCB3aXRoIHRoZSBtb2RlbCBpbiBhIHBhcmFtIG5hbWVkIGBtb2RlbGAuXG4gIC8vIFVzZWZ1bCB3aGVuIGludGVyZmFjaW5nIHdpdGggc2VydmVyLXNpZGUgbGFuZ3VhZ2VzIGxpa2UgKipQSFAqKiB0aGF0IG1ha2VcbiAgLy8gaXQgZGlmZmljdWx0IHRvIHJlYWQgdGhlIGJvZHkgb2YgYFBVVGAgcmVxdWVzdHMuXG4gIEJhY2tib25lLnN5bmMgPSBmdW5jdGlvbihtZXRob2QsIG1vZGVsLCBvcHRpb25zKSB7XG4gICAgdmFyIHR5cGUgPSBtZXRob2RNYXBbbWV0aG9kXTtcblxuICAgIC8vIERlZmF1bHQgb3B0aW9ucywgdW5sZXNzIHNwZWNpZmllZC5cbiAgICBfLmRlZmF1bHRzKG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSksIHtcbiAgICAgIGVtdWxhdGVIVFRQOiBCYWNrYm9uZS5lbXVsYXRlSFRUUCxcbiAgICAgIGVtdWxhdGVKU09OOiBCYWNrYm9uZS5lbXVsYXRlSlNPTlxuICAgIH0pO1xuXG4gICAgLy8gRGVmYXVsdCBKU09OLXJlcXVlc3Qgb3B0aW9ucy5cbiAgICB2YXIgcGFyYW1zID0ge3R5cGU6IHR5cGUsIGRhdGFUeXBlOiAnanNvbid9O1xuXG4gICAgLy8gRW5zdXJlIHRoYXQgd2UgaGF2ZSBhIFVSTC5cbiAgICBpZiAoIW9wdGlvbnMudXJsKSB7XG4gICAgICBwYXJhbXMudXJsID0gXy5yZXN1bHQobW9kZWwsICd1cmwnKSB8fCB1cmxFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHdlIGhhdmUgdGhlIGFwcHJvcHJpYXRlIHJlcXVlc3QgZGF0YS5cbiAgICBpZiAob3B0aW9ucy5kYXRhID09IG51bGwgJiYgbW9kZWwgJiYgKG1ldGhvZCA9PT0gJ2NyZWF0ZScgfHwgbWV0aG9kID09PSAndXBkYXRlJyB8fCBtZXRob2QgPT09ICdwYXRjaCcpKSB7XG4gICAgICBwYXJhbXMuY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICBwYXJhbXMuZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuYXR0cnMgfHwgbW9kZWwudG9KU09OKG9wdGlvbnMpKTtcbiAgICB9XG5cbiAgICAvLyBGb3Igb2xkZXIgc2VydmVycywgZW11bGF0ZSBKU09OIGJ5IGVuY29kaW5nIHRoZSByZXF1ZXN0IGludG8gYW4gSFRNTC1mb3JtLlxuICAgIGlmIChvcHRpb25zLmVtdWxhdGVKU09OKSB7XG4gICAgICBwYXJhbXMuY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJztcbiAgICAgIHBhcmFtcy5kYXRhID0gcGFyYW1zLmRhdGEgPyB7bW9kZWw6IHBhcmFtcy5kYXRhfSA6IHt9O1xuICAgIH1cblxuICAgIC8vIEZvciBvbGRlciBzZXJ2ZXJzLCBlbXVsYXRlIEhUVFAgYnkgbWltaWNraW5nIHRoZSBIVFRQIG1ldGhvZCB3aXRoIGBfbWV0aG9kYFxuICAgIC8vIEFuZCBhbiBgWC1IVFRQLU1ldGhvZC1PdmVycmlkZWAgaGVhZGVyLlxuICAgIGlmIChvcHRpb25zLmVtdWxhdGVIVFRQICYmICh0eXBlID09PSAnUFVUJyB8fCB0eXBlID09PSAnREVMRVRFJyB8fCB0eXBlID09PSAnUEFUQ0gnKSkge1xuICAgICAgcGFyYW1zLnR5cGUgPSAnUE9TVCc7XG4gICAgICBpZiAob3B0aW9ucy5lbXVsYXRlSlNPTikgcGFyYW1zLmRhdGEuX21ldGhvZCA9IHR5cGU7XG4gICAgICB2YXIgYmVmb3JlU2VuZCA9IG9wdGlvbnMuYmVmb3JlU2VuZDtcbiAgICAgIG9wdGlvbnMuYmVmb3JlU2VuZCA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1IVFRQLU1ldGhvZC1PdmVycmlkZScsIHR5cGUpO1xuICAgICAgICBpZiAoYmVmb3JlU2VuZCkgcmV0dXJuIGJlZm9yZVNlbmQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgcHJvY2VzcyBkYXRhIG9uIGEgbm9uLUdFVCByZXF1ZXN0LlxuICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ0dFVCcgJiYgIW9wdGlvbnMuZW11bGF0ZUpTT04pIHtcbiAgICAgIHBhcmFtcy5wcm9jZXNzRGF0YSA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHdlJ3JlIHNlbmRpbmcgYSBgUEFUQ0hgIHJlcXVlc3QsIGFuZCB3ZSdyZSBpbiBhbiBvbGQgSW50ZXJuZXQgRXhwbG9yZXJcbiAgICAvLyB0aGF0IHN0aWxsIGhhcyBBY3RpdmVYIGVuYWJsZWQgYnkgZGVmYXVsdCwgb3ZlcnJpZGUgalF1ZXJ5IHRvIHVzZSB0aGF0XG4gICAgLy8gZm9yIFhIUiBpbnN0ZWFkLiBSZW1vdmUgdGhpcyBsaW5lIHdoZW4galF1ZXJ5IHN1cHBvcnRzIGBQQVRDSGAgb24gSUU4LlxuICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ1BBVENIJyAmJiBub1hoclBhdGNoKSB7XG4gICAgICBwYXJhbXMueGhyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHRoZSByZXF1ZXN0LCBhbGxvd2luZyB0aGUgdXNlciB0byBvdmVycmlkZSBhbnkgQWpheCBvcHRpb25zLlxuICAgIHZhciB4aHIgPSBvcHRpb25zLnhociA9IEJhY2tib25lLmFqYXgoXy5leHRlbmQocGFyYW1zLCBvcHRpb25zKSk7XG4gICAgbW9kZWwudHJpZ2dlcigncmVxdWVzdCcsIG1vZGVsLCB4aHIsIG9wdGlvbnMpO1xuICAgIHJldHVybiB4aHI7XG4gIH07XG5cbiAgdmFyIG5vWGhyUGF0Y2ggPVxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICEhd2luZG93LkFjdGl2ZVhPYmplY3QgJiZcbiAgICAgICEod2luZG93LlhNTEh0dHBSZXF1ZXN0ICYmIChuZXcgWE1MSHR0cFJlcXVlc3QpLmRpc3BhdGNoRXZlbnQpO1xuXG4gIC8vIE1hcCBmcm9tIENSVUQgdG8gSFRUUCBmb3Igb3VyIGRlZmF1bHQgYEJhY2tib25lLnN5bmNgIGltcGxlbWVudGF0aW9uLlxuICB2YXIgbWV0aG9kTWFwID0ge1xuICAgICdjcmVhdGUnOiAnUE9TVCcsXG4gICAgJ3VwZGF0ZSc6ICdQVVQnLFxuICAgICdwYXRjaCc6ICAnUEFUQ0gnLFxuICAgICdkZWxldGUnOiAnREVMRVRFJyxcbiAgICAncmVhZCc6ICAgJ0dFVCdcbiAgfTtcblxuICAvLyBTZXQgdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gb2YgYEJhY2tib25lLmFqYXhgIHRvIHByb3h5IHRocm91Z2ggdG8gYCRgLlxuICAvLyBPdmVycmlkZSB0aGlzIGlmIHlvdSdkIGxpa2UgdG8gdXNlIGEgZGlmZmVyZW50IGxpYnJhcnkuXG4gIEJhY2tib25lLmFqYXggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQmFja2JvbmUuJC5hamF4LmFwcGx5KEJhY2tib25lLiQsIGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQmFja2JvbmUuUm91dGVyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJvdXRlcnMgbWFwIGZhdXgtVVJMcyB0byBhY3Rpb25zLCBhbmQgZmlyZSBldmVudHMgd2hlbiByb3V0ZXMgYXJlXG4gIC8vIG1hdGNoZWQuIENyZWF0aW5nIGEgbmV3IG9uZSBzZXRzIGl0cyBgcm91dGVzYCBoYXNoLCBpZiBub3Qgc2V0IHN0YXRpY2FsbHkuXG4gIHZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICBpZiAob3B0aW9ucy5yb3V0ZXMpIHRoaXMucm91dGVzID0gb3B0aW9ucy5yb3V0ZXM7XG4gICAgdGhpcy5fYmluZFJvdXRlcygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIENhY2hlZCByZWd1bGFyIGV4cHJlc3Npb25zIGZvciBtYXRjaGluZyBuYW1lZCBwYXJhbSBwYXJ0cyBhbmQgc3BsYXR0ZWRcbiAgLy8gcGFydHMgb2Ygcm91dGUgc3RyaW5ncy5cbiAgdmFyIG9wdGlvbmFsUGFyYW0gPSAvXFwoKC4qPylcXCkvZztcbiAgdmFyIG5hbWVkUGFyYW0gICAgPSAvKFxcKFxcPyk/OlxcdysvZztcbiAgdmFyIHNwbGF0UGFyYW0gICAgPSAvXFwqXFx3Ky9nO1xuICB2YXIgZXNjYXBlUmVnRXhwICA9IC9bXFwte31cXFtcXF0rPy4sXFxcXFxcXiR8I1xcc10vZztcblxuICAvLyBTZXQgdXAgYWxsIGluaGVyaXRhYmxlICoqQmFja2JvbmUuUm91dGVyKiogcHJvcGVydGllcyBhbmQgbWV0aG9kcy5cbiAgXy5leHRlbmQoUm91dGVyLnByb3RvdHlwZSwgRXZlbnRzLCB7XG5cbiAgICAvLyBJbml0aWFsaXplIGlzIGFuIGVtcHR5IGZ1bmN0aW9uIGJ5IGRlZmF1bHQuIE92ZXJyaWRlIGl0IHdpdGggeW91ciBvd25cbiAgICAvLyBpbml0aWFsaXphdGlvbiBsb2dpYy5cbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpe30sXG5cbiAgICAvLyBNYW51YWxseSBiaW5kIGEgc2luZ2xlIG5hbWVkIHJvdXRlIHRvIGEgY2FsbGJhY2suIEZvciBleGFtcGxlOlxuICAgIC8vXG4gICAgLy8gICAgIHRoaXMucm91dGUoJ3NlYXJjaC86cXVlcnkvcDpudW0nLCAnc2VhcmNoJywgZnVuY3Rpb24ocXVlcnksIG51bSkge1xuICAgIC8vICAgICAgIC4uLlxuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIHJvdXRlOiBmdW5jdGlvbihyb3V0ZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIGlmICghXy5pc1JlZ0V4cChyb3V0ZSkpIHJvdXRlID0gdGhpcy5fcm91dGVUb1JlZ0V4cChyb3V0ZSk7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbmFtZTtcbiAgICAgICAgbmFtZSA9ICcnO1xuICAgICAgfVxuICAgICAgaWYgKCFjYWxsYmFjaykgY2FsbGJhY2sgPSB0aGlzW25hbWVdO1xuICAgICAgdmFyIHJvdXRlciA9IHRoaXM7XG4gICAgICBCYWNrYm9uZS5oaXN0b3J5LnJvdXRlKHJvdXRlLCBmdW5jdGlvbihmcmFnbWVudCkge1xuICAgICAgICB2YXIgYXJncyA9IHJvdXRlci5fZXh0cmFjdFBhcmFtZXRlcnMocm91dGUsIGZyYWdtZW50KTtcbiAgICAgICAgcm91dGVyLmV4ZWN1dGUoY2FsbGJhY2ssIGFyZ3MpO1xuICAgICAgICByb3V0ZXIudHJpZ2dlci5hcHBseShyb3V0ZXIsIFsncm91dGU6JyArIG5hbWVdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgIHJvdXRlci50cmlnZ2VyKCdyb3V0ZScsIG5hbWUsIGFyZ3MpO1xuICAgICAgICBCYWNrYm9uZS5oaXN0b3J5LnRyaWdnZXIoJ3JvdXRlJywgcm91dGVyLCBuYW1lLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEV4ZWN1dGUgYSByb3V0ZSBoYW5kbGVyIHdpdGggdGhlIHByb3ZpZGVkIHBhcmFtZXRlcnMuICBUaGlzIGlzIGFuXG4gICAgLy8gZXhjZWxsZW50IHBsYWNlIHRvIGRvIHByZS1yb3V0ZSBzZXR1cCBvciBwb3N0LXJvdXRlIGNsZWFudXAuXG4gICAgZXhlY3V0ZTogZnVuY3Rpb24oY2FsbGJhY2ssIGFyZ3MpIHtcbiAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgfSxcblxuICAgIC8vIFNpbXBsZSBwcm94eSB0byBgQmFja2JvbmUuaGlzdG9yeWAgdG8gc2F2ZSBhIGZyYWdtZW50IGludG8gdGhlIGhpc3RvcnkuXG4gICAgbmF2aWdhdGU6IGZ1bmN0aW9uKGZyYWdtZW50LCBvcHRpb25zKSB7XG4gICAgICBCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKGZyYWdtZW50LCBvcHRpb25zKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBCaW5kIGFsbCBkZWZpbmVkIHJvdXRlcyB0byBgQmFja2JvbmUuaGlzdG9yeWAuIFdlIGhhdmUgdG8gcmV2ZXJzZSB0aGVcbiAgICAvLyBvcmRlciBvZiB0aGUgcm91dGVzIGhlcmUgdG8gc3VwcG9ydCBiZWhhdmlvciB3aGVyZSB0aGUgbW9zdCBnZW5lcmFsXG4gICAgLy8gcm91dGVzIGNhbiBiZSBkZWZpbmVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHJvdXRlIG1hcC5cbiAgICBfYmluZFJvdXRlczogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMucm91dGVzKSByZXR1cm47XG4gICAgICB0aGlzLnJvdXRlcyA9IF8ucmVzdWx0KHRoaXMsICdyb3V0ZXMnKTtcbiAgICAgIHZhciByb3V0ZSwgcm91dGVzID0gXy5rZXlzKHRoaXMucm91dGVzKTtcbiAgICAgIHdoaWxlICgocm91dGUgPSByb3V0ZXMucG9wKCkpICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5yb3V0ZShyb3V0ZSwgdGhpcy5yb3V0ZXNbcm91dGVdKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ29udmVydCBhIHJvdXRlIHN0cmluZyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uLCBzdWl0YWJsZSBmb3IgbWF0Y2hpbmdcbiAgICAvLyBhZ2FpbnN0IHRoZSBjdXJyZW50IGxvY2F0aW9uIGhhc2guXG4gICAgX3JvdXRlVG9SZWdFeHA6IGZ1bmN0aW9uKHJvdXRlKSB7XG4gICAgICByb3V0ZSA9IHJvdXRlLnJlcGxhY2UoZXNjYXBlUmVnRXhwLCAnXFxcXCQmJylcbiAgICAgICAgICAgICAgICAgICAucmVwbGFjZShvcHRpb25hbFBhcmFtLCAnKD86JDEpPycpXG4gICAgICAgICAgICAgICAgICAgLnJlcGxhY2UobmFtZWRQYXJhbSwgZnVuY3Rpb24obWF0Y2gsIG9wdGlvbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9uYWwgPyBtYXRjaCA6ICcoW14vP10rKSc7XG4gICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAucmVwbGFjZShzcGxhdFBhcmFtLCAnKFteP10qPyknKTtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKCdeJyArIHJvdXRlICsgJyg/OlxcXFw/KFtcXFxcc1xcXFxTXSopKT8kJyk7XG4gICAgfSxcblxuICAgIC8vIEdpdmVuIGEgcm91dGUsIGFuZCBhIFVSTCBmcmFnbWVudCB0aGF0IGl0IG1hdGNoZXMsIHJldHVybiB0aGUgYXJyYXkgb2ZcbiAgICAvLyBleHRyYWN0ZWQgZGVjb2RlZCBwYXJhbWV0ZXJzLiBFbXB0eSBvciB1bm1hdGNoZWQgcGFyYW1ldGVycyB3aWxsIGJlXG4gICAgLy8gdHJlYXRlZCBhcyBgbnVsbGAgdG8gbm9ybWFsaXplIGNyb3NzLWJyb3dzZXIgYmVoYXZpb3IuXG4gICAgX2V4dHJhY3RQYXJhbWV0ZXJzOiBmdW5jdGlvbihyb3V0ZSwgZnJhZ21lbnQpIHtcbiAgICAgIHZhciBwYXJhbXMgPSByb3V0ZS5leGVjKGZyYWdtZW50KS5zbGljZSgxKTtcbiAgICAgIHJldHVybiBfLm1hcChwYXJhbXMsIGZ1bmN0aW9uKHBhcmFtLCBpKSB7XG4gICAgICAgIC8vIERvbid0IGRlY29kZSB0aGUgc2VhcmNoIHBhcmFtcy5cbiAgICAgICAgaWYgKGkgPT09IHBhcmFtcy5sZW5ndGggLSAxKSByZXR1cm4gcGFyYW0gfHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHBhcmFtID8gZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtKSA6IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gQmFja2JvbmUuSGlzdG9yeVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gSGFuZGxlcyBjcm9zcy1icm93c2VyIGhpc3RvcnkgbWFuYWdlbWVudCwgYmFzZWQgb24gZWl0aGVyXG4gIC8vIFtwdXNoU3RhdGVdKGh0dHA6Ly9kaXZlaW50b2h0bWw1LmluZm8vaGlzdG9yeS5odG1sKSBhbmQgcmVhbCBVUkxzLCBvclxuICAvLyBbb25oYXNoY2hhbmdlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0RPTS93aW5kb3cub25oYXNoY2hhbmdlKVxuICAvLyBhbmQgVVJMIGZyYWdtZW50cy4gSWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgbmVpdGhlciAob2xkIElFLCBuYXRjaCksXG4gIC8vIGZhbGxzIGJhY2sgdG8gcG9sbGluZy5cbiAgdmFyIEhpc3RvcnkgPSBCYWNrYm9uZS5IaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5oYW5kbGVycyA9IFtdO1xuICAgIF8uYmluZEFsbCh0aGlzLCAnY2hlY2tVcmwnKTtcblxuICAgIC8vIEVuc3VyZSB0aGF0IGBIaXN0b3J5YCBjYW4gYmUgdXNlZCBvdXRzaWRlIG9mIHRoZSBicm93c2VyLlxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5sb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcbiAgICAgIHRoaXMuaGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5O1xuICAgIH1cbiAgfTtcblxuICAvLyBDYWNoZWQgcmVnZXggZm9yIHN0cmlwcGluZyBhIGxlYWRpbmcgaGFzaC9zbGFzaCBhbmQgdHJhaWxpbmcgc3BhY2UuXG4gIHZhciByb3V0ZVN0cmlwcGVyID0gL15bI1xcL118XFxzKyQvZztcblxuICAvLyBDYWNoZWQgcmVnZXggZm9yIHN0cmlwcGluZyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzLlxuICB2YXIgcm9vdFN0cmlwcGVyID0gL15cXC8rfFxcLyskL2c7XG5cbiAgLy8gQ2FjaGVkIHJlZ2V4IGZvciBkZXRlY3RpbmcgTVNJRS5cbiAgdmFyIGlzRXhwbG9yZXIgPSAvbXNpZSBbXFx3Ll0rLztcblxuICAvLyBDYWNoZWQgcmVnZXggZm9yIHJlbW92aW5nIGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciB0cmFpbGluZ1NsYXNoID0gL1xcLyQvO1xuXG4gIC8vIENhY2hlZCByZWdleCBmb3Igc3RyaXBwaW5nIHVybHMgb2YgaGFzaC5cbiAgdmFyIHBhdGhTdHJpcHBlciA9IC8jLiokLztcblxuICAvLyBIYXMgdGhlIGhpc3RvcnkgaGFuZGxpbmcgYWxyZWFkeSBiZWVuIHN0YXJ0ZWQ/XG4gIEhpc3Rvcnkuc3RhcnRlZCA9IGZhbHNlO1xuXG4gIC8vIFNldCB1cCBhbGwgaW5oZXJpdGFibGUgKipCYWNrYm9uZS5IaXN0b3J5KiogcHJvcGVydGllcyBhbmQgbWV0aG9kcy5cbiAgXy5leHRlbmQoSGlzdG9yeS5wcm90b3R5cGUsIEV2ZW50cywge1xuXG4gICAgLy8gVGhlIGRlZmF1bHQgaW50ZXJ2YWwgdG8gcG9sbCBmb3IgaGFzaCBjaGFuZ2VzLCBpZiBuZWNlc3NhcnksIGlzXG4gICAgLy8gdHdlbnR5IHRpbWVzIGEgc2Vjb25kLlxuICAgIGludGVydmFsOiA1MCxcblxuICAgIC8vIEFyZSB3ZSBhdCB0aGUgYXBwIHJvb3Q/XG4gICAgYXRSb290OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL1teXFwvXSQvLCAnJCYvJykgPT09IHRoaXMucm9vdDtcbiAgICB9LFxuXG4gICAgLy8gR2V0cyB0aGUgdHJ1ZSBoYXNoIHZhbHVlLiBDYW5ub3QgdXNlIGxvY2F0aW9uLmhhc2ggZGlyZWN0bHkgZHVlIHRvIGJ1Z1xuICAgIC8vIGluIEZpcmVmb3ggd2hlcmUgbG9jYXRpb24uaGFzaCB3aWxsIGFsd2F5cyBiZSBkZWNvZGVkLlxuICAgIGdldEhhc2g6IGZ1bmN0aW9uKHdpbmRvdykge1xuICAgICAgdmFyIG1hdGNoID0gKHdpbmRvdyB8fCB0aGlzKS5sb2NhdGlvbi5ocmVmLm1hdGNoKC8jKC4qKSQvKTtcbiAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgY3Jvc3MtYnJvd3NlciBub3JtYWxpemVkIFVSTCBmcmFnbWVudCwgZWl0aGVyIGZyb20gdGhlIFVSTCxcbiAgICAvLyB0aGUgaGFzaCwgb3IgdGhlIG92ZXJyaWRlLlxuICAgIGdldEZyYWdtZW50OiBmdW5jdGlvbihmcmFnbWVudCwgZm9yY2VQdXNoU3RhdGUpIHtcbiAgICAgIGlmIChmcmFnbWVudCA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNQdXNoU3RhdGUgfHwgIXRoaXMuX3dhbnRzSGFzaENoYW5nZSB8fCBmb3JjZVB1c2hTdGF0ZSkge1xuICAgICAgICAgIGZyYWdtZW50ID0gZGVjb2RlVVJJKHRoaXMubG9jYXRpb24ucGF0aG5hbWUgKyB0aGlzLmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgICAgdmFyIHJvb3QgPSB0aGlzLnJvb3QucmVwbGFjZSh0cmFpbGluZ1NsYXNoLCAnJyk7XG4gICAgICAgICAgaWYgKCFmcmFnbWVudC5pbmRleE9mKHJvb3QpKSBmcmFnbWVudCA9IGZyYWdtZW50LnNsaWNlKHJvb3QubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmcmFnbWVudCA9IHRoaXMuZ2V0SGFzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZnJhZ21lbnQucmVwbGFjZShyb3V0ZVN0cmlwcGVyLCAnJyk7XG4gICAgfSxcblxuICAgIC8vIFN0YXJ0IHRoZSBoYXNoIGNoYW5nZSBoYW5kbGluZywgcmV0dXJuaW5nIGB0cnVlYCBpZiB0aGUgY3VycmVudCBVUkwgbWF0Y2hlc1xuICAgIC8vIGFuIGV4aXN0aW5nIHJvdXRlLCBhbmQgYGZhbHNlYCBvdGhlcndpc2UuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIGlmIChIaXN0b3J5LnN0YXJ0ZWQpIHRocm93IG5ldyBFcnJvcihcIkJhY2tib25lLmhpc3RvcnkgaGFzIGFscmVhZHkgYmVlbiBzdGFydGVkXCIpO1xuICAgICAgSGlzdG9yeS5zdGFydGVkID0gdHJ1ZTtcblxuICAgICAgLy8gRmlndXJlIG91dCB0aGUgaW5pdGlhbCBjb25maWd1cmF0aW9uLiBEbyB3ZSBuZWVkIGFuIGlmcmFtZT9cbiAgICAgIC8vIElzIHB1c2hTdGF0ZSBkZXNpcmVkIC4uLiBpcyBpdCBhdmFpbGFibGU/XG4gICAgICB0aGlzLm9wdGlvbnMgICAgICAgICAgPSBfLmV4dGVuZCh7cm9vdDogJy8nfSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgIHRoaXMucm9vdCAgICAgICAgICAgICA9IHRoaXMub3B0aW9ucy5yb290O1xuICAgICAgdGhpcy5fd2FudHNIYXNoQ2hhbmdlID0gdGhpcy5vcHRpb25zLmhhc2hDaGFuZ2UgIT09IGZhbHNlO1xuICAgICAgdGhpcy5fd2FudHNQdXNoU3RhdGUgID0gISF0aGlzLm9wdGlvbnMucHVzaFN0YXRlO1xuICAgICAgdGhpcy5faGFzUHVzaFN0YXRlICAgID0gISEodGhpcy5vcHRpb25zLnB1c2hTdGF0ZSAmJiB0aGlzLmhpc3RvcnkgJiYgdGhpcy5oaXN0b3J5LnB1c2hTdGF0ZSk7XG4gICAgICB2YXIgZnJhZ21lbnQgICAgICAgICAgPSB0aGlzLmdldEZyYWdtZW50KCk7XG4gICAgICB2YXIgZG9jTW9kZSAgICAgICAgICAgPSBkb2N1bWVudC5kb2N1bWVudE1vZGU7XG4gICAgICB2YXIgb2xkSUUgICAgICAgICAgICAgPSAoaXNFeHBsb3Jlci5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSkgJiYgKCFkb2NNb2RlIHx8IGRvY01vZGUgPD0gNykpO1xuXG4gICAgICAvLyBOb3JtYWxpemUgcm9vdCB0byBhbHdheXMgaW5jbHVkZSBhIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoLlxuICAgICAgdGhpcy5yb290ID0gKCcvJyArIHRoaXMucm9vdCArICcvJykucmVwbGFjZShyb290U3RyaXBwZXIsICcvJyk7XG5cbiAgICAgIGlmIChvbGRJRSAmJiB0aGlzLl93YW50c0hhc2hDaGFuZ2UpIHtcbiAgICAgICAgdmFyIGZyYW1lID0gQmFja2JvbmUuJCgnPGlmcmFtZSBzcmM9XCJqYXZhc2NyaXB0OjBcIiB0YWJpbmRleD1cIi0xXCI+Jyk7XG4gICAgICAgIHRoaXMuaWZyYW1lID0gZnJhbWUuaGlkZSgpLmFwcGVuZFRvKCdib2R5JylbMF0uY29udGVudFdpbmRvdztcbiAgICAgICAgdGhpcy5uYXZpZ2F0ZShmcmFnbWVudCk7XG4gICAgICB9XG5cbiAgICAgIC8vIERlcGVuZGluZyBvbiB3aGV0aGVyIHdlJ3JlIHVzaW5nIHB1c2hTdGF0ZSBvciBoYXNoZXMsIGFuZCB3aGV0aGVyXG4gICAgICAvLyAnb25oYXNoY2hhbmdlJyBpcyBzdXBwb3J0ZWQsIGRldGVybWluZSBob3cgd2UgY2hlY2sgdGhlIFVSTCBzdGF0ZS5cbiAgICAgIGlmICh0aGlzLl9oYXNQdXNoU3RhdGUpIHtcbiAgICAgICAgQmFja2JvbmUuJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuY2hlY2tVcmwpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl93YW50c0hhc2hDaGFuZ2UgJiYgKCdvbmhhc2hjaGFuZ2UnIGluIHdpbmRvdykgJiYgIW9sZElFKSB7XG4gICAgICAgIEJhY2tib25lLiQod2luZG93KS5vbignaGFzaGNoYW5nZScsIHRoaXMuY2hlY2tVcmwpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl93YW50c0hhc2hDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fY2hlY2tVcmxJbnRlcnZhbCA9IHNldEludGVydmFsKHRoaXMuY2hlY2tVcmwsIHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgaWYgd2UgbmVlZCB0byBjaGFuZ2UgdGhlIGJhc2UgdXJsLCBmb3IgYSBwdXNoU3RhdGUgbGlua1xuICAgICAgLy8gb3BlbmVkIGJ5IGEgbm9uLXB1c2hTdGF0ZSBicm93c2VyLlxuICAgICAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50O1xuICAgICAgdmFyIGxvYyA9IHRoaXMubG9jYXRpb247XG5cbiAgICAgIC8vIFRyYW5zaXRpb24gZnJvbSBoYXNoQ2hhbmdlIHRvIHB1c2hTdGF0ZSBvciB2aWNlIHZlcnNhIGlmIGJvdGggYXJlXG4gICAgICAvLyByZXF1ZXN0ZWQuXG4gICAgICBpZiAodGhpcy5fd2FudHNIYXNoQ2hhbmdlICYmIHRoaXMuX3dhbnRzUHVzaFN0YXRlKSB7XG5cbiAgICAgICAgLy8gSWYgd2UndmUgc3RhcnRlZCBvZmYgd2l0aCBhIHJvdXRlIGZyb20gYSBgcHVzaFN0YXRlYC1lbmFibGVkXG4gICAgICAgIC8vIGJyb3dzZXIsIGJ1dCB3ZSdyZSBjdXJyZW50bHkgaW4gYSBicm93c2VyIHRoYXQgZG9lc24ndCBzdXBwb3J0IGl0Li4uXG4gICAgICAgIGlmICghdGhpcy5faGFzUHVzaFN0YXRlICYmICF0aGlzLmF0Um9vdCgpKSB7XG4gICAgICAgICAgdGhpcy5mcmFnbWVudCA9IHRoaXMuZ2V0RnJhZ21lbnQobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgdGhpcy5sb2NhdGlvbi5yZXBsYWNlKHRoaXMucm9vdCArICcjJyArIHRoaXMuZnJhZ21lbnQpO1xuICAgICAgICAgIC8vIFJldHVybiBpbW1lZGlhdGVseSBhcyBicm93c2VyIHdpbGwgZG8gcmVkaXJlY3QgdG8gbmV3IHVybFxuICAgICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICAgIC8vIE9yIGlmIHdlJ3ZlIHN0YXJ0ZWQgb3V0IHdpdGggYSBoYXNoLWJhc2VkIHJvdXRlLCBidXQgd2UncmUgY3VycmVudGx5XG4gICAgICAgIC8vIGluIGEgYnJvd3NlciB3aGVyZSBpdCBjb3VsZCBiZSBgcHVzaFN0YXRlYC1iYXNlZCBpbnN0ZWFkLi4uXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faGFzUHVzaFN0YXRlICYmIHRoaXMuYXRSb290KCkgJiYgbG9jLmhhc2gpIHtcbiAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gdGhpcy5nZXRIYXNoKCkucmVwbGFjZShyb3V0ZVN0cmlwcGVyLCAnJyk7XG4gICAgICAgICAgdGhpcy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHRoaXMucm9vdCArIHRoaXMuZnJhZ21lbnQpO1xuICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc2lsZW50KSByZXR1cm4gdGhpcy5sb2FkVXJsKCk7XG4gICAgfSxcblxuICAgIC8vIERpc2FibGUgQmFja2JvbmUuaGlzdG9yeSwgcGVyaGFwcyB0ZW1wb3JhcmlseS4gTm90IHVzZWZ1bCBpbiBhIHJlYWwgYXBwLFxuICAgIC8vIGJ1dCBwb3NzaWJseSB1c2VmdWwgZm9yIHVuaXQgdGVzdGluZyBSb3V0ZXJzLlxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgQmFja2JvbmUuJCh3aW5kb3cpLm9mZigncG9wc3RhdGUnLCB0aGlzLmNoZWNrVXJsKS5vZmYoJ2hhc2hjaGFuZ2UnLCB0aGlzLmNoZWNrVXJsKTtcbiAgICAgIGlmICh0aGlzLl9jaGVja1VybEludGVydmFsKSBjbGVhckludGVydmFsKHRoaXMuX2NoZWNrVXJsSW50ZXJ2YWwpO1xuICAgICAgSGlzdG9yeS5zdGFydGVkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIHJvdXRlIHRvIGJlIHRlc3RlZCB3aGVuIHRoZSBmcmFnbWVudCBjaGFuZ2VzLiBSb3V0ZXMgYWRkZWQgbGF0ZXJcbiAgICAvLyBtYXkgb3ZlcnJpZGUgcHJldmlvdXMgcm91dGVzLlxuICAgIHJvdXRlOiBmdW5jdGlvbihyb3V0ZSwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuaGFuZGxlcnMudW5zaGlmdCh7cm91dGU6IHJvdXRlLCBjYWxsYmFjazogY2FsbGJhY2t9KTtcbiAgICB9LFxuXG4gICAgLy8gQ2hlY2tzIHRoZSBjdXJyZW50IFVSTCB0byBzZWUgaWYgaXQgaGFzIGNoYW5nZWQsIGFuZCBpZiBpdCBoYXMsXG4gICAgLy8gY2FsbHMgYGxvYWRVcmxgLCBub3JtYWxpemluZyBhY3Jvc3MgdGhlIGhpZGRlbiBpZnJhbWUuXG4gICAgY2hlY2tVcmw6IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRGcmFnbWVudCgpO1xuICAgICAgaWYgKGN1cnJlbnQgPT09IHRoaXMuZnJhZ21lbnQgJiYgdGhpcy5pZnJhbWUpIHtcbiAgICAgICAgY3VycmVudCA9IHRoaXMuZ2V0RnJhZ21lbnQodGhpcy5nZXRIYXNoKHRoaXMuaWZyYW1lKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudCA9PT0gdGhpcy5mcmFnbWVudCkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKHRoaXMuaWZyYW1lKSB0aGlzLm5hdmlnYXRlKGN1cnJlbnQpO1xuICAgICAgdGhpcy5sb2FkVXJsKCk7XG4gICAgfSxcblxuICAgIC8vIEF0dGVtcHQgdG8gbG9hZCB0aGUgY3VycmVudCBVUkwgZnJhZ21lbnQuIElmIGEgcm91dGUgc3VjY2VlZHMgd2l0aCBhXG4gICAgLy8gbWF0Y2gsIHJldHVybnMgYHRydWVgLiBJZiBubyBkZWZpbmVkIHJvdXRlcyBtYXRjaGVzIHRoZSBmcmFnbWVudCxcbiAgICAvLyByZXR1cm5zIGBmYWxzZWAuXG4gICAgbG9hZFVybDogZnVuY3Rpb24oZnJhZ21lbnQpIHtcbiAgICAgIGZyYWdtZW50ID0gdGhpcy5mcmFnbWVudCA9IHRoaXMuZ2V0RnJhZ21lbnQoZnJhZ21lbnQpO1xuICAgICAgcmV0dXJuIF8uYW55KHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKGhhbmRsZXIucm91dGUudGVzdChmcmFnbWVudCkpIHtcbiAgICAgICAgICBoYW5kbGVyLmNhbGxiYWNrKGZyYWdtZW50KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8vIFNhdmUgYSBmcmFnbWVudCBpbnRvIHRoZSBoYXNoIGhpc3RvcnksIG9yIHJlcGxhY2UgdGhlIFVSTCBzdGF0ZSBpZiB0aGVcbiAgICAvLyAncmVwbGFjZScgb3B0aW9uIGlzIHBhc3NlZC4gWW91IGFyZSByZXNwb25zaWJsZSBmb3IgcHJvcGVybHkgVVJMLWVuY29kaW5nXG4gICAgLy8gdGhlIGZyYWdtZW50IGluIGFkdmFuY2UuXG4gICAgLy9cbiAgICAvLyBUaGUgb3B0aW9ucyBvYmplY3QgY2FuIGNvbnRhaW4gYHRyaWdnZXI6IHRydWVgIGlmIHlvdSB3aXNoIHRvIGhhdmUgdGhlXG4gICAgLy8gcm91dGUgY2FsbGJhY2sgYmUgZmlyZWQgKG5vdCB1c3VhbGx5IGRlc2lyYWJsZSksIG9yIGByZXBsYWNlOiB0cnVlYCwgaWZcbiAgICAvLyB5b3Ugd2lzaCB0byBtb2RpZnkgdGhlIGN1cnJlbnQgVVJMIHdpdGhvdXQgYWRkaW5nIGFuIGVudHJ5IHRvIHRoZSBoaXN0b3J5LlxuICAgIG5hdmlnYXRlOiBmdW5jdGlvbihmcmFnbWVudCwgb3B0aW9ucykge1xuICAgICAgaWYgKCFIaXN0b3J5LnN0YXJ0ZWQpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghb3B0aW9ucyB8fCBvcHRpb25zID09PSB0cnVlKSBvcHRpb25zID0ge3RyaWdnZXI6ICEhb3B0aW9uc307XG5cbiAgICAgIHZhciB1cmwgPSB0aGlzLnJvb3QgKyAoZnJhZ21lbnQgPSB0aGlzLmdldEZyYWdtZW50KGZyYWdtZW50IHx8ICcnKSk7XG5cbiAgICAgIC8vIFN0cmlwIHRoZSBoYXNoIGZvciBtYXRjaGluZy5cbiAgICAgIGZyYWdtZW50ID0gZnJhZ21lbnQucmVwbGFjZShwYXRoU3RyaXBwZXIsICcnKTtcblxuICAgICAgaWYgKHRoaXMuZnJhZ21lbnQgPT09IGZyYWdtZW50KSByZXR1cm47XG4gICAgICB0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQ7XG5cbiAgICAgIC8vIERvbid0IGluY2x1ZGUgYSB0cmFpbGluZyBzbGFzaCBvbiB0aGUgcm9vdC5cbiAgICAgIGlmIChmcmFnbWVudCA9PT0gJycgJiYgdXJsICE9PSAnLycpIHVybCA9IHVybC5zbGljZSgwLCAtMSk7XG5cbiAgICAgIC8vIElmIHB1c2hTdGF0ZSBpcyBhdmFpbGFibGUsIHdlIHVzZSBpdCB0byBzZXQgdGhlIGZyYWdtZW50IGFzIGEgcmVhbCBVUkwuXG4gICAgICBpZiAodGhpcy5faGFzUHVzaFN0YXRlKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeVtvcHRpb25zLnJlcGxhY2UgPyAncmVwbGFjZVN0YXRlJyA6ICdwdXNoU3RhdGUnXSh7fSwgZG9jdW1lbnQudGl0bGUsIHVybCk7XG5cbiAgICAgIC8vIElmIGhhc2ggY2hhbmdlcyBoYXZlbid0IGJlZW4gZXhwbGljaXRseSBkaXNhYmxlZCwgdXBkYXRlIHRoZSBoYXNoXG4gICAgICAvLyBmcmFnbWVudCB0byBzdG9yZSBoaXN0b3J5LlxuICAgICAgfSBlbHNlIGlmICh0aGlzLl93YW50c0hhc2hDaGFuZ2UpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlSGFzaCh0aGlzLmxvY2F0aW9uLCBmcmFnbWVudCwgb3B0aW9ucy5yZXBsYWNlKTtcbiAgICAgICAgaWYgKHRoaXMuaWZyYW1lICYmIChmcmFnbWVudCAhPT0gdGhpcy5nZXRGcmFnbWVudCh0aGlzLmdldEhhc2godGhpcy5pZnJhbWUpKSkpIHtcbiAgICAgICAgICAvLyBPcGVuaW5nIGFuZCBjbG9zaW5nIHRoZSBpZnJhbWUgdHJpY2tzIElFNyBhbmQgZWFybGllciB0byBwdXNoIGFcbiAgICAgICAgICAvLyBoaXN0b3J5IGVudHJ5IG9uIGhhc2gtdGFnIGNoYW5nZS4gIFdoZW4gcmVwbGFjZSBpcyB0cnVlLCB3ZSBkb24ndFxuICAgICAgICAgIC8vIHdhbnQgdGhpcy5cbiAgICAgICAgICBpZighb3B0aW9ucy5yZXBsYWNlKSB0aGlzLmlmcmFtZS5kb2N1bWVudC5vcGVuKCkuY2xvc2UoKTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVIYXNoKHRoaXMuaWZyYW1lLmxvY2F0aW9uLCBmcmFnbWVudCwgb3B0aW9ucy5yZXBsYWNlKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBJZiB5b3UndmUgdG9sZCB1cyB0aGF0IHlvdSBleHBsaWNpdGx5IGRvbid0IHdhbnQgZmFsbGJhY2sgaGFzaGNoYW5nZS1cbiAgICAgIC8vIGJhc2VkIGhpc3RvcnksIHRoZW4gYG5hdmlnYXRlYCBiZWNvbWVzIGEgcGFnZSByZWZyZXNoLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYXRpb24uYXNzaWduKHVybCk7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy50cmlnZ2VyKSByZXR1cm4gdGhpcy5sb2FkVXJsKGZyYWdtZW50KTtcbiAgICB9LFxuXG4gICAgLy8gVXBkYXRlIHRoZSBoYXNoIGxvY2F0aW9uLCBlaXRoZXIgcmVwbGFjaW5nIHRoZSBjdXJyZW50IGVudHJ5LCBvciBhZGRpbmdcbiAgICAvLyBhIG5ldyBvbmUgdG8gdGhlIGJyb3dzZXIgaGlzdG9yeS5cbiAgICBfdXBkYXRlSGFzaDogZnVuY3Rpb24obG9jYXRpb24sIGZyYWdtZW50LCByZXBsYWNlKSB7XG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB2YXIgaHJlZiA9IGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvKGphdmFzY3JpcHQ6fCMpLiokLywgJycpO1xuICAgICAgICBsb2NhdGlvbi5yZXBsYWNlKGhyZWYgKyAnIycgKyBmcmFnbWVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTb21lIGJyb3dzZXJzIHJlcXVpcmUgdGhhdCBgaGFzaGAgY29udGFpbnMgYSBsZWFkaW5nICMuXG4gICAgICAgIGxvY2F0aW9uLmhhc2ggPSAnIycgKyBmcmFnbWVudDtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IEJhY2tib25lLmhpc3RvcnkuXG4gIEJhY2tib25lLmhpc3RvcnkgPSBuZXcgSGlzdG9yeTtcblxuICAvLyBIZWxwZXJzXG4gIC8vIC0tLS0tLS1cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29ycmVjdGx5IHNldCB1cCB0aGUgcHJvdG90eXBlIGNoYWluLCBmb3Igc3ViY2xhc3Nlcy5cbiAgLy8gU2ltaWxhciB0byBgZ29vZy5pbmhlcml0c2AsIGJ1dCB1c2VzIGEgaGFzaCBvZiBwcm90b3R5cGUgcHJvcGVydGllcyBhbmRcbiAgLy8gY2xhc3MgcHJvcGVydGllcyB0byBiZSBleHRlbmRlZC5cbiAgdmFyIGV4dGVuZCA9IGZ1bmN0aW9uKHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgdmFyIGNoaWxkO1xuXG4gICAgLy8gVGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgbmV3IHN1YmNsYXNzIGlzIGVpdGhlciBkZWZpbmVkIGJ5IHlvdVxuICAgIC8vICh0aGUgXCJjb25zdHJ1Y3RvclwiIHByb3BlcnR5IGluIHlvdXIgYGV4dGVuZGAgZGVmaW5pdGlvbiksIG9yIGRlZmF1bHRlZFxuICAgIC8vIGJ5IHVzIHRvIHNpbXBseSBjYWxsIHRoZSBwYXJlbnQncyBjb25zdHJ1Y3Rvci5cbiAgICBpZiAocHJvdG9Qcm9wcyAmJiBfLmhhcyhwcm90b1Byb3BzLCAnY29uc3RydWN0b3InKSkge1xuICAgICAgY2hpbGQgPSBwcm90b1Byb3BzLmNvbnN0cnVjdG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZCA9IGZ1bmN0aW9uKCl7IHJldHVybiBwYXJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICB9XG5cbiAgICAvLyBBZGQgc3RhdGljIHByb3BlcnRpZXMgdG8gdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLCBpZiBzdXBwbGllZC5cbiAgICBfLmV4dGVuZChjaGlsZCwgcGFyZW50LCBzdGF0aWNQcm9wcyk7XG5cbiAgICAvLyBTZXQgdGhlIHByb3RvdHlwZSBjaGFpbiB0byBpbmhlcml0IGZyb20gYHBhcmVudGAsIHdpdGhvdXQgY2FsbGluZ1xuICAgIC8vIGBwYXJlbnRgJ3MgY29uc3RydWN0b3IgZnVuY3Rpb24uXG4gICAgdmFyIFN1cnJvZ2F0ZSA9IGZ1bmN0aW9uKCl7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfTtcbiAgICBTdXJyb2dhdGUucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTtcbiAgICBjaGlsZC5wcm90b3R5cGUgPSBuZXcgU3Vycm9nYXRlO1xuXG4gICAgLy8gQWRkIHByb3RvdHlwZSBwcm9wZXJ0aWVzIChpbnN0YW5jZSBwcm9wZXJ0aWVzKSB0byB0aGUgc3ViY2xhc3MsXG4gICAgLy8gaWYgc3VwcGxpZWQuXG4gICAgaWYgKHByb3RvUHJvcHMpIF8uZXh0ZW5kKGNoaWxkLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG5cbiAgICAvLyBTZXQgYSBjb252ZW5pZW5jZSBwcm9wZXJ0eSBpbiBjYXNlIHRoZSBwYXJlbnQncyBwcm90b3R5cGUgaXMgbmVlZGVkXG4gICAgLy8gbGF0ZXIuXG4gICAgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblxuICAgIHJldHVybiBjaGlsZDtcbiAgfTtcblxuICAvLyBTZXQgdXAgaW5oZXJpdGFuY2UgZm9yIHRoZSBtb2RlbCwgY29sbGVjdGlvbiwgcm91dGVyLCB2aWV3IGFuZCBoaXN0b3J5LlxuICBNb2RlbC5leHRlbmQgPSBDb2xsZWN0aW9uLmV4dGVuZCA9IFJvdXRlci5leHRlbmQgPSBWaWV3LmV4dGVuZCA9IEhpc3RvcnkuZXh0ZW5kID0gZXh0ZW5kO1xuXG4gIC8vIFRocm93IGFuIGVycm9yIHdoZW4gYSBVUkwgaXMgbmVlZGVkLCBhbmQgbm9uZSBpcyBzdXBwbGllZC5cbiAgdmFyIHVybEVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBIFwidXJsXCIgcHJvcGVydHkgb3IgZnVuY3Rpb24gbXVzdCBiZSBzcGVjaWZpZWQnKTtcbiAgfTtcblxuICAvLyBXcmFwIGFuIG9wdGlvbmFsIGVycm9yIGNhbGxiYWNrIHdpdGggYSBmYWxsYmFjayBlcnJvciBldmVudC5cbiAgdmFyIHdyYXBFcnJvciA9IGZ1bmN0aW9uKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgdmFyIGVycm9yID0gb3B0aW9ucy5lcnJvcjtcbiAgICBvcHRpb25zLmVycm9yID0gZnVuY3Rpb24ocmVzcCkge1xuICAgICAgaWYgKGVycm9yKSBlcnJvcihtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICBtb2RlbC50cmlnZ2VyKCdlcnJvcicsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICB9O1xuICB9O1xuXG4gIHJldHVybiBCYWNrYm9uZTtcblxufSkpO1xuIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS43LjBcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjcuMCc7XG5cbiAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVmZmljaWVudCAoZm9yIGN1cnJlbnQgZW5naW5lcykgdmVyc2lvblxuICAvLyBvZiB0aGUgcGFzc2VkLWluIGNhbGxiYWNrLCB0byBiZSByZXBlYXRlZGx5IGFwcGxpZWQgaW4gb3RoZXIgVW5kZXJzY29yZVxuICAvLyBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVDYWxsYmFjayA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgb3RoZXIpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEEgbW9zdGx5LWludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGNhbGxiYWNrcyB0aGF0IGNhbiBiZSBhcHBsaWVkXG4gIC8vIHRvIGVhY2ggZWxlbWVudCBpbiBhIGNvbGxlY3Rpb24sIHJldHVybmluZyB0aGUgZGVzaXJlZCByZXN1bHQg4oCUIGVpdGhlclxuICAvLyBpZGVudGl0eSwgYW4gYXJiaXRyYXJ5IGNhbGxiYWNrLCBhIHByb3BlcnR5IG1hdGNoZXIsIG9yIGEgcHJvcGVydHkgYWNjZXNzb3IuXG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBjcmVhdGVDYWxsYmFjayh2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcyh2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoID09PSArbGVuZ3RoKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIHJlc3VsdHMgPSBBcnJheShsZW5ndGgpLFxuICAgICAgICBjdXJyZW50S2V5O1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICB2YXIgcmVkdWNlRXJyb3IgPSAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQsIDQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCA9IDAsIGN1cnJlbnRLZXk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICBpZiAoIWxlbmd0aCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgICBtZW1vID0gb2JqW2tleXMgPyBrZXlzW2luZGV4KytdIDogaW5kZXgrK107XG4gICAgfVxuICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaXRlcmF0ZWUgPSBjcmVhdGVDYWxsYmFjayhpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgdmFyIGtleXMgPSBvYmoubGVuZ3RoICE9PSArIG9iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGluZGV4ID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIGN1cnJlbnRLZXk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICBpZiAoIWluZGV4KSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbLS1pbmRleF0gOiAtLWluZGV4XTtcbiAgICB9XG4gICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIF8uc29tZShvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKF8uaXRlcmF0ZWUocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgcHJlZGljYXRlID0gXy5pdGVyYXRlZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gb2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGggJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICBpbmRleCwgY3VycmVudEtleTtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIGN1cnJlbnRLZXk7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIHZhbHVlICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCB0YXJnZXQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIHRhcmdldCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIChpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdKS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVzKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gb2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGggPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBfLml0ZXJhdGVlKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPCByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IG9iaiAmJiBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IHNldC5sZW5ndGg7XG4gICAgdmFyIHNodWZmbGVkID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIHJhbmQ7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgaWYgKHJhbmQgIT09IGluZGV4KSBzaHVmZmxlZFtpbmRleF0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gc2V0W2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdGVlLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gXy5pdGVyYXRlZShpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IGxvdyArIGhpZ2ggPj4+IDE7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBfLml0ZXJhdGVlKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIHBhc3MgPSBbXSwgZmFpbCA9IFtdO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgICAgKHByZWRpY2F0ZSh2YWx1ZSwga2V5LCBvYmopID8gcGFzcyA6IGZhaWwpLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICBpZiAobiA8IDApIHJldHVybiBbXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uIFRoZSAqKmd1YXJkKiogY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aFxuICAvLyBgXy5tYXBgLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gKG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKSkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgTWF0aC5tYXgoYXJyYXkubGVuZ3RoIC0gbiwgMCkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqXG4gIC8vIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KSB7XG4gICAgaWYgKHNoYWxsb3cgJiYgXy5ldmVyeShpbnB1dCwgXy5pc0FycmF5KSkge1xuICAgICAgcmV0dXJuIGNvbmNhdC5hcHBseShvdXRwdXQsIGlucHV0KTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGlucHV0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpbnB1dFtpXTtcbiAgICAgIGlmICghXy5pc0FycmF5KHZhbHVlKSAmJiAhXy5pc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCFzdHJpY3QpIG91dHB1dC5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc2hhbGxvdykge1xuICAgICAgICBwdXNoLmFwcGx5KG91dHB1dCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UsIFtdKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiBbXTtcbiAgICBpZiAoIV8uaXNCb29sZWFuKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdGVlO1xuICAgICAgaXRlcmF0ZWUgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpdGVyYXRlZSAhPSBudWxsKSBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaV07XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IHZhbHVlKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGksIGFycmF5KTtcbiAgICAgICAgaWYgKF8uaW5kZXhPZihzZWVuLCBjb21wdXRlZCkgPCAwKSB7XG4gICAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXy5pbmRleE9mKHJlc3VsdCwgdmFsdWUpIDwgMCkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShmbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSwgdHJ1ZSwgW10pKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIHRydWUsIHRydWUsIFtdKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gW107XG4gICAgdmFyIGxlbmd0aCA9IF8ubWF4KGFyZ3VtZW50cywgJ2xlbmd0aCcpLmxlbmd0aDtcbiAgICB2YXIgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIGlmIChsaXN0ID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgaXNTb3J0ZWQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgaWYgKHR5cGVvZiBpc1NvcnRlZCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpID0gaXNTb3J0ZWQgPCAwID8gTWF0aC5tYXgoMCwgbGVuZ3RoICsgaXNTb3J0ZWQpIDogaXNTb3J0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgXy5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBmcm9tKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaWR4ID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmICh0eXBlb2YgZnJvbSA9PSAnbnVtYmVyJykge1xuICAgICAgaWR4ID0gZnJvbSA8IDAgPyBpZHggKyBmcm9tICsgMSA6IE1hdGgubWluKGlkeCwgZnJvbSArIDEpO1xuICAgIH1cbiAgICB3aGlsZSAoLS1pZHggPj0gMCkgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBzdGVwIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciByYW5nZSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XG4gICAgICByYW5nZVtpZHhdID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUmV1c2FibGUgY29uc3RydWN0b3IgZnVuY3Rpb24gZm9yIHByb3RvdHlwZSBzZXR0aW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncywgYm91bmQ7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgYm91bmQpKSByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIEN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgc2VsZiA9IG5ldyBDdG9yO1xuICAgICAgQ3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgdmFyIHJlc3VsdCA9IGZ1bmMuYXBwbHkoc2VsZiwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBpZiAoXy5pc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gMDtcbiAgICAgIHZhciBhcmdzID0gYm91bmRBcmdzLnNsaWNlKCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gYXJncy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYXJnc1tpXSA9PT0gXykgYXJnc1tpXSA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9IGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5O1xuICAgICAgaWYgKCFfLmhhcyhjYWNoZSwgYWRkcmVzcykpIGNhY2hlW2FkZHJlc3NdID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNhY2hlW2FkZHJlc3NdO1xuICAgIH07XG4gICAgbWVtb2l6ZS5jYWNoZSA9IHt9O1xuICAgIHJldHVybiBtZW1vaXplO1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gXy5kZWxheS5hcHBseShfLCBbZnVuYywgMV0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSkpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XG5cbiAgICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID4gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgYWZ0ZXIgYmVpbmcgY2FsbGVkIE4gdGltZXMuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGJlZm9yZSBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVuYyA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBfLnBhcnRpYWwoXy5iZWZvcmUsIDIpO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgdmFyIHNvdXJjZSwgcHJvcDtcbiAgICBmb3IgKHZhciBpID0gMSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG4gICAgICBmb3IgKHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwgcHJvcCkpIHtcbiAgICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIGtleTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gY3JlYXRlQ2FsbGJhY2soaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgICBpZiAoaXRlcmF0ZWUodmFsdWUsIGtleSwgb2JqKSkgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoW10sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICBvYmogPSBuZXcgT2JqZWN0KG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICBpZiAoa2V5IGluIG9iaikgcmVzdWx0W2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkge1xuICAgICAgaXRlcmF0ZWUgPSBfLm5lZ2F0ZShpdGVyYXRlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5tYXAoY29uY2F0LmFwcGx5KFtdLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG4gICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzXG4gICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgaWYgKFxuICAgICAgYUN0b3IgIT09IGJDdG9yICYmXG4gICAgICAvLyBIYW5kbGUgT2JqZWN0LmNyZWF0ZSh4KSBjYXNlc1xuICAgICAgJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYiAmJlxuICAgICAgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcbiAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUsIHJlc3VsdDtcbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgc2l6ZSA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgcmVzdWx0ID0gXy5rZXlzKGIpLmxlbmd0aCA9PT0gc2l6ZTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICAgIGtleSA9IGtleXNbc2l6ZV07XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSB8fCBfLmlzQXJndW1lbnRzKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cC5cbiAgXy5lYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFKSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5oYXMob2JqLCAnY2FsbGVlJyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS4gV29yayBhcm91bmQgYW4gSUUgMTEgYnVnLlxuICBpZiAodHlwZW9mIC8uLyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ubm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuICBfLnByb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIHZhciBwYWlycyA9IF8ucGFpcnMoYXR0cnMpLCBsZW5ndGggPSBwYWlycy5sZW5ndGg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gIWxlbmd0aDtcbiAgICAgIG9iaiA9IG5ldyBPYmplY3Qob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHBhaXIgPSBwYWlyc1tpXSwga2V5ID0gcGFpclswXTtcbiAgICAgICAgaWYgKHBhaXJbMV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IGNyZWF0ZUNhbGxiYWNrKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRlZShpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gQSAocG9zc2libHkgZmFzdGVyKSB3YXkgdG8gZ2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcCBhcyBhbiBpbnRlZ2VyLlxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfTtcblxuICAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVzY2FwZU1hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmI3gyNzsnLFxuICAgICdgJzogJyYjeDYwOydcbiAgfTtcbiAgdmFyIHVuZXNjYXBlTWFwID0gXy5pbnZlcnQoZXNjYXBlTWFwKTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIHZhciBjcmVhdGVFc2NhcGVyID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGVzY2FwZXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgcmV0dXJuIG1hcFttYXRjaF07XG4gICAgfTtcbiAgICAvLyBSZWdleGVzIGZvciBpZGVudGlmeWluZyBhIGtleSB0aGF0IG5lZWRzIHRvIGJlIGVzY2FwZWRcbiAgICB2YXIgc291cmNlID0gJyg/OicgKyBfLmtleXMobWFwKS5qb2luKCd8JykgKyAnKSc7XG4gICAgdmFyIHRlc3RSZWdleHAgPSBSZWdFeHAoc291cmNlKTtcbiAgICB2YXIgcmVwbGFjZVJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UsICdnJyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgc3RyaW5nID0gc3RyaW5nID09IG51bGwgPyAnJyA6ICcnICsgc3RyaW5nO1xuICAgICAgcmV0dXJuIHRlc3RSZWdleHAudGVzdChzdHJpbmcpID8gc3RyaW5nLnJlcGxhY2UocmVwbGFjZVJlZ2V4cCwgZXNjYXBlcikgOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbiAgXy5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKGVzY2FwZU1hcCk7XG4gIF8udW5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKHVuZXNjYXBlTWFwKTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyBvYmplY3RbcHJvcGVydHldKCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIHZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07XG4gIH07XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgLy8gTkI6IGBvbGRTZXR0aW5nc2Agb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XG4gICAgaWYgKCFzZXR0aW5ncyAmJiBvbGRTZXR0aW5ncykgc2V0dGluZ3MgPSBvbGRTZXR0aW5ncztcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UoZXNjYXBlciwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2ZmZXN0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHZhciBhcmd1bWVudCA9IHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonO1xuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgYXJndW1lbnQgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbi4gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGluc3RhbmNlID0gXyhvYmopO1xuICAgIGluc3RhbmNlLl9jaGFpbiA9IHRydWU7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBfLmVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09PSAnc2hpZnQnIHx8IG5hbWUgPT09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgXy5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd1bmRlcnNjb3JlJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qZ2xvYmFscyBIYW5kbGViYXJzOiB0cnVlICovXG52YXIgYmFzZSA9IHJlcXVpcmUoXCIuL2hhbmRsZWJhcnMvYmFzZVwiKTtcblxuLy8gRWFjaCBvZiB0aGVzZSBhdWdtZW50IHRoZSBIYW5kbGViYXJzIG9iamVjdC4gTm8gbmVlZCB0byBzZXR1cCBoZXJlLlxuLy8gKFRoaXMgaXMgZG9uZSB0byBlYXNpbHkgc2hhcmUgY29kZSBiZXR3ZWVuIGNvbW1vbmpzIGFuZCBicm93c2UgZW52cylcbnZhciBTYWZlU3RyaW5nID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9zYWZlLXN0cmluZ1wiKVtcImRlZmF1bHRcIl07XG52YXIgRXhjZXB0aW9uID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9leGNlcHRpb25cIilbXCJkZWZhdWx0XCJdO1xudmFyIFV0aWxzID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy91dGlsc1wiKTtcbnZhciBydW50aW1lID0gcmVxdWlyZShcIi4vaGFuZGxlYmFycy9ydW50aW1lXCIpO1xuXG4vLyBGb3IgY29tcGF0aWJpbGl0eSBhbmQgdXNhZ2Ugb3V0c2lkZSBvZiBtb2R1bGUgc3lzdGVtcywgbWFrZSB0aGUgSGFuZGxlYmFycyBvYmplY3QgYSBuYW1lc3BhY2VcbnZhciBjcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhiID0gbmV3IGJhc2UuSGFuZGxlYmFyc0Vudmlyb25tZW50KCk7XG5cbiAgVXRpbHMuZXh0ZW5kKGhiLCBiYXNlKTtcbiAgaGIuU2FmZVN0cmluZyA9IFNhZmVTdHJpbmc7XG4gIGhiLkV4Y2VwdGlvbiA9IEV4Y2VwdGlvbjtcbiAgaGIuVXRpbHMgPSBVdGlscztcblxuICBoYi5WTSA9IHJ1bnRpbWU7XG4gIGhiLnRlbXBsYXRlID0gZnVuY3Rpb24oc3BlYykge1xuICAgIHJldHVybiBydW50aW1lLnRlbXBsYXRlKHNwZWMsIGhiKTtcbiAgfTtcblxuICByZXR1cm4gaGI7XG59O1xuXG52YXIgSGFuZGxlYmFycyA9IGNyZWF0ZSgpO1xuSGFuZGxlYmFycy5jcmVhdGUgPSBjcmVhdGU7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gSGFuZGxlYmFyczsiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBVdGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzXCIpO1xudmFyIEV4Y2VwdGlvbiA9IHJlcXVpcmUoXCIuL2V4Y2VwdGlvblwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBWRVJTSU9OID0gXCIxLjMuMFwiO1xuZXhwb3J0cy5WRVJTSU9OID0gVkVSU0lPTjt2YXIgQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuZXhwb3J0cy5DT01QSUxFUl9SRVZJU0lPTiA9IENPTVBJTEVSX1JFVklTSU9OO1xudmFyIFJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuZXhwb3J0cy5SRVZJU0lPTl9DSEFOR0VTID0gUkVWSVNJT05fQ0hBTkdFUztcbnZhciBpc0FycmF5ID0gVXRpbHMuaXNBcnJheSxcbiAgICBpc0Z1bmN0aW9uID0gVXRpbHMuaXNGdW5jdGlvbixcbiAgICB0b1N0cmluZyA9IFV0aWxzLnRvU3RyaW5nLFxuICAgIG9iamVjdFR5cGUgPSAnW29iamVjdCBPYmplY3RdJztcblxuZnVuY3Rpb24gSGFuZGxlYmFyc0Vudmlyb25tZW50KGhlbHBlcnMsIHBhcnRpYWxzKSB7XG4gIHRoaXMuaGVscGVycyA9IGhlbHBlcnMgfHwge307XG4gIHRoaXMucGFydGlhbHMgPSBwYXJ0aWFscyB8fCB7fTtcblxuICByZWdpc3RlckRlZmF1bHRIZWxwZXJzKHRoaXMpO1xufVxuXG5leHBvcnRzLkhhbmRsZWJhcnNFbnZpcm9ubWVudCA9IEhhbmRsZWJhcnNFbnZpcm9ubWVudDtIYW5kbGViYXJzRW52aXJvbm1lbnQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogSGFuZGxlYmFyc0Vudmlyb25tZW50LFxuXG4gIGxvZ2dlcjogbG9nZ2VyLFxuICBsb2c6IGxvZyxcblxuICByZWdpc3RlckhlbHBlcjogZnVuY3Rpb24obmFtZSwgZm4sIGludmVyc2UpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgaWYgKGludmVyc2UgfHwgZm4pIHsgdGhyb3cgbmV3IEV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICAgIFV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaW52ZXJzZSkgeyBmbi5ub3QgPSBpbnZlcnNlOyB9XG4gICAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgICB9XG4gIH0sXG5cbiAgcmVnaXN0ZXJQYXJ0aWFsOiBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgICAgVXRpbHMuZXh0ZW5kKHRoaXMucGFydGlhbHMsICBuYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgICB9XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyRGVmYXVsdEhlbHBlcnMoaW5zdGFuY2UpIHtcbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihhcmcpIHtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiTWlzc2luZyBoZWxwZXI6ICdcIiArIGFyZyArIFwiJ1wiKTtcbiAgICB9XG4gIH0pO1xuXG4gIGluc3RhbmNlLnJlZ2lzdGVySGVscGVyKCdibG9ja0hlbHBlck1pc3NpbmcnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGludmVyc2UgPSBvcHRpb25zLmludmVyc2UgfHwgZnVuY3Rpb24oKSB7fSwgZm4gPSBvcHRpb25zLmZuO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oY29udGV4dCkpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gICAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGZuKHRoaXMpO1xuICAgIH0gZWxzZSBpZihjb250ZXh0ID09PSBmYWxzZSB8fCBjb250ZXh0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjb250ZXh0KSkge1xuICAgICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZS5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW52ZXJzZSh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuKGNvbnRleHQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ2VhY2gnLCBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGZuID0gb3B0aW9ucy5mbiwgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZTtcbiAgICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAob3B0aW9ucy5kYXRhKSB7XG4gICAgICBkYXRhID0gY3JlYXRlRnJhbWUob3B0aW9ucy5kYXRhKTtcbiAgICB9XG5cbiAgICBpZihjb250ZXh0ICYmIHR5cGVvZiBjb250ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEuaW5kZXggPSBpO1xuICAgICAgICAgICAgZGF0YS5maXJzdCA9IChpID09PSAwKTtcbiAgICAgICAgICAgIGRhdGEubGFzdCAgPSAoaSA9PT0gKGNvbnRleHQubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtpXSwgeyBkYXRhOiBkYXRhIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IodmFyIGtleSBpbiBjb250ZXh0KSB7XG4gICAgICAgICAgaWYoY29udGV4dC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBpZihkYXRhKSB7IFxuICAgICAgICAgICAgICBkYXRhLmtleSA9IGtleTsgXG4gICAgICAgICAgICAgIGRhdGEuaW5kZXggPSBpO1xuICAgICAgICAgICAgICBkYXRhLmZpcnN0ID0gKGkgPT09IDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKGkgPT09IDApe1xuICAgICAgcmV0ID0gaW52ZXJzZSh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignaWYnLCBmdW5jdGlvbihjb25kaXRpb25hbCwgb3B0aW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbmRpdGlvbmFsKSkgeyBjb25kaXRpb25hbCA9IGNvbmRpdGlvbmFsLmNhbGwodGhpcyk7IH1cblxuICAgIC8vIERlZmF1bHQgYmVoYXZpb3IgaXMgdG8gcmVuZGVyIHRoZSBwb3NpdGl2ZSBwYXRoIGlmIHRoZSB2YWx1ZSBpcyB0cnV0aHkgYW5kIG5vdCBlbXB0eS5cbiAgICAvLyBUaGUgYGluY2x1ZGVaZXJvYCBvcHRpb24gbWF5IGJlIHNldCB0byB0cmVhdCB0aGUgY29uZHRpb25hbCBhcyBwdXJlbHkgbm90IGVtcHR5IGJhc2VkIG9uIHRoZVxuICAgIC8vIGJlaGF2aW9yIG9mIGlzRW1wdHkuIEVmZmVjdGl2ZWx5IHRoaXMgZGV0ZXJtaW5lcyBpZiAwIGlzIGhhbmRsZWQgYnkgdGhlIHBvc2l0aXZlIHBhdGggb3IgbmVnYXRpdmUuXG4gICAgaWYgKCghb3B0aW9ucy5oYXNoLmluY2x1ZGVaZXJvICYmICFjb25kaXRpb25hbCkgfHwgVXRpbHMuaXNFbXB0eShjb25kaXRpb25hbCkpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmludmVyc2UodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmZuKHRoaXMpO1xuICAgIH1cbiAgfSk7XG5cbiAgaW5zdGFuY2UucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm4sIGhhc2g6IG9wdGlvbnMuaGFzaH0pO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignd2l0aCcsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb250ZXh0KSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgICBpZiAoIVV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xuICB9KTtcblxuICBpbnN0YW5jZS5yZWdpc3RlckhlbHBlcignbG9nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEubGV2ZWwgIT0gbnVsbCA/IHBhcnNlSW50KG9wdGlvbnMuZGF0YS5sZXZlbCwgMTApIDogMTtcbiAgICBpbnN0YW5jZS5sb2cobGV2ZWwsIGNvbnRleHQpO1xuICB9KTtcbn1cblxudmFyIGxvZ2dlciA9IHtcbiAgbWV0aG9kTWFwOiB7IDA6ICdkZWJ1ZycsIDE6ICdpbmZvJywgMjogJ3dhcm4nLCAzOiAnZXJyb3InIH0sXG5cbiAgLy8gU3RhdGUgZW51bVxuICBERUJVRzogMCxcbiAgSU5GTzogMSxcbiAgV0FSTjogMixcbiAgRVJST1I6IDMsXG4gIGxldmVsOiAzLFxuXG4gIC8vIGNhbiBiZSBvdmVycmlkZGVuIGluIHRoZSBob3N0IGVudmlyb25tZW50XG4gIGxvZzogZnVuY3Rpb24obGV2ZWwsIG9iaikge1xuICAgIGlmIChsb2dnZXIubGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgIHZhciBtZXRob2QgPSBsb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuZXhwb3J0cy5sb2dnZXIgPSBsb2dnZXI7XG5mdW5jdGlvbiBsb2cobGV2ZWwsIG9iaikgeyBsb2dnZXIubG9nKGxldmVsLCBvYmopOyB9XG5cbmV4cG9ydHMubG9nID0gbG9nO3ZhciBjcmVhdGVGcmFtZSA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICB2YXIgb2JqID0ge307XG4gIFV0aWxzLmV4dGVuZChvYmosIG9iamVjdCk7XG4gIHJldHVybiBvYmo7XG59O1xuZXhwb3J0cy5jcmVhdGVGcmFtZSA9IGNyZWF0ZUZyYW1lOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZXJyb3JQcm9wcyA9IFsnZGVzY3JpcHRpb24nLCAnZmlsZU5hbWUnLCAnbGluZU51bWJlcicsICdtZXNzYWdlJywgJ25hbWUnLCAnbnVtYmVyJywgJ3N0YWNrJ107XG5cbmZ1bmN0aW9uIEV4Y2VwdGlvbihtZXNzYWdlLCBub2RlKSB7XG4gIHZhciBsaW5lO1xuICBpZiAobm9kZSAmJiBub2RlLmZpcnN0TGluZSkge1xuICAgIGxpbmUgPSBub2RlLmZpcnN0TGluZTtcblxuICAgIG1lc3NhZ2UgKz0gJyAtICcgKyBsaW5lICsgJzonICsgbm9kZS5maXJzdENvbHVtbjtcbiAgfVxuXG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cblxuICBpZiAobGluZSkge1xuICAgIHRoaXMubGluZU51bWJlciA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gPSBub2RlLmZpcnN0Q29sdW1uO1xuICB9XG59XG5cbkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBFeGNlcHRpb247IiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgVXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbnZhciBFeGNlcHRpb24gPSByZXF1aXJlKFwiLi9leGNlcHRpb25cIilbXCJkZWZhdWx0XCJdO1xudmFyIENPTVBJTEVSX1JFVklTSU9OID0gcmVxdWlyZShcIi4vYmFzZVwiKS5DT01QSUxFUl9SRVZJU0lPTjtcbnZhciBSRVZJU0lPTl9DSEFOR0VTID0gcmVxdWlyZShcIi4vYmFzZVwiKS5SRVZJU0lPTl9DSEFOR0VTO1xuXG5mdW5jdGlvbiBjaGVja1JldmlzaW9uKGNvbXBpbGVySW5mbykge1xuICB2YXIgY29tcGlsZXJSZXZpc2lvbiA9IGNvbXBpbGVySW5mbyAmJiBjb21waWxlckluZm9bMF0gfHwgMSxcbiAgICAgIGN1cnJlbnRSZXZpc2lvbiA9IENPTVBJTEVSX1JFVklTSU9OO1xuXG4gIGlmIChjb21waWxlclJldmlzaW9uICE9PSBjdXJyZW50UmV2aXNpb24pIHtcbiAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgdmFyIHJ1bnRpbWVWZXJzaW9ucyA9IFJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICBjb21waWxlclZlcnNpb25zID0gUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJUZW1wbGF0ZSB3YXMgcHJlY29tcGlsZWQgd2l0aCBhbiBvbGRlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVXNlIHRoZSBlbWJlZGRlZCB2ZXJzaW9uIGluZm8gc2luY2UgdGhlIHJ1bnRpbWUgZG9lc24ndCBrbm93IGFib3V0IHRoaXMgcmV2aXNpb24geWV0XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHJ1bnRpbWUgdG8gYSBuZXdlciB2ZXJzaW9uIChcIitjb21waWxlckluZm9bMV0rXCIpLlwiKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5jaGVja1JldmlzaW9uID0gY2hlY2tSZXZpc2lvbjsvLyBUT0RPOiBSZW1vdmUgdGhpcyBsaW5lIGFuZCBicmVhayB1cCBjb21waWxlUGFydGlhbFxuXG5mdW5jdGlvbiB0ZW1wbGF0ZSh0ZW1wbGF0ZVNwZWMsIGVudikge1xuICBpZiAoIWVudikge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJObyBlbnZpcm9ubWVudCBwYXNzZWQgdG8gdGVtcGxhdGVcIik7XG4gIH1cblxuICAvLyBOb3RlOiBVc2luZyBlbnYuVk0gcmVmZXJlbmNlcyByYXRoZXIgdGhhbiBsb2NhbCB2YXIgcmVmZXJlbmNlcyB0aHJvdWdob3V0IHRoaXMgc2VjdGlvbiB0byBhbGxvd1xuICAvLyBmb3IgZXh0ZXJuYWwgdXNlcnMgdG8gb3ZlcnJpZGUgdGhlc2UgYXMgcHN1ZWRvLXN1cHBvcnRlZCBBUElzLlxuICB2YXIgaW52b2tlUGFydGlhbFdyYXBwZXIgPSBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciByZXN1bHQgPSBlbnYuVk0uaW52b2tlUGFydGlhbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChyZXN1bHQgIT0gbnVsbCkgeyByZXR1cm4gcmVzdWx0OyB9XG5cbiAgICBpZiAoZW52LmNvbXBpbGUpIHtcbiAgICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcbiAgICAgIHBhcnRpYWxzW25hbWVdID0gZW52LmNvbXBpbGUocGFydGlhbCwgeyBkYXRhOiBkYXRhICE9PSB1bmRlZmluZWQgfSwgZW52KTtcbiAgICAgIHJldHVybiBwYXJ0aWFsc1tuYW1lXShjb250ZXh0LCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlRoZSBwYXJ0aWFsIFwiICsgbmFtZSArIFwiIGNvdWxkIG5vdCBiZSBjb21waWxlZCB3aGVuIHJ1bm5pbmcgaW4gcnVudGltZS1vbmx5IG1vZGVcIik7XG4gICAgfVxuICB9O1xuXG4gIC8vIEp1c3QgYWRkIHdhdGVyXG4gIHZhciBjb250YWluZXIgPSB7XG4gICAgZXNjYXBlRXhwcmVzc2lvbjogVXRpbHMuZXNjYXBlRXhwcmVzc2lvbixcbiAgICBpbnZva2VQYXJ0aWFsOiBpbnZva2VQYXJ0aWFsV3JhcHBlcixcbiAgICBwcm9ncmFtczogW10sXG4gICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgIHZhciBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV07XG4gICAgICBpZihkYXRhKSB7XG4gICAgICAgIHByb2dyYW1XcmFwcGVyID0gcHJvZ3JhbShpLCBmbiwgZGF0YSk7XG4gICAgICB9IGVsc2UgaWYgKCFwcm9ncmFtV3JhcHBlcikge1xuICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBwcm9ncmFtKGksIGZuKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICB9LFxuICAgIG1lcmdlOiBmdW5jdGlvbihwYXJhbSwgY29tbW9uKSB7XG4gICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICBpZiAocGFyYW0gJiYgY29tbW9uICYmIChwYXJhbSAhPT0gY29tbW9uKSkge1xuICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgVXRpbHMuZXh0ZW5kKHJldCwgY29tbW9uKTtcbiAgICAgICAgVXRpbHMuZXh0ZW5kKHJldCwgcGFyYW0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIHByb2dyYW1XaXRoRGVwdGg6IGVudi5WTS5wcm9ncmFtV2l0aERlcHRoLFxuICAgIG5vb3A6IGVudi5WTS5ub29wLFxuICAgIGNvbXBpbGVySW5mbzogbnVsbFxuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbihjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG5hbWVzcGFjZSA9IG9wdGlvbnMucGFydGlhbCA/IG9wdGlvbnMgOiBlbnYsXG4gICAgICAgIGhlbHBlcnMsXG4gICAgICAgIHBhcnRpYWxzO1xuXG4gICAgaWYgKCFvcHRpb25zLnBhcnRpYWwpIHtcbiAgICAgIGhlbHBlcnMgPSBvcHRpb25zLmhlbHBlcnM7XG4gICAgICBwYXJ0aWFscyA9IG9wdGlvbnMucGFydGlhbHM7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSB0ZW1wbGF0ZVNwZWMuY2FsbChcbiAgICAgICAgICBjb250YWluZXIsXG4gICAgICAgICAgbmFtZXNwYWNlLCBjb250ZXh0LFxuICAgICAgICAgIGhlbHBlcnMsXG4gICAgICAgICAgcGFydGlhbHMsXG4gICAgICAgICAgb3B0aW9ucy5kYXRhKTtcblxuICAgIGlmICghb3B0aW9ucy5wYXJ0aWFsKSB7XG4gICAgICBlbnYuVk0uY2hlY2tSZXZpc2lvbihjb250YWluZXIuY29tcGlsZXJJbmZvKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5leHBvcnRzLnRlbXBsYXRlID0gdGVtcGxhdGU7ZnVuY3Rpb24gcHJvZ3JhbVdpdGhEZXB0aChpLCBmbiwgZGF0YSAvKiwgJGRlcHRoICovKSB7XG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICB2YXIgcHJvZyA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gIH07XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgcmV0dXJuIHByb2c7XG59XG5cbmV4cG9ydHMucHJvZ3JhbVdpdGhEZXB0aCA9IHByb2dyYW1XaXRoRGVwdGg7ZnVuY3Rpb24gcHJvZ3JhbShpLCBmbiwgZGF0YSkge1xuICB2YXIgcHJvZyA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHJldHVybiBmbihjb250ZXh0LCBvcHRpb25zLmRhdGEgfHwgZGF0YSk7XG4gIH07XG4gIHByb2cucHJvZ3JhbSA9IGk7XG4gIHByb2cuZGVwdGggPSAwO1xuICByZXR1cm4gcHJvZztcbn1cblxuZXhwb3J0cy5wcm9ncmFtID0gcHJvZ3JhbTtmdW5jdGlvbiBpbnZva2VQYXJ0aWFsKHBhcnRpYWwsIG5hbWUsIGNvbnRleHQsIGhlbHBlcnMsIHBhcnRpYWxzLCBkYXRhKSB7XG4gIHZhciBvcHRpb25zID0geyBwYXJ0aWFsOiB0cnVlLCBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICBpZihwYXJ0aWFsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICB9IGVsc2UgaWYocGFydGlhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHBhcnRpYWwoY29udGV4dCwgb3B0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0cy5pbnZva2VQYXJ0aWFsID0gaW52b2tlUGFydGlhbDtmdW5jdGlvbiBub29wKCkgeyByZXR1cm4gXCJcIjsgfVxuXG5leHBvcnRzLm5vb3AgPSBub29wOyIsIlwidXNlIHN0cmljdFwiO1xuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbmZ1bmN0aW9uIFNhZmVTdHJpbmcoc3RyaW5nKSB7XG4gIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xufVxuXG5TYWZlU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJcIiArIHRoaXMuc3RyaW5nO1xufTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBTYWZlU3RyaW5nOyIsIlwidXNlIHN0cmljdFwiO1xuLypqc2hpbnQgLVcwMDQgKi9cbnZhciBTYWZlU3RyaW5nID0gcmVxdWlyZShcIi4vc2FmZS1zdHJpbmdcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgZXNjYXBlID0ge1xuICBcIiZcIjogXCImYW1wO1wiLFxuICBcIjxcIjogXCImbHQ7XCIsXG4gIFwiPlwiOiBcIiZndDtcIixcbiAgJ1wiJzogXCImcXVvdDtcIixcbiAgXCInXCI6IFwiJiN4Mjc7XCIsXG4gIFwiYFwiOiBcIiYjeDYwO1wiXG59O1xuXG52YXIgYmFkQ2hhcnMgPSAvWyY8PlwiJ2BdL2c7XG52YXIgcG9zc2libGUgPSAvWyY8PlwiJ2BdLztcblxuZnVuY3Rpb24gZXNjYXBlQ2hhcihjaHIpIHtcbiAgcmV0dXJuIGVzY2FwZVtjaHJdIHx8IFwiJmFtcDtcIjtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKG9iaiwgdmFsdWUpIHtcbiAgZm9yKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpIHtcbiAgICAgIG9ialtrZXldID0gdmFsdWVba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7dmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbmV4cG9ydHMudG9TdHJpbmcgPSB0b1N0cmluZztcbi8vIFNvdXJjZWQgZnJvbSBsb2Rhc2hcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZXN0aWVqcy9sb2Rhc2gvYmxvYi9tYXN0ZXIvTElDRU5TRS50eHRcbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn07XG4vLyBmYWxsYmFjayBmb3Igb2xkZXIgdmVyc2lvbnMgb2YgQ2hyb21lIGFuZCBTYWZhcmlcbmlmIChpc0Z1bmN0aW9uKC94LykpIHtcbiAgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgfTtcbn1cbnZhciBpc0Z1bmN0aW9uO1xuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpID8gdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScgOiBmYWxzZTtcbn07XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBlc2NhcGVFeHByZXNzaW9uKHN0cmluZykge1xuICAvLyBkb24ndCBlc2NhcGUgU2FmZVN0cmluZ3MsIHNpbmNlIHRoZXkncmUgYWxyZWFkeSBzYWZlXG4gIGlmIChzdHJpbmcgaW5zdGFuY2VvZiBTYWZlU3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy50b1N0cmluZygpO1xuICB9IGVsc2UgaWYgKCFzdHJpbmcgJiYgc3RyaW5nICE9PSAwKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cblxuICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgLy8gdGhlIHJlZ2V4IHRlc3Qgd2lsbCBkbyB0aGlzIHRyYW5zcGFyZW50bHkgYmVoaW5kIHRoZSBzY2VuZXMsIGNhdXNpbmcgaXNzdWVzIGlmXG4gIC8vIGFuIG9iamVjdCdzIHRvIHN0cmluZyBoYXMgZXNjYXBlZCBjaGFyYWN0ZXJzIGluIGl0LlxuICBzdHJpbmcgPSBcIlwiICsgc3RyaW5nO1xuXG4gIGlmKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoYmFkQ2hhcnMsIGVzY2FwZUNoYXIpO1xufVxuXG5leHBvcnRzLmVzY2FwZUV4cHJlc3Npb24gPSBlc2NhcGVFeHByZXNzaW9uO2Z1bmN0aW9uIGlzRW1wdHkodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnRzLmlzRW1wdHkgPSBpc0VtcHR5OyIsIi8vIENyZWF0ZSBhIHNpbXBsZSBwYXRoIGFsaWFzIHRvIGFsbG93IGJyb3dzZXJpZnkgdG8gcmVzb2x2ZVxuLy8gdGhlIHJ1bnRpbWUgb24gYSBzdXBwb3J0ZWQgcGF0aC5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kaXN0L2Nqcy9oYW5kbGViYXJzLnJ1bnRpbWUnKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImhhbmRsZWJhcnMvcnVudGltZVwiKVtcImRlZmF1bHRcIl07XG4iLCIvKiEgalF1ZXJ5IHYyLjEuMSB8IChjKSAyMDA1LCAyMDE0IGpRdWVyeSBGb3VuZGF0aW9uLCBJbmMuIHwganF1ZXJ5Lm9yZy9saWNlbnNlICovXG4hZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YS5kb2N1bWVudD9iKGEsITApOmZ1bmN0aW9uKGEpe2lmKCFhLmRvY3VtZW50KXRocm93IG5ldyBFcnJvcihcImpRdWVyeSByZXF1aXJlcyBhIHdpbmRvdyB3aXRoIGEgZG9jdW1lbnRcIik7cmV0dXJuIGIoYSl9OmIoYSl9KFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnRoaXMsZnVuY3Rpb24oYSxiKXt2YXIgYz1bXSxkPWMuc2xpY2UsZT1jLmNvbmNhdCxmPWMucHVzaCxnPWMuaW5kZXhPZixoPXt9LGk9aC50b1N0cmluZyxqPWguaGFzT3duUHJvcGVydHksaz17fSxsPWEuZG9jdW1lbnQsbT1cIjIuMS4xXCIsbj1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgbi5mbi5pbml0KGEsYil9LG89L15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nLHA9L14tbXMtLyxxPS8tKFtcXGRhLXpdKS9naSxyPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGIudG9VcHBlckNhc2UoKX07bi5mbj1uLnByb3RvdHlwZT17anF1ZXJ5Om0sY29uc3RydWN0b3I6bixzZWxlY3RvcjpcIlwiLGxlbmd0aDowLHRvQXJyYXk6ZnVuY3Rpb24oKXtyZXR1cm4gZC5jYWxsKHRoaXMpfSxnZXQ6ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWE/MD5hP3RoaXNbYSt0aGlzLmxlbmd0aF06dGhpc1thXTpkLmNhbGwodGhpcyl9LHB1c2hTdGFjazpmdW5jdGlvbihhKXt2YXIgYj1uLm1lcmdlKHRoaXMuY29uc3RydWN0b3IoKSxhKTtyZXR1cm4gYi5wcmV2T2JqZWN0PXRoaXMsYi5jb250ZXh0PXRoaXMuY29udGV4dCxifSxlYWNoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIG4uZWFjaCh0aGlzLGEsYil9LG1hcDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5wdXNoU3RhY2sobi5tYXAodGhpcyxmdW5jdGlvbihiLGMpe3JldHVybiBhLmNhbGwoYixjLGIpfSkpfSxzbGljZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLnB1c2hTdGFjayhkLmFwcGx5KHRoaXMsYXJndW1lbnRzKSl9LGZpcnN0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZXEoMCl9LGxhc3Q6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lcSgtMSl9LGVxOmZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMubGVuZ3RoLGM9K2ErKDA+YT9iOjApO3JldHVybiB0aGlzLnB1c2hTdGFjayhjPj0wJiZiPmM/W3RoaXNbY11dOltdKX0sZW5kOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucHJldk9iamVjdHx8dGhpcy5jb25zdHJ1Y3RvcihudWxsKX0scHVzaDpmLHNvcnQ6Yy5zb3J0LHNwbGljZTpjLnNwbGljZX0sbi5leHRlbmQ9bi5mbi5leHRlbmQ9ZnVuY3Rpb24oKXt2YXIgYSxiLGMsZCxlLGYsZz1hcmd1bWVudHNbMF18fHt9LGg9MSxpPWFyZ3VtZW50cy5sZW5ndGgsaj0hMTtmb3IoXCJib29sZWFuXCI9PXR5cGVvZiBnJiYoaj1nLGc9YXJndW1lbnRzW2hdfHx7fSxoKyspLFwib2JqZWN0XCI9PXR5cGVvZiBnfHxuLmlzRnVuY3Rpb24oZyl8fChnPXt9KSxoPT09aSYmKGc9dGhpcyxoLS0pO2k+aDtoKyspaWYobnVsbCE9KGE9YXJndW1lbnRzW2hdKSlmb3IoYiBpbiBhKWM9Z1tiXSxkPWFbYl0sZyE9PWQmJihqJiZkJiYobi5pc1BsYWluT2JqZWN0KGQpfHwoZT1uLmlzQXJyYXkoZCkpKT8oZT8oZT0hMSxmPWMmJm4uaXNBcnJheShjKT9jOltdKTpmPWMmJm4uaXNQbGFpbk9iamVjdChjKT9jOnt9LGdbYl09bi5leHRlbmQoaixmLGQpKTp2b2lkIDAhPT1kJiYoZ1tiXT1kKSk7cmV0dXJuIGd9LG4uZXh0ZW5kKHtleHBhbmRvOlwialF1ZXJ5XCIrKG0rTWF0aC5yYW5kb20oKSkucmVwbGFjZSgvXFxEL2csXCJcIiksaXNSZWFkeTohMCxlcnJvcjpmdW5jdGlvbihhKXt0aHJvdyBuZXcgRXJyb3IoYSl9LG5vb3A6ZnVuY3Rpb24oKXt9LGlzRnVuY3Rpb246ZnVuY3Rpb24oYSl7cmV0dXJuXCJmdW5jdGlvblwiPT09bi50eXBlKGEpfSxpc0FycmF5OkFycmF5LmlzQXJyYXksaXNXaW5kb3c6ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWEmJmE9PT1hLndpbmRvd30saXNOdW1lcmljOmZ1bmN0aW9uKGEpe3JldHVybiFuLmlzQXJyYXkoYSkmJmEtcGFyc2VGbG9hdChhKT49MH0saXNQbGFpbk9iamVjdDpmdW5jdGlvbihhKXtyZXR1cm5cIm9iamVjdFwiIT09bi50eXBlKGEpfHxhLm5vZGVUeXBlfHxuLmlzV2luZG93KGEpPyExOmEuY29uc3RydWN0b3ImJiFqLmNhbGwoYS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsXCJpc1Byb3RvdHlwZU9mXCIpPyExOiEwfSxpc0VtcHR5T2JqZWN0OmZ1bmN0aW9uKGEpe3ZhciBiO2ZvcihiIGluIGEpcmV0dXJuITE7cmV0dXJuITB9LHR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGw9PWE/YStcIlwiOlwib2JqZWN0XCI9PXR5cGVvZiBhfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiBhP2hbaS5jYWxsKGEpXXx8XCJvYmplY3RcIjp0eXBlb2YgYX0sZ2xvYmFsRXZhbDpmdW5jdGlvbihhKXt2YXIgYixjPWV2YWw7YT1uLnRyaW0oYSksYSYmKDE9PT1hLmluZGV4T2YoXCJ1c2Ugc3RyaWN0XCIpPyhiPWwuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKSxiLnRleHQ9YSxsLmhlYWQuYXBwZW5kQ2hpbGQoYikucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChiKSk6YyhhKSl9LGNhbWVsQ2FzZTpmdW5jdGlvbihhKXtyZXR1cm4gYS5yZXBsYWNlKHAsXCJtcy1cIikucmVwbGFjZShxLHIpfSxub2RlTmFtZTpmdW5jdGlvbihhLGIpe3JldHVybiBhLm5vZGVOYW1lJiZhLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk9PT1iLnRvTG93ZXJDYXNlKCl9LGVhY2g6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGU9MCxmPWEubGVuZ3RoLGc9cyhhKTtpZihjKXtpZihnKXtmb3IoO2Y+ZTtlKyspaWYoZD1iLmFwcGx5KGFbZV0sYyksZD09PSExKWJyZWFrfWVsc2UgZm9yKGUgaW4gYSlpZihkPWIuYXBwbHkoYVtlXSxjKSxkPT09ITEpYnJlYWt9ZWxzZSBpZihnKXtmb3IoO2Y+ZTtlKyspaWYoZD1iLmNhbGwoYVtlXSxlLGFbZV0pLGQ9PT0hMSlicmVha31lbHNlIGZvcihlIGluIGEpaWYoZD1iLmNhbGwoYVtlXSxlLGFbZV0pLGQ9PT0hMSlicmVhaztyZXR1cm4gYX0sdHJpbTpmdW5jdGlvbihhKXtyZXR1cm4gbnVsbD09YT9cIlwiOihhK1wiXCIpLnJlcGxhY2UobyxcIlwiKX0sbWFrZUFycmF5OmZ1bmN0aW9uKGEsYil7dmFyIGM9Ynx8W107cmV0dXJuIG51bGwhPWEmJihzKE9iamVjdChhKSk/bi5tZXJnZShjLFwic3RyaW5nXCI9PXR5cGVvZiBhP1thXTphKTpmLmNhbGwoYyxhKSksY30saW5BcnJheTpmdW5jdGlvbihhLGIsYyl7cmV0dXJuIG51bGw9PWI/LTE6Zy5jYWxsKGIsYSxjKX0sbWVyZ2U6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9K2IubGVuZ3RoLGQ9MCxlPWEubGVuZ3RoO2M+ZDtkKyspYVtlKytdPWJbZF07cmV0dXJuIGEubGVuZ3RoPWUsYX0sZ3JlcDpmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkLGU9W10sZj0wLGc9YS5sZW5ndGgsaD0hYztnPmY7ZisrKWQ9IWIoYVtmXSxmKSxkIT09aCYmZS5wdXNoKGFbZl0pO3JldHVybiBlfSxtYXA6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGY9MCxnPWEubGVuZ3RoLGg9cyhhKSxpPVtdO2lmKGgpZm9yKDtnPmY7ZisrKWQ9YihhW2ZdLGYsYyksbnVsbCE9ZCYmaS5wdXNoKGQpO2Vsc2UgZm9yKGYgaW4gYSlkPWIoYVtmXSxmLGMpLG51bGwhPWQmJmkucHVzaChkKTtyZXR1cm4gZS5hcHBseShbXSxpKX0sZ3VpZDoxLHByb3h5OmZ1bmN0aW9uKGEsYil7dmFyIGMsZSxmO3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBiJiYoYz1hW2JdLGI9YSxhPWMpLG4uaXNGdW5jdGlvbihhKT8oZT1kLmNhbGwoYXJndW1lbnRzLDIpLGY9ZnVuY3Rpb24oKXtyZXR1cm4gYS5hcHBseShifHx0aGlzLGUuY29uY2F0KGQuY2FsbChhcmd1bWVudHMpKSl9LGYuZ3VpZD1hLmd1aWQ9YS5ndWlkfHxuLmd1aWQrKyxmKTp2b2lkIDB9LG5vdzpEYXRlLm5vdyxzdXBwb3J0Omt9KSxuLmVhY2goXCJCb29sZWFuIE51bWJlciBTdHJpbmcgRnVuY3Rpb24gQXJyYXkgRGF0ZSBSZWdFeHAgT2JqZWN0IEVycm9yXCIuc3BsaXQoXCIgXCIpLGZ1bmN0aW9uKGEsYil7aFtcIltvYmplY3QgXCIrYitcIl1cIl09Yi50b0xvd2VyQ2FzZSgpfSk7ZnVuY3Rpb24gcyhhKXt2YXIgYj1hLmxlbmd0aCxjPW4udHlwZShhKTtyZXR1cm5cImZ1bmN0aW9uXCI9PT1jfHxuLmlzV2luZG93KGEpPyExOjE9PT1hLm5vZGVUeXBlJiZiPyEwOlwiYXJyYXlcIj09PWN8fDA9PT1ifHxcIm51bWJlclwiPT10eXBlb2YgYiYmYj4wJiZiLTEgaW4gYX12YXIgdD1mdW5jdGlvbihhKXt2YXIgYixjLGQsZSxmLGcsaCxpLGosayxsLG0sbixvLHAscSxyLHMsdCx1PVwic2l6emxlXCIrLW5ldyBEYXRlLHY9YS5kb2N1bWVudCx3PTAseD0wLHk9Z2IoKSx6PWdiKCksQT1nYigpLEI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PWImJihsPSEwKSwwfSxDPVwidW5kZWZpbmVkXCIsRD0xPDwzMSxFPXt9Lmhhc093blByb3BlcnR5LEY9W10sRz1GLnBvcCxIPUYucHVzaCxJPUYucHVzaCxKPUYuc2xpY2UsSz1GLmluZGV4T2Z8fGZ1bmN0aW9uKGEpe2Zvcih2YXIgYj0wLGM9dGhpcy5sZW5ndGg7Yz5iO2IrKylpZih0aGlzW2JdPT09YSlyZXR1cm4gYjtyZXR1cm4tMX0sTD1cImNoZWNrZWR8c2VsZWN0ZWR8YXN5bmN8YXV0b2ZvY3VzfGF1dG9wbGF5fGNvbnRyb2xzfGRlZmVyfGRpc2FibGVkfGhpZGRlbnxpc21hcHxsb29wfG11bHRpcGxlfG9wZW58cmVhZG9ubHl8cmVxdWlyZWR8c2NvcGVkXCIsTT1cIltcXFxceDIwXFxcXHRcXFxcclxcXFxuXFxcXGZdXCIsTj1cIig/OlxcXFxcXFxcLnxbXFxcXHctXXxbXlxcXFx4MDAtXFxcXHhhMF0pK1wiLE89Ti5yZXBsYWNlKFwid1wiLFwidyNcIiksUD1cIlxcXFxbXCIrTStcIiooXCIrTitcIikoPzpcIitNK1wiKihbKl4kfCF+XT89KVwiK00rXCIqKD86JygoPzpcXFxcXFxcXC58W15cXFxcXFxcXCddKSopJ3xcXFwiKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcXFxcIl0pKilcXFwifChcIitPK1wiKSl8KVwiK00rXCIqXFxcXF1cIixRPVwiOihcIitOK1wiKSg/OlxcXFwoKCgnKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcJ10pKiknfFxcXCIoKD86XFxcXFxcXFwufFteXFxcXFxcXFxcXFwiXSkqKVxcXCIpfCgoPzpcXFxcXFxcXC58W15cXFxcXFxcXCgpW1xcXFxdXXxcIitQK1wiKSopfC4qKVxcXFwpfClcIixSPW5ldyBSZWdFeHAoXCJeXCIrTStcIit8KCg/Ol58W15cXFxcXFxcXF0pKD86XFxcXFxcXFwuKSopXCIrTStcIiskXCIsXCJnXCIpLFM9bmV3IFJlZ0V4cChcIl5cIitNK1wiKixcIitNK1wiKlwiKSxUPW5ldyBSZWdFeHAoXCJeXCIrTStcIiooWz4rfl18XCIrTStcIilcIitNK1wiKlwiKSxVPW5ldyBSZWdFeHAoXCI9XCIrTStcIiooW15cXFxcXSdcXFwiXSo/KVwiK00rXCIqXFxcXF1cIixcImdcIiksVj1uZXcgUmVnRXhwKFEpLFc9bmV3IFJlZ0V4cChcIl5cIitPK1wiJFwiKSxYPXtJRDpuZXcgUmVnRXhwKFwiXiMoXCIrTitcIilcIiksQ0xBU1M6bmV3IFJlZ0V4cChcIl5cXFxcLihcIitOK1wiKVwiKSxUQUc6bmV3IFJlZ0V4cChcIl4oXCIrTi5yZXBsYWNlKFwid1wiLFwidypcIikrXCIpXCIpLEFUVFI6bmV3IFJlZ0V4cChcIl5cIitQKSxQU0VVRE86bmV3IFJlZ0V4cChcIl5cIitRKSxDSElMRDpuZXcgUmVnRXhwKFwiXjoob25seXxmaXJzdHxsYXN0fG50aHxudGgtbGFzdCktKGNoaWxkfG9mLXR5cGUpKD86XFxcXChcIitNK1wiKihldmVufG9kZHwoKFsrLV18KShcXFxcZCopbnwpXCIrTStcIiooPzooWystXXwpXCIrTStcIiooXFxcXGQrKXwpKVwiK00rXCIqXFxcXCl8KVwiLFwiaVwiKSxib29sOm5ldyBSZWdFeHAoXCJeKD86XCIrTCtcIikkXCIsXCJpXCIpLG5lZWRzQ29udGV4dDpuZXcgUmVnRXhwKFwiXlwiK00rXCIqWz4rfl18OihldmVufG9kZHxlcXxndHxsdHxudGh8Zmlyc3R8bGFzdCkoPzpcXFxcKFwiK00rXCIqKCg/Oi1cXFxcZCk/XFxcXGQqKVwiK00rXCIqXFxcXCl8KSg/PVteLV18JClcIixcImlcIil9LFk9L14oPzppbnB1dHxzZWxlY3R8dGV4dGFyZWF8YnV0dG9uKSQvaSxaPS9eaFxcZCQvaSwkPS9eW157XStcXHtcXHMqXFxbbmF0aXZlIFxcdy8sXz0vXig/OiMoW1xcdy1dKyl8KFxcdyspfFxcLihbXFx3LV0rKSkkLyxhYj0vWyt+XS8sYmI9Lyd8XFxcXC9nLGNiPW5ldyBSZWdFeHAoXCJcXFxcXFxcXChbXFxcXGRhLWZdezEsNn1cIitNK1wiP3woXCIrTStcIil8LilcIixcImlnXCIpLGRiPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1cIjB4XCIrYi02NTUzNjtyZXR1cm4gZCE9PWR8fGM/YjowPmQ/U3RyaW5nLmZyb21DaGFyQ29kZShkKzY1NTM2KTpTdHJpbmcuZnJvbUNoYXJDb2RlKGQ+PjEwfDU1Mjk2LDEwMjMmZHw1NjMyMCl9O3RyeXtJLmFwcGx5KEY9Si5jYWxsKHYuY2hpbGROb2Rlcyksdi5jaGlsZE5vZGVzKSxGW3YuY2hpbGROb2Rlcy5sZW5ndGhdLm5vZGVUeXBlfWNhdGNoKGViKXtJPXthcHBseTpGLmxlbmd0aD9mdW5jdGlvbihhLGIpe0guYXBwbHkoYSxKLmNhbGwoYikpfTpmdW5jdGlvbihhLGIpe3ZhciBjPWEubGVuZ3RoLGQ9MDt3aGlsZShhW2MrK109YltkKytdKTthLmxlbmd0aD1jLTF9fX1mdW5jdGlvbiBmYihhLGIsZCxlKXt2YXIgZixoLGosayxsLG8scixzLHcseDtpZigoYj9iLm93bmVyRG9jdW1lbnR8fGI6dikhPT1uJiZtKGIpLGI9Ynx8bixkPWR8fFtdLCFhfHxcInN0cmluZ1wiIT10eXBlb2YgYSlyZXR1cm4gZDtpZigxIT09KGs9Yi5ub2RlVHlwZSkmJjkhPT1rKXJldHVybltdO2lmKHAmJiFlKXtpZihmPV8uZXhlYyhhKSlpZihqPWZbMV0pe2lmKDk9PT1rKXtpZihoPWIuZ2V0RWxlbWVudEJ5SWQoaiksIWh8fCFoLnBhcmVudE5vZGUpcmV0dXJuIGQ7aWYoaC5pZD09PWopcmV0dXJuIGQucHVzaChoKSxkfWVsc2UgaWYoYi5vd25lckRvY3VtZW50JiYoaD1iLm93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaikpJiZ0KGIsaCkmJmguaWQ9PT1qKXJldHVybiBkLnB1c2goaCksZH1lbHNle2lmKGZbMl0pcmV0dXJuIEkuYXBwbHkoZCxiLmdldEVsZW1lbnRzQnlUYWdOYW1lKGEpKSxkO2lmKChqPWZbM10pJiZjLmdldEVsZW1lbnRzQnlDbGFzc05hbWUmJmIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSlyZXR1cm4gSS5hcHBseShkLGIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShqKSksZH1pZihjLnFzYSYmKCFxfHwhcS50ZXN0KGEpKSl7aWYocz1yPXUsdz1iLHg9OT09PWsmJmEsMT09PWsmJlwib2JqZWN0XCIhPT1iLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpe289ZyhhKSwocj1iLmdldEF0dHJpYnV0ZShcImlkXCIpKT9zPXIucmVwbGFjZShiYixcIlxcXFwkJlwiKTpiLnNldEF0dHJpYnV0ZShcImlkXCIscykscz1cIltpZD0nXCIrcytcIiddIFwiLGw9by5sZW5ndGg7d2hpbGUobC0tKW9bbF09cytxYihvW2xdKTt3PWFiLnRlc3QoYSkmJm9iKGIucGFyZW50Tm9kZSl8fGIseD1vLmpvaW4oXCIsXCIpfWlmKHgpdHJ5e3JldHVybiBJLmFwcGx5KGQsdy5xdWVyeVNlbGVjdG9yQWxsKHgpKSxkfWNhdGNoKHkpe31maW5hbGx5e3J8fGIucmVtb3ZlQXR0cmlidXRlKFwiaWRcIil9fX1yZXR1cm4gaShhLnJlcGxhY2UoUixcIiQxXCIpLGIsZCxlKX1mdW5jdGlvbiBnYigpe3ZhciBhPVtdO2Z1bmN0aW9uIGIoYyxlKXtyZXR1cm4gYS5wdXNoKGMrXCIgXCIpPmQuY2FjaGVMZW5ndGgmJmRlbGV0ZSBiW2Euc2hpZnQoKV0sYltjK1wiIFwiXT1lfXJldHVybiBifWZ1bmN0aW9uIGhiKGEpe3JldHVybiBhW3VdPSEwLGF9ZnVuY3Rpb24gaWIoYSl7dmFyIGI9bi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3RyeXtyZXR1cm4hIWEoYil9Y2F0Y2goYyl7cmV0dXJuITF9ZmluYWxseXtiLnBhcmVudE5vZGUmJmIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChiKSxiPW51bGx9fWZ1bmN0aW9uIGpiKGEsYil7dmFyIGM9YS5zcGxpdChcInxcIiksZT1hLmxlbmd0aDt3aGlsZShlLS0pZC5hdHRySGFuZGxlW2NbZV1dPWJ9ZnVuY3Rpb24ga2IoYSxiKXt2YXIgYz1iJiZhLGQ9YyYmMT09PWEubm9kZVR5cGUmJjE9PT1iLm5vZGVUeXBlJiYofmIuc291cmNlSW5kZXh8fEQpLSh+YS5zb3VyY2VJbmRleHx8RCk7aWYoZClyZXR1cm4gZDtpZihjKXdoaWxlKGM9Yy5uZXh0U2libGluZylpZihjPT09YilyZXR1cm4tMTtyZXR1cm4gYT8xOi0xfWZ1bmN0aW9uIGxiKGEpe3JldHVybiBmdW5jdGlvbihiKXt2YXIgYz1iLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7cmV0dXJuXCJpbnB1dFwiPT09YyYmYi50eXBlPT09YX19ZnVuY3Rpb24gbWIoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3ZhciBjPWIubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtyZXR1cm4oXCJpbnB1dFwiPT09Y3x8XCJidXR0b25cIj09PWMpJiZiLnR5cGU9PT1hfX1mdW5jdGlvbiBuYihhKXtyZXR1cm4gaGIoZnVuY3Rpb24oYil7cmV0dXJuIGI9K2IsaGIoZnVuY3Rpb24oYyxkKXt2YXIgZSxmPWEoW10sYy5sZW5ndGgsYiksZz1mLmxlbmd0aDt3aGlsZShnLS0pY1tlPWZbZ11dJiYoY1tlXT0hKGRbZV09Y1tlXSkpfSl9KX1mdW5jdGlvbiBvYihhKXtyZXR1cm4gYSYmdHlwZW9mIGEuZ2V0RWxlbWVudHNCeVRhZ05hbWUhPT1DJiZhfWM9ZmIuc3VwcG9ydD17fSxmPWZiLmlzWE1MPWZ1bmN0aW9uKGEpe3ZhciBiPWEmJihhLm93bmVyRG9jdW1lbnR8fGEpLmRvY3VtZW50RWxlbWVudDtyZXR1cm4gYj9cIkhUTUxcIiE9PWIubm9kZU5hbWU6ITF9LG09ZmIuc2V0RG9jdW1lbnQ9ZnVuY3Rpb24oYSl7dmFyIGIsZT1hP2Eub3duZXJEb2N1bWVudHx8YTp2LGc9ZS5kZWZhdWx0VmlldztyZXR1cm4gZSE9PW4mJjk9PT1lLm5vZGVUeXBlJiZlLmRvY3VtZW50RWxlbWVudD8obj1lLG89ZS5kb2N1bWVudEVsZW1lbnQscD0hZihlKSxnJiZnIT09Zy50b3AmJihnLmFkZEV2ZW50TGlzdGVuZXI/Zy5hZGRFdmVudExpc3RlbmVyKFwidW5sb2FkXCIsZnVuY3Rpb24oKXttKCl9LCExKTpnLmF0dGFjaEV2ZW50JiZnLmF0dGFjaEV2ZW50KFwib251bmxvYWRcIixmdW5jdGlvbigpe20oKX0pKSxjLmF0dHJpYnV0ZXM9aWIoZnVuY3Rpb24oYSl7cmV0dXJuIGEuY2xhc3NOYW1lPVwiaVwiLCFhLmdldEF0dHJpYnV0ZShcImNsYXNzTmFtZVwiKX0pLGMuZ2V0RWxlbWVudHNCeVRhZ05hbWU9aWIoZnVuY3Rpb24oYSl7cmV0dXJuIGEuYXBwZW5kQ2hpbGQoZS5jcmVhdGVDb21tZW50KFwiXCIpKSwhYS5nZXRFbGVtZW50c0J5VGFnTmFtZShcIipcIikubGVuZ3RofSksYy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lPSQudGVzdChlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUpJiZpYihmdW5jdGlvbihhKXtyZXR1cm4gYS5pbm5lckhUTUw9XCI8ZGl2IGNsYXNzPSdhJz48L2Rpdj48ZGl2IGNsYXNzPSdhIGknPjwvZGl2PlwiLGEuZmlyc3RDaGlsZC5jbGFzc05hbWU9XCJpXCIsMj09PWEuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImlcIikubGVuZ3RofSksYy5nZXRCeUlkPWliKGZ1bmN0aW9uKGEpe3JldHVybiBvLmFwcGVuZENoaWxkKGEpLmlkPXUsIWUuZ2V0RWxlbWVudHNCeU5hbWV8fCFlLmdldEVsZW1lbnRzQnlOYW1lKHUpLmxlbmd0aH0pLGMuZ2V0QnlJZD8oZC5maW5kLklEPWZ1bmN0aW9uKGEsYil7aWYodHlwZW9mIGIuZ2V0RWxlbWVudEJ5SWQhPT1DJiZwKXt2YXIgYz1iLmdldEVsZW1lbnRCeUlkKGEpO3JldHVybiBjJiZjLnBhcmVudE5vZGU/W2NdOltdfX0sZC5maWx0ZXIuSUQ9ZnVuY3Rpb24oYSl7dmFyIGI9YS5yZXBsYWNlKGNiLGRiKTtyZXR1cm4gZnVuY3Rpb24oYSl7cmV0dXJuIGEuZ2V0QXR0cmlidXRlKFwiaWRcIik9PT1ifX0pOihkZWxldGUgZC5maW5kLklELGQuZmlsdGVyLklEPWZ1bmN0aW9uKGEpe3ZhciBiPWEucmVwbGFjZShjYixkYik7cmV0dXJuIGZ1bmN0aW9uKGEpe3ZhciBjPXR5cGVvZiBhLmdldEF0dHJpYnV0ZU5vZGUhPT1DJiZhLmdldEF0dHJpYnV0ZU5vZGUoXCJpZFwiKTtyZXR1cm4gYyYmYy52YWx1ZT09PWJ9fSksZC5maW5kLlRBRz1jLmdldEVsZW1lbnRzQnlUYWdOYW1lP2Z1bmN0aW9uKGEsYil7cmV0dXJuIHR5cGVvZiBiLmdldEVsZW1lbnRzQnlUYWdOYW1lIT09Qz9iLmdldEVsZW1lbnRzQnlUYWdOYW1lKGEpOnZvaWQgMH06ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPVtdLGU9MCxmPWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoYSk7aWYoXCIqXCI9PT1hKXt3aGlsZShjPWZbZSsrXSkxPT09Yy5ub2RlVHlwZSYmZC5wdXNoKGMpO3JldHVybiBkfXJldHVybiBmfSxkLmZpbmQuQ0xBU1M9Yy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lJiZmdW5jdGlvbihhLGIpe3JldHVybiB0eXBlb2YgYi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lIT09QyYmcD9iLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoYSk6dm9pZCAwfSxyPVtdLHE9W10sKGMucXNhPSQudGVzdChlLnF1ZXJ5U2VsZWN0b3JBbGwpKSYmKGliKGZ1bmN0aW9uKGEpe2EuaW5uZXJIVE1MPVwiPHNlbGVjdCBtc2FsbG93Y2xpcD0nJz48b3B0aW9uIHNlbGVjdGVkPScnPjwvb3B0aW9uPjwvc2VsZWN0PlwiLGEucXVlcnlTZWxlY3RvckFsbChcIlttc2FsbG93Y2xpcF49JyddXCIpLmxlbmd0aCYmcS5wdXNoKFwiWypeJF09XCIrTStcIiooPzonJ3xcXFwiXFxcIilcIiksYS5xdWVyeVNlbGVjdG9yQWxsKFwiW3NlbGVjdGVkXVwiKS5sZW5ndGh8fHEucHVzaChcIlxcXFxbXCIrTStcIiooPzp2YWx1ZXxcIitMK1wiKVwiKSxhLnF1ZXJ5U2VsZWN0b3JBbGwoXCI6Y2hlY2tlZFwiKS5sZW5ndGh8fHEucHVzaChcIjpjaGVja2VkXCIpfSksaWIoZnVuY3Rpb24oYSl7dmFyIGI9ZS5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7Yi5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJoaWRkZW5cIiksYS5hcHBlbmRDaGlsZChiKS5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsXCJEXCIpLGEucXVlcnlTZWxlY3RvckFsbChcIltuYW1lPWRdXCIpLmxlbmd0aCYmcS5wdXNoKFwibmFtZVwiK00rXCIqWypeJHwhfl0/PVwiKSxhLnF1ZXJ5U2VsZWN0b3JBbGwoXCI6ZW5hYmxlZFwiKS5sZW5ndGh8fHEucHVzaChcIjplbmFibGVkXCIsXCI6ZGlzYWJsZWRcIiksYS5xdWVyeVNlbGVjdG9yQWxsKFwiKiw6eFwiKSxxLnB1c2goXCIsLio6XCIpfSkpLChjLm1hdGNoZXNTZWxlY3Rvcj0kLnRlc3Qocz1vLm1hdGNoZXN8fG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yfHxvLm1vek1hdGNoZXNTZWxlY3Rvcnx8by5vTWF0Y2hlc1NlbGVjdG9yfHxvLm1zTWF0Y2hlc1NlbGVjdG9yKSkmJmliKGZ1bmN0aW9uKGEpe2MuZGlzY29ubmVjdGVkTWF0Y2g9cy5jYWxsKGEsXCJkaXZcIikscy5jYWxsKGEsXCJbcyE9JyddOnhcIiksci5wdXNoKFwiIT1cIixRKX0pLHE9cS5sZW5ndGgmJm5ldyBSZWdFeHAocS5qb2luKFwifFwiKSkscj1yLmxlbmd0aCYmbmV3IFJlZ0V4cChyLmpvaW4oXCJ8XCIpKSxiPSQudGVzdChvLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKSx0PWJ8fCQudGVzdChvLmNvbnRhaW5zKT9mdW5jdGlvbihhLGIpe3ZhciBjPTk9PT1hLm5vZGVUeXBlP2EuZG9jdW1lbnRFbGVtZW50OmEsZD1iJiZiLnBhcmVudE5vZGU7cmV0dXJuIGE9PT1kfHwhKCFkfHwxIT09ZC5ub2RlVHlwZXx8IShjLmNvbnRhaW5zP2MuY29udGFpbnMoZCk6YS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiYmMTYmYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihkKSkpfTpmdW5jdGlvbihhLGIpe2lmKGIpd2hpbGUoYj1iLnBhcmVudE5vZGUpaWYoYj09PWEpcmV0dXJuITA7cmV0dXJuITF9LEI9Yj9mdW5jdGlvbihhLGIpe2lmKGE9PT1iKXJldHVybiBsPSEwLDA7dmFyIGQ9IWEuY29tcGFyZURvY3VtZW50UG9zaXRpb24tIWIuY29tcGFyZURvY3VtZW50UG9zaXRpb247cmV0dXJuIGQ/ZDooZD0oYS5vd25lckRvY3VtZW50fHxhKT09PShiLm93bmVyRG9jdW1lbnR8fGIpP2EuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYik6MSwxJmR8fCFjLnNvcnREZXRhY2hlZCYmYi5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihhKT09PWQ/YT09PWV8fGEub3duZXJEb2N1bWVudD09PXYmJnQodixhKT8tMTpiPT09ZXx8Yi5vd25lckRvY3VtZW50PT09diYmdCh2LGIpPzE6az9LLmNhbGwoayxhKS1LLmNhbGwoayxiKTowOjQmZD8tMToxKX06ZnVuY3Rpb24oYSxiKXtpZihhPT09YilyZXR1cm4gbD0hMCwwO3ZhciBjLGQ9MCxmPWEucGFyZW50Tm9kZSxnPWIucGFyZW50Tm9kZSxoPVthXSxpPVtiXTtpZighZnx8IWcpcmV0dXJuIGE9PT1lPy0xOmI9PT1lPzE6Zj8tMTpnPzE6az9LLmNhbGwoayxhKS1LLmNhbGwoayxiKTowO2lmKGY9PT1nKXJldHVybiBrYihhLGIpO2M9YTt3aGlsZShjPWMucGFyZW50Tm9kZSloLnVuc2hpZnQoYyk7Yz1iO3doaWxlKGM9Yy5wYXJlbnROb2RlKWkudW5zaGlmdChjKTt3aGlsZShoW2RdPT09aVtkXSlkKys7cmV0dXJuIGQ/a2IoaFtkXSxpW2RdKTpoW2RdPT09dj8tMTppW2RdPT09dj8xOjB9LGUpOm59LGZiLm1hdGNoZXM9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZmIoYSxudWxsLG51bGwsYil9LGZiLm1hdGNoZXNTZWxlY3Rvcj1mdW5jdGlvbihhLGIpe2lmKChhLm93bmVyRG9jdW1lbnR8fGEpIT09biYmbShhKSxiPWIucmVwbGFjZShVLFwiPSckMSddXCIpLCEoIWMubWF0Y2hlc1NlbGVjdG9yfHwhcHx8ciYmci50ZXN0KGIpfHxxJiZxLnRlc3QoYikpKXRyeXt2YXIgZD1zLmNhbGwoYSxiKTtpZihkfHxjLmRpc2Nvbm5lY3RlZE1hdGNofHxhLmRvY3VtZW50JiYxMSE9PWEuZG9jdW1lbnQubm9kZVR5cGUpcmV0dXJuIGR9Y2F0Y2goZSl7fXJldHVybiBmYihiLG4sbnVsbCxbYV0pLmxlbmd0aD4wfSxmYi5jb250YWlucz1mdW5jdGlvbihhLGIpe3JldHVybihhLm93bmVyRG9jdW1lbnR8fGEpIT09biYmbShhKSx0KGEsYil9LGZiLmF0dHI9ZnVuY3Rpb24oYSxiKXsoYS5vd25lckRvY3VtZW50fHxhKSE9PW4mJm0oYSk7dmFyIGU9ZC5hdHRySGFuZGxlW2IudG9Mb3dlckNhc2UoKV0sZj1lJiZFLmNhbGwoZC5hdHRySGFuZGxlLGIudG9Mb3dlckNhc2UoKSk/ZShhLGIsIXApOnZvaWQgMDtyZXR1cm4gdm9pZCAwIT09Zj9mOmMuYXR0cmlidXRlc3x8IXA/YS5nZXRBdHRyaWJ1dGUoYik6KGY9YS5nZXRBdHRyaWJ1dGVOb2RlKGIpKSYmZi5zcGVjaWZpZWQ/Zi52YWx1ZTpudWxsfSxmYi5lcnJvcj1mdW5jdGlvbihhKXt0aHJvdyBuZXcgRXJyb3IoXCJTeW50YXggZXJyb3IsIHVucmVjb2duaXplZCBleHByZXNzaW9uOiBcIithKX0sZmIudW5pcXVlU29ydD1mdW5jdGlvbihhKXt2YXIgYixkPVtdLGU9MCxmPTA7aWYobD0hYy5kZXRlY3REdXBsaWNhdGVzLGs9IWMuc29ydFN0YWJsZSYmYS5zbGljZSgwKSxhLnNvcnQoQiksbCl7d2hpbGUoYj1hW2YrK10pYj09PWFbZl0mJihlPWQucHVzaChmKSk7d2hpbGUoZS0tKWEuc3BsaWNlKGRbZV0sMSl9cmV0dXJuIGs9bnVsbCxhfSxlPWZiLmdldFRleHQ9ZnVuY3Rpb24oYSl7dmFyIGIsYz1cIlwiLGQ9MCxmPWEubm9kZVR5cGU7aWYoZil7aWYoMT09PWZ8fDk9PT1mfHwxMT09PWYpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiBhLnRleHRDb250ZW50KXJldHVybiBhLnRleHRDb250ZW50O2ZvcihhPWEuZmlyc3RDaGlsZDthO2E9YS5uZXh0U2libGluZyljKz1lKGEpfWVsc2UgaWYoMz09PWZ8fDQ9PT1mKXJldHVybiBhLm5vZGVWYWx1ZX1lbHNlIHdoaWxlKGI9YVtkKytdKWMrPWUoYik7cmV0dXJuIGN9LGQ9ZmIuc2VsZWN0b3JzPXtjYWNoZUxlbmd0aDo1MCxjcmVhdGVQc2V1ZG86aGIsbWF0Y2g6WCxhdHRySGFuZGxlOnt9LGZpbmQ6e30scmVsYXRpdmU6e1wiPlwiOntkaXI6XCJwYXJlbnROb2RlXCIsZmlyc3Q6ITB9LFwiIFwiOntkaXI6XCJwYXJlbnROb2RlXCJ9LFwiK1wiOntkaXI6XCJwcmV2aW91c1NpYmxpbmdcIixmaXJzdDohMH0sXCJ+XCI6e2RpcjpcInByZXZpb3VzU2libGluZ1wifX0scHJlRmlsdGVyOntBVFRSOmZ1bmN0aW9uKGEpe3JldHVybiBhWzFdPWFbMV0ucmVwbGFjZShjYixkYiksYVszXT0oYVszXXx8YVs0XXx8YVs1XXx8XCJcIikucmVwbGFjZShjYixkYiksXCJ+PVwiPT09YVsyXSYmKGFbM109XCIgXCIrYVszXStcIiBcIiksYS5zbGljZSgwLDQpfSxDSElMRDpmdW5jdGlvbihhKXtyZXR1cm4gYVsxXT1hWzFdLnRvTG93ZXJDYXNlKCksXCJudGhcIj09PWFbMV0uc2xpY2UoMCwzKT8oYVszXXx8ZmIuZXJyb3IoYVswXSksYVs0XT0rKGFbNF0/YVs1XSsoYVs2XXx8MSk6MiooXCJldmVuXCI9PT1hWzNdfHxcIm9kZFwiPT09YVszXSkpLGFbNV09KyhhWzddK2FbOF18fFwib2RkXCI9PT1hWzNdKSk6YVszXSYmZmIuZXJyb3IoYVswXSksYX0sUFNFVURPOmZ1bmN0aW9uKGEpe3ZhciBiLGM9IWFbNl0mJmFbMl07cmV0dXJuIFguQ0hJTEQudGVzdChhWzBdKT9udWxsOihhWzNdP2FbMl09YVs0XXx8YVs1XXx8XCJcIjpjJiZWLnRlc3QoYykmJihiPWcoYywhMCkpJiYoYj1jLmluZGV4T2YoXCIpXCIsYy5sZW5ndGgtYiktYy5sZW5ndGgpJiYoYVswXT1hWzBdLnNsaWNlKDAsYiksYVsyXT1jLnNsaWNlKDAsYikpLGEuc2xpY2UoMCwzKSl9fSxmaWx0ZXI6e1RBRzpmdW5jdGlvbihhKXt2YXIgYj1hLnJlcGxhY2UoY2IsZGIpLnRvTG93ZXJDYXNlKCk7cmV0dXJuXCIqXCI9PT1hP2Z1bmN0aW9uKCl7cmV0dXJuITB9OmZ1bmN0aW9uKGEpe3JldHVybiBhLm5vZGVOYW1lJiZhLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk9PT1ifX0sQ0xBU1M6ZnVuY3Rpb24oYSl7dmFyIGI9eVthK1wiIFwiXTtyZXR1cm4gYnx8KGI9bmV3IFJlZ0V4cChcIihefFwiK00rXCIpXCIrYStcIihcIitNK1wifCQpXCIpKSYmeShhLGZ1bmN0aW9uKGEpe3JldHVybiBiLnRlc3QoXCJzdHJpbmdcIj09dHlwZW9mIGEuY2xhc3NOYW1lJiZhLmNsYXNzTmFtZXx8dHlwZW9mIGEuZ2V0QXR0cmlidXRlIT09QyYmYS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKXx8XCJcIil9KX0sQVRUUjpmdW5jdGlvbihhLGIsYyl7cmV0dXJuIGZ1bmN0aW9uKGQpe3ZhciBlPWZiLmF0dHIoZCxhKTtyZXR1cm4gbnVsbD09ZT9cIiE9XCI9PT1iOmI/KGUrPVwiXCIsXCI9XCI9PT1iP2U9PT1jOlwiIT1cIj09PWI/ZSE9PWM6XCJePVwiPT09Yj9jJiYwPT09ZS5pbmRleE9mKGMpOlwiKj1cIj09PWI/YyYmZS5pbmRleE9mKGMpPi0xOlwiJD1cIj09PWI/YyYmZS5zbGljZSgtYy5sZW5ndGgpPT09YzpcIn49XCI9PT1iPyhcIiBcIitlK1wiIFwiKS5pbmRleE9mKGMpPi0xOlwifD1cIj09PWI/ZT09PWN8fGUuc2xpY2UoMCxjLmxlbmd0aCsxKT09PWMrXCItXCI6ITEpOiEwfX0sQ0hJTEQ6ZnVuY3Rpb24oYSxiLGMsZCxlKXt2YXIgZj1cIm50aFwiIT09YS5zbGljZSgwLDMpLGc9XCJsYXN0XCIhPT1hLnNsaWNlKC00KSxoPVwib2YtdHlwZVwiPT09YjtyZXR1cm4gMT09PWQmJjA9PT1lP2Z1bmN0aW9uKGEpe3JldHVybiEhYS5wYXJlbnROb2RlfTpmdW5jdGlvbihiLGMsaSl7dmFyIGosayxsLG0sbixvLHA9ZiE9PWc/XCJuZXh0U2libGluZ1wiOlwicHJldmlvdXNTaWJsaW5nXCIscT1iLnBhcmVudE5vZGUscj1oJiZiLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkscz0haSYmIWg7aWYocSl7aWYoZil7d2hpbGUocCl7bD1iO3doaWxlKGw9bFtwXSlpZihoP2wubm9kZU5hbWUudG9Mb3dlckNhc2UoKT09PXI6MT09PWwubm9kZVR5cGUpcmV0dXJuITE7bz1wPVwib25seVwiPT09YSYmIW8mJlwibmV4dFNpYmxpbmdcIn1yZXR1cm4hMH1pZihvPVtnP3EuZmlyc3RDaGlsZDpxLmxhc3RDaGlsZF0sZyYmcyl7az1xW3VdfHwocVt1XT17fSksaj1rW2FdfHxbXSxuPWpbMF09PT13JiZqWzFdLG09alswXT09PXcmJmpbMl0sbD1uJiZxLmNoaWxkTm9kZXNbbl07d2hpbGUobD0rK24mJmwmJmxbcF18fChtPW49MCl8fG8ucG9wKCkpaWYoMT09PWwubm9kZVR5cGUmJisrbSYmbD09PWIpe2tbYV09W3csbixtXTticmVha319ZWxzZSBpZihzJiYoaj0oYlt1XXx8KGJbdV09e30pKVthXSkmJmpbMF09PT13KW09alsxXTtlbHNlIHdoaWxlKGw9KytuJiZsJiZsW3BdfHwobT1uPTApfHxvLnBvcCgpKWlmKChoP2wubm9kZU5hbWUudG9Mb3dlckNhc2UoKT09PXI6MT09PWwubm9kZVR5cGUpJiYrK20mJihzJiYoKGxbdV18fChsW3VdPXt9KSlbYV09W3csbV0pLGw9PT1iKSlicmVhaztyZXR1cm4gbS09ZSxtPT09ZHx8bSVkPT09MCYmbS9kPj0wfX19LFBTRVVETzpmdW5jdGlvbihhLGIpe3ZhciBjLGU9ZC5wc2V1ZG9zW2FdfHxkLnNldEZpbHRlcnNbYS50b0xvd2VyQ2FzZSgpXXx8ZmIuZXJyb3IoXCJ1bnN1cHBvcnRlZCBwc2V1ZG86IFwiK2EpO3JldHVybiBlW3VdP2UoYik6ZS5sZW5ndGg+MT8oYz1bYSxhLFwiXCIsYl0sZC5zZXRGaWx0ZXJzLmhhc093blByb3BlcnR5KGEudG9Mb3dlckNhc2UoKSk/aGIoZnVuY3Rpb24oYSxjKXt2YXIgZCxmPWUoYSxiKSxnPWYubGVuZ3RoO3doaWxlKGctLSlkPUsuY2FsbChhLGZbZ10pLGFbZF09IShjW2RdPWZbZ10pfSk6ZnVuY3Rpb24oYSl7cmV0dXJuIGUoYSwwLGMpfSk6ZX19LHBzZXVkb3M6e25vdDpoYihmdW5jdGlvbihhKXt2YXIgYj1bXSxjPVtdLGQ9aChhLnJlcGxhY2UoUixcIiQxXCIpKTtyZXR1cm4gZFt1XT9oYihmdW5jdGlvbihhLGIsYyxlKXt2YXIgZixnPWQoYSxudWxsLGUsW10pLGg9YS5sZW5ndGg7d2hpbGUoaC0tKShmPWdbaF0pJiYoYVtoXT0hKGJbaF09ZikpfSk6ZnVuY3Rpb24oYSxlLGYpe3JldHVybiBiWzBdPWEsZChiLG51bGwsZixjKSwhYy5wb3AoKX19KSxoYXM6aGIoZnVuY3Rpb24oYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBmYihhLGIpLmxlbmd0aD4wfX0pLGNvbnRhaW5zOmhiKGZ1bmN0aW9uKGEpe3JldHVybiBmdW5jdGlvbihiKXtyZXR1cm4oYi50ZXh0Q29udGVudHx8Yi5pbm5lclRleHR8fGUoYikpLmluZGV4T2YoYSk+LTF9fSksbGFuZzpoYihmdW5jdGlvbihhKXtyZXR1cm4gVy50ZXN0KGF8fFwiXCIpfHxmYi5lcnJvcihcInVuc3VwcG9ydGVkIGxhbmc6IFwiK2EpLGE9YS5yZXBsYWNlKGNiLGRiKS50b0xvd2VyQ2FzZSgpLGZ1bmN0aW9uKGIpe3ZhciBjO2RvIGlmKGM9cD9iLmxhbmc6Yi5nZXRBdHRyaWJ1dGUoXCJ4bWw6bGFuZ1wiKXx8Yi5nZXRBdHRyaWJ1dGUoXCJsYW5nXCIpKXJldHVybiBjPWMudG9Mb3dlckNhc2UoKSxjPT09YXx8MD09PWMuaW5kZXhPZihhK1wiLVwiKTt3aGlsZSgoYj1iLnBhcmVudE5vZGUpJiYxPT09Yi5ub2RlVHlwZSk7cmV0dXJuITF9fSksdGFyZ2V0OmZ1bmN0aW9uKGIpe3ZhciBjPWEubG9jYXRpb24mJmEubG9jYXRpb24uaGFzaDtyZXR1cm4gYyYmYy5zbGljZSgxKT09PWIuaWR9LHJvb3Q6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1vfSxmb2N1czpmdW5jdGlvbihhKXtyZXR1cm4gYT09PW4uYWN0aXZlRWxlbWVudCYmKCFuLmhhc0ZvY3VzfHxuLmhhc0ZvY3VzKCkpJiYhIShhLnR5cGV8fGEuaHJlZnx8fmEudGFiSW5kZXgpfSxlbmFibGVkOmZ1bmN0aW9uKGEpe3JldHVybiBhLmRpc2FibGVkPT09ITF9LGRpc2FibGVkOmZ1bmN0aW9uKGEpe3JldHVybiBhLmRpc2FibGVkPT09ITB9LGNoZWNrZWQ6ZnVuY3Rpb24oYSl7dmFyIGI9YS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO3JldHVyblwiaW5wdXRcIj09PWImJiEhYS5jaGVja2VkfHxcIm9wdGlvblwiPT09YiYmISFhLnNlbGVjdGVkfSxzZWxlY3RlZDpmdW5jdGlvbihhKXtyZXR1cm4gYS5wYXJlbnROb2RlJiZhLnBhcmVudE5vZGUuc2VsZWN0ZWRJbmRleCxhLnNlbGVjdGVkPT09ITB9LGVtcHR5OmZ1bmN0aW9uKGEpe2ZvcihhPWEuZmlyc3RDaGlsZDthO2E9YS5uZXh0U2libGluZylpZihhLm5vZGVUeXBlPDYpcmV0dXJuITE7cmV0dXJuITB9LHBhcmVudDpmdW5jdGlvbihhKXtyZXR1cm4hZC5wc2V1ZG9zLmVtcHR5KGEpfSxoZWFkZXI6ZnVuY3Rpb24oYSl7cmV0dXJuIFoudGVzdChhLm5vZGVOYW1lKX0saW5wdXQ6ZnVuY3Rpb24oYSl7cmV0dXJuIFkudGVzdChhLm5vZGVOYW1lKX0sYnV0dG9uOmZ1bmN0aW9uKGEpe3ZhciBiPWEubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtyZXR1cm5cImlucHV0XCI9PT1iJiZcImJ1dHRvblwiPT09YS50eXBlfHxcImJ1dHRvblwiPT09Yn0sdGV4dDpmdW5jdGlvbihhKXt2YXIgYjtyZXR1cm5cImlucHV0XCI9PT1hLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkmJlwidGV4dFwiPT09YS50eXBlJiYobnVsbD09KGI9YS5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpKXx8XCJ0ZXh0XCI9PT1iLnRvTG93ZXJDYXNlKCkpfSxmaXJzdDpuYihmdW5jdGlvbigpe3JldHVyblswXX0pLGxhc3Q6bmIoZnVuY3Rpb24oYSxiKXtyZXR1cm5bYi0xXX0pLGVxOm5iKGZ1bmN0aW9uKGEsYixjKXtyZXR1cm5bMD5jP2MrYjpjXX0pLGV2ZW46bmIoZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MDtiPmM7Yys9MilhLnB1c2goYyk7cmV0dXJuIGF9KSxvZGQ6bmIoZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MTtiPmM7Yys9MilhLnB1c2goYyk7cmV0dXJuIGF9KSxsdDpuYihmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPTA+Yz9jK2I6YzstLWQ+PTA7KWEucHVzaChkKTtyZXR1cm4gYX0pLGd0Om5iKGZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9MD5jP2MrYjpjOysrZDxiOylhLnB1c2goZCk7cmV0dXJuIGF9KX19LGQucHNldWRvcy5udGg9ZC5wc2V1ZG9zLmVxO2ZvcihiIGlue3JhZGlvOiEwLGNoZWNrYm94OiEwLGZpbGU6ITAscGFzc3dvcmQ6ITAsaW1hZ2U6ITB9KWQucHNldWRvc1tiXT1sYihiKTtmb3IoYiBpbntzdWJtaXQ6ITAscmVzZXQ6ITB9KWQucHNldWRvc1tiXT1tYihiKTtmdW5jdGlvbiBwYigpe31wYi5wcm90b3R5cGU9ZC5maWx0ZXJzPWQucHNldWRvcyxkLnNldEZpbHRlcnM9bmV3IHBiLGc9ZmIudG9rZW5pemU9ZnVuY3Rpb24oYSxiKXt2YXIgYyxlLGYsZyxoLGksaixrPXpbYStcIiBcIl07aWYoaylyZXR1cm4gYj8wOmsuc2xpY2UoMCk7aD1hLGk9W10saj1kLnByZUZpbHRlcjt3aGlsZShoKXsoIWN8fChlPVMuZXhlYyhoKSkpJiYoZSYmKGg9aC5zbGljZShlWzBdLmxlbmd0aCl8fGgpLGkucHVzaChmPVtdKSksYz0hMSwoZT1ULmV4ZWMoaCkpJiYoYz1lLnNoaWZ0KCksZi5wdXNoKHt2YWx1ZTpjLHR5cGU6ZVswXS5yZXBsYWNlKFIsXCIgXCIpfSksaD1oLnNsaWNlKGMubGVuZ3RoKSk7Zm9yKGcgaW4gZC5maWx0ZXIpIShlPVhbZ10uZXhlYyhoKSl8fGpbZ10mJiEoZT1qW2ddKGUpKXx8KGM9ZS5zaGlmdCgpLGYucHVzaCh7dmFsdWU6Yyx0eXBlOmcsbWF0Y2hlczplfSksaD1oLnNsaWNlKGMubGVuZ3RoKSk7aWYoIWMpYnJlYWt9cmV0dXJuIGI/aC5sZW5ndGg6aD9mYi5lcnJvcihhKTp6KGEsaSkuc2xpY2UoMCl9O2Z1bmN0aW9uIHFiKGEpe2Zvcih2YXIgYj0wLGM9YS5sZW5ndGgsZD1cIlwiO2M+YjtiKyspZCs9YVtiXS52YWx1ZTtyZXR1cm4gZH1mdW5jdGlvbiByYihhLGIsYyl7dmFyIGQ9Yi5kaXIsZT1jJiZcInBhcmVudE5vZGVcIj09PWQsZj14Kys7cmV0dXJuIGIuZmlyc3Q/ZnVuY3Rpb24oYixjLGYpe3doaWxlKGI9YltkXSlpZigxPT09Yi5ub2RlVHlwZXx8ZSlyZXR1cm4gYShiLGMsZil9OmZ1bmN0aW9uKGIsYyxnKXt2YXIgaCxpLGo9W3csZl07aWYoZyl7d2hpbGUoYj1iW2RdKWlmKCgxPT09Yi5ub2RlVHlwZXx8ZSkmJmEoYixjLGcpKXJldHVybiEwfWVsc2Ugd2hpbGUoYj1iW2RdKWlmKDE9PT1iLm5vZGVUeXBlfHxlKXtpZihpPWJbdV18fChiW3VdPXt9KSwoaD1pW2RdKSYmaFswXT09PXcmJmhbMV09PT1mKXJldHVybiBqWzJdPWhbMl07aWYoaVtkXT1qLGpbMl09YShiLGMsZykpcmV0dXJuITB9fX1mdW5jdGlvbiBzYihhKXtyZXR1cm4gYS5sZW5ndGg+MT9mdW5jdGlvbihiLGMsZCl7dmFyIGU9YS5sZW5ndGg7d2hpbGUoZS0tKWlmKCFhW2VdKGIsYyxkKSlyZXR1cm4hMTtyZXR1cm4hMH06YVswXX1mdW5jdGlvbiB0YihhLGIsYyl7Zm9yKHZhciBkPTAsZT1iLmxlbmd0aDtlPmQ7ZCsrKWZiKGEsYltkXSxjKTtyZXR1cm4gY31mdW5jdGlvbiB1YihhLGIsYyxkLGUpe2Zvcih2YXIgZixnPVtdLGg9MCxpPWEubGVuZ3RoLGo9bnVsbCE9YjtpPmg7aCsrKShmPWFbaF0pJiYoIWN8fGMoZixkLGUpKSYmKGcucHVzaChmKSxqJiZiLnB1c2goaCkpO3JldHVybiBnfWZ1bmN0aW9uIHZiKGEsYixjLGQsZSxmKXtyZXR1cm4gZCYmIWRbdV0mJihkPXZiKGQpKSxlJiYhZVt1XSYmKGU9dmIoZSxmKSksaGIoZnVuY3Rpb24oZixnLGgsaSl7dmFyIGosayxsLG09W10sbj1bXSxvPWcubGVuZ3RoLHA9Znx8dGIoYnx8XCIqXCIsaC5ub2RlVHlwZT9baF06aCxbXSkscT0hYXx8IWYmJmI/cDp1YihwLG0sYSxoLGkpLHI9Yz9lfHwoZj9hOm98fGQpP1tdOmc6cTtpZihjJiZjKHEscixoLGkpLGQpe2o9dWIocixuKSxkKGosW10saCxpKSxrPWoubGVuZ3RoO3doaWxlKGstLSkobD1qW2tdKSYmKHJbbltrXV09IShxW25ba11dPWwpKX1pZihmKXtpZihlfHxhKXtpZihlKXtqPVtdLGs9ci5sZW5ndGg7d2hpbGUoay0tKShsPXJba10pJiZqLnB1c2gocVtrXT1sKTtlKG51bGwscj1bXSxqLGkpfWs9ci5sZW5ndGg7d2hpbGUoay0tKShsPXJba10pJiYoaj1lP0suY2FsbChmLGwpOm1ba10pPi0xJiYoZltqXT0hKGdbal09bCkpfX1lbHNlIHI9dWIocj09PWc/ci5zcGxpY2UobyxyLmxlbmd0aCk6ciksZT9lKG51bGwsZyxyLGkpOkkuYXBwbHkoZyxyKX0pfWZ1bmN0aW9uIHdiKGEpe2Zvcih2YXIgYixjLGUsZj1hLmxlbmd0aCxnPWQucmVsYXRpdmVbYVswXS50eXBlXSxoPWd8fGQucmVsYXRpdmVbXCIgXCJdLGk9Zz8xOjAsaz1yYihmdW5jdGlvbihhKXtyZXR1cm4gYT09PWJ9LGgsITApLGw9cmIoZnVuY3Rpb24oYSl7cmV0dXJuIEsuY2FsbChiLGEpPi0xfSxoLCEwKSxtPVtmdW5jdGlvbihhLGMsZCl7cmV0dXJuIWcmJihkfHxjIT09ail8fCgoYj1jKS5ub2RlVHlwZT9rKGEsYyxkKTpsKGEsYyxkKSl9XTtmPmk7aSsrKWlmKGM9ZC5yZWxhdGl2ZVthW2ldLnR5cGVdKW09W3JiKHNiKG0pLGMpXTtlbHNle2lmKGM9ZC5maWx0ZXJbYVtpXS50eXBlXS5hcHBseShudWxsLGFbaV0ubWF0Y2hlcyksY1t1XSl7Zm9yKGU9KytpO2Y+ZTtlKyspaWYoZC5yZWxhdGl2ZVthW2VdLnR5cGVdKWJyZWFrO3JldHVybiB2YihpPjEmJnNiKG0pLGk+MSYmcWIoYS5zbGljZSgwLGktMSkuY29uY2F0KHt2YWx1ZTpcIiBcIj09PWFbaS0yXS50eXBlP1wiKlwiOlwiXCJ9KSkucmVwbGFjZShSLFwiJDFcIiksYyxlPmkmJndiKGEuc2xpY2UoaSxlKSksZj5lJiZ3YihhPWEuc2xpY2UoZSkpLGY+ZSYmcWIoYSkpfW0ucHVzaChjKX1yZXR1cm4gc2IobSl9ZnVuY3Rpb24geGIoYSxiKXt2YXIgYz1iLmxlbmd0aD4wLGU9YS5sZW5ndGg+MCxmPWZ1bmN0aW9uKGYsZyxoLGksayl7dmFyIGwsbSxvLHA9MCxxPVwiMFwiLHI9ZiYmW10scz1bXSx0PWosdT1mfHxlJiZkLmZpbmQuVEFHKFwiKlwiLGspLHY9dys9bnVsbD09dD8xOk1hdGgucmFuZG9tKCl8fC4xLHg9dS5sZW5ndGg7Zm9yKGsmJihqPWchPT1uJiZnKTtxIT09eCYmbnVsbCE9KGw9dVtxXSk7cSsrKXtpZihlJiZsKXttPTA7d2hpbGUobz1hW20rK10paWYobyhsLGcsaCkpe2kucHVzaChsKTticmVha31rJiYodz12KX1jJiYoKGw9IW8mJmwpJiZwLS0sZiYmci5wdXNoKGwpKX1pZihwKz1xLGMmJnEhPT1wKXttPTA7d2hpbGUobz1iW20rK10pbyhyLHMsZyxoKTtpZihmKXtpZihwPjApd2hpbGUocS0tKXJbcV18fHNbcV18fChzW3FdPUcuY2FsbChpKSk7cz11YihzKX1JLmFwcGx5KGkscyksayYmIWYmJnMubGVuZ3RoPjAmJnArYi5sZW5ndGg+MSYmZmIudW5pcXVlU29ydChpKX1yZXR1cm4gayYmKHc9dixqPXQpLHJ9O3JldHVybiBjP2hiKGYpOmZ9cmV0dXJuIGg9ZmIuY29tcGlsZT1mdW5jdGlvbihhLGIpe3ZhciBjLGQ9W10sZT1bXSxmPUFbYStcIiBcIl07aWYoIWYpe2J8fChiPWcoYSkpLGM9Yi5sZW5ndGg7d2hpbGUoYy0tKWY9d2IoYltjXSksZlt1XT9kLnB1c2goZik6ZS5wdXNoKGYpO2Y9QShhLHhiKGUsZCkpLGYuc2VsZWN0b3I9YX1yZXR1cm4gZn0saT1mYi5zZWxlY3Q9ZnVuY3Rpb24oYSxiLGUsZil7dmFyIGksaixrLGwsbSxuPVwiZnVuY3Rpb25cIj09dHlwZW9mIGEmJmEsbz0hZiYmZyhhPW4uc2VsZWN0b3J8fGEpO2lmKGU9ZXx8W10sMT09PW8ubGVuZ3RoKXtpZihqPW9bMF09b1swXS5zbGljZSgwKSxqLmxlbmd0aD4yJiZcIklEXCI9PT0oaz1qWzBdKS50eXBlJiZjLmdldEJ5SWQmJjk9PT1iLm5vZGVUeXBlJiZwJiZkLnJlbGF0aXZlW2pbMV0udHlwZV0pe2lmKGI9KGQuZmluZC5JRChrLm1hdGNoZXNbMF0ucmVwbGFjZShjYixkYiksYil8fFtdKVswXSwhYilyZXR1cm4gZTtuJiYoYj1iLnBhcmVudE5vZGUpLGE9YS5zbGljZShqLnNoaWZ0KCkudmFsdWUubGVuZ3RoKX1pPVgubmVlZHNDb250ZXh0LnRlc3QoYSk/MDpqLmxlbmd0aDt3aGlsZShpLS0pe2lmKGs9altpXSxkLnJlbGF0aXZlW2w9ay50eXBlXSlicmVhaztpZigobT1kLmZpbmRbbF0pJiYoZj1tKGsubWF0Y2hlc1swXS5yZXBsYWNlKGNiLGRiKSxhYi50ZXN0KGpbMF0udHlwZSkmJm9iKGIucGFyZW50Tm9kZSl8fGIpKSl7aWYoai5zcGxpY2UoaSwxKSxhPWYubGVuZ3RoJiZxYihqKSwhYSlyZXR1cm4gSS5hcHBseShlLGYpLGU7YnJlYWt9fX1yZXR1cm4obnx8aChhLG8pKShmLGIsIXAsZSxhYi50ZXN0KGEpJiZvYihiLnBhcmVudE5vZGUpfHxiKSxlfSxjLnNvcnRTdGFibGU9dS5zcGxpdChcIlwiKS5zb3J0KEIpLmpvaW4oXCJcIik9PT11LGMuZGV0ZWN0RHVwbGljYXRlcz0hIWwsbSgpLGMuc29ydERldGFjaGVkPWliKGZ1bmN0aW9uKGEpe3JldHVybiAxJmEuY29tcGFyZURvY3VtZW50UG9zaXRpb24obi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKX0pLGliKGZ1bmN0aW9uKGEpe3JldHVybiBhLmlubmVySFRNTD1cIjxhIGhyZWY9JyMnPjwvYT5cIixcIiNcIj09PWEuZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpfSl8fGpiKFwidHlwZXxocmVmfGhlaWdodHx3aWR0aFwiLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYz92b2lkIDA6YS5nZXRBdHRyaWJ1dGUoYixcInR5cGVcIj09PWIudG9Mb3dlckNhc2UoKT8xOjIpfSksYy5hdHRyaWJ1dGVzJiZpYihmdW5jdGlvbihhKXtyZXR1cm4gYS5pbm5lckhUTUw9XCI8aW5wdXQvPlwiLGEuZmlyc3RDaGlsZC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLFwiXCIpLFwiXCI9PT1hLmZpcnN0Q2hpbGQuZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9KXx8amIoXCJ2YWx1ZVwiLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gY3x8XCJpbnB1dFwiIT09YS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpP3ZvaWQgMDphLmRlZmF1bHRWYWx1ZX0pLGliKGZ1bmN0aW9uKGEpe3JldHVybiBudWxsPT1hLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpfSl8fGpiKEwsZnVuY3Rpb24oYSxiLGMpe3ZhciBkO3JldHVybiBjP3ZvaWQgMDphW2JdPT09ITA/Yi50b0xvd2VyQ2FzZSgpOihkPWEuZ2V0QXR0cmlidXRlTm9kZShiKSkmJmQuc3BlY2lmaWVkP2QudmFsdWU6bnVsbH0pLGZifShhKTtuLmZpbmQ9dCxuLmV4cHI9dC5zZWxlY3RvcnMsbi5leHByW1wiOlwiXT1uLmV4cHIucHNldWRvcyxuLnVuaXF1ZT10LnVuaXF1ZVNvcnQsbi50ZXh0PXQuZ2V0VGV4dCxuLmlzWE1MRG9jPXQuaXNYTUwsbi5jb250YWlucz10LmNvbnRhaW5zO3ZhciB1PW4uZXhwci5tYXRjaC5uZWVkc0NvbnRleHQsdj0vXjwoXFx3KylcXHMqXFwvPz4oPzo8XFwvXFwxPnwpJC8sdz0vXi5bXjojXFxbXFwuLF0qJC87ZnVuY3Rpb24geChhLGIsYyl7aWYobi5pc0Z1bmN0aW9uKGIpKXJldHVybiBuLmdyZXAoYSxmdW5jdGlvbihhLGQpe3JldHVybiEhYi5jYWxsKGEsZCxhKSE9PWN9KTtpZihiLm5vZGVUeXBlKXJldHVybiBuLmdyZXAoYSxmdW5jdGlvbihhKXtyZXR1cm4gYT09PWIhPT1jfSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGIpe2lmKHcudGVzdChiKSlyZXR1cm4gbi5maWx0ZXIoYixhLGMpO2I9bi5maWx0ZXIoYixhKX1yZXR1cm4gbi5ncmVwKGEsZnVuY3Rpb24oYSl7cmV0dXJuIGcuY2FsbChiLGEpPj0wIT09Y30pfW4uZmlsdGVyPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1iWzBdO3JldHVybiBjJiYoYT1cIjpub3QoXCIrYStcIilcIiksMT09PWIubGVuZ3RoJiYxPT09ZC5ub2RlVHlwZT9uLmZpbmQubWF0Y2hlc1NlbGVjdG9yKGQsYSk/W2RdOltdOm4uZmluZC5tYXRjaGVzKGEsbi5ncmVwKGIsZnVuY3Rpb24oYSl7cmV0dXJuIDE9PT1hLm5vZGVUeXBlfSkpfSxuLmZuLmV4dGVuZCh7ZmluZDpmdW5jdGlvbihhKXt2YXIgYixjPXRoaXMubGVuZ3RoLGQ9W10sZT10aGlzO2lmKFwic3RyaW5nXCIhPXR5cGVvZiBhKXJldHVybiB0aGlzLnB1c2hTdGFjayhuKGEpLmZpbHRlcihmdW5jdGlvbigpe2ZvcihiPTA7Yz5iO2IrKylpZihuLmNvbnRhaW5zKGVbYl0sdGhpcykpcmV0dXJuITB9KSk7Zm9yKGI9MDtjPmI7YisrKW4uZmluZChhLGVbYl0sZCk7cmV0dXJuIGQ9dGhpcy5wdXNoU3RhY2soYz4xP24udW5pcXVlKGQpOmQpLGQuc2VsZWN0b3I9dGhpcy5zZWxlY3Rvcj90aGlzLnNlbGVjdG9yK1wiIFwiK2E6YSxkfSxmaWx0ZXI6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMucHVzaFN0YWNrKHgodGhpcyxhfHxbXSwhMSkpfSxub3Q6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMucHVzaFN0YWNrKHgodGhpcyxhfHxbXSwhMCkpfSxpczpmdW5jdGlvbihhKXtyZXR1cm4hIXgodGhpcyxcInN0cmluZ1wiPT10eXBlb2YgYSYmdS50ZXN0KGEpP24oYSk6YXx8W10sITEpLmxlbmd0aH19KTt2YXIgeSx6PS9eKD86XFxzKig8W1xcd1xcV10rPilbXj5dKnwjKFtcXHctXSopKSQvLEE9bi5mbi5pbml0PWZ1bmN0aW9uKGEsYil7dmFyIGMsZDtpZighYSlyZXR1cm4gdGhpcztpZihcInN0cmluZ1wiPT10eXBlb2YgYSl7aWYoYz1cIjxcIj09PWFbMF0mJlwiPlwiPT09YVthLmxlbmd0aC0xXSYmYS5sZW5ndGg+PTM/W251bGwsYSxudWxsXTp6LmV4ZWMoYSksIWN8fCFjWzFdJiZiKXJldHVybiFifHxiLmpxdWVyeT8oYnx8eSkuZmluZChhKTp0aGlzLmNvbnN0cnVjdG9yKGIpLmZpbmQoYSk7aWYoY1sxXSl7aWYoYj1iIGluc3RhbmNlb2Ygbj9iWzBdOmIsbi5tZXJnZSh0aGlzLG4ucGFyc2VIVE1MKGNbMV0sYiYmYi5ub2RlVHlwZT9iLm93bmVyRG9jdW1lbnR8fGI6bCwhMCkpLHYudGVzdChjWzFdKSYmbi5pc1BsYWluT2JqZWN0KGIpKWZvcihjIGluIGIpbi5pc0Z1bmN0aW9uKHRoaXNbY10pP3RoaXNbY10oYltjXSk6dGhpcy5hdHRyKGMsYltjXSk7cmV0dXJuIHRoaXN9cmV0dXJuIGQ9bC5nZXRFbGVtZW50QnlJZChjWzJdKSxkJiZkLnBhcmVudE5vZGUmJih0aGlzLmxlbmd0aD0xLHRoaXNbMF09ZCksdGhpcy5jb250ZXh0PWwsdGhpcy5zZWxlY3Rvcj1hLHRoaXN9cmV0dXJuIGEubm9kZVR5cGU/KHRoaXMuY29udGV4dD10aGlzWzBdPWEsdGhpcy5sZW5ndGg9MSx0aGlzKTpuLmlzRnVuY3Rpb24oYSk/XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHkucmVhZHk/eS5yZWFkeShhKTphKG4pOih2b2lkIDAhPT1hLnNlbGVjdG9yJiYodGhpcy5zZWxlY3Rvcj1hLnNlbGVjdG9yLHRoaXMuY29udGV4dD1hLmNvbnRleHQpLG4ubWFrZUFycmF5KGEsdGhpcykpfTtBLnByb3RvdHlwZT1uLmZuLHk9bihsKTt2YXIgQj0vXig/OnBhcmVudHN8cHJldig/OlVudGlsfEFsbCkpLyxDPXtjaGlsZHJlbjohMCxjb250ZW50czohMCxuZXh0OiEwLHByZXY6ITB9O24uZXh0ZW5kKHtkaXI6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPVtdLGU9dm9pZCAwIT09Yzt3aGlsZSgoYT1hW2JdKSYmOSE9PWEubm9kZVR5cGUpaWYoMT09PWEubm9kZVR5cGUpe2lmKGUmJm4oYSkuaXMoYykpYnJlYWs7ZC5wdXNoKGEpfXJldHVybiBkfSxzaWJsaW5nOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPVtdO2E7YT1hLm5leHRTaWJsaW5nKTE9PT1hLm5vZGVUeXBlJiZhIT09YiYmYy5wdXNoKGEpO3JldHVybiBjfX0pLG4uZm4uZXh0ZW5kKHtoYXM6ZnVuY3Rpb24oYSl7dmFyIGI9bihhLHRoaXMpLGM9Yi5sZW5ndGg7cmV0dXJuIHRoaXMuZmlsdGVyKGZ1bmN0aW9uKCl7Zm9yKHZhciBhPTA7Yz5hO2ErKylpZihuLmNvbnRhaW5zKHRoaXMsYlthXSkpcmV0dXJuITB9KX0sY2xvc2VzdDpmdW5jdGlvbihhLGIpe2Zvcih2YXIgYyxkPTAsZT10aGlzLmxlbmd0aCxmPVtdLGc9dS50ZXN0KGEpfHxcInN0cmluZ1wiIT10eXBlb2YgYT9uKGEsYnx8dGhpcy5jb250ZXh0KTowO2U+ZDtkKyspZm9yKGM9dGhpc1tkXTtjJiZjIT09YjtjPWMucGFyZW50Tm9kZSlpZihjLm5vZGVUeXBlPDExJiYoZz9nLmluZGV4KGMpPi0xOjE9PT1jLm5vZGVUeXBlJiZuLmZpbmQubWF0Y2hlc1NlbGVjdG9yKGMsYSkpKXtmLnB1c2goYyk7YnJlYWt9cmV0dXJuIHRoaXMucHVzaFN0YWNrKGYubGVuZ3RoPjE/bi51bmlxdWUoZik6Zil9LGluZGV4OmZ1bmN0aW9uKGEpe3JldHVybiBhP1wic3RyaW5nXCI9PXR5cGVvZiBhP2cuY2FsbChuKGEpLHRoaXNbMF0pOmcuY2FsbCh0aGlzLGEuanF1ZXJ5P2FbMF06YSk6dGhpc1swXSYmdGhpc1swXS5wYXJlbnROb2RlP3RoaXMuZmlyc3QoKS5wcmV2QWxsKCkubGVuZ3RoOi0xfSxhZGQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5wdXNoU3RhY2sobi51bmlxdWUobi5tZXJnZSh0aGlzLmdldCgpLG4oYSxiKSkpKX0sYWRkQmFjazpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5hZGQobnVsbD09YT90aGlzLnByZXZPYmplY3Q6dGhpcy5wcmV2T2JqZWN0LmZpbHRlcihhKSl9fSk7ZnVuY3Rpb24gRChhLGIpe3doaWxlKChhPWFbYl0pJiYxIT09YS5ub2RlVHlwZSk7cmV0dXJuIGF9bi5lYWNoKHtwYXJlbnQ6ZnVuY3Rpb24oYSl7dmFyIGI9YS5wYXJlbnROb2RlO3JldHVybiBiJiYxMSE9PWIubm9kZVR5cGU/YjpudWxsfSxwYXJlbnRzOmZ1bmN0aW9uKGEpe3JldHVybiBuLmRpcihhLFwicGFyZW50Tm9kZVwiKX0scGFyZW50c1VudGlsOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gbi5kaXIoYSxcInBhcmVudE5vZGVcIixjKX0sbmV4dDpmdW5jdGlvbihhKXtyZXR1cm4gRChhLFwibmV4dFNpYmxpbmdcIil9LHByZXY6ZnVuY3Rpb24oYSl7cmV0dXJuIEQoYSxcInByZXZpb3VzU2libGluZ1wiKX0sbmV4dEFsbDpmdW5jdGlvbihhKXtyZXR1cm4gbi5kaXIoYSxcIm5leHRTaWJsaW5nXCIpfSxwcmV2QWxsOmZ1bmN0aW9uKGEpe3JldHVybiBuLmRpcihhLFwicHJldmlvdXNTaWJsaW5nXCIpfSxuZXh0VW50aWw6ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBuLmRpcihhLFwibmV4dFNpYmxpbmdcIixjKX0scHJldlVudGlsOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gbi5kaXIoYSxcInByZXZpb3VzU2libGluZ1wiLGMpfSxzaWJsaW5nczpmdW5jdGlvbihhKXtyZXR1cm4gbi5zaWJsaW5nKChhLnBhcmVudE5vZGV8fHt9KS5maXJzdENoaWxkLGEpfSxjaGlsZHJlbjpmdW5jdGlvbihhKXtyZXR1cm4gbi5zaWJsaW5nKGEuZmlyc3RDaGlsZCl9LGNvbnRlbnRzOmZ1bmN0aW9uKGEpe3JldHVybiBhLmNvbnRlbnREb2N1bWVudHx8bi5tZXJnZShbXSxhLmNoaWxkTm9kZXMpfX0sZnVuY3Rpb24oYSxiKXtuLmZuW2FdPWZ1bmN0aW9uKGMsZCl7dmFyIGU9bi5tYXAodGhpcyxiLGMpO3JldHVyblwiVW50aWxcIiE9PWEuc2xpY2UoLTUpJiYoZD1jKSxkJiZcInN0cmluZ1wiPT10eXBlb2YgZCYmKGU9bi5maWx0ZXIoZCxlKSksdGhpcy5sZW5ndGg+MSYmKENbYV18fG4udW5pcXVlKGUpLEIudGVzdChhKSYmZS5yZXZlcnNlKCkpLHRoaXMucHVzaFN0YWNrKGUpfX0pO3ZhciBFPS9cXFMrL2csRj17fTtmdW5jdGlvbiBHKGEpe3ZhciBiPUZbYV09e307cmV0dXJuIG4uZWFjaChhLm1hdGNoKEUpfHxbXSxmdW5jdGlvbihhLGMpe2JbY109ITB9KSxifW4uQ2FsbGJhY2tzPWZ1bmN0aW9uKGEpe2E9XCJzdHJpbmdcIj09dHlwZW9mIGE/RlthXXx8RyhhKTpuLmV4dGVuZCh7fSxhKTt2YXIgYixjLGQsZSxmLGcsaD1bXSxpPSFhLm9uY2UmJltdLGo9ZnVuY3Rpb24obCl7Zm9yKGI9YS5tZW1vcnkmJmwsYz0hMCxnPWV8fDAsZT0wLGY9aC5sZW5ndGgsZD0hMDtoJiZmPmc7ZysrKWlmKGhbZ10uYXBwbHkobFswXSxsWzFdKT09PSExJiZhLnN0b3BPbkZhbHNlKXtiPSExO2JyZWFrfWQ9ITEsaCYmKGk/aS5sZW5ndGgmJmooaS5zaGlmdCgpKTpiP2g9W106ay5kaXNhYmxlKCkpfSxrPXthZGQ6ZnVuY3Rpb24oKXtpZihoKXt2YXIgYz1oLmxlbmd0aDshZnVuY3Rpb24gZyhiKXtuLmVhY2goYixmdW5jdGlvbihiLGMpe3ZhciBkPW4udHlwZShjKTtcImZ1bmN0aW9uXCI9PT1kP2EudW5pcXVlJiZrLmhhcyhjKXx8aC5wdXNoKGMpOmMmJmMubGVuZ3RoJiZcInN0cmluZ1wiIT09ZCYmZyhjKX0pfShhcmd1bWVudHMpLGQ/Zj1oLmxlbmd0aDpiJiYoZT1jLGooYikpfXJldHVybiB0aGlzfSxyZW1vdmU6ZnVuY3Rpb24oKXtyZXR1cm4gaCYmbi5lYWNoKGFyZ3VtZW50cyxmdW5jdGlvbihhLGIpe3ZhciBjO3doaWxlKChjPW4uaW5BcnJheShiLGgsYykpPi0xKWguc3BsaWNlKGMsMSksZCYmKGY+PWMmJmYtLSxnPj1jJiZnLS0pfSksdGhpc30saGFzOmZ1bmN0aW9uKGEpe3JldHVybiBhP24uaW5BcnJheShhLGgpPi0xOiEoIWh8fCFoLmxlbmd0aCl9LGVtcHR5OmZ1bmN0aW9uKCl7cmV0dXJuIGg9W10sZj0wLHRoaXN9LGRpc2FibGU6ZnVuY3Rpb24oKXtyZXR1cm4gaD1pPWI9dm9pZCAwLHRoaXN9LGRpc2FibGVkOmZ1bmN0aW9uKCl7cmV0dXJuIWh9LGxvY2s6ZnVuY3Rpb24oKXtyZXR1cm4gaT12b2lkIDAsYnx8ay5kaXNhYmxlKCksdGhpc30sbG9ja2VkOmZ1bmN0aW9uKCl7cmV0dXJuIWl9LGZpcmVXaXRoOmZ1bmN0aW9uKGEsYil7cmV0dXJuIWh8fGMmJiFpfHwoYj1ifHxbXSxiPVthLGIuc2xpY2U/Yi5zbGljZSgpOmJdLGQ/aS5wdXNoKGIpOmooYikpLHRoaXN9LGZpcmU6ZnVuY3Rpb24oKXtyZXR1cm4gay5maXJlV2l0aCh0aGlzLGFyZ3VtZW50cyksdGhpc30sZmlyZWQ6ZnVuY3Rpb24oKXtyZXR1cm4hIWN9fTtyZXR1cm4ga30sbi5leHRlbmQoe0RlZmVycmVkOmZ1bmN0aW9uKGEpe3ZhciBiPVtbXCJyZXNvbHZlXCIsXCJkb25lXCIsbi5DYWxsYmFja3MoXCJvbmNlIG1lbW9yeVwiKSxcInJlc29sdmVkXCJdLFtcInJlamVjdFwiLFwiZmFpbFwiLG4uQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIiksXCJyZWplY3RlZFwiXSxbXCJub3RpZnlcIixcInByb2dyZXNzXCIsbi5DYWxsYmFja3MoXCJtZW1vcnlcIildXSxjPVwicGVuZGluZ1wiLGQ9e3N0YXRlOmZ1bmN0aW9uKCl7cmV0dXJuIGN9LGFsd2F5czpmdW5jdGlvbigpe3JldHVybiBlLmRvbmUoYXJndW1lbnRzKS5mYWlsKGFyZ3VtZW50cyksdGhpc30sdGhlbjpmdW5jdGlvbigpe3ZhciBhPWFyZ3VtZW50cztyZXR1cm4gbi5EZWZlcnJlZChmdW5jdGlvbihjKXtuLmVhY2goYixmdW5jdGlvbihiLGYpe3ZhciBnPW4uaXNGdW5jdGlvbihhW2JdKSYmYVtiXTtlW2ZbMV1dKGZ1bmN0aW9uKCl7dmFyIGE9ZyYmZy5hcHBseSh0aGlzLGFyZ3VtZW50cyk7YSYmbi5pc0Z1bmN0aW9uKGEucHJvbWlzZSk/YS5wcm9taXNlKCkuZG9uZShjLnJlc29sdmUpLmZhaWwoYy5yZWplY3QpLnByb2dyZXNzKGMubm90aWZ5KTpjW2ZbMF0rXCJXaXRoXCJdKHRoaXM9PT1kP2MucHJvbWlzZSgpOnRoaXMsZz9bYV06YXJndW1lbnRzKX0pfSksYT1udWxsfSkucHJvbWlzZSgpfSxwcm9taXNlOmZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT1hP24uZXh0ZW5kKGEsZCk6ZH19LGU9e307cmV0dXJuIGQucGlwZT1kLnRoZW4sbi5lYWNoKGIsZnVuY3Rpb24oYSxmKXt2YXIgZz1mWzJdLGg9ZlszXTtkW2ZbMV1dPWcuYWRkLGgmJmcuYWRkKGZ1bmN0aW9uKCl7Yz1ofSxiWzFeYV1bMl0uZGlzYWJsZSxiWzJdWzJdLmxvY2spLGVbZlswXV09ZnVuY3Rpb24oKXtyZXR1cm4gZVtmWzBdK1wiV2l0aFwiXSh0aGlzPT09ZT9kOnRoaXMsYXJndW1lbnRzKSx0aGlzfSxlW2ZbMF0rXCJXaXRoXCJdPWcuZmlyZVdpdGh9KSxkLnByb21pc2UoZSksYSYmYS5jYWxsKGUsZSksZX0sd2hlbjpmdW5jdGlvbihhKXt2YXIgYj0wLGM9ZC5jYWxsKGFyZ3VtZW50cyksZT1jLmxlbmd0aCxmPTEhPT1lfHxhJiZuLmlzRnVuY3Rpb24oYS5wcm9taXNlKT9lOjAsZz0xPT09Zj9hOm4uRGVmZXJyZWQoKSxoPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gZnVuY3Rpb24oZSl7YlthXT10aGlzLGNbYV09YXJndW1lbnRzLmxlbmd0aD4xP2QuY2FsbChhcmd1bWVudHMpOmUsYz09PWk/Zy5ub3RpZnlXaXRoKGIsYyk6LS1mfHxnLnJlc29sdmVXaXRoKGIsYyl9fSxpLGosaztpZihlPjEpZm9yKGk9bmV3IEFycmF5KGUpLGo9bmV3IEFycmF5KGUpLGs9bmV3IEFycmF5KGUpO2U+YjtiKyspY1tiXSYmbi5pc0Z1bmN0aW9uKGNbYl0ucHJvbWlzZSk/Y1tiXS5wcm9taXNlKCkuZG9uZShoKGIsayxjKSkuZmFpbChnLnJlamVjdCkucHJvZ3Jlc3MoaChiLGosaSkpOi0tZjtyZXR1cm4gZnx8Zy5yZXNvbHZlV2l0aChrLGMpLGcucHJvbWlzZSgpfX0pO3ZhciBIO24uZm4ucmVhZHk9ZnVuY3Rpb24oYSl7cmV0dXJuIG4ucmVhZHkucHJvbWlzZSgpLmRvbmUoYSksdGhpc30sbi5leHRlbmQoe2lzUmVhZHk6ITEscmVhZHlXYWl0OjEsaG9sZFJlYWR5OmZ1bmN0aW9uKGEpe2E/bi5yZWFkeVdhaXQrKzpuLnJlYWR5KCEwKX0scmVhZHk6ZnVuY3Rpb24oYSl7KGE9PT0hMD8tLW4ucmVhZHlXYWl0Om4uaXNSZWFkeSl8fChuLmlzUmVhZHk9ITAsYSE9PSEwJiYtLW4ucmVhZHlXYWl0PjB8fChILnJlc29sdmVXaXRoKGwsW25dKSxuLmZuLnRyaWdnZXJIYW5kbGVyJiYobihsKS50cmlnZ2VySGFuZGxlcihcInJlYWR5XCIpLG4obCkub2ZmKFwicmVhZHlcIikpKSl9fSk7ZnVuY3Rpb24gSSgpe2wucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixJLCExKSxhLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsSSwhMSksbi5yZWFkeSgpfW4ucmVhZHkucHJvbWlzZT1mdW5jdGlvbihiKXtyZXR1cm4gSHx8KEg9bi5EZWZlcnJlZCgpLFwiY29tcGxldGVcIj09PWwucmVhZHlTdGF0ZT9zZXRUaW1lb3V0KG4ucmVhZHkpOihsLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsSSwhMSksYS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLEksITEpKSksSC5wcm9taXNlKGIpfSxuLnJlYWR5LnByb21pc2UoKTt2YXIgSj1uLmFjY2Vzcz1mdW5jdGlvbihhLGIsYyxkLGUsZixnKXt2YXIgaD0wLGk9YS5sZW5ndGgsaj1udWxsPT1jO2lmKFwib2JqZWN0XCI9PT1uLnR5cGUoYykpe2U9ITA7Zm9yKGggaW4gYyluLmFjY2VzcyhhLGIsaCxjW2hdLCEwLGYsZyl9ZWxzZSBpZih2b2lkIDAhPT1kJiYoZT0hMCxuLmlzRnVuY3Rpb24oZCl8fChnPSEwKSxqJiYoZz8oYi5jYWxsKGEsZCksYj1udWxsKTooaj1iLGI9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBqLmNhbGwobihhKSxjKX0pKSxiKSlmb3IoO2k+aDtoKyspYihhW2hdLGMsZz9kOmQuY2FsbChhW2hdLGgsYihhW2hdLGMpKSk7cmV0dXJuIGU/YTpqP2IuY2FsbChhKTppP2IoYVswXSxjKTpmfTtuLmFjY2VwdERhdGE9ZnVuY3Rpb24oYSl7cmV0dXJuIDE9PT1hLm5vZGVUeXBlfHw5PT09YS5ub2RlVHlwZXx8ISthLm5vZGVUeXBlfTtmdW5jdGlvbiBLKCl7T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMuY2FjaGU9e30sMCx7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJue319fSksdGhpcy5leHBhbmRvPW4uZXhwYW5kbytNYXRoLnJhbmRvbSgpfUsudWlkPTEsSy5hY2NlcHRzPW4uYWNjZXB0RGF0YSxLLnByb3RvdHlwZT17a2V5OmZ1bmN0aW9uKGEpe2lmKCFLLmFjY2VwdHMoYSkpcmV0dXJuIDA7dmFyIGI9e30sYz1hW3RoaXMuZXhwYW5kb107aWYoIWMpe2M9Sy51aWQrKzt0cnl7Ylt0aGlzLmV4cGFuZG9dPXt2YWx1ZTpjfSxPYmplY3QuZGVmaW5lUHJvcGVydGllcyhhLGIpfWNhdGNoKGQpe2JbdGhpcy5leHBhbmRvXT1jLG4uZXh0ZW5kKGEsYil9fXJldHVybiB0aGlzLmNhY2hlW2NdfHwodGhpcy5jYWNoZVtjXT17fSksY30sc2V0OmZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlPXRoaXMua2V5KGEpLGY9dGhpcy5jYWNoZVtlXTtpZihcInN0cmluZ1wiPT10eXBlb2YgYilmW2JdPWM7ZWxzZSBpZihuLmlzRW1wdHlPYmplY3QoZikpbi5leHRlbmQodGhpcy5jYWNoZVtlXSxiKTtlbHNlIGZvcihkIGluIGIpZltkXT1iW2RdO3JldHVybiBmfSxnZXQ6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLmNhY2hlW3RoaXMua2V5KGEpXTtyZXR1cm4gdm9pZCAwPT09Yj9jOmNbYl19LGFjY2VzczpmdW5jdGlvbihhLGIsYyl7dmFyIGQ7cmV0dXJuIHZvaWQgMD09PWJ8fGImJlwic3RyaW5nXCI9PXR5cGVvZiBiJiZ2b2lkIDA9PT1jPyhkPXRoaXMuZ2V0KGEsYiksdm9pZCAwIT09ZD9kOnRoaXMuZ2V0KGEsbi5jYW1lbENhc2UoYikpKToodGhpcy5zZXQoYSxiLGMpLHZvaWQgMCE9PWM/YzpiKX0scmVtb3ZlOmZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlLGY9dGhpcy5rZXkoYSksZz10aGlzLmNhY2hlW2ZdO2lmKHZvaWQgMD09PWIpdGhpcy5jYWNoZVtmXT17fTtlbHNle24uaXNBcnJheShiKT9kPWIuY29uY2F0KGIubWFwKG4uY2FtZWxDYXNlKSk6KGU9bi5jYW1lbENhc2UoYiksYiBpbiBnP2Q9W2IsZV06KGQ9ZSxkPWQgaW4gZz9bZF06ZC5tYXRjaChFKXx8W10pKSxjPWQubGVuZ3RoO3doaWxlKGMtLSlkZWxldGUgZ1tkW2NdXX19LGhhc0RhdGE6ZnVuY3Rpb24oYSl7cmV0dXJuIW4uaXNFbXB0eU9iamVjdCh0aGlzLmNhY2hlW2FbdGhpcy5leHBhbmRvXV18fHt9KX0sZGlzY2FyZDpmdW5jdGlvbihhKXthW3RoaXMuZXhwYW5kb10mJmRlbGV0ZSB0aGlzLmNhY2hlW2FbdGhpcy5leHBhbmRvXV19fTt2YXIgTD1uZXcgSyxNPW5ldyBLLE49L14oPzpcXHtbXFx3XFxXXSpcXH18XFxbW1xcd1xcV10qXFxdKSQvLE89LyhbQS1aXSkvZztmdW5jdGlvbiBQKGEsYixjKXt2YXIgZDtpZih2b2lkIDA9PT1jJiYxPT09YS5ub2RlVHlwZSlpZihkPVwiZGF0YS1cIitiLnJlcGxhY2UoTyxcIi0kMVwiKS50b0xvd2VyQ2FzZSgpLGM9YS5nZXRBdHRyaWJ1dGUoZCksXCJzdHJpbmdcIj09dHlwZW9mIGMpe3RyeXtjPVwidHJ1ZVwiPT09Yz8hMDpcImZhbHNlXCI9PT1jPyExOlwibnVsbFwiPT09Yz9udWxsOitjK1wiXCI9PT1jPytjOk4udGVzdChjKT9uLnBhcnNlSlNPTihjKTpjfWNhdGNoKGUpe31NLnNldChhLGIsYyl9ZWxzZSBjPXZvaWQgMDtyZXR1cm4gY31uLmV4dGVuZCh7aGFzRGF0YTpmdW5jdGlvbihhKXtyZXR1cm4gTS5oYXNEYXRhKGEpfHxMLmhhc0RhdGEoYSl9LGRhdGE6ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBNLmFjY2VzcyhhLGIsYyl9LHJlbW92ZURhdGE6ZnVuY3Rpb24oYSxiKXtNLnJlbW92ZShhLGIpXG59LF9kYXRhOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTC5hY2Nlc3MoYSxiLGMpfSxfcmVtb3ZlRGF0YTpmdW5jdGlvbihhLGIpe0wucmVtb3ZlKGEsYil9fSksbi5mbi5leHRlbmQoe2RhdGE6ZnVuY3Rpb24oYSxiKXt2YXIgYyxkLGUsZj10aGlzWzBdLGc9ZiYmZi5hdHRyaWJ1dGVzO2lmKHZvaWQgMD09PWEpe2lmKHRoaXMubGVuZ3RoJiYoZT1NLmdldChmKSwxPT09Zi5ub2RlVHlwZSYmIUwuZ2V0KGYsXCJoYXNEYXRhQXR0cnNcIikpKXtjPWcubGVuZ3RoO3doaWxlKGMtLSlnW2NdJiYoZD1nW2NdLm5hbWUsMD09PWQuaW5kZXhPZihcImRhdGEtXCIpJiYoZD1uLmNhbWVsQ2FzZShkLnNsaWNlKDUpKSxQKGYsZCxlW2RdKSkpO0wuc2V0KGYsXCJoYXNEYXRhQXR0cnNcIiwhMCl9cmV0dXJuIGV9cmV0dXJuXCJvYmplY3RcIj09dHlwZW9mIGE/dGhpcy5lYWNoKGZ1bmN0aW9uKCl7TS5zZXQodGhpcyxhKX0pOkoodGhpcyxmdW5jdGlvbihiKXt2YXIgYyxkPW4uY2FtZWxDYXNlKGEpO2lmKGYmJnZvaWQgMD09PWIpe2lmKGM9TS5nZXQoZixhKSx2b2lkIDAhPT1jKXJldHVybiBjO2lmKGM9TS5nZXQoZixkKSx2b2lkIDAhPT1jKXJldHVybiBjO2lmKGM9UChmLGQsdm9pZCAwKSx2b2lkIDAhPT1jKXJldHVybiBjfWVsc2UgdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGM9TS5nZXQodGhpcyxkKTtNLnNldCh0aGlzLGQsYiksLTEhPT1hLmluZGV4T2YoXCItXCIpJiZ2b2lkIDAhPT1jJiZNLnNldCh0aGlzLGEsYil9KX0sbnVsbCxiLGFyZ3VtZW50cy5sZW5ndGg+MSxudWxsLCEwKX0scmVtb3ZlRGF0YTpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7TS5yZW1vdmUodGhpcyxhKX0pfX0pLG4uZXh0ZW5kKHtxdWV1ZTpmdW5jdGlvbihhLGIsYyl7dmFyIGQ7cmV0dXJuIGE/KGI9KGJ8fFwiZnhcIikrXCJxdWV1ZVwiLGQ9TC5nZXQoYSxiKSxjJiYoIWR8fG4uaXNBcnJheShjKT9kPUwuYWNjZXNzKGEsYixuLm1ha2VBcnJheShjKSk6ZC5wdXNoKGMpKSxkfHxbXSk6dm9pZCAwfSxkZXF1ZXVlOmZ1bmN0aW9uKGEsYil7Yj1ifHxcImZ4XCI7dmFyIGM9bi5xdWV1ZShhLGIpLGQ9Yy5sZW5ndGgsZT1jLnNoaWZ0KCksZj1uLl9xdWV1ZUhvb2tzKGEsYiksZz1mdW5jdGlvbigpe24uZGVxdWV1ZShhLGIpfTtcImlucHJvZ3Jlc3NcIj09PWUmJihlPWMuc2hpZnQoKSxkLS0pLGUmJihcImZ4XCI9PT1iJiZjLnVuc2hpZnQoXCJpbnByb2dyZXNzXCIpLGRlbGV0ZSBmLnN0b3AsZS5jYWxsKGEsZyxmKSksIWQmJmYmJmYuZW1wdHkuZmlyZSgpfSxfcXVldWVIb29rczpmdW5jdGlvbihhLGIpe3ZhciBjPWIrXCJxdWV1ZUhvb2tzXCI7cmV0dXJuIEwuZ2V0KGEsYyl8fEwuYWNjZXNzKGEsYyx7ZW1wdHk6bi5DYWxsYmFja3MoXCJvbmNlIG1lbW9yeVwiKS5hZGQoZnVuY3Rpb24oKXtMLnJlbW92ZShhLFtiK1wicXVldWVcIixjXSl9KX0pfX0pLG4uZm4uZXh0ZW5kKHtxdWV1ZTpmdW5jdGlvbihhLGIpe3ZhciBjPTI7cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGEmJihiPWEsYT1cImZ4XCIsYy0tKSxhcmd1bWVudHMubGVuZ3RoPGM/bi5xdWV1ZSh0aGlzWzBdLGEpOnZvaWQgMD09PWI/dGhpczp0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgYz1uLnF1ZXVlKHRoaXMsYSxiKTtuLl9xdWV1ZUhvb2tzKHRoaXMsYSksXCJmeFwiPT09YSYmXCJpbnByb2dyZXNzXCIhPT1jWzBdJiZuLmRlcXVldWUodGhpcyxhKX0pfSxkZXF1ZXVlOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXtuLmRlcXVldWUodGhpcyxhKX0pfSxjbGVhclF1ZXVlOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnF1ZXVlKGF8fFwiZnhcIixbXSl9LHByb21pc2U6ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPTEsZT1uLkRlZmVycmVkKCksZj10aGlzLGc9dGhpcy5sZW5ndGgsaD1mdW5jdGlvbigpey0tZHx8ZS5yZXNvbHZlV2l0aChmLFtmXSl9O1wic3RyaW5nXCIhPXR5cGVvZiBhJiYoYj1hLGE9dm9pZCAwKSxhPWF8fFwiZnhcIjt3aGlsZShnLS0pYz1MLmdldChmW2ddLGErXCJxdWV1ZUhvb2tzXCIpLGMmJmMuZW1wdHkmJihkKyssYy5lbXB0eS5hZGQoaCkpO3JldHVybiBoKCksZS5wcm9taXNlKGIpfX0pO3ZhciBRPS9bKy1dPyg/OlxcZCpcXC58KVxcZCsoPzpbZUVdWystXT9cXGQrfCkvLnNvdXJjZSxSPVtcIlRvcFwiLFwiUmlnaHRcIixcIkJvdHRvbVwiLFwiTGVmdFwiXSxTPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9Ynx8YSxcIm5vbmVcIj09PW4uY3NzKGEsXCJkaXNwbGF5XCIpfHwhbi5jb250YWlucyhhLm93bmVyRG9jdW1lbnQsYSl9LFQ9L14oPzpjaGVja2JveHxyYWRpbykkL2k7IWZ1bmN0aW9uKCl7dmFyIGE9bC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksYj1hLmFwcGVuZENoaWxkKGwuY3JlYXRlRWxlbWVudChcImRpdlwiKSksYz1sLmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtjLnNldEF0dHJpYnV0ZShcInR5cGVcIixcInJhZGlvXCIpLGMuc2V0QXR0cmlidXRlKFwiY2hlY2tlZFwiLFwiY2hlY2tlZFwiKSxjLnNldEF0dHJpYnV0ZShcIm5hbWVcIixcInRcIiksYi5hcHBlbmRDaGlsZChjKSxrLmNoZWNrQ2xvbmU9Yi5jbG9uZU5vZGUoITApLmNsb25lTm9kZSghMCkubGFzdENoaWxkLmNoZWNrZWQsYi5pbm5lckhUTUw9XCI8dGV4dGFyZWE+eDwvdGV4dGFyZWE+XCIsay5ub0Nsb25lQ2hlY2tlZD0hIWIuY2xvbmVOb2RlKCEwKS5sYXN0Q2hpbGQuZGVmYXVsdFZhbHVlfSgpO3ZhciBVPVwidW5kZWZpbmVkXCI7ay5mb2N1c2luQnViYmxlcz1cIm9uZm9jdXNpblwiaW4gYTt2YXIgVj0vXmtleS8sVz0vXig/Om1vdXNlfHBvaW50ZXJ8Y29udGV4dG1lbnUpfGNsaWNrLyxYPS9eKD86Zm9jdXNpbmZvY3VzfGZvY3Vzb3V0Ymx1cikkLyxZPS9eKFteLl0qKSg/OlxcLiguKyl8KSQvO2Z1bmN0aW9uIFooKXtyZXR1cm4hMH1mdW5jdGlvbiAkKCl7cmV0dXJuITF9ZnVuY3Rpb24gXygpe3RyeXtyZXR1cm4gbC5hY3RpdmVFbGVtZW50fWNhdGNoKGEpe319bi5ldmVudD17Z2xvYmFsOnt9LGFkZDpmdW5jdGlvbihhLGIsYyxkLGUpe3ZhciBmLGcsaCxpLGosayxsLG0sbyxwLHEscj1MLmdldChhKTtpZihyKXtjLmhhbmRsZXImJihmPWMsYz1mLmhhbmRsZXIsZT1mLnNlbGVjdG9yKSxjLmd1aWR8fChjLmd1aWQ9bi5ndWlkKyspLChpPXIuZXZlbnRzKXx8KGk9ci5ldmVudHM9e30pLChnPXIuaGFuZGxlKXx8KGc9ci5oYW5kbGU9ZnVuY3Rpb24oYil7cmV0dXJuIHR5cGVvZiBuIT09VSYmbi5ldmVudC50cmlnZ2VyZWQhPT1iLnR5cGU/bi5ldmVudC5kaXNwYXRjaC5hcHBseShhLGFyZ3VtZW50cyk6dm9pZCAwfSksYj0oYnx8XCJcIikubWF0Y2goRSl8fFtcIlwiXSxqPWIubGVuZ3RoO3doaWxlKGotLSloPVkuZXhlYyhiW2pdKXx8W10sbz1xPWhbMV0scD0oaFsyXXx8XCJcIikuc3BsaXQoXCIuXCIpLnNvcnQoKSxvJiYobD1uLmV2ZW50LnNwZWNpYWxbb118fHt9LG89KGU/bC5kZWxlZ2F0ZVR5cGU6bC5iaW5kVHlwZSl8fG8sbD1uLmV2ZW50LnNwZWNpYWxbb118fHt9LGs9bi5leHRlbmQoe3R5cGU6byxvcmlnVHlwZTpxLGRhdGE6ZCxoYW5kbGVyOmMsZ3VpZDpjLmd1aWQsc2VsZWN0b3I6ZSxuZWVkc0NvbnRleHQ6ZSYmbi5leHByLm1hdGNoLm5lZWRzQ29udGV4dC50ZXN0KGUpLG5hbWVzcGFjZTpwLmpvaW4oXCIuXCIpfSxmKSwobT1pW29dKXx8KG09aVtvXT1bXSxtLmRlbGVnYXRlQ291bnQ9MCxsLnNldHVwJiZsLnNldHVwLmNhbGwoYSxkLHAsZykhPT0hMXx8YS5hZGRFdmVudExpc3RlbmVyJiZhLmFkZEV2ZW50TGlzdGVuZXIobyxnLCExKSksbC5hZGQmJihsLmFkZC5jYWxsKGEsayksay5oYW5kbGVyLmd1aWR8fChrLmhhbmRsZXIuZ3VpZD1jLmd1aWQpKSxlP20uc3BsaWNlKG0uZGVsZWdhdGVDb3VudCsrLDAsayk6bS5wdXNoKGspLG4uZXZlbnQuZ2xvYmFsW29dPSEwKX19LHJlbW92ZTpmdW5jdGlvbihhLGIsYyxkLGUpe3ZhciBmLGcsaCxpLGosayxsLG0sbyxwLHEscj1MLmhhc0RhdGEoYSkmJkwuZ2V0KGEpO2lmKHImJihpPXIuZXZlbnRzKSl7Yj0oYnx8XCJcIikubWF0Y2goRSl8fFtcIlwiXSxqPWIubGVuZ3RoO3doaWxlKGotLSlpZihoPVkuZXhlYyhiW2pdKXx8W10sbz1xPWhbMV0scD0oaFsyXXx8XCJcIikuc3BsaXQoXCIuXCIpLnNvcnQoKSxvKXtsPW4uZXZlbnQuc3BlY2lhbFtvXXx8e30sbz0oZD9sLmRlbGVnYXRlVHlwZTpsLmJpbmRUeXBlKXx8byxtPWlbb118fFtdLGg9aFsyXSYmbmV3IFJlZ0V4cChcIihefFxcXFwuKVwiK3Auam9pbihcIlxcXFwuKD86LipcXFxcLnwpXCIpK1wiKFxcXFwufCQpXCIpLGc9Zj1tLmxlbmd0aDt3aGlsZShmLS0paz1tW2ZdLCFlJiZxIT09ay5vcmlnVHlwZXx8YyYmYy5ndWlkIT09ay5ndWlkfHxoJiYhaC50ZXN0KGsubmFtZXNwYWNlKXx8ZCYmZCE9PWsuc2VsZWN0b3ImJihcIioqXCIhPT1kfHwhay5zZWxlY3Rvcil8fChtLnNwbGljZShmLDEpLGsuc2VsZWN0b3ImJm0uZGVsZWdhdGVDb3VudC0tLGwucmVtb3ZlJiZsLnJlbW92ZS5jYWxsKGEsaykpO2cmJiFtLmxlbmd0aCYmKGwudGVhcmRvd24mJmwudGVhcmRvd24uY2FsbChhLHAsci5oYW5kbGUpIT09ITF8fG4ucmVtb3ZlRXZlbnQoYSxvLHIuaGFuZGxlKSxkZWxldGUgaVtvXSl9ZWxzZSBmb3IobyBpbiBpKW4uZXZlbnQucmVtb3ZlKGEsbytiW2pdLGMsZCwhMCk7bi5pc0VtcHR5T2JqZWN0KGkpJiYoZGVsZXRlIHIuaGFuZGxlLEwucmVtb3ZlKGEsXCJldmVudHNcIikpfX0sdHJpZ2dlcjpmdW5jdGlvbihiLGMsZCxlKXt2YXIgZixnLGgsaSxrLG0sbyxwPVtkfHxsXSxxPWouY2FsbChiLFwidHlwZVwiKT9iLnR5cGU6YixyPWouY2FsbChiLFwibmFtZXNwYWNlXCIpP2IubmFtZXNwYWNlLnNwbGl0KFwiLlwiKTpbXTtpZihnPWg9ZD1kfHxsLDMhPT1kLm5vZGVUeXBlJiY4IT09ZC5ub2RlVHlwZSYmIVgudGVzdChxK24uZXZlbnQudHJpZ2dlcmVkKSYmKHEuaW5kZXhPZihcIi5cIik+PTAmJihyPXEuc3BsaXQoXCIuXCIpLHE9ci5zaGlmdCgpLHIuc29ydCgpKSxrPXEuaW5kZXhPZihcIjpcIik8MCYmXCJvblwiK3EsYj1iW24uZXhwYW5kb10/YjpuZXcgbi5FdmVudChxLFwib2JqZWN0XCI9PXR5cGVvZiBiJiZiKSxiLmlzVHJpZ2dlcj1lPzI6MyxiLm5hbWVzcGFjZT1yLmpvaW4oXCIuXCIpLGIubmFtZXNwYWNlX3JlPWIubmFtZXNwYWNlP25ldyBSZWdFeHAoXCIoXnxcXFxcLilcIityLmpvaW4oXCJcXFxcLig/Oi4qXFxcXC58KVwiKStcIihcXFxcLnwkKVwiKTpudWxsLGIucmVzdWx0PXZvaWQgMCxiLnRhcmdldHx8KGIudGFyZ2V0PWQpLGM9bnVsbD09Yz9bYl06bi5tYWtlQXJyYXkoYyxbYl0pLG89bi5ldmVudC5zcGVjaWFsW3FdfHx7fSxlfHwhby50cmlnZ2VyfHxvLnRyaWdnZXIuYXBwbHkoZCxjKSE9PSExKSl7aWYoIWUmJiFvLm5vQnViYmxlJiYhbi5pc1dpbmRvdyhkKSl7Zm9yKGk9by5kZWxlZ2F0ZVR5cGV8fHEsWC50ZXN0KGkrcSl8fChnPWcucGFyZW50Tm9kZSk7ZztnPWcucGFyZW50Tm9kZSlwLnB1c2goZyksaD1nO2g9PT0oZC5vd25lckRvY3VtZW50fHxsKSYmcC5wdXNoKGguZGVmYXVsdFZpZXd8fGgucGFyZW50V2luZG93fHxhKX1mPTA7d2hpbGUoKGc9cFtmKytdKSYmIWIuaXNQcm9wYWdhdGlvblN0b3BwZWQoKSliLnR5cGU9Zj4xP2k6by5iaW5kVHlwZXx8cSxtPShMLmdldChnLFwiZXZlbnRzXCIpfHx7fSlbYi50eXBlXSYmTC5nZXQoZyxcImhhbmRsZVwiKSxtJiZtLmFwcGx5KGcsYyksbT1rJiZnW2tdLG0mJm0uYXBwbHkmJm4uYWNjZXB0RGF0YShnKSYmKGIucmVzdWx0PW0uYXBwbHkoZyxjKSxiLnJlc3VsdD09PSExJiZiLnByZXZlbnREZWZhdWx0KCkpO3JldHVybiBiLnR5cGU9cSxlfHxiLmlzRGVmYXVsdFByZXZlbnRlZCgpfHxvLl9kZWZhdWx0JiZvLl9kZWZhdWx0LmFwcGx5KHAucG9wKCksYykhPT0hMXx8IW4uYWNjZXB0RGF0YShkKXx8ayYmbi5pc0Z1bmN0aW9uKGRbcV0pJiYhbi5pc1dpbmRvdyhkKSYmKGg9ZFtrXSxoJiYoZFtrXT1udWxsKSxuLmV2ZW50LnRyaWdnZXJlZD1xLGRbcV0oKSxuLmV2ZW50LnRyaWdnZXJlZD12b2lkIDAsaCYmKGRba109aCkpLGIucmVzdWx0fX0sZGlzcGF0Y2g6ZnVuY3Rpb24oYSl7YT1uLmV2ZW50LmZpeChhKTt2YXIgYixjLGUsZixnLGg9W10saT1kLmNhbGwoYXJndW1lbnRzKSxqPShMLmdldCh0aGlzLFwiZXZlbnRzXCIpfHx7fSlbYS50eXBlXXx8W10saz1uLmV2ZW50LnNwZWNpYWxbYS50eXBlXXx8e307aWYoaVswXT1hLGEuZGVsZWdhdGVUYXJnZXQ9dGhpcywhay5wcmVEaXNwYXRjaHx8ay5wcmVEaXNwYXRjaC5jYWxsKHRoaXMsYSkhPT0hMSl7aD1uLmV2ZW50LmhhbmRsZXJzLmNhbGwodGhpcyxhLGopLGI9MDt3aGlsZSgoZj1oW2IrK10pJiYhYS5pc1Byb3BhZ2F0aW9uU3RvcHBlZCgpKXthLmN1cnJlbnRUYXJnZXQ9Zi5lbGVtLGM9MDt3aGlsZSgoZz1mLmhhbmRsZXJzW2MrK10pJiYhYS5pc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCgpKSghYS5uYW1lc3BhY2VfcmV8fGEubmFtZXNwYWNlX3JlLnRlc3QoZy5uYW1lc3BhY2UpKSYmKGEuaGFuZGxlT2JqPWcsYS5kYXRhPWcuZGF0YSxlPSgobi5ldmVudC5zcGVjaWFsW2cub3JpZ1R5cGVdfHx7fSkuaGFuZGxlfHxnLmhhbmRsZXIpLmFwcGx5KGYuZWxlbSxpKSx2b2lkIDAhPT1lJiYoYS5yZXN1bHQ9ZSk9PT0hMSYmKGEucHJldmVudERlZmF1bHQoKSxhLnN0b3BQcm9wYWdhdGlvbigpKSl9cmV0dXJuIGsucG9zdERpc3BhdGNoJiZrLnBvc3REaXNwYXRjaC5jYWxsKHRoaXMsYSksYS5yZXN1bHR9fSxoYW5kbGVyczpmdW5jdGlvbihhLGIpe3ZhciBjLGQsZSxmLGc9W10saD1iLmRlbGVnYXRlQ291bnQsaT1hLnRhcmdldDtpZihoJiZpLm5vZGVUeXBlJiYoIWEuYnV0dG9ufHxcImNsaWNrXCIhPT1hLnR5cGUpKWZvcig7aSE9PXRoaXM7aT1pLnBhcmVudE5vZGV8fHRoaXMpaWYoaS5kaXNhYmxlZCE9PSEwfHxcImNsaWNrXCIhPT1hLnR5cGUpe2ZvcihkPVtdLGM9MDtoPmM7YysrKWY9YltjXSxlPWYuc2VsZWN0b3IrXCIgXCIsdm9pZCAwPT09ZFtlXSYmKGRbZV09Zi5uZWVkc0NvbnRleHQ/bihlLHRoaXMpLmluZGV4KGkpPj0wOm4uZmluZChlLHRoaXMsbnVsbCxbaV0pLmxlbmd0aCksZFtlXSYmZC5wdXNoKGYpO2QubGVuZ3RoJiZnLnB1c2goe2VsZW06aSxoYW5kbGVyczpkfSl9cmV0dXJuIGg8Yi5sZW5ndGgmJmcucHVzaCh7ZWxlbTp0aGlzLGhhbmRsZXJzOmIuc2xpY2UoaCl9KSxnfSxwcm9wczpcImFsdEtleSBidWJibGVzIGNhbmNlbGFibGUgY3RybEtleSBjdXJyZW50VGFyZ2V0IGV2ZW50UGhhc2UgbWV0YUtleSByZWxhdGVkVGFyZ2V0IHNoaWZ0S2V5IHRhcmdldCB0aW1lU3RhbXAgdmlldyB3aGljaFwiLnNwbGl0KFwiIFwiKSxmaXhIb29rczp7fSxrZXlIb29rczp7cHJvcHM6XCJjaGFyIGNoYXJDb2RlIGtleSBrZXlDb2RlXCIuc3BsaXQoXCIgXCIpLGZpbHRlcjpmdW5jdGlvbihhLGIpe3JldHVybiBudWxsPT1hLndoaWNoJiYoYS53aGljaD1udWxsIT1iLmNoYXJDb2RlP2IuY2hhckNvZGU6Yi5rZXlDb2RlKSxhfX0sbW91c2VIb29rczp7cHJvcHM6XCJidXR0b24gYnV0dG9ucyBjbGllbnRYIGNsaWVudFkgb2Zmc2V0WCBvZmZzZXRZIHBhZ2VYIHBhZ2VZIHNjcmVlblggc2NyZWVuWSB0b0VsZW1lbnRcIi5zcGxpdChcIiBcIiksZmlsdGVyOmZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlLGY9Yi5idXR0b247cmV0dXJuIG51bGw9PWEucGFnZVgmJm51bGwhPWIuY2xpZW50WCYmKGM9YS50YXJnZXQub3duZXJEb2N1bWVudHx8bCxkPWMuZG9jdW1lbnRFbGVtZW50LGU9Yy5ib2R5LGEucGFnZVg9Yi5jbGllbnRYKyhkJiZkLnNjcm9sbExlZnR8fGUmJmUuc2Nyb2xsTGVmdHx8MCktKGQmJmQuY2xpZW50TGVmdHx8ZSYmZS5jbGllbnRMZWZ0fHwwKSxhLnBhZ2VZPWIuY2xpZW50WSsoZCYmZC5zY3JvbGxUb3B8fGUmJmUuc2Nyb2xsVG9wfHwwKS0oZCYmZC5jbGllbnRUb3B8fGUmJmUuY2xpZW50VG9wfHwwKSksYS53aGljaHx8dm9pZCAwPT09Znx8KGEud2hpY2g9MSZmPzE6MiZmPzM6NCZmPzI6MCksYX19LGZpeDpmdW5jdGlvbihhKXtpZihhW24uZXhwYW5kb10pcmV0dXJuIGE7dmFyIGIsYyxkLGU9YS50eXBlLGY9YSxnPXRoaXMuZml4SG9va3NbZV07Z3x8KHRoaXMuZml4SG9va3NbZV09Zz1XLnRlc3QoZSk/dGhpcy5tb3VzZUhvb2tzOlYudGVzdChlKT90aGlzLmtleUhvb2tzOnt9KSxkPWcucHJvcHM/dGhpcy5wcm9wcy5jb25jYXQoZy5wcm9wcyk6dGhpcy5wcm9wcyxhPW5ldyBuLkV2ZW50KGYpLGI9ZC5sZW5ndGg7d2hpbGUoYi0tKWM9ZFtiXSxhW2NdPWZbY107cmV0dXJuIGEudGFyZ2V0fHwoYS50YXJnZXQ9bCksMz09PWEudGFyZ2V0Lm5vZGVUeXBlJiYoYS50YXJnZXQ9YS50YXJnZXQucGFyZW50Tm9kZSksZy5maWx0ZXI/Zy5maWx0ZXIoYSxmKTphfSxzcGVjaWFsOntsb2FkOntub0J1YmJsZTohMH0sZm9jdXM6e3RyaWdnZXI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcyE9PV8oKSYmdGhpcy5mb2N1cz8odGhpcy5mb2N1cygpLCExKTp2b2lkIDB9LGRlbGVnYXRlVHlwZTpcImZvY3VzaW5cIn0sYmx1cjp7dHJpZ2dlcjpmdW5jdGlvbigpe3JldHVybiB0aGlzPT09XygpJiZ0aGlzLmJsdXI/KHRoaXMuYmx1cigpLCExKTp2b2lkIDB9LGRlbGVnYXRlVHlwZTpcImZvY3Vzb3V0XCJ9LGNsaWNrOnt0cmlnZ2VyOmZ1bmN0aW9uKCl7cmV0dXJuXCJjaGVja2JveFwiPT09dGhpcy50eXBlJiZ0aGlzLmNsaWNrJiZuLm5vZGVOYW1lKHRoaXMsXCJpbnB1dFwiKT8odGhpcy5jbGljaygpLCExKTp2b2lkIDB9LF9kZWZhdWx0OmZ1bmN0aW9uKGEpe3JldHVybiBuLm5vZGVOYW1lKGEudGFyZ2V0LFwiYVwiKX19LGJlZm9yZXVubG9hZDp7cG9zdERpc3BhdGNoOmZ1bmN0aW9uKGEpe3ZvaWQgMCE9PWEucmVzdWx0JiZhLm9yaWdpbmFsRXZlbnQmJihhLm9yaWdpbmFsRXZlbnQucmV0dXJuVmFsdWU9YS5yZXN1bHQpfX19LHNpbXVsYXRlOmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPW4uZXh0ZW5kKG5ldyBuLkV2ZW50LGMse3R5cGU6YSxpc1NpbXVsYXRlZDohMCxvcmlnaW5hbEV2ZW50Ont9fSk7ZD9uLmV2ZW50LnRyaWdnZXIoZSxudWxsLGIpOm4uZXZlbnQuZGlzcGF0Y2guY2FsbChiLGUpLGUuaXNEZWZhdWx0UHJldmVudGVkKCkmJmMucHJldmVudERlZmF1bHQoKX19LG4ucmVtb3ZlRXZlbnQ9ZnVuY3Rpb24oYSxiLGMpe2EucmVtb3ZlRXZlbnRMaXN0ZW5lciYmYS5yZW1vdmVFdmVudExpc3RlbmVyKGIsYywhMSl9LG4uRXZlbnQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIG4uRXZlbnQ/KGEmJmEudHlwZT8odGhpcy5vcmlnaW5hbEV2ZW50PWEsdGhpcy50eXBlPWEudHlwZSx0aGlzLmlzRGVmYXVsdFByZXZlbnRlZD1hLmRlZmF1bHRQcmV2ZW50ZWR8fHZvaWQgMD09PWEuZGVmYXVsdFByZXZlbnRlZCYmYS5yZXR1cm5WYWx1ZT09PSExP1o6JCk6dGhpcy50eXBlPWEsYiYmbi5leHRlbmQodGhpcyxiKSx0aGlzLnRpbWVTdGFtcD1hJiZhLnRpbWVTdGFtcHx8bi5ub3coKSx2b2lkKHRoaXNbbi5leHBhbmRvXT0hMCkpOm5ldyBuLkV2ZW50KGEsYil9LG4uRXZlbnQucHJvdG90eXBlPXtpc0RlZmF1bHRQcmV2ZW50ZWQ6JCxpc1Byb3BhZ2F0aW9uU3RvcHBlZDokLGlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkOiQscHJldmVudERlZmF1bHQ6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLm9yaWdpbmFsRXZlbnQ7dGhpcy5pc0RlZmF1bHRQcmV2ZW50ZWQ9WixhJiZhLnByZXZlbnREZWZhdWx0JiZhLnByZXZlbnREZWZhdWx0KCl9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbigpe3ZhciBhPXRoaXMub3JpZ2luYWxFdmVudDt0aGlzLmlzUHJvcGFnYXRpb25TdG9wcGVkPVosYSYmYS5zdG9wUHJvcGFnYXRpb24mJmEuc3RvcFByb3BhZ2F0aW9uKCl9LHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbjpmdW5jdGlvbigpe3ZhciBhPXRoaXMub3JpZ2luYWxFdmVudDt0aGlzLmlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkPVosYSYmYS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24mJmEuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksdGhpcy5zdG9wUHJvcGFnYXRpb24oKX19LG4uZWFjaCh7bW91c2VlbnRlcjpcIm1vdXNlb3ZlclwiLG1vdXNlbGVhdmU6XCJtb3VzZW91dFwiLHBvaW50ZXJlbnRlcjpcInBvaW50ZXJvdmVyXCIscG9pbnRlcmxlYXZlOlwicG9pbnRlcm91dFwifSxmdW5jdGlvbihhLGIpe24uZXZlbnQuc3BlY2lhbFthXT17ZGVsZWdhdGVUeXBlOmIsYmluZFR5cGU6YixoYW5kbGU6ZnVuY3Rpb24oYSl7dmFyIGMsZD10aGlzLGU9YS5yZWxhdGVkVGFyZ2V0LGY9YS5oYW5kbGVPYmo7cmV0dXJuKCFlfHxlIT09ZCYmIW4uY29udGFpbnMoZCxlKSkmJihhLnR5cGU9Zi5vcmlnVHlwZSxjPWYuaGFuZGxlci5hcHBseSh0aGlzLGFyZ3VtZW50cyksYS50eXBlPWIpLGN9fX0pLGsuZm9jdXNpbkJ1YmJsZXN8fG4uZWFjaCh7Zm9jdXM6XCJmb2N1c2luXCIsYmx1cjpcImZvY3Vzb3V0XCJ9LGZ1bmN0aW9uKGEsYil7dmFyIGM9ZnVuY3Rpb24oYSl7bi5ldmVudC5zaW11bGF0ZShiLGEudGFyZ2V0LG4uZXZlbnQuZml4KGEpLCEwKX07bi5ldmVudC5zcGVjaWFsW2JdPXtzZXR1cDpmdW5jdGlvbigpe3ZhciBkPXRoaXMub3duZXJEb2N1bWVudHx8dGhpcyxlPUwuYWNjZXNzKGQsYik7ZXx8ZC5hZGRFdmVudExpc3RlbmVyKGEsYywhMCksTC5hY2Nlc3MoZCxiLChlfHwwKSsxKX0sdGVhcmRvd246ZnVuY3Rpb24oKXt2YXIgZD10aGlzLm93bmVyRG9jdW1lbnR8fHRoaXMsZT1MLmFjY2VzcyhkLGIpLTE7ZT9MLmFjY2VzcyhkLGIsZSk6KGQucmVtb3ZlRXZlbnRMaXN0ZW5lcihhLGMsITApLEwucmVtb3ZlKGQsYikpfX19KSxuLmZuLmV4dGVuZCh7b246ZnVuY3Rpb24oYSxiLGMsZCxlKXt2YXIgZixnO2lmKFwib2JqZWN0XCI9PXR5cGVvZiBhKXtcInN0cmluZ1wiIT10eXBlb2YgYiYmKGM9Y3x8YixiPXZvaWQgMCk7Zm9yKGcgaW4gYSl0aGlzLm9uKGcsYixjLGFbZ10sZSk7cmV0dXJuIHRoaXN9aWYobnVsbD09YyYmbnVsbD09ZD8oZD1iLGM9Yj12b2lkIDApOm51bGw9PWQmJihcInN0cmluZ1wiPT10eXBlb2YgYj8oZD1jLGM9dm9pZCAwKTooZD1jLGM9YixiPXZvaWQgMCkpLGQ9PT0hMSlkPSQ7ZWxzZSBpZighZClyZXR1cm4gdGhpcztyZXR1cm4gMT09PWUmJihmPWQsZD1mdW5jdGlvbihhKXtyZXR1cm4gbigpLm9mZihhKSxmLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sZC5ndWlkPWYuZ3VpZHx8KGYuZ3VpZD1uLmd1aWQrKykpLHRoaXMuZWFjaChmdW5jdGlvbigpe24uZXZlbnQuYWRkKHRoaXMsYSxkLGMsYil9KX0sb25lOmZ1bmN0aW9uKGEsYixjLGQpe3JldHVybiB0aGlzLm9uKGEsYixjLGQsMSl9LG9mZjpmdW5jdGlvbihhLGIsYyl7dmFyIGQsZTtpZihhJiZhLnByZXZlbnREZWZhdWx0JiZhLmhhbmRsZU9iailyZXR1cm4gZD1hLmhhbmRsZU9iaixuKGEuZGVsZWdhdGVUYXJnZXQpLm9mZihkLm5hbWVzcGFjZT9kLm9yaWdUeXBlK1wiLlwiK2QubmFtZXNwYWNlOmQub3JpZ1R5cGUsZC5zZWxlY3RvcixkLmhhbmRsZXIpLHRoaXM7aWYoXCJvYmplY3RcIj09dHlwZW9mIGEpe2ZvcihlIGluIGEpdGhpcy5vZmYoZSxiLGFbZV0pO3JldHVybiB0aGlzfXJldHVybihiPT09ITF8fFwiZnVuY3Rpb25cIj09dHlwZW9mIGIpJiYoYz1iLGI9dm9pZCAwKSxjPT09ITEmJihjPSQpLHRoaXMuZWFjaChmdW5jdGlvbigpe24uZXZlbnQucmVtb3ZlKHRoaXMsYSxjLGIpfSl9LHRyaWdnZXI6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7bi5ldmVudC50cmlnZ2VyKGEsYix0aGlzKX0pfSx0cmlnZ2VySGFuZGxlcjpmdW5jdGlvbihhLGIpe3ZhciBjPXRoaXNbMF07cmV0dXJuIGM/bi5ldmVudC50cmlnZ2VyKGEsYixjLCEwKTp2b2lkIDB9fSk7dmFyIGFiPS88KD8hYXJlYXxicnxjb2x8ZW1iZWR8aHJ8aW1nfGlucHV0fGxpbmt8bWV0YXxwYXJhbSkoKFtcXHc6XSspW14+XSopXFwvPi9naSxiYj0vPChbXFx3Ol0rKS8sY2I9Lzx8JiM/XFx3KzsvLGRiPS88KD86c2NyaXB0fHN0eWxlfGxpbmspL2ksZWI9L2NoZWNrZWRcXHMqKD86W149XXw9XFxzKi5jaGVja2VkLikvaSxmYj0vXiR8XFwvKD86amF2YXxlY21hKXNjcmlwdC9pLGdiPS9edHJ1ZVxcLyguKikvLGhiPS9eXFxzKjwhKD86XFxbQ0RBVEFcXFt8LS0pfCg/OlxcXVxcXXwtLSk+XFxzKiQvZyxpYj17b3B0aW9uOlsxLFwiPHNlbGVjdCBtdWx0aXBsZT0nbXVsdGlwbGUnPlwiLFwiPC9zZWxlY3Q+XCJdLHRoZWFkOlsxLFwiPHRhYmxlPlwiLFwiPC90YWJsZT5cIl0sY29sOlsyLFwiPHRhYmxlPjxjb2xncm91cD5cIixcIjwvY29sZ3JvdXA+PC90YWJsZT5cIl0sdHI6WzIsXCI8dGFibGU+PHRib2R5PlwiLFwiPC90Ym9keT48L3RhYmxlPlwiXSx0ZDpbMyxcIjx0YWJsZT48dGJvZHk+PHRyPlwiLFwiPC90cj48L3Rib2R5PjwvdGFibGU+XCJdLF9kZWZhdWx0OlswLFwiXCIsXCJcIl19O2liLm9wdGdyb3VwPWliLm9wdGlvbixpYi50Ym9keT1pYi50Zm9vdD1pYi5jb2xncm91cD1pYi5jYXB0aW9uPWliLnRoZWFkLGliLnRoPWliLnRkO2Z1bmN0aW9uIGpiKGEsYil7cmV0dXJuIG4ubm9kZU5hbWUoYSxcInRhYmxlXCIpJiZuLm5vZGVOYW1lKDExIT09Yi5ub2RlVHlwZT9iOmIuZmlyc3RDaGlsZCxcInRyXCIpP2EuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0Ym9keVwiKVswXXx8YS5hcHBlbmRDaGlsZChhLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRib2R5XCIpKTphfWZ1bmN0aW9uIGtiKGEpe3JldHVybiBhLnR5cGU9KG51bGwhPT1hLmdldEF0dHJpYnV0ZShcInR5cGVcIikpK1wiL1wiK2EudHlwZSxhfWZ1bmN0aW9uIGxiKGEpe3ZhciBiPWdiLmV4ZWMoYS50eXBlKTtyZXR1cm4gYj9hLnR5cGU9YlsxXTphLnJlbW92ZUF0dHJpYnV0ZShcInR5cGVcIiksYX1mdW5jdGlvbiBtYihhLGIpe2Zvcih2YXIgYz0wLGQ9YS5sZW5ndGg7ZD5jO2MrKylMLnNldChhW2NdLFwiZ2xvYmFsRXZhbFwiLCFifHxMLmdldChiW2NdLFwiZ2xvYmFsRXZhbFwiKSl9ZnVuY3Rpb24gbmIoYSxiKXt2YXIgYyxkLGUsZixnLGgsaSxqO2lmKDE9PT1iLm5vZGVUeXBlKXtpZihMLmhhc0RhdGEoYSkmJihmPUwuYWNjZXNzKGEpLGc9TC5zZXQoYixmKSxqPWYuZXZlbnRzKSl7ZGVsZXRlIGcuaGFuZGxlLGcuZXZlbnRzPXt9O2ZvcihlIGluIGopZm9yKGM9MCxkPWpbZV0ubGVuZ3RoO2Q+YztjKyspbi5ldmVudC5hZGQoYixlLGpbZV1bY10pfU0uaGFzRGF0YShhKSYmKGg9TS5hY2Nlc3MoYSksaT1uLmV4dGVuZCh7fSxoKSxNLnNldChiLGkpKX19ZnVuY3Rpb24gb2IoYSxiKXt2YXIgYz1hLmdldEVsZW1lbnRzQnlUYWdOYW1lP2EuZ2V0RWxlbWVudHNCeVRhZ05hbWUoYnx8XCIqXCIpOmEucXVlcnlTZWxlY3RvckFsbD9hLnF1ZXJ5U2VsZWN0b3JBbGwoYnx8XCIqXCIpOltdO3JldHVybiB2b2lkIDA9PT1ifHxiJiZuLm5vZGVOYW1lKGEsYik/bi5tZXJnZShbYV0sYyk6Y31mdW5jdGlvbiBwYihhLGIpe3ZhciBjPWIubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcImlucHV0XCI9PT1jJiZULnRlc3QoYS50eXBlKT9iLmNoZWNrZWQ9YS5jaGVja2VkOihcImlucHV0XCI9PT1jfHxcInRleHRhcmVhXCI9PT1jKSYmKGIuZGVmYXVsdFZhbHVlPWEuZGVmYXVsdFZhbHVlKX1uLmV4dGVuZCh7Y2xvbmU6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGUsZixnLGg9YS5jbG9uZU5vZGUoITApLGk9bi5jb250YWlucyhhLm93bmVyRG9jdW1lbnQsYSk7aWYoIShrLm5vQ2xvbmVDaGVja2VkfHwxIT09YS5ub2RlVHlwZSYmMTEhPT1hLm5vZGVUeXBlfHxuLmlzWE1MRG9jKGEpKSlmb3IoZz1vYihoKSxmPW9iKGEpLGQ9MCxlPWYubGVuZ3RoO2U+ZDtkKyspcGIoZltkXSxnW2RdKTtpZihiKWlmKGMpZm9yKGY9Znx8b2IoYSksZz1nfHxvYihoKSxkPTAsZT1mLmxlbmd0aDtlPmQ7ZCsrKW5iKGZbZF0sZ1tkXSk7ZWxzZSBuYihhLGgpO3JldHVybiBnPW9iKGgsXCJzY3JpcHRcIiksZy5sZW5ndGg+MCYmbWIoZywhaSYmb2IoYSxcInNjcmlwdFwiKSksaH0sYnVpbGRGcmFnbWVudDpmdW5jdGlvbihhLGIsYyxkKXtmb3IodmFyIGUsZixnLGgsaSxqLGs9Yi5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksbD1bXSxtPTAsbz1hLmxlbmd0aDtvPm07bSsrKWlmKGU9YVttXSxlfHwwPT09ZSlpZihcIm9iamVjdFwiPT09bi50eXBlKGUpKW4ubWVyZ2UobCxlLm5vZGVUeXBlP1tlXTplKTtlbHNlIGlmKGNiLnRlc3QoZSkpe2Y9Znx8ay5hcHBlbmRDaGlsZChiLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpLGc9KGJiLmV4ZWMoZSl8fFtcIlwiLFwiXCJdKVsxXS50b0xvd2VyQ2FzZSgpLGg9aWJbZ118fGliLl9kZWZhdWx0LGYuaW5uZXJIVE1MPWhbMV0rZS5yZXBsYWNlKGFiLFwiPCQxPjwvJDI+XCIpK2hbMl0saj1oWzBdO3doaWxlKGotLSlmPWYubGFzdENoaWxkO24ubWVyZ2UobCxmLmNoaWxkTm9kZXMpLGY9ay5maXJzdENoaWxkLGYudGV4dENvbnRlbnQ9XCJcIn1lbHNlIGwucHVzaChiLmNyZWF0ZVRleHROb2RlKGUpKTtrLnRleHRDb250ZW50PVwiXCIsbT0wO3doaWxlKGU9bFttKytdKWlmKCghZHx8LTE9PT1uLmluQXJyYXkoZSxkKSkmJihpPW4uY29udGFpbnMoZS5vd25lckRvY3VtZW50LGUpLGY9b2Ioay5hcHBlbmRDaGlsZChlKSxcInNjcmlwdFwiKSxpJiZtYihmKSxjKSl7aj0wO3doaWxlKGU9ZltqKytdKWZiLnRlc3QoZS50eXBlfHxcIlwiKSYmYy5wdXNoKGUpfXJldHVybiBrfSxjbGVhbkRhdGE6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiLGMsZCxlLGY9bi5ldmVudC5zcGVjaWFsLGc9MDt2b2lkIDAhPT0oYz1hW2ddKTtnKyspe2lmKG4uYWNjZXB0RGF0YShjKSYmKGU9Y1tMLmV4cGFuZG9dLGUmJihiPUwuY2FjaGVbZV0pKSl7aWYoYi5ldmVudHMpZm9yKGQgaW4gYi5ldmVudHMpZltkXT9uLmV2ZW50LnJlbW92ZShjLGQpOm4ucmVtb3ZlRXZlbnQoYyxkLGIuaGFuZGxlKTtMLmNhY2hlW2VdJiZkZWxldGUgTC5jYWNoZVtlXX1kZWxldGUgTS5jYWNoZVtjW00uZXhwYW5kb11dfX19KSxuLmZuLmV4dGVuZCh7dGV4dDpmdW5jdGlvbihhKXtyZXR1cm4gSih0aGlzLGZ1bmN0aW9uKGEpe3JldHVybiB2b2lkIDA9PT1hP24udGV4dCh0aGlzKTp0aGlzLmVtcHR5KCkuZWFjaChmdW5jdGlvbigpeygxPT09dGhpcy5ub2RlVHlwZXx8MTE9PT10aGlzLm5vZGVUeXBlfHw5PT09dGhpcy5ub2RlVHlwZSkmJih0aGlzLnRleHRDb250ZW50PWEpfSl9LG51bGwsYSxhcmd1bWVudHMubGVuZ3RoKX0sYXBwZW5kOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZG9tTWFuaXAoYXJndW1lbnRzLGZ1bmN0aW9uKGEpe2lmKDE9PT10aGlzLm5vZGVUeXBlfHwxMT09PXRoaXMubm9kZVR5cGV8fDk9PT10aGlzLm5vZGVUeXBlKXt2YXIgYj1qYih0aGlzLGEpO2IuYXBwZW5kQ2hpbGQoYSl9fSl9LHByZXBlbmQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kb21NYW5pcChhcmd1bWVudHMsZnVuY3Rpb24oYSl7aWYoMT09PXRoaXMubm9kZVR5cGV8fDExPT09dGhpcy5ub2RlVHlwZXx8OT09PXRoaXMubm9kZVR5cGUpe3ZhciBiPWpiKHRoaXMsYSk7Yi5pbnNlcnRCZWZvcmUoYSxiLmZpcnN0Q2hpbGQpfX0pfSxiZWZvcmU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kb21NYW5pcChhcmd1bWVudHMsZnVuY3Rpb24oYSl7dGhpcy5wYXJlbnROb2RlJiZ0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGEsdGhpcyl9KX0sYWZ0ZXI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kb21NYW5pcChhcmd1bWVudHMsZnVuY3Rpb24oYSl7dGhpcy5wYXJlbnROb2RlJiZ0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGEsdGhpcy5uZXh0U2libGluZyl9KX0scmVtb3ZlOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjLGQ9YT9uLmZpbHRlcihhLHRoaXMpOnRoaXMsZT0wO251bGwhPShjPWRbZV0pO2UrKylifHwxIT09Yy5ub2RlVHlwZXx8bi5jbGVhbkRhdGEob2IoYykpLGMucGFyZW50Tm9kZSYmKGImJm4uY29udGFpbnMoYy5vd25lckRvY3VtZW50LGMpJiZtYihvYihjLFwic2NyaXB0XCIpKSxjLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYykpO3JldHVybiB0aGlzfSxlbXB0eTpmdW5jdGlvbigpe2Zvcih2YXIgYSxiPTA7bnVsbCE9KGE9dGhpc1tiXSk7YisrKTE9PT1hLm5vZGVUeXBlJiYobi5jbGVhbkRhdGEob2IoYSwhMSkpLGEudGV4dENvbnRlbnQ9XCJcIik7cmV0dXJuIHRoaXN9LGNsb25lOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9bnVsbD09YT8hMTphLGI9bnVsbD09Yj9hOmIsdGhpcy5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gbi5jbG9uZSh0aGlzLGEsYil9KX0saHRtbDpmdW5jdGlvbihhKXtyZXR1cm4gSih0aGlzLGZ1bmN0aW9uKGEpe3ZhciBiPXRoaXNbMF18fHt9LGM9MCxkPXRoaXMubGVuZ3RoO2lmKHZvaWQgMD09PWEmJjE9PT1iLm5vZGVUeXBlKXJldHVybiBiLmlubmVySFRNTDtpZihcInN0cmluZ1wiPT10eXBlb2YgYSYmIWRiLnRlc3QoYSkmJiFpYlsoYmIuZXhlYyhhKXx8W1wiXCIsXCJcIl0pWzFdLnRvTG93ZXJDYXNlKCldKXthPWEucmVwbGFjZShhYixcIjwkMT48LyQyPlwiKTt0cnl7Zm9yKDtkPmM7YysrKWI9dGhpc1tjXXx8e30sMT09PWIubm9kZVR5cGUmJihuLmNsZWFuRGF0YShvYihiLCExKSksYi5pbm5lckhUTUw9YSk7Yj0wfWNhdGNoKGUpe319YiYmdGhpcy5lbXB0eSgpLmFwcGVuZChhKX0sbnVsbCxhLGFyZ3VtZW50cy5sZW5ndGgpfSxyZXBsYWNlV2l0aDpmdW5jdGlvbigpe3ZhciBhPWFyZ3VtZW50c1swXTtyZXR1cm4gdGhpcy5kb21NYW5pcChhcmd1bWVudHMsZnVuY3Rpb24oYil7YT10aGlzLnBhcmVudE5vZGUsbi5jbGVhbkRhdGEob2IodGhpcykpLGEmJmEucmVwbGFjZUNoaWxkKGIsdGhpcyl9KSxhJiYoYS5sZW5ndGh8fGEubm9kZVR5cGUpP3RoaXM6dGhpcy5yZW1vdmUoKX0sZGV0YWNoOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnJlbW92ZShhLCEwKX0sZG9tTWFuaXA6ZnVuY3Rpb24oYSxiKXthPWUuYXBwbHkoW10sYSk7dmFyIGMsZCxmLGcsaCxpLGo9MCxsPXRoaXMubGVuZ3RoLG09dGhpcyxvPWwtMSxwPWFbMF0scT1uLmlzRnVuY3Rpb24ocCk7aWYocXx8bD4xJiZcInN0cmluZ1wiPT10eXBlb2YgcCYmIWsuY2hlY2tDbG9uZSYmZWIudGVzdChwKSlyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGMpe3ZhciBkPW0uZXEoYyk7cSYmKGFbMF09cC5jYWxsKHRoaXMsYyxkLmh0bWwoKSkpLGQuZG9tTWFuaXAoYSxiKX0pO2lmKGwmJihjPW4uYnVpbGRGcmFnbWVudChhLHRoaXNbMF0ub3duZXJEb2N1bWVudCwhMSx0aGlzKSxkPWMuZmlyc3RDaGlsZCwxPT09Yy5jaGlsZE5vZGVzLmxlbmd0aCYmKGM9ZCksZCkpe2ZvcihmPW4ubWFwKG9iKGMsXCJzY3JpcHRcIiksa2IpLGc9Zi5sZW5ndGg7bD5qO2orKyloPWMsaiE9PW8mJihoPW4uY2xvbmUoaCwhMCwhMCksZyYmbi5tZXJnZShmLG9iKGgsXCJzY3JpcHRcIikpKSxiLmNhbGwodGhpc1tqXSxoLGopO2lmKGcpZm9yKGk9ZltmLmxlbmd0aC0xXS5vd25lckRvY3VtZW50LG4ubWFwKGYsbGIpLGo9MDtnPmo7aisrKWg9ZltqXSxmYi50ZXN0KGgudHlwZXx8XCJcIikmJiFMLmFjY2VzcyhoLFwiZ2xvYmFsRXZhbFwiKSYmbi5jb250YWlucyhpLGgpJiYoaC5zcmM/bi5fZXZhbFVybCYmbi5fZXZhbFVybChoLnNyYyk6bi5nbG9iYWxFdmFsKGgudGV4dENvbnRlbnQucmVwbGFjZShoYixcIlwiKSkpfXJldHVybiB0aGlzfX0pLG4uZWFjaCh7YXBwZW5kVG86XCJhcHBlbmRcIixwcmVwZW5kVG86XCJwcmVwZW5kXCIsaW5zZXJ0QmVmb3JlOlwiYmVmb3JlXCIsaW5zZXJ0QWZ0ZXI6XCJhZnRlclwiLHJlcGxhY2VBbGw6XCJyZXBsYWNlV2l0aFwifSxmdW5jdGlvbihhLGIpe24uZm5bYV09ZnVuY3Rpb24oYSl7Zm9yKHZhciBjLGQ9W10sZT1uKGEpLGc9ZS5sZW5ndGgtMSxoPTA7Zz49aDtoKyspYz1oPT09Zz90aGlzOnRoaXMuY2xvbmUoITApLG4oZVtoXSlbYl0oYyksZi5hcHBseShkLGMuZ2V0KCkpO3JldHVybiB0aGlzLnB1c2hTdGFjayhkKX19KTt2YXIgcWIscmI9e307ZnVuY3Rpb24gc2IoYixjKXt2YXIgZCxlPW4oYy5jcmVhdGVFbGVtZW50KGIpKS5hcHBlbmRUbyhjLmJvZHkpLGY9YS5nZXREZWZhdWx0Q29tcHV0ZWRTdHlsZSYmKGQ9YS5nZXREZWZhdWx0Q29tcHV0ZWRTdHlsZShlWzBdKSk/ZC5kaXNwbGF5Om4uY3NzKGVbMF0sXCJkaXNwbGF5XCIpO3JldHVybiBlLmRldGFjaCgpLGZ9ZnVuY3Rpb24gdGIoYSl7dmFyIGI9bCxjPXJiW2FdO3JldHVybiBjfHwoYz1zYihhLGIpLFwibm9uZVwiIT09YyYmY3x8KHFiPShxYnx8bihcIjxpZnJhbWUgZnJhbWVib3JkZXI9JzAnIHdpZHRoPScwJyBoZWlnaHQ9JzAnLz5cIikpLmFwcGVuZFRvKGIuZG9jdW1lbnRFbGVtZW50KSxiPXFiWzBdLmNvbnRlbnREb2N1bWVudCxiLndyaXRlKCksYi5jbG9zZSgpLGM9c2IoYSxiKSxxYi5kZXRhY2goKSkscmJbYV09YyksY312YXIgdWI9L15tYXJnaW4vLHZiPW5ldyBSZWdFeHAoXCJeKFwiK1ErXCIpKD8hcHgpW2EteiVdKyRcIixcImlcIiksd2I9ZnVuY3Rpb24oYSl7cmV0dXJuIGEub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGEsbnVsbCl9O2Z1bmN0aW9uIHhiKGEsYixjKXt2YXIgZCxlLGYsZyxoPWEuc3R5bGU7cmV0dXJuIGM9Y3x8d2IoYSksYyYmKGc9Yy5nZXRQcm9wZXJ0eVZhbHVlKGIpfHxjW2JdKSxjJiYoXCJcIiE9PWd8fG4uY29udGFpbnMoYS5vd25lckRvY3VtZW50LGEpfHwoZz1uLnN0eWxlKGEsYikpLHZiLnRlc3QoZykmJnViLnRlc3QoYikmJihkPWgud2lkdGgsZT1oLm1pbldpZHRoLGY9aC5tYXhXaWR0aCxoLm1pbldpZHRoPWgubWF4V2lkdGg9aC53aWR0aD1nLGc9Yy53aWR0aCxoLndpZHRoPWQsaC5taW5XaWR0aD1lLGgubWF4V2lkdGg9ZikpLHZvaWQgMCE9PWc/ZytcIlwiOmd9ZnVuY3Rpb24geWIoYSxiKXtyZXR1cm57Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIGEoKT92b2lkIGRlbGV0ZSB0aGlzLmdldDoodGhpcy5nZXQ9YikuYXBwbHkodGhpcyxhcmd1bWVudHMpfX19IWZ1bmN0aW9uKCl7dmFyIGIsYyxkPWwuZG9jdW1lbnRFbGVtZW50LGU9bC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLGY9bC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2lmKGYuc3R5bGUpe2Yuc3R5bGUuYmFja2dyb3VuZENsaXA9XCJjb250ZW50LWJveFwiLGYuY2xvbmVOb2RlKCEwKS5zdHlsZS5iYWNrZ3JvdW5kQ2xpcD1cIlwiLGsuY2xlYXJDbG9uZVN0eWxlPVwiY29udGVudC1ib3hcIj09PWYuc3R5bGUuYmFja2dyb3VuZENsaXAsZS5zdHlsZS5jc3NUZXh0PVwiYm9yZGVyOjA7d2lkdGg6MDtoZWlnaHQ6MDt0b3A6MDtsZWZ0Oi05OTk5cHg7bWFyZ2luLXRvcDoxcHg7cG9zaXRpb246YWJzb2x1dGVcIixlLmFwcGVuZENoaWxkKGYpO2Z1bmN0aW9uIGcoKXtmLnN0eWxlLmNzc1RleHQ9XCItd2Via2l0LWJveC1zaXppbmc6Ym9yZGVyLWJveDstbW96LWJveC1zaXppbmc6Ym9yZGVyLWJveDtib3gtc2l6aW5nOmJvcmRlci1ib3g7ZGlzcGxheTpibG9jazttYXJnaW4tdG9wOjElO3RvcDoxJTtib3JkZXI6MXB4O3BhZGRpbmc6MXB4O3dpZHRoOjRweDtwb3NpdGlvbjphYnNvbHV0ZVwiLGYuaW5uZXJIVE1MPVwiXCIsZC5hcHBlbmRDaGlsZChlKTt2YXIgZz1hLmdldENvbXB1dGVkU3R5bGUoZixudWxsKTtiPVwiMSVcIiE9PWcudG9wLGM9XCI0cHhcIj09PWcud2lkdGgsZC5yZW1vdmVDaGlsZChlKX1hLmdldENvbXB1dGVkU3R5bGUmJm4uZXh0ZW5kKGsse3BpeGVsUG9zaXRpb246ZnVuY3Rpb24oKXtyZXR1cm4gZygpLGJ9LGJveFNpemluZ1JlbGlhYmxlOmZ1bmN0aW9uKCl7cmV0dXJuIG51bGw9PWMmJmcoKSxjfSxyZWxpYWJsZU1hcmdpblJpZ2h0OmZ1bmN0aW9uKCl7dmFyIGIsYz1mLmFwcGVuZENoaWxkKGwuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7cmV0dXJuIGMuc3R5bGUuY3NzVGV4dD1mLnN0eWxlLmNzc1RleHQ9XCItd2Via2l0LWJveC1zaXppbmc6Y29udGVudC1ib3g7LW1vei1ib3gtc2l6aW5nOmNvbnRlbnQtYm94O2JveC1zaXppbmc6Y29udGVudC1ib3g7ZGlzcGxheTpibG9jazttYXJnaW46MDtib3JkZXI6MDtwYWRkaW5nOjBcIixjLnN0eWxlLm1hcmdpblJpZ2h0PWMuc3R5bGUud2lkdGg9XCIwXCIsZi5zdHlsZS53aWR0aD1cIjFweFwiLGQuYXBwZW5kQ2hpbGQoZSksYj0hcGFyc2VGbG9hdChhLmdldENvbXB1dGVkU3R5bGUoYyxudWxsKS5tYXJnaW5SaWdodCksZC5yZW1vdmVDaGlsZChlKSxifX0pfX0oKSxuLnN3YXA9ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGUsZixnPXt9O2ZvcihmIGluIGIpZ1tmXT1hLnN0eWxlW2ZdLGEuc3R5bGVbZl09YltmXTtlPWMuYXBwbHkoYSxkfHxbXSk7Zm9yKGYgaW4gYilhLnN0eWxlW2ZdPWdbZl07cmV0dXJuIGV9O3ZhciB6Yj0vXihub25lfHRhYmxlKD8hLWNbZWFdKS4rKS8sQWI9bmV3IFJlZ0V4cChcIl4oXCIrUStcIikoLiopJFwiLFwiaVwiKSxCYj1uZXcgUmVnRXhwKFwiXihbKy1dKT0oXCIrUStcIilcIixcImlcIiksQ2I9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCJ9LERiPXtsZXR0ZXJTcGFjaW5nOlwiMFwiLGZvbnRXZWlnaHQ6XCI0MDBcIn0sRWI9W1wiV2Via2l0XCIsXCJPXCIsXCJNb3pcIixcIm1zXCJdO2Z1bmN0aW9uIEZiKGEsYil7aWYoYiBpbiBhKXJldHVybiBiO3ZhciBjPWJbMF0udG9VcHBlckNhc2UoKStiLnNsaWNlKDEpLGQ9YixlPUViLmxlbmd0aDt3aGlsZShlLS0paWYoYj1FYltlXStjLGIgaW4gYSlyZXR1cm4gYjtyZXR1cm4gZH1mdW5jdGlvbiBHYihhLGIsYyl7dmFyIGQ9QWIuZXhlYyhiKTtyZXR1cm4gZD9NYXRoLm1heCgwLGRbMV0tKGN8fDApKSsoZFsyXXx8XCJweFwiKTpifWZ1bmN0aW9uIEhiKGEsYixjLGQsZSl7Zm9yKHZhciBmPWM9PT0oZD9cImJvcmRlclwiOlwiY29udGVudFwiKT80Olwid2lkdGhcIj09PWI/MTowLGc9MDs0PmY7Zis9MilcIm1hcmdpblwiPT09YyYmKGcrPW4uY3NzKGEsYytSW2ZdLCEwLGUpKSxkPyhcImNvbnRlbnRcIj09PWMmJihnLT1uLmNzcyhhLFwicGFkZGluZ1wiK1JbZl0sITAsZSkpLFwibWFyZ2luXCIhPT1jJiYoZy09bi5jc3MoYSxcImJvcmRlclwiK1JbZl0rXCJXaWR0aFwiLCEwLGUpKSk6KGcrPW4uY3NzKGEsXCJwYWRkaW5nXCIrUltmXSwhMCxlKSxcInBhZGRpbmdcIiE9PWMmJihnKz1uLmNzcyhhLFwiYm9yZGVyXCIrUltmXStcIldpZHRoXCIsITAsZSkpKTtyZXR1cm4gZ31mdW5jdGlvbiBJYihhLGIsYyl7dmFyIGQ9ITAsZT1cIndpZHRoXCI9PT1iP2Eub2Zmc2V0V2lkdGg6YS5vZmZzZXRIZWlnaHQsZj13YihhKSxnPVwiYm9yZGVyLWJveFwiPT09bi5jc3MoYSxcImJveFNpemluZ1wiLCExLGYpO2lmKDA+PWV8fG51bGw9PWUpe2lmKGU9eGIoYSxiLGYpLCgwPmV8fG51bGw9PWUpJiYoZT1hLnN0eWxlW2JdKSx2Yi50ZXN0KGUpKXJldHVybiBlO2Q9ZyYmKGsuYm94U2l6aW5nUmVsaWFibGUoKXx8ZT09PWEuc3R5bGVbYl0pLGU9cGFyc2VGbG9hdChlKXx8MH1yZXR1cm4gZStIYihhLGIsY3x8KGc/XCJib3JkZXJcIjpcImNvbnRlbnRcIiksZCxmKStcInB4XCJ9ZnVuY3Rpb24gSmIoYSxiKXtmb3IodmFyIGMsZCxlLGY9W10sZz0wLGg9YS5sZW5ndGg7aD5nO2crKylkPWFbZ10sZC5zdHlsZSYmKGZbZ109TC5nZXQoZCxcIm9sZGRpc3BsYXlcIiksYz1kLnN0eWxlLmRpc3BsYXksYj8oZltnXXx8XCJub25lXCIhPT1jfHwoZC5zdHlsZS5kaXNwbGF5PVwiXCIpLFwiXCI9PT1kLnN0eWxlLmRpc3BsYXkmJlMoZCkmJihmW2ddPUwuYWNjZXNzKGQsXCJvbGRkaXNwbGF5XCIsdGIoZC5ub2RlTmFtZSkpKSk6KGU9UyhkKSxcIm5vbmVcIj09PWMmJmV8fEwuc2V0KGQsXCJvbGRkaXNwbGF5XCIsZT9jOm4uY3NzKGQsXCJkaXNwbGF5XCIpKSkpO2ZvcihnPTA7aD5nO2crKylkPWFbZ10sZC5zdHlsZSYmKGImJlwibm9uZVwiIT09ZC5zdHlsZS5kaXNwbGF5JiZcIlwiIT09ZC5zdHlsZS5kaXNwbGF5fHwoZC5zdHlsZS5kaXNwbGF5PWI/ZltnXXx8XCJcIjpcIm5vbmVcIikpO3JldHVybiBhfW4uZXh0ZW5kKHtjc3NIb29rczp7b3BhY2l0eTp7Z2V0OmZ1bmN0aW9uKGEsYil7aWYoYil7dmFyIGM9eGIoYSxcIm9wYWNpdHlcIik7cmV0dXJuXCJcIj09PWM/XCIxXCI6Y319fX0sY3NzTnVtYmVyOntjb2x1bW5Db3VudDohMCxmaWxsT3BhY2l0eTohMCxmbGV4R3JvdzohMCxmbGV4U2hyaW5rOiEwLGZvbnRXZWlnaHQ6ITAsbGluZUhlaWdodDohMCxvcGFjaXR5OiEwLG9yZGVyOiEwLG9ycGhhbnM6ITAsd2lkb3dzOiEwLHpJbmRleDohMCx6b29tOiEwfSxjc3NQcm9wczp7XCJmbG9hdFwiOlwiY3NzRmxvYXRcIn0sc3R5bGU6ZnVuY3Rpb24oYSxiLGMsZCl7aWYoYSYmMyE9PWEubm9kZVR5cGUmJjghPT1hLm5vZGVUeXBlJiZhLnN0eWxlKXt2YXIgZSxmLGcsaD1uLmNhbWVsQ2FzZShiKSxpPWEuc3R5bGU7cmV0dXJuIGI9bi5jc3NQcm9wc1toXXx8KG4uY3NzUHJvcHNbaF09RmIoaSxoKSksZz1uLmNzc0hvb2tzW2JdfHxuLmNzc0hvb2tzW2hdLHZvaWQgMD09PWM/ZyYmXCJnZXRcImluIGcmJnZvaWQgMCE9PShlPWcuZ2V0KGEsITEsZCkpP2U6aVtiXTooZj10eXBlb2YgYyxcInN0cmluZ1wiPT09ZiYmKGU9QmIuZXhlYyhjKSkmJihjPShlWzFdKzEpKmVbMl0rcGFyc2VGbG9hdChuLmNzcyhhLGIpKSxmPVwibnVtYmVyXCIpLG51bGwhPWMmJmM9PT1jJiYoXCJudW1iZXJcIiE9PWZ8fG4uY3NzTnVtYmVyW2hdfHwoYys9XCJweFwiKSxrLmNsZWFyQ2xvbmVTdHlsZXx8XCJcIiE9PWN8fDAhPT1iLmluZGV4T2YoXCJiYWNrZ3JvdW5kXCIpfHwoaVtiXT1cImluaGVyaXRcIiksZyYmXCJzZXRcImluIGcmJnZvaWQgMD09PShjPWcuc2V0KGEsYyxkKSl8fChpW2JdPWMpKSx2b2lkIDApfX0sY3NzOmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlLGYsZyxoPW4uY2FtZWxDYXNlKGIpO3JldHVybiBiPW4uY3NzUHJvcHNbaF18fChuLmNzc1Byb3BzW2hdPUZiKGEuc3R5bGUsaCkpLGc9bi5jc3NIb29rc1tiXXx8bi5jc3NIb29rc1toXSxnJiZcImdldFwiaW4gZyYmKGU9Zy5nZXQoYSwhMCxjKSksdm9pZCAwPT09ZSYmKGU9eGIoYSxiLGQpKSxcIm5vcm1hbFwiPT09ZSYmYiBpbiBEYiYmKGU9RGJbYl0pLFwiXCI9PT1jfHxjPyhmPXBhcnNlRmxvYXQoZSksYz09PSEwfHxuLmlzTnVtZXJpYyhmKT9mfHwwOmUpOmV9fSksbi5lYWNoKFtcImhlaWdodFwiLFwid2lkdGhcIl0sZnVuY3Rpb24oYSxiKXtuLmNzc0hvb2tzW2JdPXtnZXQ6ZnVuY3Rpb24oYSxjLGQpe3JldHVybiBjP3piLnRlc3Qobi5jc3MoYSxcImRpc3BsYXlcIikpJiYwPT09YS5vZmZzZXRXaWR0aD9uLnN3YXAoYSxDYixmdW5jdGlvbigpe3JldHVybiBJYihhLGIsZCl9KTpJYihhLGIsZCk6dm9pZCAwfSxzZXQ6ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWQmJndiKGEpO3JldHVybiBHYihhLGMsZD9IYihhLGIsZCxcImJvcmRlci1ib3hcIj09PW4uY3NzKGEsXCJib3hTaXppbmdcIiwhMSxlKSxlKTowKX19fSksbi5jc3NIb29rcy5tYXJnaW5SaWdodD15YihrLnJlbGlhYmxlTWFyZ2luUmlnaHQsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj9uLnN3YXAoYSx7ZGlzcGxheTpcImlubGluZS1ibG9ja1wifSx4YixbYSxcIm1hcmdpblJpZ2h0XCJdKTp2b2lkIDB9KSxuLmVhY2goe21hcmdpbjpcIlwiLHBhZGRpbmc6XCJcIixib3JkZXI6XCJXaWR0aFwifSxmdW5jdGlvbihhLGIpe24uY3NzSG9va3NbYStiXT17ZXhwYW5kOmZ1bmN0aW9uKGMpe2Zvcih2YXIgZD0wLGU9e30sZj1cInN0cmluZ1wiPT10eXBlb2YgYz9jLnNwbGl0KFwiIFwiKTpbY107ND5kO2QrKyllW2ErUltkXStiXT1mW2RdfHxmW2QtMl18fGZbMF07cmV0dXJuIGV9fSx1Yi50ZXN0KGEpfHwobi5jc3NIb29rc1thK2JdLnNldD1HYil9KSxuLmZuLmV4dGVuZCh7Y3NzOmZ1bmN0aW9uKGEsYil7cmV0dXJuIEoodGhpcyxmdW5jdGlvbihhLGIsYyl7dmFyIGQsZSxmPXt9LGc9MDtpZihuLmlzQXJyYXkoYikpe2ZvcihkPXdiKGEpLGU9Yi5sZW5ndGg7ZT5nO2crKylmW2JbZ11dPW4uY3NzKGEsYltnXSwhMSxkKTtyZXR1cm4gZn1yZXR1cm4gdm9pZCAwIT09Yz9uLnN0eWxlKGEsYixjKTpuLmNzcyhhLGIpfSxhLGIsYXJndW1lbnRzLmxlbmd0aD4xKX0sc2hvdzpmdW5jdGlvbigpe3JldHVybiBKYih0aGlzLCEwKX0saGlkZTpmdW5jdGlvbigpe3JldHVybiBKYih0aGlzKX0sdG9nZ2xlOmZ1bmN0aW9uKGEpe3JldHVyblwiYm9vbGVhblwiPT10eXBlb2YgYT9hP3RoaXMuc2hvdygpOnRoaXMuaGlkZSgpOnRoaXMuZWFjaChmdW5jdGlvbigpe1ModGhpcyk/bih0aGlzKS5zaG93KCk6bih0aGlzKS5oaWRlKCl9KX19KTtmdW5jdGlvbiBLYihhLGIsYyxkLGUpe3JldHVybiBuZXcgS2IucHJvdG90eXBlLmluaXQoYSxiLGMsZCxlKX1uLlR3ZWVuPUtiLEtiLnByb3RvdHlwZT17Y29uc3RydWN0b3I6S2IsaW5pdDpmdW5jdGlvbihhLGIsYyxkLGUsZil7dGhpcy5lbGVtPWEsdGhpcy5wcm9wPWMsdGhpcy5lYXNpbmc9ZXx8XCJzd2luZ1wiLHRoaXMub3B0aW9ucz1iLHRoaXMuc3RhcnQ9dGhpcy5ub3c9dGhpcy5jdXIoKSx0aGlzLmVuZD1kLHRoaXMudW5pdD1mfHwobi5jc3NOdW1iZXJbY10/XCJcIjpcInB4XCIpfSxjdXI6ZnVuY3Rpb24oKXt2YXIgYT1LYi5wcm9wSG9va3NbdGhpcy5wcm9wXTtyZXR1cm4gYSYmYS5nZXQ/YS5nZXQodGhpcyk6S2IucHJvcEhvb2tzLl9kZWZhdWx0LmdldCh0aGlzKX0scnVuOmZ1bmN0aW9uKGEpe3ZhciBiLGM9S2IucHJvcEhvb2tzW3RoaXMucHJvcF07cmV0dXJuIHRoaXMucG9zPWI9dGhpcy5vcHRpb25zLmR1cmF0aW9uP24uZWFzaW5nW3RoaXMuZWFzaW5nXShhLHRoaXMub3B0aW9ucy5kdXJhdGlvbiphLDAsMSx0aGlzLm9wdGlvbnMuZHVyYXRpb24pOmEsdGhpcy5ub3c9KHRoaXMuZW5kLXRoaXMuc3RhcnQpKmIrdGhpcy5zdGFydCx0aGlzLm9wdGlvbnMuc3RlcCYmdGhpcy5vcHRpb25zLnN0ZXAuY2FsbCh0aGlzLmVsZW0sdGhpcy5ub3csdGhpcyksYyYmYy5zZXQ/Yy5zZXQodGhpcyk6S2IucHJvcEhvb2tzLl9kZWZhdWx0LnNldCh0aGlzKSx0aGlzfX0sS2IucHJvdG90eXBlLmluaXQucHJvdG90eXBlPUtiLnByb3RvdHlwZSxLYi5wcm9wSG9va3M9e19kZWZhdWx0OntnZXQ6ZnVuY3Rpb24oYSl7dmFyIGI7cmV0dXJuIG51bGw9PWEuZWxlbVthLnByb3BdfHxhLmVsZW0uc3R5bGUmJm51bGwhPWEuZWxlbS5zdHlsZVthLnByb3BdPyhiPW4uY3NzKGEuZWxlbSxhLnByb3AsXCJcIiksYiYmXCJhdXRvXCIhPT1iP2I6MCk6YS5lbGVtW2EucHJvcF19LHNldDpmdW5jdGlvbihhKXtuLmZ4LnN0ZXBbYS5wcm9wXT9uLmZ4LnN0ZXBbYS5wcm9wXShhKTphLmVsZW0uc3R5bGUmJihudWxsIT1hLmVsZW0uc3R5bGVbbi5jc3NQcm9wc1thLnByb3BdXXx8bi5jc3NIb29rc1thLnByb3BdKT9uLnN0eWxlKGEuZWxlbSxhLnByb3AsYS5ub3crYS51bml0KTphLmVsZW1bYS5wcm9wXT1hLm5vd319fSxLYi5wcm9wSG9va3Muc2Nyb2xsVG9wPUtiLnByb3BIb29rcy5zY3JvbGxMZWZ0PXtzZXQ6ZnVuY3Rpb24oYSl7YS5lbGVtLm5vZGVUeXBlJiZhLmVsZW0ucGFyZW50Tm9kZSYmKGEuZWxlbVthLnByb3BdPWEubm93KX19LG4uZWFzaW5nPXtsaW5lYXI6ZnVuY3Rpb24oYSl7cmV0dXJuIGF9LHN3aW5nOmZ1bmN0aW9uKGEpe3JldHVybi41LU1hdGguY29zKGEqTWF0aC5QSSkvMn19LG4uZng9S2IucHJvdG90eXBlLmluaXQsbi5meC5zdGVwPXt9O3ZhciBMYixNYixOYj0vXig/OnRvZ2dsZXxzaG93fGhpZGUpJC8sT2I9bmV3IFJlZ0V4cChcIl4oPzooWystXSk9fCkoXCIrUStcIikoW2EteiVdKikkXCIsXCJpXCIpLFBiPS9xdWV1ZUhvb2tzJC8sUWI9W1ZiXSxSYj17XCIqXCI6W2Z1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5jcmVhdGVUd2VlbihhLGIpLGQ9Yy5jdXIoKSxlPU9iLmV4ZWMoYiksZj1lJiZlWzNdfHwobi5jc3NOdW1iZXJbYV0/XCJcIjpcInB4XCIpLGc9KG4uY3NzTnVtYmVyW2FdfHxcInB4XCIhPT1mJiYrZCkmJk9iLmV4ZWMobi5jc3MoYy5lbGVtLGEpKSxoPTEsaT0yMDtpZihnJiZnWzNdIT09Zil7Zj1mfHxnWzNdLGU9ZXx8W10sZz0rZHx8MTtkbyBoPWh8fFwiLjVcIixnLz1oLG4uc3R5bGUoYy5lbGVtLGEsZytmKTt3aGlsZShoIT09KGg9Yy5jdXIoKS9kKSYmMSE9PWgmJi0taSl9cmV0dXJuIGUmJihnPWMuc3RhcnQ9K2d8fCtkfHwwLGMudW5pdD1mLGMuZW5kPWVbMV0/ZysoZVsxXSsxKSplWzJdOitlWzJdKSxjfV19O2Z1bmN0aW9uIFNiKCl7cmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtMYj12b2lkIDB9KSxMYj1uLm5vdygpfWZ1bmN0aW9uIFRiKGEsYil7dmFyIGMsZD0wLGU9e2hlaWdodDphfTtmb3IoYj1iPzE6MDs0PmQ7ZCs9Mi1iKWM9UltkXSxlW1wibWFyZ2luXCIrY109ZVtcInBhZGRpbmdcIitjXT1hO3JldHVybiBiJiYoZS5vcGFjaXR5PWUud2lkdGg9YSksZX1mdW5jdGlvbiBVYihhLGIsYyl7Zm9yKHZhciBkLGU9KFJiW2JdfHxbXSkuY29uY2F0KFJiW1wiKlwiXSksZj0wLGc9ZS5sZW5ndGg7Zz5mO2YrKylpZihkPWVbZl0uY2FsbChjLGIsYSkpcmV0dXJuIGR9ZnVuY3Rpb24gVmIoYSxiLGMpe3ZhciBkLGUsZixnLGgsaSxqLGssbD10aGlzLG09e30sbz1hLnN0eWxlLHA9YS5ub2RlVHlwZSYmUyhhKSxxPUwuZ2V0KGEsXCJmeHNob3dcIik7Yy5xdWV1ZXx8KGg9bi5fcXVldWVIb29rcyhhLFwiZnhcIiksbnVsbD09aC51bnF1ZXVlZCYmKGgudW5xdWV1ZWQ9MCxpPWguZW1wdHkuZmlyZSxoLmVtcHR5LmZpcmU9ZnVuY3Rpb24oKXtoLnVucXVldWVkfHxpKCl9KSxoLnVucXVldWVkKyssbC5hbHdheXMoZnVuY3Rpb24oKXtsLmFsd2F5cyhmdW5jdGlvbigpe2gudW5xdWV1ZWQtLSxuLnF1ZXVlKGEsXCJmeFwiKS5sZW5ndGh8fGguZW1wdHkuZmlyZSgpfSl9KSksMT09PWEubm9kZVR5cGUmJihcImhlaWdodFwiaW4gYnx8XCJ3aWR0aFwiaW4gYikmJihjLm92ZXJmbG93PVtvLm92ZXJmbG93LG8ub3ZlcmZsb3dYLG8ub3ZlcmZsb3dZXSxqPW4uY3NzKGEsXCJkaXNwbGF5XCIpLGs9XCJub25lXCI9PT1qP0wuZ2V0KGEsXCJvbGRkaXNwbGF5XCIpfHx0YihhLm5vZGVOYW1lKTpqLFwiaW5saW5lXCI9PT1rJiZcIm5vbmVcIj09PW4uY3NzKGEsXCJmbG9hdFwiKSYmKG8uZGlzcGxheT1cImlubGluZS1ibG9ja1wiKSksYy5vdmVyZmxvdyYmKG8ub3ZlcmZsb3c9XCJoaWRkZW5cIixsLmFsd2F5cyhmdW5jdGlvbigpe28ub3ZlcmZsb3c9Yy5vdmVyZmxvd1swXSxvLm92ZXJmbG93WD1jLm92ZXJmbG93WzFdLG8ub3ZlcmZsb3dZPWMub3ZlcmZsb3dbMl19KSk7Zm9yKGQgaW4gYilpZihlPWJbZF0sTmIuZXhlYyhlKSl7aWYoZGVsZXRlIGJbZF0sZj1mfHxcInRvZ2dsZVwiPT09ZSxlPT09KHA/XCJoaWRlXCI6XCJzaG93XCIpKXtpZihcInNob3dcIiE9PWV8fCFxfHx2b2lkIDA9PT1xW2RdKWNvbnRpbnVlO3A9ITB9bVtkXT1xJiZxW2RdfHxuLnN0eWxlKGEsZCl9ZWxzZSBqPXZvaWQgMDtpZihuLmlzRW1wdHlPYmplY3QobSkpXCJpbmxpbmVcIj09PShcIm5vbmVcIj09PWo/dGIoYS5ub2RlTmFtZSk6aikmJihvLmRpc3BsYXk9aik7ZWxzZXtxP1wiaGlkZGVuXCJpbiBxJiYocD1xLmhpZGRlbik6cT1MLmFjY2VzcyhhLFwiZnhzaG93XCIse30pLGYmJihxLmhpZGRlbj0hcCkscD9uKGEpLnNob3coKTpsLmRvbmUoZnVuY3Rpb24oKXtuKGEpLmhpZGUoKX0pLGwuZG9uZShmdW5jdGlvbigpe3ZhciBiO0wucmVtb3ZlKGEsXCJmeHNob3dcIik7Zm9yKGIgaW4gbSluLnN0eWxlKGEsYixtW2JdKX0pO2ZvcihkIGluIG0pZz1VYihwP3FbZF06MCxkLGwpLGQgaW4gcXx8KHFbZF09Zy5zdGFydCxwJiYoZy5lbmQ9Zy5zdGFydCxnLnN0YXJ0PVwid2lkdGhcIj09PWR8fFwiaGVpZ2h0XCI9PT1kPzE6MCkpfX1mdW5jdGlvbiBXYihhLGIpe3ZhciBjLGQsZSxmLGc7Zm9yKGMgaW4gYSlpZihkPW4uY2FtZWxDYXNlKGMpLGU9YltkXSxmPWFbY10sbi5pc0FycmF5KGYpJiYoZT1mWzFdLGY9YVtjXT1mWzBdKSxjIT09ZCYmKGFbZF09ZixkZWxldGUgYVtjXSksZz1uLmNzc0hvb2tzW2RdLGcmJlwiZXhwYW5kXCJpbiBnKXtmPWcuZXhwYW5kKGYpLGRlbGV0ZSBhW2RdO2ZvcihjIGluIGYpYyBpbiBhfHwoYVtjXT1mW2NdLGJbY109ZSl9ZWxzZSBiW2RdPWV9ZnVuY3Rpb24gWGIoYSxiLGMpe3ZhciBkLGUsZj0wLGc9UWIubGVuZ3RoLGg9bi5EZWZlcnJlZCgpLmFsd2F5cyhmdW5jdGlvbigpe2RlbGV0ZSBpLmVsZW19KSxpPWZ1bmN0aW9uKCl7aWYoZSlyZXR1cm4hMTtmb3IodmFyIGI9TGJ8fFNiKCksYz1NYXRoLm1heCgwLGouc3RhcnRUaW1lK2ouZHVyYXRpb24tYiksZD1jL2ouZHVyYXRpb258fDAsZj0xLWQsZz0wLGk9ai50d2VlbnMubGVuZ3RoO2k+ZztnKyspai50d2VlbnNbZ10ucnVuKGYpO3JldHVybiBoLm5vdGlmeVdpdGgoYSxbaixmLGNdKSwxPmYmJmk/YzooaC5yZXNvbHZlV2l0aChhLFtqXSksITEpfSxqPWgucHJvbWlzZSh7ZWxlbTphLHByb3BzOm4uZXh0ZW5kKHt9LGIpLG9wdHM6bi5leHRlbmQoITAse3NwZWNpYWxFYXNpbmc6e319LGMpLG9yaWdpbmFsUHJvcGVydGllczpiLG9yaWdpbmFsT3B0aW9uczpjLHN0YXJ0VGltZTpMYnx8U2IoKSxkdXJhdGlvbjpjLmR1cmF0aW9uLHR3ZWVuczpbXSxjcmVhdGVUd2VlbjpmdW5jdGlvbihiLGMpe3ZhciBkPW4uVHdlZW4oYSxqLm9wdHMsYixjLGoub3B0cy5zcGVjaWFsRWFzaW5nW2JdfHxqLm9wdHMuZWFzaW5nKTtyZXR1cm4gai50d2VlbnMucHVzaChkKSxkfSxzdG9wOmZ1bmN0aW9uKGIpe3ZhciBjPTAsZD1iP2oudHdlZW5zLmxlbmd0aDowO2lmKGUpcmV0dXJuIHRoaXM7Zm9yKGU9ITA7ZD5jO2MrKylqLnR3ZWVuc1tjXS5ydW4oMSk7cmV0dXJuIGI/aC5yZXNvbHZlV2l0aChhLFtqLGJdKTpoLnJlamVjdFdpdGgoYSxbaixiXSksdGhpc319KSxrPWoucHJvcHM7Zm9yKFdiKGssai5vcHRzLnNwZWNpYWxFYXNpbmcpO2c+ZjtmKyspaWYoZD1RYltmXS5jYWxsKGosYSxrLGoub3B0cykpcmV0dXJuIGQ7cmV0dXJuIG4ubWFwKGssVWIsaiksbi5pc0Z1bmN0aW9uKGoub3B0cy5zdGFydCkmJmoub3B0cy5zdGFydC5jYWxsKGEsaiksbi5meC50aW1lcihuLmV4dGVuZChpLHtlbGVtOmEsYW5pbTpqLHF1ZXVlOmoub3B0cy5xdWV1ZX0pKSxqLnByb2dyZXNzKGoub3B0cy5wcm9ncmVzcykuZG9uZShqLm9wdHMuZG9uZSxqLm9wdHMuY29tcGxldGUpLmZhaWwoai5vcHRzLmZhaWwpLmFsd2F5cyhqLm9wdHMuYWx3YXlzKX1uLkFuaW1hdGlvbj1uLmV4dGVuZChYYix7dHdlZW5lcjpmdW5jdGlvbihhLGIpe24uaXNGdW5jdGlvbihhKT8oYj1hLGE9W1wiKlwiXSk6YT1hLnNwbGl0KFwiIFwiKTtmb3IodmFyIGMsZD0wLGU9YS5sZW5ndGg7ZT5kO2QrKyljPWFbZF0sUmJbY109UmJbY118fFtdLFJiW2NdLnVuc2hpZnQoYil9LHByZWZpbHRlcjpmdW5jdGlvbihhLGIpe2I/UWIudW5zaGlmdChhKTpRYi5wdXNoKGEpfX0pLG4uc3BlZWQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWEmJlwib2JqZWN0XCI9PXR5cGVvZiBhP24uZXh0ZW5kKHt9LGEpOntjb21wbGV0ZTpjfHwhYyYmYnx8bi5pc0Z1bmN0aW9uKGEpJiZhLGR1cmF0aW9uOmEsZWFzaW5nOmMmJmJ8fGImJiFuLmlzRnVuY3Rpb24oYikmJmJ9O3JldHVybiBkLmR1cmF0aW9uPW4uZngub2ZmPzA6XCJudW1iZXJcIj09dHlwZW9mIGQuZHVyYXRpb24/ZC5kdXJhdGlvbjpkLmR1cmF0aW9uIGluIG4uZnguc3BlZWRzP24uZnguc3BlZWRzW2QuZHVyYXRpb25dOm4uZnguc3BlZWRzLl9kZWZhdWx0LChudWxsPT1kLnF1ZXVlfHxkLnF1ZXVlPT09ITApJiYoZC5xdWV1ZT1cImZ4XCIpLGQub2xkPWQuY29tcGxldGUsZC5jb21wbGV0ZT1mdW5jdGlvbigpe24uaXNGdW5jdGlvbihkLm9sZCkmJmQub2xkLmNhbGwodGhpcyksZC5xdWV1ZSYmbi5kZXF1ZXVlKHRoaXMsZC5xdWV1ZSl9LGR9LG4uZm4uZXh0ZW5kKHtmYWRlVG86ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIHRoaXMuZmlsdGVyKFMpLmNzcyhcIm9wYWNpdHlcIiwwKS5zaG93KCkuZW5kKCkuYW5pbWF0ZSh7b3BhY2l0eTpifSxhLGMsZCl9LGFuaW1hdGU6ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9bi5pc0VtcHR5T2JqZWN0KGEpLGY9bi5zcGVlZChiLGMsZCksZz1mdW5jdGlvbigpe3ZhciBiPVhiKHRoaXMsbi5leHRlbmQoe30sYSksZik7KGV8fEwuZ2V0KHRoaXMsXCJmaW5pc2hcIikpJiZiLnN0b3AoITApfTtyZXR1cm4gZy5maW5pc2g9ZyxlfHxmLnF1ZXVlPT09ITE/dGhpcy5lYWNoKGcpOnRoaXMucXVldWUoZi5xdWV1ZSxnKX0sc3RvcDpmdW5jdGlvbihhLGIsYyl7dmFyIGQ9ZnVuY3Rpb24oYSl7dmFyIGI9YS5zdG9wO2RlbGV0ZSBhLnN0b3AsYihjKX07cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGEmJihjPWIsYj1hLGE9dm9pZCAwKSxiJiZhIT09ITEmJnRoaXMucXVldWUoYXx8XCJmeFwiLFtdKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgYj0hMCxlPW51bGwhPWEmJmErXCJxdWV1ZUhvb2tzXCIsZj1uLnRpbWVycyxnPUwuZ2V0KHRoaXMpO2lmKGUpZ1tlXSYmZ1tlXS5zdG9wJiZkKGdbZV0pO2Vsc2UgZm9yKGUgaW4gZylnW2VdJiZnW2VdLnN0b3AmJlBiLnRlc3QoZSkmJmQoZ1tlXSk7Zm9yKGU9Zi5sZW5ndGg7ZS0tOylmW2VdLmVsZW0hPT10aGlzfHxudWxsIT1hJiZmW2VdLnF1ZXVlIT09YXx8KGZbZV0uYW5pbS5zdG9wKGMpLGI9ITEsZi5zcGxpY2UoZSwxKSk7KGJ8fCFjKSYmbi5kZXF1ZXVlKHRoaXMsYSl9KX0sZmluaXNoOmZ1bmN0aW9uKGEpe3JldHVybiBhIT09ITEmJihhPWF8fFwiZnhcIiksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGIsYz1MLmdldCh0aGlzKSxkPWNbYStcInF1ZXVlXCJdLGU9Y1thK1wicXVldWVIb29rc1wiXSxmPW4udGltZXJzLGc9ZD9kLmxlbmd0aDowO2ZvcihjLmZpbmlzaD0hMCxuLnF1ZXVlKHRoaXMsYSxbXSksZSYmZS5zdG9wJiZlLnN0b3AuY2FsbCh0aGlzLCEwKSxiPWYubGVuZ3RoO2ItLTspZltiXS5lbGVtPT09dGhpcyYmZltiXS5xdWV1ZT09PWEmJihmW2JdLmFuaW0uc3RvcCghMCksZi5zcGxpY2UoYiwxKSk7Zm9yKGI9MDtnPmI7YisrKWRbYl0mJmRbYl0uZmluaXNoJiZkW2JdLmZpbmlzaC5jYWxsKHRoaXMpO2RlbGV0ZSBjLmZpbmlzaH0pfX0pLG4uZWFjaChbXCJ0b2dnbGVcIixcInNob3dcIixcImhpZGVcIl0sZnVuY3Rpb24oYSxiKXt2YXIgYz1uLmZuW2JdO24uZm5bYl09ZnVuY3Rpb24oYSxkLGUpe3JldHVybiBudWxsPT1hfHxcImJvb2xlYW5cIj09dHlwZW9mIGE/Yy5hcHBseSh0aGlzLGFyZ3VtZW50cyk6dGhpcy5hbmltYXRlKFRiKGIsITApLGEsZCxlKX19KSxuLmVhY2goe3NsaWRlRG93bjpUYihcInNob3dcIiksc2xpZGVVcDpUYihcImhpZGVcIiksc2xpZGVUb2dnbGU6VGIoXCJ0b2dnbGVcIiksZmFkZUluOntvcGFjaXR5Olwic2hvd1wifSxmYWRlT3V0OntvcGFjaXR5OlwiaGlkZVwifSxmYWRlVG9nZ2xlOntvcGFjaXR5OlwidG9nZ2xlXCJ9fSxmdW5jdGlvbihhLGIpe24uZm5bYV09ZnVuY3Rpb24oYSxjLGQpe3JldHVybiB0aGlzLmFuaW1hdGUoYixhLGMsZCl9fSksbi50aW1lcnM9W10sbi5meC50aWNrPWZ1bmN0aW9uKCl7dmFyIGEsYj0wLGM9bi50aW1lcnM7Zm9yKExiPW4ubm93KCk7YjxjLmxlbmd0aDtiKyspYT1jW2JdLGEoKXx8Y1tiXSE9PWF8fGMuc3BsaWNlKGItLSwxKTtjLmxlbmd0aHx8bi5meC5zdG9wKCksTGI9dm9pZCAwfSxuLmZ4LnRpbWVyPWZ1bmN0aW9uKGEpe24udGltZXJzLnB1c2goYSksYSgpP24uZnguc3RhcnQoKTpuLnRpbWVycy5wb3AoKX0sbi5meC5pbnRlcnZhbD0xMyxuLmZ4LnN0YXJ0PWZ1bmN0aW9uKCl7TWJ8fChNYj1zZXRJbnRlcnZhbChuLmZ4LnRpY2ssbi5meC5pbnRlcnZhbCkpfSxuLmZ4LnN0b3A9ZnVuY3Rpb24oKXtjbGVhckludGVydmFsKE1iKSxNYj1udWxsfSxuLmZ4LnNwZWVkcz17c2xvdzo2MDAsZmFzdDoyMDAsX2RlZmF1bHQ6NDAwfSxuLmZuLmRlbGF5PWZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9bi5meD9uLmZ4LnNwZWVkc1thXXx8YTphLGI9Ynx8XCJmeFwiLHRoaXMucXVldWUoYixmdW5jdGlvbihiLGMpe3ZhciBkPXNldFRpbWVvdXQoYixhKTtjLnN0b3A9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQoZCl9fSl9LGZ1bmN0aW9uKCl7dmFyIGE9bC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiksYj1sLmNyZWF0ZUVsZW1lbnQoXCJzZWxlY3RcIiksYz1iLmFwcGVuZENoaWxkKGwuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKSk7YS50eXBlPVwiY2hlY2tib3hcIixrLmNoZWNrT249XCJcIiE9PWEudmFsdWUsay5vcHRTZWxlY3RlZD1jLnNlbGVjdGVkLGIuZGlzYWJsZWQ9ITAsay5vcHREaXNhYmxlZD0hYy5kaXNhYmxlZCxhPWwuY3JlYXRlRWxlbWVudChcImlucHV0XCIpLGEudmFsdWU9XCJ0XCIsYS50eXBlPVwicmFkaW9cIixrLnJhZGlvVmFsdWU9XCJ0XCI9PT1hLnZhbHVlfSgpO3ZhciBZYixaYiwkYj1uLmV4cHIuYXR0ckhhbmRsZTtuLmZuLmV4dGVuZCh7YXR0cjpmdW5jdGlvbihhLGIpe3JldHVybiBKKHRoaXMsbi5hdHRyLGEsYixhcmd1bWVudHMubGVuZ3RoPjEpfSxyZW1vdmVBdHRyOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXtuLnJlbW92ZUF0dHIodGhpcyxhKX0pfX0pLG4uZXh0ZW5kKHthdHRyOmZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlLGY9YS5ub2RlVHlwZTtpZihhJiYzIT09ZiYmOCE9PWYmJjIhPT1mKXJldHVybiB0eXBlb2YgYS5nZXRBdHRyaWJ1dGU9PT1VP24ucHJvcChhLGIsYyk6KDE9PT1mJiZuLmlzWE1MRG9jKGEpfHwoYj1iLnRvTG93ZXJDYXNlKCksZD1uLmF0dHJIb29rc1tiXXx8KG4uZXhwci5tYXRjaC5ib29sLnRlc3QoYik/WmI6WWIpKSx2b2lkIDA9PT1jP2QmJlwiZ2V0XCJpbiBkJiZudWxsIT09KGU9ZC5nZXQoYSxiKSk/ZTooZT1uLmZpbmQuYXR0cihhLGIpLG51bGw9PWU/dm9pZCAwOmUpOm51bGwhPT1jP2QmJlwic2V0XCJpbiBkJiZ2b2lkIDAhPT0oZT1kLnNldChhLGMsYikpP2U6KGEuc2V0QXR0cmlidXRlKGIsYytcIlwiKSxjKTp2b2lkIG4ucmVtb3ZlQXR0cihhLGIpKVxufSxyZW1vdmVBdHRyOmZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlPTAsZj1iJiZiLm1hdGNoKEUpO2lmKGYmJjE9PT1hLm5vZGVUeXBlKXdoaWxlKGM9ZltlKytdKWQ9bi5wcm9wRml4W2NdfHxjLG4uZXhwci5tYXRjaC5ib29sLnRlc3QoYykmJihhW2RdPSExKSxhLnJlbW92ZUF0dHJpYnV0ZShjKX0sYXR0ckhvb2tzOnt0eXBlOntzZXQ6ZnVuY3Rpb24oYSxiKXtpZighay5yYWRpb1ZhbHVlJiZcInJhZGlvXCI9PT1iJiZuLm5vZGVOYW1lKGEsXCJpbnB1dFwiKSl7dmFyIGM9YS52YWx1ZTtyZXR1cm4gYS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsYiksYyYmKGEudmFsdWU9YyksYn19fX19KSxaYj17c2V0OmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gYj09PSExP24ucmVtb3ZlQXR0cihhLGMpOmEuc2V0QXR0cmlidXRlKGMsYyksY319LG4uZWFjaChuLmV4cHIubWF0Y2guYm9vbC5zb3VyY2UubWF0Y2goL1xcdysvZyksZnVuY3Rpb24oYSxiKXt2YXIgYz0kYltiXXx8bi5maW5kLmF0dHI7JGJbYl09ZnVuY3Rpb24oYSxiLGQpe3ZhciBlLGY7cmV0dXJuIGR8fChmPSRiW2JdLCRiW2JdPWUsZT1udWxsIT1jKGEsYixkKT9iLnRvTG93ZXJDYXNlKCk6bnVsbCwkYltiXT1mKSxlfX0pO3ZhciBfYj0vXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxidXR0b24pJC9pO24uZm4uZXh0ZW5kKHtwcm9wOmZ1bmN0aW9uKGEsYil7cmV0dXJuIEoodGhpcyxuLnByb3AsYSxiLGFyZ3VtZW50cy5sZW5ndGg+MSl9LHJlbW92ZVByb3A6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzW24ucHJvcEZpeFthXXx8YV19KX19KSxuLmV4dGVuZCh7cHJvcEZpeDp7XCJmb3JcIjpcImh0bWxGb3JcIixcImNsYXNzXCI6XCJjbGFzc05hbWVcIn0scHJvcDpmdW5jdGlvbihhLGIsYyl7dmFyIGQsZSxmLGc9YS5ub2RlVHlwZTtpZihhJiYzIT09ZyYmOCE9PWcmJjIhPT1nKXJldHVybiBmPTEhPT1nfHwhbi5pc1hNTERvYyhhKSxmJiYoYj1uLnByb3BGaXhbYl18fGIsZT1uLnByb3BIb29rc1tiXSksdm9pZCAwIT09Yz9lJiZcInNldFwiaW4gZSYmdm9pZCAwIT09KGQ9ZS5zZXQoYSxjLGIpKT9kOmFbYl09YzplJiZcImdldFwiaW4gZSYmbnVsbCE9PShkPWUuZ2V0KGEsYikpP2Q6YVtiXX0scHJvcEhvb2tzOnt0YWJJbmRleDp7Z2V0OmZ1bmN0aW9uKGEpe3JldHVybiBhLmhhc0F0dHJpYnV0ZShcInRhYmluZGV4XCIpfHxfYi50ZXN0KGEubm9kZU5hbWUpfHxhLmhyZWY/YS50YWJJbmRleDotMX19fX0pLGsub3B0U2VsZWN0ZWR8fChuLnByb3BIb29rcy5zZWxlY3RlZD17Z2V0OmZ1bmN0aW9uKGEpe3ZhciBiPWEucGFyZW50Tm9kZTtyZXR1cm4gYiYmYi5wYXJlbnROb2RlJiZiLnBhcmVudE5vZGUuc2VsZWN0ZWRJbmRleCxudWxsfX0pLG4uZWFjaChbXCJ0YWJJbmRleFwiLFwicmVhZE9ubHlcIixcIm1heExlbmd0aFwiLFwiY2VsbFNwYWNpbmdcIixcImNlbGxQYWRkaW5nXCIsXCJyb3dTcGFuXCIsXCJjb2xTcGFuXCIsXCJ1c2VNYXBcIixcImZyYW1lQm9yZGVyXCIsXCJjb250ZW50RWRpdGFibGVcIl0sZnVuY3Rpb24oKXtuLnByb3BGaXhbdGhpcy50b0xvd2VyQ2FzZSgpXT10aGlzfSk7dmFyIGFjPS9bXFx0XFxyXFxuXFxmXS9nO24uZm4uZXh0ZW5kKHthZGRDbGFzczpmdW5jdGlvbihhKXt2YXIgYixjLGQsZSxmLGcsaD1cInN0cmluZ1wiPT10eXBlb2YgYSYmYSxpPTAsaj10aGlzLmxlbmd0aDtpZihuLmlzRnVuY3Rpb24oYSkpcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihiKXtuKHRoaXMpLmFkZENsYXNzKGEuY2FsbCh0aGlzLGIsdGhpcy5jbGFzc05hbWUpKX0pO2lmKGgpZm9yKGI9KGF8fFwiXCIpLm1hdGNoKEUpfHxbXTtqPmk7aSsrKWlmKGM9dGhpc1tpXSxkPTE9PT1jLm5vZGVUeXBlJiYoYy5jbGFzc05hbWU/KFwiIFwiK2MuY2xhc3NOYW1lK1wiIFwiKS5yZXBsYWNlKGFjLFwiIFwiKTpcIiBcIikpe2Y9MDt3aGlsZShlPWJbZisrXSlkLmluZGV4T2YoXCIgXCIrZStcIiBcIik8MCYmKGQrPWUrXCIgXCIpO2c9bi50cmltKGQpLGMuY2xhc3NOYW1lIT09ZyYmKGMuY2xhc3NOYW1lPWcpfXJldHVybiB0aGlzfSxyZW1vdmVDbGFzczpmdW5jdGlvbihhKXt2YXIgYixjLGQsZSxmLGcsaD0wPT09YXJndW1lbnRzLmxlbmd0aHx8XCJzdHJpbmdcIj09dHlwZW9mIGEmJmEsaT0wLGo9dGhpcy5sZW5ndGg7aWYobi5pc0Z1bmN0aW9uKGEpKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oYil7bih0aGlzKS5yZW1vdmVDbGFzcyhhLmNhbGwodGhpcyxiLHRoaXMuY2xhc3NOYW1lKSl9KTtpZihoKWZvcihiPShhfHxcIlwiKS5tYXRjaChFKXx8W107aj5pO2krKylpZihjPXRoaXNbaV0sZD0xPT09Yy5ub2RlVHlwZSYmKGMuY2xhc3NOYW1lPyhcIiBcIitjLmNsYXNzTmFtZStcIiBcIikucmVwbGFjZShhYyxcIiBcIik6XCJcIikpe2Y9MDt3aGlsZShlPWJbZisrXSl3aGlsZShkLmluZGV4T2YoXCIgXCIrZStcIiBcIik+PTApZD1kLnJlcGxhY2UoXCIgXCIrZStcIiBcIixcIiBcIik7Zz1hP24udHJpbShkKTpcIlwiLGMuY2xhc3NOYW1lIT09ZyYmKGMuY2xhc3NOYW1lPWcpfXJldHVybiB0aGlzfSx0b2dnbGVDbGFzczpmdW5jdGlvbihhLGIpe3ZhciBjPXR5cGVvZiBhO3JldHVyblwiYm9vbGVhblwiPT10eXBlb2YgYiYmXCJzdHJpbmdcIj09PWM/Yj90aGlzLmFkZENsYXNzKGEpOnRoaXMucmVtb3ZlQ2xhc3MoYSk6dGhpcy5lYWNoKG4uaXNGdW5jdGlvbihhKT9mdW5jdGlvbihjKXtuKHRoaXMpLnRvZ2dsZUNsYXNzKGEuY2FsbCh0aGlzLGMsdGhpcy5jbGFzc05hbWUsYiksYil9OmZ1bmN0aW9uKCl7aWYoXCJzdHJpbmdcIj09PWMpe3ZhciBiLGQ9MCxlPW4odGhpcyksZj1hLm1hdGNoKEUpfHxbXTt3aGlsZShiPWZbZCsrXSllLmhhc0NsYXNzKGIpP2UucmVtb3ZlQ2xhc3MoYik6ZS5hZGRDbGFzcyhiKX1lbHNlKGM9PT1VfHxcImJvb2xlYW5cIj09PWMpJiYodGhpcy5jbGFzc05hbWUmJkwuc2V0KHRoaXMsXCJfX2NsYXNzTmFtZV9fXCIsdGhpcy5jbGFzc05hbWUpLHRoaXMuY2xhc3NOYW1lPXRoaXMuY2xhc3NOYW1lfHxhPT09ITE/XCJcIjpMLmdldCh0aGlzLFwiX19jbGFzc05hbWVfX1wiKXx8XCJcIil9KX0saGFzQ2xhc3M6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPVwiIFwiK2ErXCIgXCIsYz0wLGQ9dGhpcy5sZW5ndGg7ZD5jO2MrKylpZigxPT09dGhpc1tjXS5ub2RlVHlwZSYmKFwiIFwiK3RoaXNbY10uY2xhc3NOYW1lK1wiIFwiKS5yZXBsYWNlKGFjLFwiIFwiKS5pbmRleE9mKGIpPj0wKXJldHVybiEwO3JldHVybiExfX0pO3ZhciBiYz0vXFxyL2c7bi5mbi5leHRlbmQoe3ZhbDpmdW5jdGlvbihhKXt2YXIgYixjLGQsZT10aGlzWzBdO3tpZihhcmd1bWVudHMubGVuZ3RoKXJldHVybiBkPW4uaXNGdW5jdGlvbihhKSx0aGlzLmVhY2goZnVuY3Rpb24oYyl7dmFyIGU7MT09PXRoaXMubm9kZVR5cGUmJihlPWQ/YS5jYWxsKHRoaXMsYyxuKHRoaXMpLnZhbCgpKTphLG51bGw9PWU/ZT1cIlwiOlwibnVtYmVyXCI9PXR5cGVvZiBlP2UrPVwiXCI6bi5pc0FycmF5KGUpJiYoZT1uLm1hcChlLGZ1bmN0aW9uKGEpe3JldHVybiBudWxsPT1hP1wiXCI6YStcIlwifSkpLGI9bi52YWxIb29rc1t0aGlzLnR5cGVdfHxuLnZhbEhvb2tzW3RoaXMubm9kZU5hbWUudG9Mb3dlckNhc2UoKV0sYiYmXCJzZXRcImluIGImJnZvaWQgMCE9PWIuc2V0KHRoaXMsZSxcInZhbHVlXCIpfHwodGhpcy52YWx1ZT1lKSl9KTtpZihlKXJldHVybiBiPW4udmFsSG9va3NbZS50eXBlXXx8bi52YWxIb29rc1tlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCldLGImJlwiZ2V0XCJpbiBiJiZ2b2lkIDAhPT0oYz1iLmdldChlLFwidmFsdWVcIikpP2M6KGM9ZS52YWx1ZSxcInN0cmluZ1wiPT10eXBlb2YgYz9jLnJlcGxhY2UoYmMsXCJcIik6bnVsbD09Yz9cIlwiOmMpfX19KSxuLmV4dGVuZCh7dmFsSG9va3M6e29wdGlvbjp7Z2V0OmZ1bmN0aW9uKGEpe3ZhciBiPW4uZmluZC5hdHRyKGEsXCJ2YWx1ZVwiKTtyZXR1cm4gbnVsbCE9Yj9iOm4udHJpbShuLnRleHQoYSkpfX0sc2VsZWN0OntnZXQ6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiLGMsZD1hLm9wdGlvbnMsZT1hLnNlbGVjdGVkSW5kZXgsZj1cInNlbGVjdC1vbmVcIj09PWEudHlwZXx8MD5lLGc9Zj9udWxsOltdLGg9Zj9lKzE6ZC5sZW5ndGgsaT0wPmU/aDpmP2U6MDtoPmk7aSsrKWlmKGM9ZFtpXSwhKCFjLnNlbGVjdGVkJiZpIT09ZXx8KGsub3B0RGlzYWJsZWQ/Yy5kaXNhYmxlZDpudWxsIT09Yy5nZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSl8fGMucGFyZW50Tm9kZS5kaXNhYmxlZCYmbi5ub2RlTmFtZShjLnBhcmVudE5vZGUsXCJvcHRncm91cFwiKSkpe2lmKGI9bihjKS52YWwoKSxmKXJldHVybiBiO2cucHVzaChiKX1yZXR1cm4gZ30sc2V0OmZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlPWEub3B0aW9ucyxmPW4ubWFrZUFycmF5KGIpLGc9ZS5sZW5ndGg7d2hpbGUoZy0tKWQ9ZVtnXSwoZC5zZWxlY3RlZD1uLmluQXJyYXkoZC52YWx1ZSxmKT49MCkmJihjPSEwKTtyZXR1cm4gY3x8KGEuc2VsZWN0ZWRJbmRleD0tMSksZn19fX0pLG4uZWFjaChbXCJyYWRpb1wiLFwiY2hlY2tib3hcIl0sZnVuY3Rpb24oKXtuLnZhbEhvb2tzW3RoaXNdPXtzZXQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbi5pc0FycmF5KGIpP2EuY2hlY2tlZD1uLmluQXJyYXkobihhKS52YWwoKSxiKT49MDp2b2lkIDB9fSxrLmNoZWNrT258fChuLnZhbEhvb2tzW3RoaXNdLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gbnVsbD09PWEuZ2V0QXR0cmlidXRlKFwidmFsdWVcIik/XCJvblwiOmEudmFsdWV9KX0pLG4uZWFjaChcImJsdXIgZm9jdXMgZm9jdXNpbiBmb2N1c291dCBsb2FkIHJlc2l6ZSBzY3JvbGwgdW5sb2FkIGNsaWNrIGRibGNsaWNrIG1vdXNlZG93biBtb3VzZXVwIG1vdXNlbW92ZSBtb3VzZW92ZXIgbW91c2VvdXQgbW91c2VlbnRlciBtb3VzZWxlYXZlIGNoYW5nZSBzZWxlY3Qgc3VibWl0IGtleWRvd24ga2V5cHJlc3Mga2V5dXAgZXJyb3IgY29udGV4dG1lbnVcIi5zcGxpdChcIiBcIiksZnVuY3Rpb24oYSxiKXtuLmZuW2JdPWZ1bmN0aW9uKGEsYyl7cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGg+MD90aGlzLm9uKGIsbnVsbCxhLGMpOnRoaXMudHJpZ2dlcihiKX19KSxuLmZuLmV4dGVuZCh7aG92ZXI6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5tb3VzZWVudGVyKGEpLm1vdXNlbGVhdmUoYnx8YSl9LGJpbmQ6ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0aGlzLm9uKGEsbnVsbCxiLGMpfSx1bmJpbmQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5vZmYoYSxudWxsLGIpfSxkZWxlZ2F0ZTpmdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4gdGhpcy5vbihiLGEsYyxkKX0sdW5kZWxlZ2F0ZTpmdW5jdGlvbihhLGIsYyl7cmV0dXJuIDE9PT1hcmd1bWVudHMubGVuZ3RoP3RoaXMub2ZmKGEsXCIqKlwiKTp0aGlzLm9mZihiLGF8fFwiKipcIixjKX19KTt2YXIgY2M9bi5ub3coKSxkYz0vXFw/LztuLnBhcnNlSlNPTj1mdW5jdGlvbihhKXtyZXR1cm4gSlNPTi5wYXJzZShhK1wiXCIpfSxuLnBhcnNlWE1MPWZ1bmN0aW9uKGEpe3ZhciBiLGM7aWYoIWF8fFwic3RyaW5nXCIhPXR5cGVvZiBhKXJldHVybiBudWxsO3RyeXtjPW5ldyBET01QYXJzZXIsYj1jLnBhcnNlRnJvbVN0cmluZyhhLFwidGV4dC94bWxcIil9Y2F0Y2goZCl7Yj12b2lkIDB9cmV0dXJuKCFifHxiLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicGFyc2VyZXJyb3JcIikubGVuZ3RoKSYmbi5lcnJvcihcIkludmFsaWQgWE1MOiBcIithKSxifTt2YXIgZWMsZmMsZ2M9LyMuKiQvLGhjPS8oWz8mXSlfPVteJl0qLyxpYz0vXiguKj8pOlsgXFx0XSooW15cXHJcXG5dKikkL2dtLGpjPS9eKD86YWJvdXR8YXBwfGFwcC1zdG9yYWdlfC4rLWV4dGVuc2lvbnxmaWxlfHJlc3x3aWRnZXQpOiQvLGtjPS9eKD86R0VUfEhFQUQpJC8sbGM9L15cXC9cXC8vLG1jPS9eKFtcXHcuKy1dKzopKD86XFwvXFwvKD86W15cXC8/I10qQHwpKFteXFwvPyM6XSopKD86OihcXGQrKXwpfCkvLG5jPXt9LG9jPXt9LHBjPVwiKi9cIi5jb25jYXQoXCIqXCIpO3RyeXtmYz1sb2NhdGlvbi5ocmVmfWNhdGNoKHFjKXtmYz1sLmNyZWF0ZUVsZW1lbnQoXCJhXCIpLGZjLmhyZWY9XCJcIixmYz1mYy5ocmVmfWVjPW1jLmV4ZWMoZmMudG9Mb3dlckNhc2UoKSl8fFtdO2Z1bmN0aW9uIHJjKGEpe3JldHVybiBmdW5jdGlvbihiLGMpe1wic3RyaW5nXCIhPXR5cGVvZiBiJiYoYz1iLGI9XCIqXCIpO3ZhciBkLGU9MCxmPWIudG9Mb3dlckNhc2UoKS5tYXRjaChFKXx8W107aWYobi5pc0Z1bmN0aW9uKGMpKXdoaWxlKGQ9ZltlKytdKVwiK1wiPT09ZFswXT8oZD1kLnNsaWNlKDEpfHxcIipcIiwoYVtkXT1hW2RdfHxbXSkudW5zaGlmdChjKSk6KGFbZF09YVtkXXx8W10pLnB1c2goYyl9fWZ1bmN0aW9uIHNjKGEsYixjLGQpe3ZhciBlPXt9LGY9YT09PW9jO2Z1bmN0aW9uIGcoaCl7dmFyIGk7cmV0dXJuIGVbaF09ITAsbi5lYWNoKGFbaF18fFtdLGZ1bmN0aW9uKGEsaCl7dmFyIGo9aChiLGMsZCk7cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGp8fGZ8fGVbal0/Zj8hKGk9aik6dm9pZCAwOihiLmRhdGFUeXBlcy51bnNoaWZ0KGopLGcoaiksITEpfSksaX1yZXR1cm4gZyhiLmRhdGFUeXBlc1swXSl8fCFlW1wiKlwiXSYmZyhcIipcIil9ZnVuY3Rpb24gdGMoYSxiKXt2YXIgYyxkLGU9bi5hamF4U2V0dGluZ3MuZmxhdE9wdGlvbnN8fHt9O2ZvcihjIGluIGIpdm9pZCAwIT09YltjXSYmKChlW2NdP2E6ZHx8KGQ9e30pKVtjXT1iW2NdKTtyZXR1cm4gZCYmbi5leHRlbmQoITAsYSxkKSxhfWZ1bmN0aW9uIHVjKGEsYixjKXt2YXIgZCxlLGYsZyxoPWEuY29udGVudHMsaT1hLmRhdGFUeXBlczt3aGlsZShcIipcIj09PWlbMF0paS5zaGlmdCgpLHZvaWQgMD09PWQmJihkPWEubWltZVR5cGV8fGIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIikpO2lmKGQpZm9yKGUgaW4gaClpZihoW2VdJiZoW2VdLnRlc3QoZCkpe2kudW5zaGlmdChlKTticmVha31pZihpWzBdaW4gYylmPWlbMF07ZWxzZXtmb3IoZSBpbiBjKXtpZighaVswXXx8YS5jb252ZXJ0ZXJzW2UrXCIgXCIraVswXV0pe2Y9ZTticmVha31nfHwoZz1lKX1mPWZ8fGd9cmV0dXJuIGY/KGYhPT1pWzBdJiZpLnVuc2hpZnQoZiksY1tmXSk6dm9pZCAwfWZ1bmN0aW9uIHZjKGEsYixjLGQpe3ZhciBlLGYsZyxoLGksaj17fSxrPWEuZGF0YVR5cGVzLnNsaWNlKCk7aWYoa1sxXSlmb3IoZyBpbiBhLmNvbnZlcnRlcnMpaltnLnRvTG93ZXJDYXNlKCldPWEuY29udmVydGVyc1tnXTtmPWsuc2hpZnQoKTt3aGlsZShmKWlmKGEucmVzcG9uc2VGaWVsZHNbZl0mJihjW2EucmVzcG9uc2VGaWVsZHNbZl1dPWIpLCFpJiZkJiZhLmRhdGFGaWx0ZXImJihiPWEuZGF0YUZpbHRlcihiLGEuZGF0YVR5cGUpKSxpPWYsZj1rLnNoaWZ0KCkpaWYoXCIqXCI9PT1mKWY9aTtlbHNlIGlmKFwiKlwiIT09aSYmaSE9PWYpe2lmKGc9altpK1wiIFwiK2ZdfHxqW1wiKiBcIitmXSwhZylmb3IoZSBpbiBqKWlmKGg9ZS5zcGxpdChcIiBcIiksaFsxXT09PWYmJihnPWpbaStcIiBcIitoWzBdXXx8altcIiogXCIraFswXV0pKXtnPT09ITA/Zz1qW2VdOmpbZV0hPT0hMCYmKGY9aFswXSxrLnVuc2hpZnQoaFsxXSkpO2JyZWFrfWlmKGchPT0hMClpZihnJiZhW1widGhyb3dzXCJdKWI9ZyhiKTtlbHNlIHRyeXtiPWcoYil9Y2F0Y2gobCl7cmV0dXJue3N0YXRlOlwicGFyc2VyZXJyb3JcIixlcnJvcjpnP2w6XCJObyBjb252ZXJzaW9uIGZyb20gXCIraStcIiB0byBcIitmfX19cmV0dXJue3N0YXRlOlwic3VjY2Vzc1wiLGRhdGE6Yn19bi5leHRlbmQoe2FjdGl2ZTowLGxhc3RNb2RpZmllZDp7fSxldGFnOnt9LGFqYXhTZXR0aW5nczp7dXJsOmZjLHR5cGU6XCJHRVRcIixpc0xvY2FsOmpjLnRlc3QoZWNbMV0pLGdsb2JhbDohMCxwcm9jZXNzRGF0YTohMCxhc3luYzohMCxjb250ZW50VHlwZTpcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiLGFjY2VwdHM6e1wiKlwiOnBjLHRleHQ6XCJ0ZXh0L3BsYWluXCIsaHRtbDpcInRleHQvaHRtbFwiLHhtbDpcImFwcGxpY2F0aW9uL3htbCwgdGV4dC94bWxcIixqc29uOlwiYXBwbGljYXRpb24vanNvbiwgdGV4dC9qYXZhc2NyaXB0XCJ9LGNvbnRlbnRzOnt4bWw6L3htbC8saHRtbDovaHRtbC8sanNvbjovanNvbi99LHJlc3BvbnNlRmllbGRzOnt4bWw6XCJyZXNwb25zZVhNTFwiLHRleHQ6XCJyZXNwb25zZVRleHRcIixqc29uOlwicmVzcG9uc2VKU09OXCJ9LGNvbnZlcnRlcnM6e1wiKiB0ZXh0XCI6U3RyaW5nLFwidGV4dCBodG1sXCI6ITAsXCJ0ZXh0IGpzb25cIjpuLnBhcnNlSlNPTixcInRleHQgeG1sXCI6bi5wYXJzZVhNTH0sZmxhdE9wdGlvbnM6e3VybDohMCxjb250ZXh0OiEwfX0sYWpheFNldHVwOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGI/dGModGMoYSxuLmFqYXhTZXR0aW5ncyksYik6dGMobi5hamF4U2V0dGluZ3MsYSl9LGFqYXhQcmVmaWx0ZXI6cmMobmMpLGFqYXhUcmFuc3BvcnQ6cmMob2MpLGFqYXg6ZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgYSYmKGI9YSxhPXZvaWQgMCksYj1ifHx7fTt2YXIgYyxkLGUsZixnLGgsaSxqLGs9bi5hamF4U2V0dXAoe30sYiksbD1rLmNvbnRleHR8fGssbT1rLmNvbnRleHQmJihsLm5vZGVUeXBlfHxsLmpxdWVyeSk/bihsKTpuLmV2ZW50LG89bi5EZWZlcnJlZCgpLHA9bi5DYWxsYmFja3MoXCJvbmNlIG1lbW9yeVwiKSxxPWsuc3RhdHVzQ29kZXx8e30scj17fSxzPXt9LHQ9MCx1PVwiY2FuY2VsZWRcIix2PXtyZWFkeVN0YXRlOjAsZ2V0UmVzcG9uc2VIZWFkZXI6ZnVuY3Rpb24oYSl7dmFyIGI7aWYoMj09PXQpe2lmKCFmKXtmPXt9O3doaWxlKGI9aWMuZXhlYyhlKSlmW2JbMV0udG9Mb3dlckNhc2UoKV09YlsyXX1iPWZbYS50b0xvd2VyQ2FzZSgpXX1yZXR1cm4gbnVsbD09Yj9udWxsOmJ9LGdldEFsbFJlc3BvbnNlSGVhZGVyczpmdW5jdGlvbigpe3JldHVybiAyPT09dD9lOm51bGx9LHNldFJlcXVlc3RIZWFkZXI6ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLnRvTG93ZXJDYXNlKCk7cmV0dXJuIHR8fChhPXNbY109c1tjXXx8YSxyW2FdPWIpLHRoaXN9LG92ZXJyaWRlTWltZVR5cGU6ZnVuY3Rpb24oYSl7cmV0dXJuIHR8fChrLm1pbWVUeXBlPWEpLHRoaXN9LHN0YXR1c0NvZGU6ZnVuY3Rpb24oYSl7dmFyIGI7aWYoYSlpZigyPnQpZm9yKGIgaW4gYSlxW2JdPVtxW2JdLGFbYl1dO2Vsc2Ugdi5hbHdheXMoYVt2LnN0YXR1c10pO3JldHVybiB0aGlzfSxhYm9ydDpmdW5jdGlvbihhKXt2YXIgYj1hfHx1O3JldHVybiBjJiZjLmFib3J0KGIpLHgoMCxiKSx0aGlzfX07aWYoby5wcm9taXNlKHYpLmNvbXBsZXRlPXAuYWRkLHYuc3VjY2Vzcz12LmRvbmUsdi5lcnJvcj12LmZhaWwsay51cmw9KChhfHxrLnVybHx8ZmMpK1wiXCIpLnJlcGxhY2UoZ2MsXCJcIikucmVwbGFjZShsYyxlY1sxXStcIi8vXCIpLGsudHlwZT1iLm1ldGhvZHx8Yi50eXBlfHxrLm1ldGhvZHx8ay50eXBlLGsuZGF0YVR5cGVzPW4udHJpbShrLmRhdGFUeXBlfHxcIipcIikudG9Mb3dlckNhc2UoKS5tYXRjaChFKXx8W1wiXCJdLG51bGw9PWsuY3Jvc3NEb21haW4mJihoPW1jLmV4ZWMoay51cmwudG9Mb3dlckNhc2UoKSksay5jcm9zc0RvbWFpbj0hKCFofHxoWzFdPT09ZWNbMV0mJmhbMl09PT1lY1syXSYmKGhbM118fChcImh0dHA6XCI9PT1oWzFdP1wiODBcIjpcIjQ0M1wiKSk9PT0oZWNbM118fChcImh0dHA6XCI9PT1lY1sxXT9cIjgwXCI6XCI0NDNcIikpKSksay5kYXRhJiZrLnByb2Nlc3NEYXRhJiZcInN0cmluZ1wiIT10eXBlb2Ygay5kYXRhJiYoay5kYXRhPW4ucGFyYW0oay5kYXRhLGsudHJhZGl0aW9uYWwpKSxzYyhuYyxrLGIsdiksMj09PXQpcmV0dXJuIHY7aT1rLmdsb2JhbCxpJiYwPT09bi5hY3RpdmUrKyYmbi5ldmVudC50cmlnZ2VyKFwiYWpheFN0YXJ0XCIpLGsudHlwZT1rLnR5cGUudG9VcHBlckNhc2UoKSxrLmhhc0NvbnRlbnQ9IWtjLnRlc3Qoay50eXBlKSxkPWsudXJsLGsuaGFzQ29udGVudHx8KGsuZGF0YSYmKGQ9ay51cmwrPShkYy50ZXN0KGQpP1wiJlwiOlwiP1wiKStrLmRhdGEsZGVsZXRlIGsuZGF0YSksay5jYWNoZT09PSExJiYoay51cmw9aGMudGVzdChkKT9kLnJlcGxhY2UoaGMsXCIkMV89XCIrY2MrKyk6ZCsoZGMudGVzdChkKT9cIiZcIjpcIj9cIikrXCJfPVwiK2NjKyspKSxrLmlmTW9kaWZpZWQmJihuLmxhc3RNb2RpZmllZFtkXSYmdi5zZXRSZXF1ZXN0SGVhZGVyKFwiSWYtTW9kaWZpZWQtU2luY2VcIixuLmxhc3RNb2RpZmllZFtkXSksbi5ldGFnW2RdJiZ2LnNldFJlcXVlc3RIZWFkZXIoXCJJZi1Ob25lLU1hdGNoXCIsbi5ldGFnW2RdKSksKGsuZGF0YSYmay5oYXNDb250ZW50JiZrLmNvbnRlbnRUeXBlIT09ITF8fGIuY29udGVudFR5cGUpJiZ2LnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIixrLmNvbnRlbnRUeXBlKSx2LnNldFJlcXVlc3RIZWFkZXIoXCJBY2NlcHRcIixrLmRhdGFUeXBlc1swXSYmay5hY2NlcHRzW2suZGF0YVR5cGVzWzBdXT9rLmFjY2VwdHNbay5kYXRhVHlwZXNbMF1dKyhcIipcIiE9PWsuZGF0YVR5cGVzWzBdP1wiLCBcIitwYytcIjsgcT0wLjAxXCI6XCJcIik6ay5hY2NlcHRzW1wiKlwiXSk7Zm9yKGogaW4gay5oZWFkZXJzKXYuc2V0UmVxdWVzdEhlYWRlcihqLGsuaGVhZGVyc1tqXSk7aWYoay5iZWZvcmVTZW5kJiYoay5iZWZvcmVTZW5kLmNhbGwobCx2LGspPT09ITF8fDI9PT10KSlyZXR1cm4gdi5hYm9ydCgpO3U9XCJhYm9ydFwiO2ZvcihqIGlue3N1Y2Nlc3M6MSxlcnJvcjoxLGNvbXBsZXRlOjF9KXZbal0oa1tqXSk7aWYoYz1zYyhvYyxrLGIsdikpe3YucmVhZHlTdGF0ZT0xLGkmJm0udHJpZ2dlcihcImFqYXhTZW5kXCIsW3Ysa10pLGsuYXN5bmMmJmsudGltZW91dD4wJiYoZz1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7di5hYm9ydChcInRpbWVvdXRcIil9LGsudGltZW91dCkpO3RyeXt0PTEsYy5zZW5kKHIseCl9Y2F0Y2godyl7aWYoISgyPnQpKXRocm93IHc7eCgtMSx3KX19ZWxzZSB4KC0xLFwiTm8gVHJhbnNwb3J0XCIpO2Z1bmN0aW9uIHgoYSxiLGYsaCl7dmFyIGoscixzLHUsdyx4PWI7MiE9PXQmJih0PTIsZyYmY2xlYXJUaW1lb3V0KGcpLGM9dm9pZCAwLGU9aHx8XCJcIix2LnJlYWR5U3RhdGU9YT4wPzQ6MCxqPWE+PTIwMCYmMzAwPmF8fDMwND09PWEsZiYmKHU9dWMoayx2LGYpKSx1PXZjKGssdSx2LGopLGo/KGsuaWZNb2RpZmllZCYmKHc9di5nZXRSZXNwb25zZUhlYWRlcihcIkxhc3QtTW9kaWZpZWRcIiksdyYmKG4ubGFzdE1vZGlmaWVkW2RdPXcpLHc9di5nZXRSZXNwb25zZUhlYWRlcihcImV0YWdcIiksdyYmKG4uZXRhZ1tkXT13KSksMjA0PT09YXx8XCJIRUFEXCI9PT1rLnR5cGU/eD1cIm5vY29udGVudFwiOjMwND09PWE/eD1cIm5vdG1vZGlmaWVkXCI6KHg9dS5zdGF0ZSxyPXUuZGF0YSxzPXUuZXJyb3Isaj0hcykpOihzPXgsKGF8fCF4KSYmKHg9XCJlcnJvclwiLDA+YSYmKGE9MCkpKSx2LnN0YXR1cz1hLHYuc3RhdHVzVGV4dD0oYnx8eCkrXCJcIixqP28ucmVzb2x2ZVdpdGgobCxbcix4LHZdKTpvLnJlamVjdFdpdGgobCxbdix4LHNdKSx2LnN0YXR1c0NvZGUocSkscT12b2lkIDAsaSYmbS50cmlnZ2VyKGo/XCJhamF4U3VjY2Vzc1wiOlwiYWpheEVycm9yXCIsW3YsayxqP3I6c10pLHAuZmlyZVdpdGgobCxbdix4XSksaSYmKG0udHJpZ2dlcihcImFqYXhDb21wbGV0ZVwiLFt2LGtdKSwtLW4uYWN0aXZlfHxuLmV2ZW50LnRyaWdnZXIoXCJhamF4U3RvcFwiKSkpfXJldHVybiB2fSxnZXRKU09OOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gbi5nZXQoYSxiLGMsXCJqc29uXCIpfSxnZXRTY3JpcHQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbi5nZXQoYSx2b2lkIDAsYixcInNjcmlwdFwiKX19KSxuLmVhY2goW1wiZ2V0XCIsXCJwb3N0XCJdLGZ1bmN0aW9uKGEsYil7bltiXT1mdW5jdGlvbihhLGMsZCxlKXtyZXR1cm4gbi5pc0Z1bmN0aW9uKGMpJiYoZT1lfHxkLGQ9YyxjPXZvaWQgMCksbi5hamF4KHt1cmw6YSx0eXBlOmIsZGF0YVR5cGU6ZSxkYXRhOmMsc3VjY2VzczpkfSl9fSksbi5lYWNoKFtcImFqYXhTdGFydFwiLFwiYWpheFN0b3BcIixcImFqYXhDb21wbGV0ZVwiLFwiYWpheEVycm9yXCIsXCJhamF4U3VjY2Vzc1wiLFwiYWpheFNlbmRcIl0sZnVuY3Rpb24oYSxiKXtuLmZuW2JdPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm9uKGIsYSl9fSksbi5fZXZhbFVybD1mdW5jdGlvbihhKXtyZXR1cm4gbi5hamF4KHt1cmw6YSx0eXBlOlwiR0VUXCIsZGF0YVR5cGU6XCJzY3JpcHRcIixhc3luYzohMSxnbG9iYWw6ITEsXCJ0aHJvd3NcIjohMH0pfSxuLmZuLmV4dGVuZCh7d3JhcEFsbDpmdW5jdGlvbihhKXt2YXIgYjtyZXR1cm4gbi5pc0Z1bmN0aW9uKGEpP3RoaXMuZWFjaChmdW5jdGlvbihiKXtuKHRoaXMpLndyYXBBbGwoYS5jYWxsKHRoaXMsYikpfSk6KHRoaXNbMF0mJihiPW4oYSx0aGlzWzBdLm93bmVyRG9jdW1lbnQpLmVxKDApLmNsb25lKCEwKSx0aGlzWzBdLnBhcmVudE5vZGUmJmIuaW5zZXJ0QmVmb3JlKHRoaXNbMF0pLGIubWFwKGZ1bmN0aW9uKCl7dmFyIGE9dGhpczt3aGlsZShhLmZpcnN0RWxlbWVudENoaWxkKWE9YS5maXJzdEVsZW1lbnRDaGlsZDtyZXR1cm4gYX0pLmFwcGVuZCh0aGlzKSksdGhpcyl9LHdyYXBJbm5lcjpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5lYWNoKG4uaXNGdW5jdGlvbihhKT9mdW5jdGlvbihiKXtuKHRoaXMpLndyYXBJbm5lcihhLmNhbGwodGhpcyxiKSl9OmZ1bmN0aW9uKCl7dmFyIGI9bih0aGlzKSxjPWIuY29udGVudHMoKTtjLmxlbmd0aD9jLndyYXBBbGwoYSk6Yi5hcHBlbmQoYSl9KX0sd3JhcDpmdW5jdGlvbihhKXt2YXIgYj1uLmlzRnVuY3Rpb24oYSk7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihjKXtuKHRoaXMpLndyYXBBbGwoYj9hLmNhbGwodGhpcyxjKTphKX0pfSx1bndyYXA6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5wYXJlbnQoKS5lYWNoKGZ1bmN0aW9uKCl7bi5ub2RlTmFtZSh0aGlzLFwiYm9keVwiKXx8bih0aGlzKS5yZXBsYWNlV2l0aCh0aGlzLmNoaWxkTm9kZXMpfSkuZW5kKCl9fSksbi5leHByLmZpbHRlcnMuaGlkZGVuPWZ1bmN0aW9uKGEpe3JldHVybiBhLm9mZnNldFdpZHRoPD0wJiZhLm9mZnNldEhlaWdodDw9MH0sbi5leHByLmZpbHRlcnMudmlzaWJsZT1mdW5jdGlvbihhKXtyZXR1cm4hbi5leHByLmZpbHRlcnMuaGlkZGVuKGEpfTt2YXIgd2M9LyUyMC9nLHhjPS9cXFtcXF0kLyx5Yz0vXFxyP1xcbi9nLHpjPS9eKD86c3VibWl0fGJ1dHRvbnxpbWFnZXxyZXNldHxmaWxlKSQvaSxBYz0vXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxrZXlnZW4pL2k7ZnVuY3Rpb24gQmMoYSxiLGMsZCl7dmFyIGU7aWYobi5pc0FycmF5KGIpKW4uZWFjaChiLGZ1bmN0aW9uKGIsZSl7Y3x8eGMudGVzdChhKT9kKGEsZSk6QmMoYStcIltcIisoXCJvYmplY3RcIj09dHlwZW9mIGU/YjpcIlwiKStcIl1cIixlLGMsZCl9KTtlbHNlIGlmKGN8fFwib2JqZWN0XCIhPT1uLnR5cGUoYikpZChhLGIpO2Vsc2UgZm9yKGUgaW4gYilCYyhhK1wiW1wiK2UrXCJdXCIsYltlXSxjLGQpfW4ucGFyYW09ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPVtdLGU9ZnVuY3Rpb24oYSxiKXtiPW4uaXNGdW5jdGlvbihiKT9iKCk6bnVsbD09Yj9cIlwiOmIsZFtkLmxlbmd0aF09ZW5jb2RlVVJJQ29tcG9uZW50KGEpK1wiPVwiK2VuY29kZVVSSUNvbXBvbmVudChiKX07aWYodm9pZCAwPT09YiYmKGI9bi5hamF4U2V0dGluZ3MmJm4uYWpheFNldHRpbmdzLnRyYWRpdGlvbmFsKSxuLmlzQXJyYXkoYSl8fGEuanF1ZXJ5JiYhbi5pc1BsYWluT2JqZWN0KGEpKW4uZWFjaChhLGZ1bmN0aW9uKCl7ZSh0aGlzLm5hbWUsdGhpcy52YWx1ZSl9KTtlbHNlIGZvcihjIGluIGEpQmMoYyxhW2NdLGIsZSk7cmV0dXJuIGQuam9pbihcIiZcIikucmVwbGFjZSh3YyxcIitcIil9LG4uZm4uZXh0ZW5kKHtzZXJpYWxpemU6ZnVuY3Rpb24oKXtyZXR1cm4gbi5wYXJhbSh0aGlzLnNlcmlhbGl6ZUFycmF5KCkpfSxzZXJpYWxpemVBcnJheTpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1hcChmdW5jdGlvbigpe3ZhciBhPW4ucHJvcCh0aGlzLFwiZWxlbWVudHNcIik7cmV0dXJuIGE/bi5tYWtlQXJyYXkoYSk6dGhpc30pLmZpbHRlcihmdW5jdGlvbigpe3ZhciBhPXRoaXMudHlwZTtyZXR1cm4gdGhpcy5uYW1lJiYhbih0aGlzKS5pcyhcIjpkaXNhYmxlZFwiKSYmQWMudGVzdCh0aGlzLm5vZGVOYW1lKSYmIXpjLnRlc3QoYSkmJih0aGlzLmNoZWNrZWR8fCFULnRlc3QoYSkpfSkubWFwKGZ1bmN0aW9uKGEsYil7dmFyIGM9bih0aGlzKS52YWwoKTtyZXR1cm4gbnVsbD09Yz9udWxsOm4uaXNBcnJheShjKT9uLm1hcChjLGZ1bmN0aW9uKGEpe3JldHVybntuYW1lOmIubmFtZSx2YWx1ZTphLnJlcGxhY2UoeWMsXCJcXHJcXG5cIil9fSk6e25hbWU6Yi5uYW1lLHZhbHVlOmMucmVwbGFjZSh5YyxcIlxcclxcblwiKX19KS5nZXQoKX19KSxuLmFqYXhTZXR0aW5ncy54aHI9ZnVuY3Rpb24oKXt0cnl7cmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdH1jYXRjaChhKXt9fTt2YXIgQ2M9MCxEYz17fSxFYz17MDoyMDAsMTIyMzoyMDR9LEZjPW4uYWpheFNldHRpbmdzLnhocigpO2EuQWN0aXZlWE9iamVjdCYmbihhKS5vbihcInVubG9hZFwiLGZ1bmN0aW9uKCl7Zm9yKHZhciBhIGluIERjKURjW2FdKCl9KSxrLmNvcnM9ISFGYyYmXCJ3aXRoQ3JlZGVudGlhbHNcImluIEZjLGsuYWpheD1GYz0hIUZjLG4uYWpheFRyYW5zcG9ydChmdW5jdGlvbihhKXt2YXIgYjtyZXR1cm4gay5jb3JzfHxGYyYmIWEuY3Jvc3NEb21haW4/e3NlbmQ6ZnVuY3Rpb24oYyxkKXt2YXIgZSxmPWEueGhyKCksZz0rK0NjO2lmKGYub3BlbihhLnR5cGUsYS51cmwsYS5hc3luYyxhLnVzZXJuYW1lLGEucGFzc3dvcmQpLGEueGhyRmllbGRzKWZvcihlIGluIGEueGhyRmllbGRzKWZbZV09YS54aHJGaWVsZHNbZV07YS5taW1lVHlwZSYmZi5vdmVycmlkZU1pbWVUeXBlJiZmLm92ZXJyaWRlTWltZVR5cGUoYS5taW1lVHlwZSksYS5jcm9zc0RvbWFpbnx8Y1tcIlgtUmVxdWVzdGVkLVdpdGhcIl18fChjW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXT1cIlhNTEh0dHBSZXF1ZXN0XCIpO2ZvcihlIGluIGMpZi5zZXRSZXF1ZXN0SGVhZGVyKGUsY1tlXSk7Yj1mdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oKXtiJiYoZGVsZXRlIERjW2ddLGI9Zi5vbmxvYWQ9Zi5vbmVycm9yPW51bGwsXCJhYm9ydFwiPT09YT9mLmFib3J0KCk6XCJlcnJvclwiPT09YT9kKGYuc3RhdHVzLGYuc3RhdHVzVGV4dCk6ZChFY1tmLnN0YXR1c118fGYuc3RhdHVzLGYuc3RhdHVzVGV4dCxcInN0cmluZ1wiPT10eXBlb2YgZi5yZXNwb25zZVRleHQ/e3RleHQ6Zi5yZXNwb25zZVRleHR9OnZvaWQgMCxmLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSl9fSxmLm9ubG9hZD1iKCksZi5vbmVycm9yPWIoXCJlcnJvclwiKSxiPURjW2ddPWIoXCJhYm9ydFwiKTt0cnl7Zi5zZW5kKGEuaGFzQ29udGVudCYmYS5kYXRhfHxudWxsKX1jYXRjaChoKXtpZihiKXRocm93IGh9fSxhYm9ydDpmdW5jdGlvbigpe2ImJmIoKX19OnZvaWQgMH0pLG4uYWpheFNldHVwKHthY2NlcHRzOntzY3JpcHQ6XCJ0ZXh0L2phdmFzY3JpcHQsIGFwcGxpY2F0aW9uL2phdmFzY3JpcHQsIGFwcGxpY2F0aW9uL2VjbWFzY3JpcHQsIGFwcGxpY2F0aW9uL3gtZWNtYXNjcmlwdFwifSxjb250ZW50czp7c2NyaXB0Oi8oPzpqYXZhfGVjbWEpc2NyaXB0L30sY29udmVydGVyczp7XCJ0ZXh0IHNjcmlwdFwiOmZ1bmN0aW9uKGEpe3JldHVybiBuLmdsb2JhbEV2YWwoYSksYX19fSksbi5hamF4UHJlZmlsdGVyKFwic2NyaXB0XCIsZnVuY3Rpb24oYSl7dm9pZCAwPT09YS5jYWNoZSYmKGEuY2FjaGU9ITEpLGEuY3Jvc3NEb21haW4mJihhLnR5cGU9XCJHRVRcIil9KSxuLmFqYXhUcmFuc3BvcnQoXCJzY3JpcHRcIixmdW5jdGlvbihhKXtpZihhLmNyb3NzRG9tYWluKXt2YXIgYixjO3JldHVybntzZW5kOmZ1bmN0aW9uKGQsZSl7Yj1uKFwiPHNjcmlwdD5cIikucHJvcCh7YXN5bmM6ITAsY2hhcnNldDphLnNjcmlwdENoYXJzZXQsc3JjOmEudXJsfSkub24oXCJsb2FkIGVycm9yXCIsYz1mdW5jdGlvbihhKXtiLnJlbW92ZSgpLGM9bnVsbCxhJiZlKFwiZXJyb3JcIj09PWEudHlwZT80MDQ6MjAwLGEudHlwZSl9KSxsLmhlYWQuYXBwZW5kQ2hpbGQoYlswXSl9LGFib3J0OmZ1bmN0aW9uKCl7YyYmYygpfX19fSk7dmFyIEdjPVtdLEhjPS8oPSlcXD8oPz0mfCQpfFxcP1xcPy87bi5hamF4U2V0dXAoe2pzb25wOlwiY2FsbGJhY2tcIixqc29ucENhbGxiYWNrOmZ1bmN0aW9uKCl7dmFyIGE9R2MucG9wKCl8fG4uZXhwYW5kbytcIl9cIitjYysrO3JldHVybiB0aGlzW2FdPSEwLGF9fSksbi5hamF4UHJlZmlsdGVyKFwianNvbiBqc29ucFwiLGZ1bmN0aW9uKGIsYyxkKXt2YXIgZSxmLGcsaD1iLmpzb25wIT09ITEmJihIYy50ZXN0KGIudXJsKT9cInVybFwiOlwic3RyaW5nXCI9PXR5cGVvZiBiLmRhdGEmJiEoYi5jb250ZW50VHlwZXx8XCJcIikuaW5kZXhPZihcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKSYmSGMudGVzdChiLmRhdGEpJiZcImRhdGFcIik7cmV0dXJuIGh8fFwianNvbnBcIj09PWIuZGF0YVR5cGVzWzBdPyhlPWIuanNvbnBDYWxsYmFjaz1uLmlzRnVuY3Rpb24oYi5qc29ucENhbGxiYWNrKT9iLmpzb25wQ2FsbGJhY2soKTpiLmpzb25wQ2FsbGJhY2ssaD9iW2hdPWJbaF0ucmVwbGFjZShIYyxcIiQxXCIrZSk6Yi5qc29ucCE9PSExJiYoYi51cmwrPShkYy50ZXN0KGIudXJsKT9cIiZcIjpcIj9cIikrYi5qc29ucCtcIj1cIitlKSxiLmNvbnZlcnRlcnNbXCJzY3JpcHQganNvblwiXT1mdW5jdGlvbigpe3JldHVybiBnfHxuLmVycm9yKGUrXCIgd2FzIG5vdCBjYWxsZWRcIiksZ1swXX0sYi5kYXRhVHlwZXNbMF09XCJqc29uXCIsZj1hW2VdLGFbZV09ZnVuY3Rpb24oKXtnPWFyZ3VtZW50c30sZC5hbHdheXMoZnVuY3Rpb24oKXthW2VdPWYsYltlXSYmKGIuanNvbnBDYWxsYmFjaz1jLmpzb25wQ2FsbGJhY2ssR2MucHVzaChlKSksZyYmbi5pc0Z1bmN0aW9uKGYpJiZmKGdbMF0pLGc9Zj12b2lkIDB9KSxcInNjcmlwdFwiKTp2b2lkIDB9KSxuLnBhcnNlSFRNTD1mdW5jdGlvbihhLGIsYyl7aWYoIWF8fFwic3RyaW5nXCIhPXR5cGVvZiBhKXJldHVybiBudWxsO1wiYm9vbGVhblwiPT10eXBlb2YgYiYmKGM9YixiPSExKSxiPWJ8fGw7dmFyIGQ9di5leGVjKGEpLGU9IWMmJltdO3JldHVybiBkP1tiLmNyZWF0ZUVsZW1lbnQoZFsxXSldOihkPW4uYnVpbGRGcmFnbWVudChbYV0sYixlKSxlJiZlLmxlbmd0aCYmbihlKS5yZW1vdmUoKSxuLm1lcmdlKFtdLGQuY2hpbGROb2RlcykpfTt2YXIgSWM9bi5mbi5sb2FkO24uZm4ubG9hZD1mdW5jdGlvbihhLGIsYyl7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGEmJkljKXJldHVybiBJYy5hcHBseSh0aGlzLGFyZ3VtZW50cyk7dmFyIGQsZSxmLGc9dGhpcyxoPWEuaW5kZXhPZihcIiBcIik7cmV0dXJuIGg+PTAmJihkPW4udHJpbShhLnNsaWNlKGgpKSxhPWEuc2xpY2UoMCxoKSksbi5pc0Z1bmN0aW9uKGIpPyhjPWIsYj12b2lkIDApOmImJlwib2JqZWN0XCI9PXR5cGVvZiBiJiYoZT1cIlBPU1RcIiksZy5sZW5ndGg+MCYmbi5hamF4KHt1cmw6YSx0eXBlOmUsZGF0YVR5cGU6XCJodG1sXCIsZGF0YTpifSkuZG9uZShmdW5jdGlvbihhKXtmPWFyZ3VtZW50cyxnLmh0bWwoZD9uKFwiPGRpdj5cIikuYXBwZW5kKG4ucGFyc2VIVE1MKGEpKS5maW5kKGQpOmEpfSkuY29tcGxldGUoYyYmZnVuY3Rpb24oYSxiKXtnLmVhY2goYyxmfHxbYS5yZXNwb25zZVRleHQsYixhXSl9KSx0aGlzfSxuLmV4cHIuZmlsdGVycy5hbmltYXRlZD1mdW5jdGlvbihhKXtyZXR1cm4gbi5ncmVwKG4udGltZXJzLGZ1bmN0aW9uKGIpe3JldHVybiBhPT09Yi5lbGVtfSkubGVuZ3RofTt2YXIgSmM9YS5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7ZnVuY3Rpb24gS2MoYSl7cmV0dXJuIG4uaXNXaW5kb3coYSk/YTo5PT09YS5ub2RlVHlwZSYmYS5kZWZhdWx0Vmlld31uLm9mZnNldD17c2V0T2Zmc2V0OmZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlLGYsZyxoLGksaixrPW4uY3NzKGEsXCJwb3NpdGlvblwiKSxsPW4oYSksbT17fTtcInN0YXRpY1wiPT09ayYmKGEuc3R5bGUucG9zaXRpb249XCJyZWxhdGl2ZVwiKSxoPWwub2Zmc2V0KCksZj1uLmNzcyhhLFwidG9wXCIpLGk9bi5jc3MoYSxcImxlZnRcIiksaj0oXCJhYnNvbHV0ZVwiPT09a3x8XCJmaXhlZFwiPT09aykmJihmK2kpLmluZGV4T2YoXCJhdXRvXCIpPi0xLGo/KGQ9bC5wb3NpdGlvbigpLGc9ZC50b3AsZT1kLmxlZnQpOihnPXBhcnNlRmxvYXQoZil8fDAsZT1wYXJzZUZsb2F0KGkpfHwwKSxuLmlzRnVuY3Rpb24oYikmJihiPWIuY2FsbChhLGMsaCkpLG51bGwhPWIudG9wJiYobS50b3A9Yi50b3AtaC50b3ArZyksbnVsbCE9Yi5sZWZ0JiYobS5sZWZ0PWIubGVmdC1oLmxlZnQrZSksXCJ1c2luZ1wiaW4gYj9iLnVzaW5nLmNhbGwoYSxtKTpsLmNzcyhtKX19LG4uZm4uZXh0ZW5kKHtvZmZzZXQ6ZnVuY3Rpb24oYSl7aWYoYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdm9pZCAwPT09YT90aGlzOnRoaXMuZWFjaChmdW5jdGlvbihiKXtuLm9mZnNldC5zZXRPZmZzZXQodGhpcyxhLGIpfSk7dmFyIGIsYyxkPXRoaXNbMF0sZT17dG9wOjAsbGVmdDowfSxmPWQmJmQub3duZXJEb2N1bWVudDtpZihmKXJldHVybiBiPWYuZG9jdW1lbnRFbGVtZW50LG4uY29udGFpbnMoYixkKT8odHlwZW9mIGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0IT09VSYmKGU9ZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksYz1LYyhmKSx7dG9wOmUudG9wK2MucGFnZVlPZmZzZXQtYi5jbGllbnRUb3AsbGVmdDplLmxlZnQrYy5wYWdlWE9mZnNldC1iLmNsaWVudExlZnR9KTplfSxwb3NpdGlvbjpmdW5jdGlvbigpe2lmKHRoaXNbMF0pe3ZhciBhLGIsYz10aGlzWzBdLGQ9e3RvcDowLGxlZnQ6MH07cmV0dXJuXCJmaXhlZFwiPT09bi5jc3MoYyxcInBvc2l0aW9uXCIpP2I9Yy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTooYT10aGlzLm9mZnNldFBhcmVudCgpLGI9dGhpcy5vZmZzZXQoKSxuLm5vZGVOYW1lKGFbMF0sXCJodG1sXCIpfHwoZD1hLm9mZnNldCgpKSxkLnRvcCs9bi5jc3MoYVswXSxcImJvcmRlclRvcFdpZHRoXCIsITApLGQubGVmdCs9bi5jc3MoYVswXSxcImJvcmRlckxlZnRXaWR0aFwiLCEwKSkse3RvcDpiLnRvcC1kLnRvcC1uLmNzcyhjLFwibWFyZ2luVG9wXCIsITApLGxlZnQ6Yi5sZWZ0LWQubGVmdC1uLmNzcyhjLFwibWFyZ2luTGVmdFwiLCEwKX19fSxvZmZzZXRQYXJlbnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24oKXt2YXIgYT10aGlzLm9mZnNldFBhcmVudHx8SmM7d2hpbGUoYSYmIW4ubm9kZU5hbWUoYSxcImh0bWxcIikmJlwic3RhdGljXCI9PT1uLmNzcyhhLFwicG9zaXRpb25cIikpYT1hLm9mZnNldFBhcmVudDtyZXR1cm4gYXx8SmN9KX19KSxuLmVhY2goe3Njcm9sbExlZnQ6XCJwYWdlWE9mZnNldFwiLHNjcm9sbFRvcDpcInBhZ2VZT2Zmc2V0XCJ9LGZ1bmN0aW9uKGIsYyl7dmFyIGQ9XCJwYWdlWU9mZnNldFwiPT09YztuLmZuW2JdPWZ1bmN0aW9uKGUpe3JldHVybiBKKHRoaXMsZnVuY3Rpb24oYixlLGYpe3ZhciBnPUtjKGIpO3JldHVybiB2b2lkIDA9PT1mP2c/Z1tjXTpiW2VdOnZvaWQoZz9nLnNjcm9sbFRvKGQ/YS5wYWdlWE9mZnNldDpmLGQ/ZjphLnBhZ2VZT2Zmc2V0KTpiW2VdPWYpfSxiLGUsYXJndW1lbnRzLmxlbmd0aCxudWxsKX19KSxuLmVhY2goW1widG9wXCIsXCJsZWZ0XCJdLGZ1bmN0aW9uKGEsYil7bi5jc3NIb29rc1tiXT15YihrLnBpeGVsUG9zaXRpb24sZnVuY3Rpb24oYSxjKXtyZXR1cm4gYz8oYz14YihhLGIpLHZiLnRlc3QoYyk/bihhKS5wb3NpdGlvbigpW2JdK1wicHhcIjpjKTp2b2lkIDB9KX0pLG4uZWFjaCh7SGVpZ2h0OlwiaGVpZ2h0XCIsV2lkdGg6XCJ3aWR0aFwifSxmdW5jdGlvbihhLGIpe24uZWFjaCh7cGFkZGluZzpcImlubmVyXCIrYSxjb250ZW50OmIsXCJcIjpcIm91dGVyXCIrYX0sZnVuY3Rpb24oYyxkKXtuLmZuW2RdPWZ1bmN0aW9uKGQsZSl7dmFyIGY9YXJndW1lbnRzLmxlbmd0aCYmKGN8fFwiYm9vbGVhblwiIT10eXBlb2YgZCksZz1jfHwoZD09PSEwfHxlPT09ITA/XCJtYXJnaW5cIjpcImJvcmRlclwiKTtyZXR1cm4gSih0aGlzLGZ1bmN0aW9uKGIsYyxkKXt2YXIgZTtyZXR1cm4gbi5pc1dpbmRvdyhiKT9iLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudFtcImNsaWVudFwiK2FdOjk9PT1iLm5vZGVUeXBlPyhlPWIuZG9jdW1lbnRFbGVtZW50LE1hdGgubWF4KGIuYm9keVtcInNjcm9sbFwiK2FdLGVbXCJzY3JvbGxcIithXSxiLmJvZHlbXCJvZmZzZXRcIithXSxlW1wib2Zmc2V0XCIrYV0sZVtcImNsaWVudFwiK2FdKSk6dm9pZCAwPT09ZD9uLmNzcyhiLGMsZyk6bi5zdHlsZShiLGMsZCxnKX0sYixmP2Q6dm9pZCAwLGYsbnVsbCl9fSl9KSxuLmZuLnNpemU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5sZW5ndGh9LG4uZm4uYW5kU2VsZj1uLmZuLmFkZEJhY2ssXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kJiZkZWZpbmUoXCJqcXVlcnlcIixbXSxmdW5jdGlvbigpe3JldHVybiBufSk7dmFyIExjPWEualF1ZXJ5LE1jPWEuJDtyZXR1cm4gbi5ub0NvbmZsaWN0PWZ1bmN0aW9uKGIpe3JldHVybiBhLiQ9PT1uJiYoYS4kPU1jKSxiJiZhLmpRdWVyeT09PW4mJihhLmpRdWVyeT1MYyksbn0sdHlwZW9mIGI9PT1VJiYoYS5qUXVlcnk9YS4kPW4pLG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWpxdWVyeS5taW4ubWFwIl19
