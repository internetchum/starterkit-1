<?php

namespace Frontend;

class SiteController extends \BaseController
{
	/**
	 * Home view
	 *
	 * @return view
	 */
	public function getIndex()
	{
		return \View::make('frontend.home');
	}
}