'use strict';

const secrets = require('./secrets.js');

const { WebClient } = require('@slack/web-api');
const _ = require('lodash');
const spotifyTrackIdExtractor = require('./spotifyTrackIdExtractor.js');
const spotify = require('./spotify');


function getSlackClient() {
    const slackClient = new WebClient(secrets.slackBotOauthAccessToken);

    return slackClient;
}

async function getAllSpotifyTracksFromSlack(slackClient, channelId, pageLimit = -1) {
    let tracks = [];

    let pageCount = 0;

    for await (const page of slackClient.paginate('conversations.history', { channel: channelId })) {
        const theseTracks = _.flatten(page.messages.map(message =>
            spotifyTrackIdExtractor.extractTrackIds(message.text).map(trackId => ({
                trackId: trackId,
                timestamp: message.ts
            }))
        ));
        tracks.push(...theseTracks);
        pageCount++;

        console.log("Fetched " + theseTracks.length + " tracks from slack");

        if (pageLimit !== -1 && pageCount >= pageLimit) {
            break;
        }
    }

    return _.uniqBy(tracks, x => x.trackId);
}

(async () => {

    try {
        const slackApi = getSlackClient();
        const tracks = await getAllSpotifyTracksFromSlack(slackApi, secrets.spotifyChannelName, 1);
        console.log("Got " + tracks.length + " tracks from slack, total");

        const spotifyApi = await spotify.getSpotifyClient(secrets);
        const tracksAdded = await spotify.putSpotifyTracksIntoPlaylist(spotifyApi, tracks, '4VgNNTXhy73ZCvqT2MthV5');

        console.log('Success! Added ' + tracksAdded + ' tracks');

    } catch (error) {
        console.log(error);
    }

})();

