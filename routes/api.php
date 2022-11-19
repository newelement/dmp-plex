<?php

use Newelement\DmpPlex\Http\Controllers\DmpPlexController;

// These are /api/* routes
Route::get('/dmp-plex/settings', [DmpPlexController::class, 'getSettings']);
Route::get('/dmp-plex/sections', [DmpPlexController::class, 'getSections']);
Route::post('/dmp-plex/settings', [DmpPlexController::class, 'updateSettings']);
Route::get('/dmp-plex/now-playing', [DmpPlexController::class, 'getNowPlaying']);

Route::get('/dmp-plex-install', [DmpPlexController::class, 'install']);
Route::get('/dmp-plex-update', [DmpPlexController::class, 'update']);
