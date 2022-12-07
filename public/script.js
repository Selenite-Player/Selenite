const { ipcRenderer } = require('electron')
const helper = require('./helper.js')
const Sentry = require("@sentry/electron");

require('dotenv').config()

Sentry.init({ dsn: process.env.SENTRY_DSN })

let state = {
  active: true,
  playing: null,
  shuffle_state: null,
  repeat_state: null,
  repeat_options: ['track', 'context', 'off'],
  song_id: null,
  saved: false,
  progress: null,
  seek: null
}

setInterval(() => ipcRenderer.send('update-info'), 1000)

ipcRenderer.on('inactive-device', (e, data) => {
  state.active = false
})

ipcRenderer.on('init', (e, data) => {
  state = {...state, ...helper.setState(data)}
  document.getElementById("time-range").value = state.progress
  helper.initDOMValues(data)
  helper.addTextScroll()
})

ipcRenderer.on('currently-playing', (e, data) => {
  state = {...state, ...helper.setState(data)}

  if(state.seek == null){
    document.getElementById("time-range").value = state.progress
  } else {
    document.getElementById("time-range").value = state.seek
    state.seek = null
  }

  helper.updateDOMValues(data)
  helper.addTextScroll()
})

ipcRenderer.on('blur', () => {
  document.getElementById('window').style.backgroundImage = 'none'
})

ipcRenderer.on('focus', () => {
  document.getElementById('window').style.backgroundImage = 'url("https://raw.githubusercontent.com/Schlenges/soggy-waffles/master/transparent.png")'
})

function play() {
  if(!state.active){
    ipcRenderer.send('activate-device')
    state.active = true
  }

  state.playing ? ipcRenderer.send('pause') : ipcRenderer.send('play')
  state.playing = !state.playing

  // setTimeout to bridge 1s update gap and avoid glitchy control toggle animations
  setTimeout(() => helper.toggleClass(document.getElementById("play"), ["fa fa-play", "fa fa-pause"]), 200)
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
  let val = document.getElementById("time-range").value
  ipcRenderer.send("seek", val)
  state.seek = val
}

function shuffle(){
  ipcRenderer.send("shuffle", !state.shuffle_state)
  state.shuffle_state = !state.shuffle_state
  helper.toggleClass(document.getElementById("shuffle"), ['fa fa-random active', 'fa fa-random'])
}

function repeat() {
  let i = state.repeat_options.indexOf(state.repeat_state)
  let index = (i == 2) ? 0 : i+1
  ipcRenderer.send("repeat", state.repeat_options[index])
  state.repeat_state = state.repeat_options[index]
  setTimeout(() => document.getElementById('repeat').className = helper.getRepeatClassName(state.repeat_options[index]), 200)
}

function saveSong(){
  if(state.song_id != null){
    state.saved ? ipcRenderer.send("delete-song", state.song_id) : ipcRenderer.send("save-song", state.song_id)

    state.saved = !state.saved
    setTimeout(() => {
      document.getElementById("liked-icon").style.display == "none"
        ? (document.getElementById("liked-icon").style.display = "inline")
        : (document.getElementById("liked-icon").style.display = "none")
    }, 200)
  }
}