let plexStore = {
    settings: '',
};
let nowPlaying = false;
let checkedPlexMediaType = false;

function plexControlPlayerState(state) {
    switch (state) {
        case 'playing':
            console.log('-- PLEX STARTED NOW PLAYING');
            nowPlaying = true;
            plexNowPlaying();
            break;
        case 'paused':
        case 'stopped':
            console.log('-- PLEX STOPPED NOW PLAYING');
            nowPlaying = false;
            checkedPlexMediaType = false;
            axios.post('/api/stopped', { mediaSource: 'dmp-plex' });
            break;
    }
}

function plexNowPlaying() {
    const protocol = plexStore.settings.plexUseSsl ? 'https' : 'http';
    const baseUrl = protocol + '://' + plexStore.settings.plexIpAddress + ':32400';
    const params = '?X-Plex-Token=' + plexStore.settings.plexToken;
    axios
        .get(baseUrl + '/status/sessions/' + params)
        .then((response) => {
            const size = response.data.MediaContainer.size;
            if (size > 0) {
                let data = response.data.MediaContainer.Metadata[0];
                let playing = {
                    mediaSource: 'dmp-plex',
                    mediaType: 'movie',
                    contentRating: 0,
                    audienceRating: 0,
                    duration: null,
                    poster: '',
                };

                let poster =
                    data.type === 'show' || data.type === 'episode'
                        ? response.data.MediaContainer.Metadata[0].grandparentThumb
                        : response.data.MediaContainer.Metadata[0].thumb;

                playing.poster =
                    protocol +
                    '://' +
                    plexStore.settings.plexIpAddress +
                    ':32400' +
                    poster +
                    '?X-Plex-Token=' +
                    plexStore.settings.plexToken;

                playing.contentRating = data.contentRating;

                if (data.audienceRating) {
                    playing.audienceRating = data.audienceRating;
                }

                if (data.duration) {
                    playing.duration = data.duration / 1000 / 60;
                }

                axios
                    .post('/api/now-playing', playing)
                    .then((response) => {
                        console.log(response);
                    })
                    .catch((e) => {
                        console.log('PLEX NOW PLAYING ERROR: ', e.message);
                    });
            }
        })
        .catch((e) => {
            console.log(e.message);
        });
}

function startPlexSocket() {
    const socket = new WebSocket(
        'ws://' +
            plexStore.settings.plexIpAddress +
            ':32400/:/websockets/notifications' +
            '?X-Plex-Token=' +
            plexStore.settings.plexToken
    );

    socket.addEventListener('open', () => {});

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        const action = data.NotificationContainer.type;
        let state;
        console.log('PLEX ACTION: ', action);
        if (action === 'playing') {
            state = data.NotificationContainer.PlaySessionStateNotification[0].state;
            console.log('PLEX STATE: ', state);
            // Make status session call to check if its a movie
            if (!checkedPlexMediaType) {
                console.log('PLEX CHECK SESSION TYPE');
                const protocol = plexStore.settings.plexUseSsl ? 'https' : 'http';
                const baseUrl = protocol + '://' + plexStore.settings.plexIpAddress + ':32400';
                const params = '?X-Plex-Token=' + plexStore.settings.plexToken;
                axios
                    .get(baseUrl + '/status/sessions/' + params)
                    .then((response) => {
                        console.log(response);
                        const size = response.data.MediaContainer.size;
                        if (size > 0) {
                            let data = response.data.MediaContainer.Metadata[0];
                            checkedPlexMediaType = true;
                            console.log('PLEX TYPE: ', data.type);
                            console.log(
                                'PLEX STORE PLAYING BOOL: ',
                                plexStore.settings.plexShowMovieNowPlaying
                            );
                            if (
                                (data.type === 'movie' &&
                                    plexStore.settings.plexShowMovieNowPlaying) ||
                                ((data.type === 'show' || data.type === 'episode') &&
                                    plexStore.settings.plexShowTvNowPlaying)
                            ) {
                                console.log(' -- PLEX PRE CONTROL PLAYING STATE');
                                plexControlPlayerState(action);
                            }
                        }
                    })
                    .catch(() => {});
            }
        }

        if (state === 'stopped' && nowPlaying) {
            plexControlPlayerState(state);
        }
    });
}

setTimeout(() => {
    axios
        .get('/api/dmp-plex/settings')
        .then((response) => {
            plexStore.settings = response.data.settings;
            startPlexSocket();
        })
        .catch((e) => {
            console.log('ERROR GETTING PLEX NOW PLAYING SETTINGS: ' + e.message);
        });
}, 6000);
