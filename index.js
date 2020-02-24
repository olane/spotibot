'use strict';

const secrets = require('./secrets.js');

const { WebClient } = require('@slack/web-api');
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

