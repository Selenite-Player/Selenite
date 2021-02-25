const { ipcRenderer } = require('electron')
const helper = require('./helper.js')

let state = {
  active: true,
  playing: null,
  shuffle_state: null,
  repeat_state: null,
  repeat_options: ['track', 'context', 'off']
}

setInterval(() => ipcRenderer.send('update-info'), 1000)

ipcRenderer.on('inactive-device', (e, data) => {
  state.active = false
})

ipcRenderer.on('init', (e, data) => {
  state = {...state, ...helper.setState(data)}
  console.log(state)
  helper.initDOMValues(data)
  helper.addTextScroll()
})

ipcRenderer.on('currently-playing', (e, data) => {
  helper.setState(data)
  helper.updateDOMValues(data)
  helper.addTextScroll()
})

function play() {
  console.log(state.active)
  if(!state.active){
    ipcRenderer.send('activate-device')
    state.active = true
  }

  /* state.playing ? ipcRenderer.send('pause') : ipcRenderer.send('play') */
  state.playing = !state.playing
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
  ipcRenderer.send("shuffle", !state.shuffle_state)
  helper.toggleClass(document.getElementById("shuffle"), ['fa fa-random active', 'fa fa-random'])
}

function repeat() {
  let i = state.repeat_options.indexOf(state.repeat_state)
  let index = (i == 2) ? 0 : i+1
  ipcRenderer.send("repeat", state.repeat_options[index])
  document.getElementById('repeat').className = helper.getRepeatClassName(state.repeat_options[index])
}