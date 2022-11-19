<script>
import { mapState, mapGetters, mapActions } from 'pinia';
import { usePlexStore } from '@/store/plex';

export default {
    name: 'PlexPLugin',
    components: {},
    data: function () {
        return {
            plexSections: [],
            plexTvSection: '',
            plexMovieSection: '',
        };
    },
    computed: {
        ...mapState(usePlexStore, ['settings']),
        plexIpAddress: {
            get() {
                return this.settings.plexIpAddress;
            },
            set(val) {
                this.setSetting('plexIpAddress', val);
            },
        },
        plexToken: {
            get() {
                return this.settings.plexToken;
            },
            set(val) {
                this.setSetting('plexToken', val);
            },
        },
        plexUseSsl: {
            get() {
                return this.settings.plexUseSsl;
            },
            set(val) {
                this.setSetting('plexUseSsl', val);
            },
        },
        plexShowMovieNowPlaying: {
            get() {
                return this.settings.plexShowMovieNowPlaying;
            },
            set(val) {
                this.setSetting('plexShowMovieNowPlaying', val);
            },
        },
        plexShowTvNowPlaying: {
            get() {
                return this.settings.plexShowTvNowPlaying;
            },
            set(val) {
                this.setSetting('plexShowTvNowPlaying', val);
            },
        },
        plexSyncMovies: {
            get() {
                return this.settings.plexSyncMovies;
            },
            set(val) {
                this.setSetting('plexSyncMovies', val);
            },
        },
        plexSyncTv: {
            get() {
                return this.settings.plexSyncTv;
            },
            set(val) {
                this.setSetting('plexSyncTv', val);
            },
        },
        plexTvSections() {
            return this.plexSections.filter((item) => {
                return item.type === 'show';
            });
        },
        plexMovieSections() {
            return this.plexSections.filter((item) => {
                return item.type === 'movie';
            });
        },
    },
    methods: {
        ...mapActions(usePlexStore, ['getPlexSettings', 'setSetting']),
        updateSettings() {
            //
            axios.post('/api/dmp-plex/settings', this.settings);
            console.log('updateSettings');
        },
        getMovieLibraryName(key) {
            let obj = this.plexMovieSections.find((item) => {
                return item.key === key;
            });
            return obj ? obj.title : '';
        },
        getTvLibraryName(key) {
            let obj = this.plexTvSections.find((item) => {
                return item.key === key;
            });
            return obj ? obj.title : '';
        },
        addMovieSyncLibrary() {
            if (this.plexMovieSection) {
                if (!this.settings.plex_movie_sections) {
                    this.settings.plex_movie_sections = [];
                }
                if (!this.settings.plex_movie_sections.includes(this.plexMovieSection)) {
                    this.settings.plex_movie_sections.push(this.plexMovieSection);
                }
            }
        },
        addTvSyncLibrary() {
            if (this.plexTvSection) {
                if (!this.settings.plex_tv_sections) {
                    this.settings.plex_tv_sections = [];
                }
                if (!this.settings.plex_tv_sections.includes(this.plexTvSection)) {
                    this.settings.plex_tv_sections.push(this.plexTvSection);
                }
            }
        },
        removeMovieSyncLibrary(item) {
            this.settings.plex_movie_sections.splice(
                this.settings.plex_movie_sections.indexOf(item),
                1
            );
        },
        removeTvSyncLibrary(item) {
            this.settings.plex_tv_sections.splice(this.settings.plex_tv_sections.indexOf(item), 1);
        },
        getServiceSections() {
            axios
                .get('/api/dmp-plex/service-sections')
                .then((response) => {
                    this.plexSections = response.data;
                })
                .catch((e) => {
                    console.log(e.message);
                });
        },
    },
    created() {},
    mounted() {
        this.getPlexSettings();
    },
};
</script>
