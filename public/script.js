const { ipcRenderer } = require('electron')

let playing
let shuffle_state
const repeat_options = ['track', 'context', 'off']
let repeat_state

setInterval(() => ipcRenderer.send('update-info'), 1000)

ipcRenderer.on('currently-playing', (e, data) => {
  playing = data.playing
  shuffle_state = data.shuffle_state
  repeat_state = data.repeat_state
  document.getElementById("repeat").className = _getRepeatClassName()
  document.getElementById("play").className = data.playing ? 'fa fa-pause' : 'fa fa-play'
  document.getElementById("shuffle").className = shuffle_state ? 'fa fa-random active' : 'fa fa-random'
  document.getElementById("song-title").innerText = data.title
  document.getElementById("artist").innerText = data.artists.map(artist => artist.name)
  document.getElementById("cover").src = data.image
  document.getElementById("time-range").max = data.duration
  document.getElementById("time-range").value = data.progress
})

function play() {
  /* let icon = document.getElementById("play") */
  playing ? ipcRenderer.send('pause') : ipcRenderer.send('play')
  /* playing = !playing */
  /* icon.className == "fa fa-play" ? icon.className = "fa fa-pause" : icon.className = "fa fa-play" */
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

function repeat() {
  let i = repeat_options.indexOf(repeat_state)
  let index = (i == 2) ? 0 : i+1
  ipcRenderer.send("repeat", repeat_options[index])
}

function _getRepeatClassName(){
  switch(repeat_state){
    case 'track':
      return 'fa fa-repeat active'
    case 'context':
      return 'fa fa-refresh active'
    case 'off':
      return 'fa fa-repeat'
  }
}