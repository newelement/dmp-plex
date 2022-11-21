import { usePlexStore } from '@/store/plex';
const plexStore = usePlexStore();

function plexControlPlayerState(state) {
    switch (state) {
        case 'playing':
            console.log('-- STARTED NOW PLAYING');
            plexStore.setNowPlaying(true);
            break;
        case 'paused':
        case 'stopped':
            console.log('-- STOPPED NOW PLAYING');
            plexStore.setNowPlaying(false);
            break;
    }
}

function plexNowPlaying() {
    const protocol = plexStore.settings.plexUseSsl ? 'https' : 'http';
    const baseUrl = protocol + '://' + plexStore.settings.plexIpAddress + ':32400';
    route += '?X-Plex-Token=' + plexStore.settings.plexToken;
    axios
        .get(baseUrl + route + '/status/sessions/')
        .then((response) => {
            const size = response.data.MediaContainer.size;
            if (size > 0) {
                let data = response.data.MediaContainer.Metadata[0];
                let playing = {
                    contentRating: 0,
                    rating: 0,
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

                //this.setNowPlaying(playing);
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
            if (!this.checkedPlexMediaType) {
                console.log('PLEX CHECK SESSION TYPE');
                const protocol = plexStore.settings.plexUseSsl ? 'https' : 'http';
                const baseUrl = protocol + '://' + plexStore.settings.plexIpAddress + ':32400';
                route += '?X-Plex-Token=' + plexStore.settings.plexToken;
                axios
                    .get(baseUrl + route + '/status/sessions/')
                    .then((response) => {
                        console.log(response);
                        const size = response.data.MediaContainer.size;
                        if (size > 0) {
                            let data = response.data.MediaContainer.Metadata[0];
                            this.checkedPlexMediaType = true;
                            if (
                                (data.type === 'movie' &&
                                    plexStore.settings.plexShowMovieNowPlaying) ||
                                ((data.type === 'show' || data.type === 'episode') &&
                                    plexStore.settings.plexShowTvNowPlaying)
                            ) {
                                plexControlPlayerState(state);
                            }
                        }
                    })
                    .catch(() => {});
            }
        }

        if (state === 'stopped' && plexStore.nowPlaying) {
            this.checkedPlexMediaType = false;
            plexControlPlayerState(state);
        }
    });
}

setTimeout(() => {
    plexStore.getPlexSettings().then(() => {
        startPlexSocket();
    });
}, 5000);
