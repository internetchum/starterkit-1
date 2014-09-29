<?php

namespace Frontend;

class SiteController extends \BaseController
{
	/**
	 * Helper model
	 *
	 * @return Eloquent\Helper
	 */
	protected $helperModel;

	/**
	 * Filter routes, requests, and set protected variables
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->helperModel = new \Helper;
	}

	/**
	 * Home view
	 *
	 * @return view
	 */
	public function getIndex()
	{
		return \View::make('frontend.home');
	}

	/**
	 * Get assets
	 *
	 * @return mixed
	 */
	public function getAsset()
	{
		if (\Input::has('_t'))
		{
			switch (\Input::get('_t'))
			{
				case 'logo':
					return ASSET_DIR.'/assets/images/'.$this->helperModel->getLogoName();
					break;

				default:
					return null;
					break;
			}
		}
	}
}