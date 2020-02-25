'use strict';

const secrets = require('./secrets');
const spotify = require('./spotify');
const slack = require('./slack');

async function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function shovelTracks() {
    try {
        const slackApi = slack.getSlackClient(secrets);
        const tracks = await slack.getAllSpotifyTracksFromSlack(slackApi, secrets.spotifyChannelName, 1);
        console.log("Got " + tracks.length + " tracks from slack, total");

        const spotifyApi = await spotify.getSpotifyClient(secrets);
        const tracksAdded = await spotify.putSpotifyTracksIntoPlaylist(spotifyApi, tracks, '4VgNNTXhy73ZCvqT2MthV5');
        console.log('Success! Added ' + tracksAdded + ' tracks');
    } catch (error) {
        console.log(error);
    }
}

async function shovelTracksRepeatedly() {
    while (true) {
        await shovelTracks();
        console.log("Waiting 5 minutes...");
        await delay(1000 * 60 * 5);
    }
}

if (process.argv[2] === 'daemon') {
    shovelTracksRepeatedly();
}
else {
    shovelTracks();
}

