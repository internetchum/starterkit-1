<?php

namespace App\Http\Controllers\Frontend;

use Illuminate\Routing\Controller;

class SiteController extends Controller
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