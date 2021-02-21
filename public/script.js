const { ipcRenderer } = require('electron')
const helper = require('./helper.js')

let playing
let shuffle_state
let repeat_state
const repeat_options = ['track', 'context', 'off']

setInterval(() => ipcRenderer.send('update-info'), 1000)

ipcRenderer.on('init', (e, data) => {
  helper.setState(data)
  helper.initDOMValues(data)
  helper.addTextScroll()
})

ipcRenderer.on('currently-playing', (e, data) => {
  helper.setState(data)
  helper.updateDOMValues(data)
  helper.addTextScroll()
})

function play() {
  playing ? ipcRenderer.send('pause') : ipcRenderer.send('play')
  playing = !playing
  helper.toggleClass(document.getElementById("play"), ["fa fa-play", "fa fa-pause"])
}

function next() {
  ipcRenderer.send("next")
  document.getElementById("play").className = "fa fa-pause"
}

function prev() {
  ipcRenderer.send("prev")
  document.getElementById("play").className = "fa fa-pause"
}

function seek(){
  ipcRenderer.send("seek", document.getElementById("time-range").value)
}

function shuffle(){
  ipcRenderer.send("shuffle", !shuffle_state)
  helper.toggleClass(document.getElementById("shuffle"), ['fa fa-random active', 'fa fa-random'])
}

function repeat() {
  let i = repeat_options.indexOf(repeat_state)
  let index = (i == 2) ? 0 : i+1
  ipcRenderer.send("repeat", repeat_options[index])
  document.getElementById('repeat').className = helper.getRepeatClassName(repeat_options[index])
}