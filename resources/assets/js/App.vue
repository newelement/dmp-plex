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
        ...mapActions(usePlexStore, []),
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
};
</script>
