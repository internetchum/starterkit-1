<?php

class AdminSeeder extends \Seeder
{
	public function run()
	{
		// \Sentry::createGroup(array(
		// 	'name'        => 'Admin',
		// 	'permissions' => array(),
		// ));

		$data = array(
			'email'				=>	'admin@email.org',
			'password'		=>	'password',
			'slug'				=>	'admin',
			'first_name'	=>	'Admin',
			'last_name'		=>	null,
			'token'				=>	Hash::make(Str::random(10)),
			'activated'		=>	true,
		);

		$user = \Sentry::register($data);
		$group = \Sentry::findGroupByName('Admin');
		$user->addGroup($group);
	}
}