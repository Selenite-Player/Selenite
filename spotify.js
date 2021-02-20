const fetch = require('node-fetch')

require('dotenv').config()

const DEVICE_ID = process.env.DEVICE_ID

function getCurrentlyPlaying(access_token) {
  return fetch(`https://api.spotify.com/v1/me/player?device_id=${DEVICE_ID}`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
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
      console.log(json)
      return json
    }
  })
  .catch(err => {
    console.log(err.message)
    return null
  })
}

function resume(access_token){
  return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${DEVICE_ID}`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + access_token }
  })
  .catch(err => console.log(err.message))
}

function pause(access_token){
  return fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${DEVICE_ID}`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + access_token }
  })
  .catch(err => console.log(err.message))
}

module.exports = { 
  getCurrentlyPlaying,
  resume,
  pause
}