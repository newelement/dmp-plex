let e={settings:""},g=!1,r=!1;function P(t){switch(t){case"playing":console.log("-- PLEX STARTED NOW PLAYING"),g=!0,x();break;case"paused":case"stopped":console.log("-- PLEX STOPPED NOW PLAYING"),g=!1,r=!1,axios.post("/api/stopped",{mediaSource:"dmp-plex"});break}}function x(){const t=e.settings.plexUseSsl?"https":"http",c=t+"://"+e.settings.plexIpAddress+":32400",l="?X-Plex-Token="+e.settings.plexToken;axios.get(c+"/status/sessions/"+l).then(o=>{if(o.data.MediaContainer.size>0){let s=o.data.MediaContainer.Metadata[0],a={mediaSource:"dmp-plex",mediaType:"movie",contentRating:0,audienceRating:0,duration:null,poster:""},d=s.type==="show"||s.type==="episode"?o.data.MediaContainer.Metadata[0].grandparentThumb:o.data.MediaContainer.Metadata[0].thumb;a.poster=t+"://"+e.settings.plexIpAddress+":32400"+d+"?X-Plex-Token="+e.settings.plexToken,a.contentRating=s.contentRating,s.audienceRating&&(a.audienceRating=s.audienceRating),s.duration&&(a.duration=s.duration/1e3/60),axios.post("/api/now-playing",a).then(n=>{console.log(n)}).catch(n=>{console.log("PLEX NOW PLAYING ERROR: ",n.message)})}}).catch(o=>{console.log(o.message)})}function T(){const t=new WebSocket("ws://"+e.settings.plexIpAddress+":32400/:/websockets/notifications?X-Plex-Token="+e.settings.plexToken);t.addEventListener("open",()=>{}),t.addEventListener("message",c=>{const l=JSON.parse(c.data),o=l.NotificationContainer.type;let i;if(console.log("PLEX ACTION: ",o),o==="playing"&&(i=l.NotificationContainer.PlaySessionStateNotification[0].state,console.log("PLEX STATE: ",i),!r)){console.log("PLEX CHECK SESSION TYPE");const a=(e.settings.plexUseSsl?"https":"http")+"://"+e.settings.plexIpAddress+":32400",d="?X-Plex-Token="+e.settings.plexToken;axios.get(a+"/status/sessions/"+d).then(n=>{if(console.log(n),n.data.MediaContainer.size>0){let p=n.data.MediaContainer.Metadata[0];r=!0,console.log("PLEX TYPE: ",p.type),console.log("PLEX STORE PLAYING BOOL: ",e.settings.plexShowMovieNowPlaying),(p.type==="movie"&&e.settings.plexShowMovieNowPlaying||(p.type==="show"||p.type==="episode")&&e.settings.plexShowTvNowPlaying)&&(console.log(" -- PLEX PRE CONTROL PLAYING STATE"),P(o))}}).catch(()=>{})}i==="stopped"&&g&&P(i)})}setTimeout(()=>{axios.get("/api/dmp-plex/settings").then(t=>{e.settings=t.data.settings,T()}).catch(t=>{console.log("ERROR GETTING PLEX NOW PLAYING SETTINGS: "+t.message)})},6e3);
