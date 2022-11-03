Setup
=====
Create a `secrets.js` file with this template:
```js
module.exports = {
    spotifyClientCredentials : {
        redirectUri: '', // only for auth step, from ngrok (see below)
        clientId: '', // from spotify app dashboard
        clientSecret: '', // from spotify app dashboard
    },
    spotifyRefreshToken: '' // from running `npm run authorize` (see below)
    slackBotOauthAccessToken: 'xoxb-...', // from https://api.slack.com/apps/ in app's oauth and permissions section
    spotifyChannelName: '' // from channel information at the bottom of the spotify channel
}
```
Fill in all the gaps apart from `spotifyRefreshToken` and use the below process to fill that

Authorizing Spotify
===========

Run `ngrok http 3000`

Copy the ngrok URL into the spotify app's callback URLs, adding `/callback` to the end of it. Also copy this value into secrets.js (`spotifyClientCredentials.redirectUri`)

Run `npm run authorize`

The console will print an auth URL - visit it, and log into your spotify account. Accept the app's access.

Once you do, the callback will hit the app and the app will log out your refresh and access code.

Copy the refresh token into secrets.js (`spotifyRefreshToken`)