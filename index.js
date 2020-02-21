'use strict';

const secrets = require('./secrets.js');

const { WebClient } = require('@slack/web-api');
var SpotifyWebApi = require('spotify-web-api-node');
const _ = require('lodash');
const spotifyTrackIdExtractor = require('./spotifyTrackIdExtractor.js');

const slackClient = new WebClient(secrets.slackBotOauthAccessToken);

async function getAllSpotifyTracks(slackClient, channelId) {
    let tracks = [];

    for await (const page of slackClient.paginate('conversations.history', { channel: channelId })) {
        const theseTracks = _.flatten(page.messages.map(message => ({
            trackId: spotifyTrackIdExtractor.extractTrackIds(message.text),
            timestamp: message.ts 
        })));
        tracks.push(...theseTracks);
    }

    return tracks;
}

async function putSpotifyTracksIntoPlaylist(tracks, playlistId) {

}

(async () => {

  try {
    const tracks = await getAllSpotifyTracks(slackClient, secrets.spotifyChannelName);

    console.log(tracks);

  } catch (error) {
    console.log(error);
  }

})();

const scopes = ['playlist-read-collaborative','playlist-modify-public','playlist-read-private','playlist-modify-private'];

var spotifyApi = new SpotifyWebApi(secrets.spotifyClientCredentials);
  
// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'some-state');
console.log(authorizeURL);

