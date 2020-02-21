'use strict';

function extractTrackIds(messageText) {
    const spotifyTrackUrlRegex = /https:\/\/open.spotify.com\/track\/\w+/gi;

    const matches = messageText.match(spotifyTrackUrlRegex);

    if (!matches) {
        return [];
    }

    return matches.map(x => x.substring('https://open.spotify.com/track/'.length))
};

module.exports = {
    extractTrackIds
};
