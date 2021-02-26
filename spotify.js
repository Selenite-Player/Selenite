const fetch = require('node-fetch')

const settings = require('electron-settings')

require('dotenv').config()

let DEVICE_ID = settings.hasSync('device_id') ? settings.getSync('device_id') : null

function _fetch(url, method, body = null){
  return fetch(url, {
    method: method,
    headers: { 'Authorization': 'Bearer ' + settings.getSync('access_token') },
    body
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

function getDeviceId(){
  return _fetchResult('https://api.spotify.com/v1/me/player/devices', 'GET')
    .then(data => {
      let id = data.devices.filter(device => device.type === 'Computer')[0].id
      return id
    })
    .catch(err => console.log(err.message))
}

function setDeviceId(id){
  settings.setSync("device_id", id)
  DEVICE_ID = id
}

function transferPlayback(deviceId){
  return _fetch('https://api.spotify.com/v1/me/player', 'PUT', JSON.stringify({
    device_ids: [deviceId],
    play: true
  }))
}

function getCurrentlyPlaying() {
  return _fetchResult(`https://api.spotify.com/v1/me/player?device_id=${DEVICE_ID}`, 'GET')
}

function resume(){
  return _fetch(`https://api.spotify.com/v1/me/player/play?device_id=${settings.getSync("device_id")}`, 'PUT')
}

function pause(){
  return _fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${settings.getSync("device_id")}`, 'PUT')
}

function next(){
  return _fetch('https://api.spotify.com/v1/me/player/next', 'POST')
}

function prev(){
  return _fetch('https://api.spotify.com/v1/me/player/previous', 'POST')
}

function seek(timestamp){
  return _fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${timestamp}`, 'PUT')
}

function shuffle(state){
  return _fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${state}`, 'PUT')
}

function repeat(state){
  return _fetch(`https://api.spotify.com/v1/me/player/repeat?state=${state}`, 'PUT')
}

module.exports = { 
  transferPlayback,
  getCurrentlyPlaying,
  resume,
  pause,
  next,
  prev,
  seek,
  shuffle,
  repeat,
  getDeviceId,
  setDeviceId
}