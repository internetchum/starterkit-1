<?php

/**
 * Main controller of user module
 *
 * @package Surberbo/User
 */

class UserController extends \BaseController
{
	/**
	 * Pipe collectino to read/write
	 *
	 * @var array
	 */
	protected $descriptorspec = array(
		0 => array("pipe", "r"),
		1 => array("pipe", "w")
	);

	/**
	 * Filters request
	 *
	 * @return void
	 */
	public function __construct()
	{
		if (count(\Input::all()) > 0)
		{
			Input::merge(array_map('trim', Input::all()));
		}
	}

	/**
	 * Admin login
	 *
	 * @return response
	 */
	public function postAdminLogin()
	{
		if (\Session::has('ch_key')) 
		{
			$key = \Session::get("ch_key");
			$cmd = sprintf("openssl enc -aes-256-cbc -pass pass:" . escapeshellarg($key) . " -d");
			$process = proc_open($cmd, $this->descriptorspec, $pipes);
			if (is_resource($process)) 
			{
				fwrite($pipes[0], base64_decode(\Input::get('jCryption')));
				fclose($pipes[0]);

				$data = stream_get_contents($pipes[1]);
				fclose($pipes[1]);
				proc_close($process);
			}

			parse_str($data, $output);

			try
			{
				$credentials = array(
					'email'			=>	$output['email'],
					'password'	=>	$output['password'],
				);

				if (isset($output['remember'])) $user = \Sentry::authenticateAndRemember($credentials);
				else $user = \Sentry::authenticate($credentials);

				return \Response::json(array('type'=>'success'));
			}
			catch (\Exception $e)
			{
				return \Response::json(array(
					'message'	=>	$e->getMessage(),
					'type'		=>	'danger',
				));
			}
		}
		else
		{
			return \Response::json(array(
				'type'			=>	'danger',
				'message'		=>	'Fail generating session key, reload page?',
				'is_reload'	=>	true,
			));
		}
	}

	/**
	 * Admin logout
	 *
	 * @return view
	 */
	public function getLogout()
	{
		\Sentry::logout();
		return Redirect::to('dashboard');
	}
}