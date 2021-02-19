const express = require('express')
const crypto = require("crypto")
const fetch = require('node-fetch')
const app = express()
const main = require('./main.js')

require('dotenv').config()

const AUTH_URL = 'https://accounts.spotify.com/authorize'
const CLIENT_ID = process.env.CLIENT_ID
const REDIRECT_URI = process.env.REDIRECT_URI

app.listen(8888)
console.log('Listening on 8888')

const scopes = ["user-modify-playback-state", "user-read-playback-state"]
let codeVerifier
let codeChallenge

let access_token
let refresh_token

const authenticate = () => {
  codeVerifier = _base64URLEncode(crypto.randomBytes(32))
  codeChallenge = _base64URLEncode(_sha256(codeVerifier))
  
  const authUrl = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=${scopes}`
    // &scope=${scopes}
    // &state=${codeState} This can be used to mitigate cross-site request forgery attacks.
  
    function _sha256(str) {
      return crypto.createHash('sha256')
      .update(str)
      .digest()
    }
  
    function _base64URLEncode(str) {
      return new Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    }

    console.log(authUrl)
    return authUrl
}

app.get('/login', (req, res) => {
  let url = authenticate()
  res.redirect(url)
})

app.get('/callback', (req, res) => {
  const code = req.query.code

  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: `client_id=${CLIENT_ID}&grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}&code_verifier=${codeVerifier}`
  })
  .then(res => res.json())
  .then( json => {
    if (json.error) {
      // main.startAuth();
      console.log(json.error)
    } else {
      access_token = json.access_token
      refresh_token =json.refresh_token
      
      getCurrentlyPlaying(access_token)
        .then((data) => main.startApp(data))
    }
  })
})

function getCurrentlyPlaying(access_token) {
  return fetch('https://api.spotify.com/v1/me/player', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
  })
  .then(res => res.json())
  .then(json => {
    if(json.error){
      console.log(error)
    } else {
      console.log(json)
      return json
    }
  })
}

// Request refreshed access token
const refresh = () => {
  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: `grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${CLIENT_ID}`
  })
  .then(res => res.json())
  .then(json => {
    if (json.error) {
      // try login again
      console.log('error', json)
    } else {
      access_token = json.access_token
      refresh_token = json.refresh_token
    }
  })
}

module.exports = { refresh }

/* A refresh token that has been obtained through PKCE can be exchanged for an access token only once, after which it becomes invalid. */