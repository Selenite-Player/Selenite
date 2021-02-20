const fetch = require('node-fetch')

const settings = require('electron-settings')

require('dotenv').config()

const DEVICE_ID = process.env.DEVICE_ID

function _fetch(url, method){
  return fetch(url, {
    method: method,
    headers: { 'Authorization': 'Bearer ' + settings.getSync('access_token') },
  })
  .catch(err => {
    console.log(err.message)
  })
}

function _fetchResult(url, method){
  return fetch(url, {
    method: method,
    headers: { 'Authorization': 'Bearer ' + settings.getSync('access_token') },
  })
  .then(res => {
    if(res.status == '204'){
      throw new Error('204 no content (inactive device)')
    }
    return res.json()
  })
  .then(json => {
    if(json.error){
      console.log(json.error)
    } else {
      return json
    }
  })
  .catch(err => {
    console.log(err.message)
    return null
  })
}

function getCurrentlyPlaying() {
  return _fetchResult(`https://api.spotify.com/v1/me/player?device_id=${DEVICE_ID}`, 'GET')
}

function resume(){
  return _fetch(`https://api.spotify.com/v1/me/player/play?device_id=${DEVICE_ID}`, 'PUT')
}

function pause(){
  return _fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${DEVICE_ID}`, 'PUT')
}

function next(){
  return _fetch('https://api.spotify.com/v1/me/player/next', 'POST')
}

function prev(){
  return _fetch('https://api.spotify.com/v1/me/player/previous', 'POST')
}

module.exports = { 
  getCurrentlyPlaying,
  resume,
  pause,
  next,
  prev
}