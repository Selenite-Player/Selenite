const { ipcRenderer } = require('electron')
const helper = require('./helper.js')

let playing
let shuffle_state
const repeat_options = ['track', 'context', 'off']
let repeat_state

setInterval(() => ipcRenderer.send('update-info'), 1000)

ipcRenderer.on('currently-playing', (e, data) => {
  helper.setState(data)
  helper.setDOMValues(data)
  helper.addTextScroll()
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