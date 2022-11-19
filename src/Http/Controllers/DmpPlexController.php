<?php

namespace Newelement\DmpPlex\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Newelement\DmpPlex\Services\PlexMediaSyncService;

class DmpPlexController extends Controller
{
	public function install(PlexMediaSyncService $service)
	{
		return $service->install();
	}

	public function update()
	{
		//
	}

	public function getSettings(PlexMediaSyncService $service)
	{
		return $service->getSettings();
	}

	public function updateSettings(Request $request, PlexMediaSyncService $service)
	{
		$service->updateSettings($request);
		return redirect()->back()->with('success', 'Plex settings updated');
	}

	public function getNowPlaying(PlexMediaSyncService $service)
	{
		return $service->nowPlaying();
	}
}
