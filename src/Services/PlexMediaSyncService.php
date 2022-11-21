<?php

namespace Newelement\DmpPlex\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use App\Interfaces\MediaSyncInterface;
use App\Traits\PosterProcess;
use Illuminate\Support\Facades\Artisan;
use Plugin;

class PlexMediaSyncService implements MediaSyncInterface
{
    use PosterProcess;

    public $plexSettings = [];

    public function __construct()
    {
        $this->setSettings();
        $this->setPlexSettings();
    }

    public function setSettings()
    {
        $this->settings = Setting::first();
    }

    /**
     * Install the plugin
     *
     * @return array
     */
    public function install(): array
    {
        Artisan::call('vendor:publish', ['--provider' => 'Newelement\DmpPlex\DmpPlexServiceProvider', '--force' => true]);

        $plugin = [
            'type' => 'media_source',
            'plugin_key' => 'dmp-plex',
            'name' => 'Plex Media Sync and Now Playing',
            'description' => 'Syncs movie posters and shows now playing.',
            'url' => 'https://github.com/newelement/dmp-plex',
            'repo' => 'newelement/dmp-plex',
            'version' => '1.0.0',
        ];

        Plugin::install($plugin);

        $options = [
            [
                'type' => 'string',
                'value' => null,
                'field_name' => 'plex_ip_address',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'string',
                'value' => null,
                'field_name' => 'plex_token',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'boolean',
                'value' => false,
                'field_name' => 'plex_use_ssl',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'boolean',
                'value' => true,
                'field_name' => 'plex_show_movie_now_playing',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'boolean',
                'value' => false,
                'field_name' => 'plex_show_tv_now_playing',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'boolean',
                'value' => true,
                'field_name' => 'plex_sync_movies',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'boolean',
                'value' => false,
                'field_name' => 'plex_sync_tv',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'json',
                'value' => [],
                'field_name' => 'plex_movie_libraries',
                'plugin_key' => 'dmp-plex',
            ],
            [
                'type' => 'json',
                'value' => [],
                'field_name' => 'plex_tv_libraries',
                'plugin_key' => 'dmp-plex',
            ]
        ];

        Plugin::addOptions($options);

        Artisan::call('optimize:clear');
        Artisan::call('optimize');

        return ['success' => true];
    }

    public function update()
    {
        //
    }

    public function setPlexSettings()
    {
        // Can also call Plugin::getOptions('dmp-plex') to get full options array
        $this->plexSettings['plexIpAddress'] = Plugin::getOptionValue('plex_ip_address');
        $this->plexSettings['plexToken'] = Plugin::getOptionValue('plex_token');
        $this->plexSettings['plexUseSsl'] = Plugin::getOptionValue('plex_use_ssl');
        $this->plexSettings['plexShowMovieNowPlaying'] = Plugin::getOptionValue('plex_show_movie_now_playing');
        $this->plexSettings['plexShowTvNowPlaying'] = Plugin::getOptionValue('plex_show_tv_now_playing');
        $this->plexSettings['plexSyncMovies'] = Plugin::getOptionValue('plex_sync_movies');
        $this->plexSettings['plexSyncTv'] = Plugin::getOptionValue('plex_sync_tv');
        $this->plexSettings['plexMovieLibraries'] = (array) Plugin::getOptionValue('plex_movie_libraries');
        $this->plexSettings['plexTvLibraries'] = (array) Plugin::getOptionValue('plex_tv_libraries');
    }

    public function getSettings()
    {
        return $this->plexSettings;
    }

    public function updateSettings($request)
    {
        Plugin::updateOption('plex_ip_address', $request->plexIpAddress);
        Plugin::updateOption('plex_token', $request->plexToken);
        Plugin::updateOption('plex_use_ssl', $request->plexUseSsl);
        Plugin::updateOption('plex_show_movie_now_playing', $request->plexShowMovieNowPlaying);
        Plugin::updateOption('plex_show_tv_now_playing', $request->plexShowTvNowPlaying);
        Plugin::updateOption('plex_sync_movies', $request->plexSyncMovies);
        Plugin::updateOption('plex_sync_tv', $request->plexSyncTv);
        Plugin::updateOption('plex_movie_libraries', $request->plexMovieLibraries);
        Plugin::updateOption('plex_tv_libraries', $request->plexTvLibraries);
    }

    /**
     * Make Plex API calls to media server
     *
     * @param string $path /path/resource
     * @param string $method get|post
     * @param array $params
     *
     * @return json
     */
    public function apiCall($path, $method = 'GET', $params = [])
    {
        $protocol = $this->plexSettings['plexUseSsl'] ? 'https' : 'http' ;
        $response = Http::withHeaders([
            'Accept' => 'application/json',
        ])->get($protocol.'://'.$this->plexSettings['plexIpAddress'].':32400'.$path.'?X-Plex-Token='.$this->plexSettings['plexToken']);

        return $response->json();
    }

    public function getSections()
    {
        $sections = [];
        $json = $this->apiCall('/library/sections/all');
        $plexSections = $json['MediaContainer']['Directory'];

        foreach ($plexSections as $plexSection) {
            $sections[] = [
                'key' => $plexSection['key'],
                'title' => $plexSection['title'],
                'type' => $plexSection['type']
            ];
        }

        return $sections;
    }

    public function syncMedia()
    {
        if ($this->settings->plex_sync_movies) {
            $this->syncMovies($this->settings->plex_movie_sections);
        }
        if ($this->settings->plex_sync_tv) {
            $this->syncTv($this->settings->plex_tv_sections);
        }
    }

    private function syncMovies($sections)
    {
        foreach ($sections as $section) {
            $json = $this->apiCall('/library/sections/'.$section.'/all');
            $medias = $json['MediaContainer']['Metadata'];

            foreach ($medias as $media) {
                if ($media['type'] === 'movie') {
                    $protocol = $this->plexSettings['plexUseSsl'] ? 'https' : 'http' ;
                    $imageUrl = $protocol.'://'.$this->plexIpAddress.':32400'.$media['thumb'].'?X-Plex-Token='.$this->plexToken;

                    $savedImage = $this->saveImage($media['title'], $imageUrl);

                    $params = [
                        'media_type' => 'movie',
                        'name' => $media['title'],
                        'file_name' => $savedImage['file_name'],
                        'id' => $media['key'],
                        'rating' => isset($media['contentRating']) ? $media['contentRating'] : null,
                        'audience_rating' => isset($media['audienceRating']) ? $media['audienceRating'] : 0,
                        'runtime' => is_numeric($media['duration']) ? $media['duration']/1000/60 : null
                    ];

                    $this->savePoster($params);
                }
            }
        }
    }

    private function syncTv($sections)
    {
        foreach ($sections as $section) {
            $json = $this->apiCall('/library/sections/'.$section.'/all');
            $shows = $json['MediaContainer']['Metadata'];
            foreach ($shows as $media) {
                if ($media['type'] === 'show') {
                    $imageUrl = 'http://'.$this->plexIpAddress.':32400'.$media['thumb'].'?X-Plex-Token='.$this->plexToken;

                    $savedImage = $this->saveImage($media['title'], $imageUrl);

                    $params = [
                        'media_type' => 'tv',
                        'name' => $media['title'],
                        'file_name' => $savedImage['file_name'],
                        'id' => $media['key'],
                        'rating' => isset($media['contentRating']) ? $media['contentRating'] : null,
                        'audience_rating' => isset($media['audienceRating']) ? $media['audienceRating'] : 0,
                    ];

                    $this->savePoster($params);
                }
            }
        }
    }
}
