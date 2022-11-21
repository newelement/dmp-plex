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
                    this.settings = response.data.settings;
                    return this.settings;
                })
                .catch((e) => {
                    console.log(e.message);
                });
        },
        setSettings() {},
        setSetting(key, val) {
            this.settings[key] = val;
        },
        setNowPlaying(val) {
            this.nowPlaying = val;
        },
        setMovieLibrary(item) {
            if (!this.settings.plexMovieLibraries.includes(item)) {
                this.settings.plexMovieLibraries.push(item);
            }
        },
        removeMovieLibrary(item) {
            this.settings.plexMovieLibraries.splice(
                this.settings.plexMovieLibraries.indexOf(item),
                1
            );
        },
        setTvLibrary(item) {
            if (!this.settings.plexTvLibraries.includes(item)) {
                this.settings.plexTvLibraries.push(item);
            }
        },
        removeTvLibrary(item) {
            this.settings.plexTvLibraries.splice(this.settings.plexTvLibraries.indexOf(item), 1);
        },
    },
});
