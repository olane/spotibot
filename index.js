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

async function putSpotifyTracksIntoPlaylist(tracks, playlistId) {
  const data = await spotifyApi.refreshAccessToken();
  spotifyApi.setAccessToken(data.body['access_token']);

  return spotifyApi.addTracksToPlaylist(playlistId, tracks.map(x => 'spotify:track:' + x.trackId));
}

(async () => {

  try {
    const tracks = await getAllSpotifyTracks(slackClient, secrets.spotifyChannelName);

    console.log(tracks);

    await putSpotifyTracksIntoPlaylist(tracks, '4VgNNTXhy73ZCvqT2MthV5');

    console.log('Success! Added ' + tracks.length + ' tracks');

  } catch (error) {
    console.log(error);
  }

})();

