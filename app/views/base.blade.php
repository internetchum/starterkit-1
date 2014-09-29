<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
		<meta name="_t" content="{{ csrf_token() }}" />
		@if (\Sentry::check())
			<?php $user = \Sentry::getUser(); ?>
			<meta name="_uT" content="{{ $user->token }}" />
		@endif
		<title>@yield('title', 'Default Surberbo Title')</title>
		<link rel="stylesheet" href="{{ ASSET_DIR.'assets/css/styles.css' }}" />
		@yield('styles')
		<script src="{{ ASSET_DIR.'plugins/script.min.js' }}"></script>
		<script data-id="App.Scripts">
			var App = {};
			App.Scripts = {
				core: [
					'{{ ASSET_DIR."plugins/jquery.min.js" }}',
					'{{ ASSET_DIR."plugins/modernizr/modernizr.js" }}'
				],
				plugins_dependency: [
					'{{ ASSET_DIR."plugins/bootstrap/bootstrap.min.js" }}',
					'{{ ASSET_DIR."plugins/jquery-migrate.min.js" }}',
					'{{ ASSET_DIR."plugins/flot/jquery.flot.js" }}'
				],
				plugins:[
					'{{ ASSET_DIR."plugins/jcrypt/jcrypt.js" }}'
				],
				bundle:[
					'{{ ASSET_DIR."plugins/pace/pace.min.js" }}'
				]
			};
		</script>
		<script>
			$script(App.Scripts.core,"core");$script.ready(["core"],function(){$script(App.Scripts.plugins_dependency,"plugins_dependency")});$script.ready(["core","plugins_dependency"],function(){$script(App.Scripts.plugins,"plugins")});$script.ready(["core","plugins_dependency","plugins"],function(){$script(App.Scripts.bundle,"bundle")})
		</script>
		@yield('scripts')
	</head>
	<body>
		@yield('content')
	</body>
</html>