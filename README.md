Authorizing
===========

Run `ngrok http 3000`

Copy the ngrok URL into the spotify app's callback URLs, adding `/callback` to the end of it. Also copy this value into secrets.js (`spotifyClientCredentials.redirectUri`)

Run `npm run authorize`

The console will print an auth URL - visit it, and log into your spotify account. Accept the app's access.

Once you do, the callback will hit the app and the app will log out your authorization code.

Copy the auth code into secrets.js (`spotifyAuthCode`)