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
        getPlexSettings() {
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
        setSettings() {},
        setSetting(key, val) {},
        setNowPlaying(val) {
            this.nowPlaying = val;
        },
    },
});
