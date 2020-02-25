'use strict';

const secrets = require('./secrets.js');

const { WebClient } = require('@slack/web-api');
const _ = require('lodash');
const spotifyTrackIdExtractor = require('./spotifyTrackIdExtractor.js');
const SpotifyWebApi = require('spotify-web-api-node');

async function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function getSpotifyClient() {
    const spotifyApi = new SpotifyWebApi(secrets.spotifyClientCredentials);
    spotifyApi.setRefreshToken(secrets.spotifyRefreshToken);
    
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);

    return spotifyApi;
}

function getSlackClient() {
    const slackClient = new WebClient(secrets.slackBotOauthAccessToken);

    return slackClient;
}

async function getAllSpotifyTracksFromSlack(slackClient, channelId) {
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
    }

    return _.uniqBy(tracks, x => x.trackId);
}

async function getSpotifyTracksInPlaylist(spotifyApi, playlistId) {
    const limit = 100;
    let offset = 0;
    let playlistTracks = [];
    let total = 0;

    do { 
        const playlistTracksResponse = await spotifyApi.getPlaylistTracks(playlistId, {
            limit: limit,
            offset: offset
        });

        offset = playlistTracksResponse.body.offset + playlistTracksResponse.body.limit;
        total = playlistTracksResponse.body.total;

        console.log("Fetched " + playlistTracksResponse.body.limit + " tracks from playlist");

        playlistTracks.push(...playlistTracksResponse.body.items);

        await delay(200);
    }
    while (playlistTracks.length < total);

    return playlistTracks;
}

async function putSpotifyTracksIntoPlaylist(spotifyApi, tracksToAdd, playlistId) {
    const currentTracks = await getSpotifyTracksInPlaylist(spotifyApi, playlistId);

    const currentTrackIds = currentTracks.map(x => x.track.id);
    // spotify has some tracks that link from multiple IDs - this also excludes the aliases
    const currentLinkedFromTrackIds = currentTracks.map(x => x.track.linked_from && x.track.linked_from.id).filter(x => x != null);

    const trackIdsBeingAdded = tracksToAdd.map(x => x.trackId);

    const newTracksToAdd = _.difference(_.difference(trackIdsBeingAdded, currentTrackIds), currentLinkedFromTrackIds);

    if (newTracksToAdd.length === 0) {
        return 0;
    }

    const chunked = _.chunk(newTracksToAdd, 20);

    for (const chunk of chunked) {
        await spotifyApi.addTracksToPlaylist(playlistId, chunk.map(x => 'spotify:track:' + x));
        console.log("Added " + chunk.length + " tracks");
        await delay(1000);
    }

    return newTracksToAdd.length;
}

(async () => {

    try {
        const slackApi = getSlackClient();
        const tracks = await getAllSpotifyTracksFromSlack(slackApi, secrets.spotifyChannelName);
        console.log("Got " + tracks.length + " tracks from slack, total");

        const spotifyApi = await getSpotifyClient();
        const tracksAdded = await putSpotifyTracksIntoPlaylist(spotifyApi, tracks, '4VgNNTXhy73ZCvqT2MthV5');

        console.log('Success! Added ' + tracksAdded + ' tracks');

    } catch (error) {
        console.log(error);
    }

})();

