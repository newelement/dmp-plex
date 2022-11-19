<?php

use Illuminate\Database\Seeder;
use Newelement\DmpPlex\Models\DmpPlexSetting;

class DmpPlexSettingsSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		DmpPlexSetting::firstOrCreate(
			[ 'setting_name' => 'enable' ],
			[ 'bool_value' => 0 ]
		);
	}
}
