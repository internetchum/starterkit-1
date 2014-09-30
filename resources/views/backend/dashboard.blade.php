@extends('base')

@section('title')
	Backend | Surberbo
@stop

@section('styles')
@stop

@section('scripts')
	<script>
		App.Scripts.bundle.push('{{ ASSET_DIR."assets/js/backend/app.js" }}');
	</script>
@stop

@section('content')
	<div class="layout-app">
		<div id="app-content"></div>
	</div>
@stop