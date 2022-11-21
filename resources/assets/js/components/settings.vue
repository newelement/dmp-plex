<template>
    <div>
        <div class="mb-5">
            <label for="ip-address" class="text-gray-300 block mb-2 font-bold"
                >Plex Server IP Address</label
            >
            <input
                type="text"
                class="text-black w-full mb-2"
                id="ip-address"
                aria-describedby="ipAddressHelp"
                v-model="plexIpAddress"
            />
            <div id="ipAddressHelp" class="text-gray-400 text-sm">
                The IP address of your Plex server.
            </div>
        </div>

        <div class="mb-5">
            <label for="plex-token" class="text-gray-300 block mb-2 font-bold">Plex Token</label>
            <input
                type="text"
                class="text-black w-full mb-2"
                id="plex-token"
                aria-describedby="tokenHelp"
                v-model="plexToken"
            />
            <div id="tokenHelp" class="text-gray-400 text-sm">
                You can find your Plex token
                <a
                    href="https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/"
                    target="_blank"
                    class="underline"
                    >here</a
                >.
            </div>
        </div>

        <div class="mb-5">
            <label for="plex-use-ssl" class="text-gray-300 block mb-2 font-bold flex items-center">
                <input
                    type="checkbox"
                    class="text-black"
                    id="plex-use-ssl"
                    aria-describedby="plex-use-sslHelp"
                    name="plex_use_ssl"
                    v-model="plexUseSsl"
                />
                <span class="ml-2">Use SSL for Plex IP address</span>
            </label>
            <div id="plex-use-sslHelp" class="text-gray-400 text-sm"></div>
        </div>

        <div class="mb-5">
            <label
                for="plex-show-movie-now-playing"
                class="text-gray-300 block mb-2 font-bold flex items-center"
            >
                <input
                    type="checkbox"
                    class="text-black"
                    id="plex-show-movie-now-playing"
                    aria-describedby="plex-show-movie-now-playingHelp"
                    name="show_movie_now_playing"
                    v-model="plexShowMovieNowPlaying"
                />
                <span class="ml-2">Allow Movie Now Playing</span>
            </label>
            <div id="plex-show-movie-now-playingHelp" class="text-gray-400 text-sm"></div>
        </div>

        <div class="mb-5">
            <label
                for="plex-show-tv-now-playing"
                class="text-gray-300 block mb-2 font-bold flex items-center"
            >
                <input
                    type="checkbox"
                    class="text-black"
                    id="plex-show-tv-now-playing"
                    aria-describedby="plex-show-tv-now-playingsHelp"
                    v-model="plexShowTvNowPlaying"
                />
                <span class="ml-2">Allow TV Now Playing</span>
            </label>
            <div id="plex-show-tv-now-playingHelp" class="text-gray-400 text-sm"></div>
        </div>

        <div class="mb-5">
            <label
                for="sync-plex-movies"
                class="text-gray-300 block mb-2 font-bold flex items-center"
            >
                <input
                    type="checkbox"
                    class="text-black"
                    id="sync-plex-movies"
                    aria-describedby="syncplexmoviesHelp"
                    v-model="plexSyncMovies"
                />
                <span class="ml-2">Sync Plex Movies</span>
            </label>
            <div id="syncplexmoviesHelp" class="text-gray-400 text-sm"></div>
        </div>

        <div class="mb-5">
            <label for="sync-plex-tv" class="text-gray-300 block mb-2 font-bold flex items-center">
                <input
                    type="checkbox"
                    class="text-black"
                    id="sync-plex-tv"
                    aria-describedby="syncplextvHelp"
                    v-model="plexSyncTv"
                />
                <span class="ml-2">Sync Plex TV Shows</span>
            </label>
            <div id="syncplextvHelp" class="text-gray-400 text-sm"></div>
        </div>

        <button class="btn mb-4 hover:text-white" @click.prevent="getServiceSections()">
            Refresh Plex Media Libraries
            <small>(Save Plex Credentials first)</small>
        </button>

        <div class="mb-5" v-if="plexSyncMovies">
            <label
                for="plex-movie-sections"
                class="text-gray-300 block mb-2 font-bold flex items-center"
                >Plex Movie Libraries</label
            >
            <select id="plex-movie-sections" class="text-black" v-model="plexMovieSection">
                <option value=""></option>
                <option
                    v-for="(movieSection, mIndex) in plexMovieSections"
                    :value="movieSection.key"
                    :key="'msection-' + mIndex"
                >
                    {{ movieSection.title }}
                </option>
            </select>
            <button
                class="
                    text-black text-sm
                    bg-white
                    border-2 border-gray-500
                    px-3
                    py-2
                    ml-3
                    rounded-none
                    hover:bg-gray-700
                    hover:text-white
                "
                @click.prevent="addMovieSyncLibrary()"
            >
                &plus; Sync Library
            </button>
        </div>

        <div class="mb-5" v-if="plexSyncMovies">
            <ul class="bg-gray-700 px-3 py-2 flex" v-if="plexMovieSections">
                <li v-if="addedMovieSections.length === 0">
                    <span class="text-white">No Movie libraries added yet.</span>
                </li>
                <li
                    class="mr-3 bg-white px-2"
                    v-for="(pmSection, pmIndex) in addedMovieSections"
                    :key="'pmindex-' + pmIndex"
                >
                    <span class="text-black">{{ getMovieLibraryName(pmSection) }}</span>
                    <a href="#" role="button" @click.prevent="removeMovieSyncLibrary(pmSection)"
                        ><span class="ml-2 text-xl text-red-700">&times;</span></a
                    >
                </li>
            </ul>
        </div>

        <div class="mb-5" v-if="plexSyncTv">
            <label
                for="plex-tv-sections"
                class="text-gray-300 block mb-2 font-bold flex items-center"
                >Plex TV Libraries</label
            >
            <select id="plex-tv-sections" v-model="plexTvSection">
                <option value=""></option>
                <option
                    v-for="(tvSection, tIndex) in plexTvSections"
                    :value="tvSection.key"
                    :key="'tsection-' + tIndex"
                >
                    {{ tvSection.title }}
                </option>
            </select>
            <button
                class="
                    text-black text-sm
                    bg-white
                    border-2 border-gray-500
                    px-3
                    py-2
                    ml-3
                    rounded-none
                    hover:bg-gray-700
                    hover:text-white
                "
                @click.prevent="addTvSyncLibrary()"
            >
                &plus; Sync Library
            </button>
        </div>

        <div class="mb-5" v-if="plexSyncTv">
            <ul class="bg-gray-700 px-3 py-2 flex" v-if="plexTvSections">
                <li v-if="addedTvSections.length === 0">
                    <span class="text-white">No TV libraries added yet.</span>
                </li>
                <li
                    class="mr-3 bg-white px-2"
                    v-for="(tvSection, tvIndex) in addedTvSections"
                    :key="'pmindex-' + tvIndex"
                >
                    <span class="text-black">{{ getTvLibraryName(tvSection) }}</span>
                    <a href="#" role="button" @click.prevent="removeTvSyncLibrary(tvSection)"
                        ><span class="ml-2 text-xl text-red-700">&times;</span></a
                    >
                </li>
            </ul>
        </div>

        <div class="mb-3">{{ settingsMessage }}</div>

        <button
            type="submit"
            @click.prevent="updateSettings"
            class="btn text-black bg-gray-300 text-md px-3 py-1 rounded-sm hover:bg-gray-100"
        >
            Save Plex Settings
        </button>
    </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { usePlexStore } from '@/store/plex';

