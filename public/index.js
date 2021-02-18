const { ipcRenderer } = require('electron')

ipcRenderer.on('currently-playing', (e, data) => {
  document.getElementById("song-title").innerText = data.title
  document.getElementById("artist").innerText = data.artists.map(artist => artist.name)
  document.getElementById("cover").src = data.image
})