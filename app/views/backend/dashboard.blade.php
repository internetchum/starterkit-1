@extends('base')

@section('title')
	Backend | Surberbo
@stop

@section('styles')
@stop

@section('scripts')
	<script>
		App.Scripts.bundle.push('{{ asset('assets/js/backend/app.js') }}');
	</script>
@stop

@section('content')
	<div class="layout-app col-lg-12">
		<div id="app-content"></div>
	</div>
@stop