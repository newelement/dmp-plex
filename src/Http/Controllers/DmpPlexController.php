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
        return ['settings' => $service->getSettings()];
    }

    public function getSections(PlexMediaSyncService $service)
    {
        return response()->json($service->getSections());
    }

    public function updateSettings(Request $request, PlexMediaSyncService $service)
    {
        $service->updateSettings($request);
        return ['success' => true];
    }

    public function getNowPlaying(PlexMediaSyncService $service)
    {
        return $service->nowPlaying();
    }
}