export default {
    name: 'PlexSettings',
    components: {},
    data: () => {
        return {
            plexSections: [],
            plexTvSection: '',
            plexMovieSection: '',
            settingsMessage: '',
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
        addedMovieSections() {
            return this.settings.plexMovieLibraries;
        },
        addedTvSections() {
            return this.settings.plexTvLibraries;
        },
    },
    methods: {
        ...mapActions(usePlexStore, [
            'getPlexSettings',
            'setSetting',
            'setMovieLibrary',
            'setTvLibrary',
            'removeMovieLibrary',
            'removeTvLibrary',
        ]),
        updateSettings() {
            this.settingsMessage = '';
            axios
                .post('/api/dmp-plex/settings', this.settings)
                .then((response) => {
                    this.settingsMessage = 'Settings updated';
                    setTimeout(() => {
                        this.settingsMessage = '';
                    }, 2000);
                })
                .catch((e) => {
                    this.settingsMessage = 'Error saving settings: ' + e.response.data.message;
                });
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
                this.setMovieLibrary(this.plexMovieSection);
            }
        },
        addTvSyncLibrary() {
            if (this.plexTvSection) {
                this.setTvLibrary(this.plexTvSection);
            }
        },
        removeMovieSyncLibrary(item) {
            this.removeMovieLibrary(item);
        },
        removeTvSyncLibrary(item) {
            this.removeTvLibrary(item);
        },
        getServiceSections() {
            axios
                .get('/api/dmp-plex/sections')
                .then((response) => {
                    this.plexSections = response.data;
                })
                .catch((e) => {
                    this.settingsMessage =
                        'Error getting sections from Plex server: ' + e.response.data.message;
                });
        },
    },
    created() {},
    mounted() {
        this.getPlexSettings();
        this.getServiceSections();
    },
};
</script>
