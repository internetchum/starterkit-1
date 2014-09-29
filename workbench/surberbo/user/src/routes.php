<?php

Route::group(array('prefix'=>'dashboard', 'before'=>'ip.admin'), function() {

	Route::controller('user', 'UserController');

});