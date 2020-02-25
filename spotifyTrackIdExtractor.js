'use strict';

function extractTrackIds(messageText) {
    const spotifyTrackUrlRegex = /https:\/\/open.spotify.com\/track\/\w+/gi;

    const matches = messageText.match(spotifyTrackUrlRegex);

    if (!matches) {
        return [];
    }

    const ids = matches.map(x => x.substring('https://open.spotify.com/track/'.length));

    // final sanity check: track ids are 22 characters long, something has gone wrong if we have something longer or shorter
    return ids.filter(x => x.length === 22);
};

module.exports = {
    extractTrackIds
};
