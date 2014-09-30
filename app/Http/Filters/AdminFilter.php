<?php namespace App\Http\Filters;

use Cartalyst\Sentry\Facades\Laravel\Sentry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\Foundation\Application;
use App\Helper;

class AdminFilter
{
	/**
	 * The application implementation.
	 *
	 * @var Application
	 */
	protected $app;

	/**
	 * Create a new filter instance.
	 *
	 * @param Sentry $user
	 * @return void
	 */
	public function __construct(Application $app)
	{
		$this->app = $app;

		define('ASSET_DIR', Helper::assetHelper());

		$provider = \Sentry::getThrottleProvider();
		if (!$provider->isEnabled())
		{
			$provider->enable();
		}
	}

	/**
	 * Run the request filter.
	 *
	 * @return mixed
	 */
	public function filter()
	{
		if ($this->app->environment() != 'local')
		{
			$helper = new Helper;
			if (!in_array(\Request::getClientIp(), $helper->getAllowedIp()))
				return new RedirectResponse(url('/'));
		}
		
		//if ($this->user->check()) return new RedirectResponse(url('dashboard/login'));
	}
}