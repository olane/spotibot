'use strict';

const secrets = require('./secrets.js');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();
const port = 3000;

app.get('/callback', (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  console.log('Got authorization code ' + code);
  console.log('Got state ' + state);

  res.send('OK - view log for auth code');
});

app.listen(port, () => console.log(`App listening on port ${port}`));


const scopes = ['playlist-read-collaborative','playlist-modify-public','playlist-read-private','playlist-modify-private'];
const spotifyApi = new SpotifyWebApi(secrets.spotifyClientCredentials);

// Create the authorization URL
const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'some-state');

console.log('Authorization URL:');
console.log(authorizeURL);
