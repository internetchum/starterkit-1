<?php

/*
|--------------------------------------------------------------------------
| Detect The Application Environment
|--------------------------------------------------------------------------
|
| Laravel takes a dead simple approach to your application environments
| so you can just specify a machine name for the host that matches a
| given environment, then we will automatically detect it for you.
|
*/

$env = $app->detectEnvironment(function(){

	$dir = __DIR__;

  $isLocal       = strpos($dir, 'home/ford/web/www-surberbo/');
  $isDevelopment = strpos($dir, 'var/www/my-domain.com/development/');
  $isTest        = strpos($dir, 'var/www/my-domain.com/test/');
  $isProduction  = strpos($dir, 'var/www/my-domain.com/web/');

	if ($isLocal)       $environment = "local";
  if ($isDevelopment) $environment = "development";
  if ($isTest)        $environment = "test";
  if ($isProduction)  $environment = "production";

  return $environment;

});
