const fetch = require('node-fetch')

function getCurrentlyPlaying(access_token) {
  return fetch('https://api.spotify.com/v1/me/player', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + access_token },
  })
  .then(res => res.json())
  .then(json => {
    if(json.error){
      console.log(json.error)
    } else {
      console.log(json)
      return json
    }
  })
}

module.exports = { 
  getCurrentlyPlaying
}