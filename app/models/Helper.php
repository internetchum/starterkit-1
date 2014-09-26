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
	 * Return allowed IP to access backend
	 *
	 * @return array
	 */
	public function getAllowedIp()
	{
		return $this->allowed_ip;
	}
}