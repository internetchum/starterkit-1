<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title>@yield('title', 'Default Surberbo Title')</title>
		<link rel="stylesheet" href="{{ asset('assets/css/styles.css') }}" />
		@yield('styles')
		<script src="{{ asset('plugins/script.min.js') }}"></script>
		<script data-id="App.Scripts">
			var App = {};
			App.Scripts = {
				core: [
					'{{ asset('plugins/jquery.min.js') }}',
					'{{ asset('plugins/modernizr/modernizr.js') }}'
				],
				plugins_dependency: [
					'{{ asset('plugins/bootstrap/bootstrap.min.js') }}',
					'{{ asset('plugins/jquery-migrate.min.js') }}',
					'{{ asset('plugins/flot/jquery.flot.js') }}'
				],
				plugins:[
					'{{ asset('plugins/lazyjax/davis.min.js') }}',
					'{{ asset('plugins/lazyjax/jquery.lazyjaxdavis.min.js') }}'
				],
				bundle:[
					'{{ asset('plugins/pace/pace.min.js') }}'
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