<?php

namespace Newelement\DmpPlex\Commands;

use Illuminate\Console\Command;
use Newelement\DmpPlex\Services\PlexMediaSyncService;

class DmpPlexSyncCommand extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'dmp-plex:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'DMP Plex poster sync';


    public function handle()
    {
        $service = new PlexMediaSyncService();
        $service->syncMedia();
    }
}
