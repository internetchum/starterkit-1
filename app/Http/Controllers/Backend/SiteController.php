<?php

namespace App\Http\Controllers\Backend;
use Illuminate\Routing\Controller;

class SiteController extends Controller
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
	 * Filter route and request
	 *
	 * @return void
	 */
	public function __construct()
	{
		//$this->beforeFilter('auth.admin', array('except'=>'getLogin'));
	}

	/**
	 * Get public auth key
	 *
	 * @return json
	 */
	public function getAuthGen()
	{
		$arrOutput = array(
			"publickey" => file_get_contents('rsa_4096_pub.pem')
		);

		return json_encode($arrOutput);
	}

	/**
	 * Get challenge and set session key
	 *
	 * @return json
	 */
	public function postAuthHandshake()
	{
		$cmd = sprintf("openssl rsautl -decrypt -inkey rsa_4096_priv.pem");
		$process = proc_open($cmd, $this->descriptorspec, $pipes);
		if (is_resource($process))
		{
			fwrite($pipes[0], base64_decode($_POST['key']));
			fclose($pipes[0]);

			$key = stream_get_contents($pipes[1]);
			fclose($pipes[1]);
			proc_close($process);
		}

		\Session::put('ch_key', $key);
		\Session::save();
		
		$cmd = sprintf("openssl enc -aes-256-cbc -pass pass:" . escapeshellarg($key) . " -a -e");
		$process = proc_open($cmd, $this->descriptorspec, $pipes);
		if (is_resource($process))
		{
			fwrite($pipes[0], $key);
			fclose($pipes[0]);

			$challenge = trim(str_replace("\n", "", stream_get_contents($pipes[1])));
			fclose($pipes[1]);
			proc_close($process);
		}

		return json_encode(array("challenge" =>  $challenge));
	}

	/**
	 * Dashboard view
	 *
	 * @return view
	 */
	public function getIndex()
	{
		return \View::make('backend.dashboard');
	}

	/**
	 * Check for authentication with backbone
	 *
	 * @return response
	 */
	public function postAuthCheck()
	{
		if (\Sentry::check())
		{
			return \Response::json(array(
				'type'	=>	'success',
			));
		}

		return \Response::json(array(
			'type'	=>	'danger',
		));
	}
}