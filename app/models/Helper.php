<?php

class Helper
{
	/**
	 * List of ip allowed to access backend
	 *
	 * @var array
	 */
	protected $allowed_ip = array(
		'127.0.0.1',
	);

	/**
	 * Site logo file name
	 *
	 * @var string
	 */
	protected $logo_name = 'logo.png';

	/**
	 * Return allowed ip to pass backend
	 *
	 * @return string
	 */
	public function getAllowedIp()
	{
		return $this->allowed_ip;
	}

	/**
	 * Return main logo name
	 *
	 * @return string
	 */
	public function getLogoName()
	{
		return $this->logo_name;
	}

	/**
	 * Return string to asset
	 *
	 * @return string
	 */
	public static function assetHelper()
	{
		$public = parse_url(\URL::to('/'));
		$current = parse_url(\URL::current());
		
		if (!isset($current['path']))
		{
			$current = \URL::to('/');
		}
		else
		{
			$current = explode('/', $current['path']);
		}

		$str = '';

		if (count($current) > 0)
		{
			for ($i=0; $i<(count($current)-2); $i++)
			{
				$str .= '../';
			}
		}

		return $str;
	}
	
	/** 
	 * Make unique slug
	 *
	 * @return string
	 */
	public static function getSlug($title, $model)
	{
		$slug = \Str::slug($title,'-');
		$slugCount = count($model->whereRaw("slug REGEXP '^{$slug}(-[0-9]*)?$'")->get());

		return ($slugCount > 0) ? "{$slug}-{$slugCount}" : $slug;
	}
}