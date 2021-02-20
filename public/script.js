const { ipcRenderer } = require('electron')

let playing

ipcRenderer.on('currently-playing', (e, data) => {
  playing = data.playing
  document.getElementById("song-title").innerText = data.title
  document.getElementById("artist").innerText = data.artists.map(artist => artist.name)
  document.getElementById("cover").src = data.image
  document.getElementById("time-range").max = data.duration
  document.getElementById("time-range").value = data.progress
  setInterval(() => {
    document.getElementById("time-range").value = parseInt(document.getElementById("time-range").value)+1000
  }, 1000)
})

function play() {
  playing ? ipcRenderer.send('pause', 'any') : ipcRenderer.send('play', 'any')
  playing = !playing
}