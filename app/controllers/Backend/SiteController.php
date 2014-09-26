<?php

namespace Backend;

class SiteController extends \BaseController
{
	/**
	 * Filter route and request
	 *
	 * @return void
	 */
	public function __construct()
	{
		// $this->beforeFilter('auth.admin', array('except'=>'getLogin'));
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
		if (Sentry::check())
		{
			return \Response::json(array(
				'type'	=>	'success',
			));
		}

		return \Response::json(array(
			'type'	=>	'danger',
		));
	}

	// /**
	//  * Dashboard login view
	//  *
	//  * @return view
	//  */
	// public function getLogin()
	// {
	// 	return \View::make('backend.login');
	// }
}