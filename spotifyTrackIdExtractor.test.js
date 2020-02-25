'use strict';

const extractor = require('./spotifyTrackIdExtractor');

test('Extracts standard spotify track ID from url', () => {
    const result = extractor.extractTrackIds('https://open.spotify.com/track/10vkYRKw6Jjr7try1ir50G?si=38swX6RjQQWRL7KEG2-Agg');

    expect(result.length).toBe(1);
    expect(result[0]).toBe('10vkYRKw6Jjr7try1ir50G');
});

test('Extracts multiple spotify track ID from multiple urls', () => {
    const result = extractor.extractTrackIds('https://open.spotify.com/track/10vkYRKw6Jjr7try1ir50G?si=38swX6RjQQWRL7KEG2-Agg https://open.spotify.com/track/3SqVMOupg0AX9xTWqP9PSD');

    expect(result.length).toBe(2);
    expect(result[0]).toBe('10vkYRKw6Jjr7try1ir50G');
    expect(result[1]).toBe('3SqVMOupg0AX9xTWqP9PSD');
});

test('Returns empty if no spotify URL', () => {
    const result = extractor.extractTrackIds('<some other message> https://google.com');

    expect(result.length).toBe(0);
});

test('rejects invalid length ID', () => {
    // the first one of these has an accidental extra e on the end
    const result = extractor.extractTrackIds('https://open.spotify.com/track/53FlV8SMfTTgF8uD8I31P4e https://open.spotify.com/track/53FlV8SMfTTgF8uD8I31P4');

    expect(result.length).toBe(1);
    expect(result[0]).toBe('53FlV8SMfTTgF8uD8I31P4');
    
})
