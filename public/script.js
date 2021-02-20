const { ipcRenderer } = require('electron')

let playing
let shuffle_state

setInterval(() => ipcRenderer.send('update-info'), 1000)

ipcRenderer.on('currently-playing', (e, data) => {
  playing = data.playing
  shuffle_state = data.shuffle_state
  document.getElementById("play").className = (data.playing ? 'fa fa-pause' : 'fa fa-play')
  document.getElementById("song-title").innerText = data.title
  document.getElementById("artist").innerText = data.artists.map(artist => artist.name)
  document.getElementById("cover").src = data.image
  document.getElementById("time-range").max = data.duration
  document.getElementById("time-range").value = data.progress
})

function play() {
  let icon = document.getElementById("play")
  playing ? ipcRenderer.send('pause', 'any') : ipcRenderer.send('play', 'any')
  /* playing = !playing */
  icon.className == "fa fa-play" ? icon.className = "fa fa-pause" : icon.className = "fa fa-play"
}

function next() {
  ipcRenderer.send("next")
}

function prev() {
  ipcRenderer.send("prev")
}

function seek(){
  ipcRenderer.send("seek", document.getElementById("time-range").value)
}

function shuffle(){
  ipcRenderer.send("shuffle", !shuffle_state)
}