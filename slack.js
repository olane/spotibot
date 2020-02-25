'use strict';

const { WebClient } = require('@slack/web-api');
const _ = require('lodash');
const spotifyTrackIdExtractor = require('./spotifyTrackIdExtractor');

function getSlackClient(secrets) {
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

    const uniqueTracks = _.uniqBy(tracks, x => x.trackId);

    const sortedUniqueTracks = _.sortBy(uniqueTracks, x => x.timestamp);

    return sortedUniqueTracks;
}

module.exports = {
    getSlackClient,
    getAllSpotifyTracksFromSlack
};
