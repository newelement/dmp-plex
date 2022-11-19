import { defineStore } from 'pinia';

export const usePlexStore = defineStore('plex', {
    state: () => ({
        loading: false,
        settings: {},
        nowPlaying: false,
        checkedPlexMediaType: false,
    }),
    getters: {},
    actions: {
        getPLexSettings() {
            return axios
                .get('/api/dmp-plex/settings')
                .then((response) => {
                    this.settings = response.data;
                    return response.data;
                })
                .catch((e) => {
                    console.log(e.message);
                });
        },
        setNowPlaying(val) {
            this.nowPlaying = val;
        },
    },
});
