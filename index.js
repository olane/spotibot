'use strict';

const secrets = require('./secrets.js');

const { WebClient } = require('@slack/web-api');
const _ = require('lodash');
const spotifyTrackIdExtractor = require('./spotifyTrackIdExtractor.js');
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi(secrets.spotifyClientCredentials);
spotifyApi.setRefreshToken(secrets.spotifyRefreshToken);

const slackClient = new WebClient(secrets.slackBotOauthAccessToken);

async function getAllSpotifyTracks(slackClient, channelId) {
    let tracks = [];

    for await (const page of slackClient.paginate('conversations.history', { channel: channelId })) {
        const theseTracks = _.flatten(page.messages.map(message => 
            spotifyTrackIdExtractor.extractTrackIds(message.text).map(trackId => ({
              trackId: trackId,
              timestamp: message.ts 
            }))
        ));
        tracks.push(...theseTracks);
    }

    return tracks;
}

async function refreshSpotifyAccessToken() {
  const data = await spotifyApi.refreshAccessToken();
  spotifyApi.setAccessToken(data.body['access_token']);
}

async function getSpotifyTracksInPlaylist(playlistId) {
  const playlistTracks = await spotifyApi.getPlaylistTracks(playlistId, {
    fields: 'items'
  });

  return playlistTracks.body.items;
}

async function putSpotifyTracksIntoPlaylist(tracksToAdd, playlistId) {
  const currentTracks = await getSpotifyTracksInPlaylist(playlistId);

  const currentTrackIds = currentTracks.map(x => x.track.id);
  const trackIdsBeingAdded = tracksToAdd.map(x => x.trackId);

  const newTracksToAdd = _.difference(trackIdsBeingAdded, currentTrackIds);

  if (newTracksToAdd.length === 0) {
    return 0;
  }

  await spotifyApi.addTracksToPlaylist(playlistId, newTracksToAdd.map(x => 'spotify:track:' + x));
  return newTracksToAdd.length;
}

(async () => {

  try {
    const tracks = await getAllSpotifyTracks(slackClient, secrets.spotifyChannelName);

    console.log(tracks);

    await refreshSpotifyAccessToken();
    await getSpotifyTracksInPlaylist('4VgNNTXhy73ZCvqT2MthV5');
    const tracksAdded = await putSpotifyTracksIntoPlaylist(tracks, '4VgNNTXhy73ZCvqT2MthV5');

    console.log('Success! Added ' + tracksAdded + ' tracks');

  } catch (error) {
    console.log(error);
  }

})();

