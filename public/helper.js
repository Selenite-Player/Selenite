const initDOMValues = (data) => {
  _getSongData(data)
  document.getElementById("repeat").className = getRepeatClassName(data.repeat_state)
  document.getElementById("play").className = data.playing ? 'fa fa-pause' : 'fa fa-play'
  document.getElementById("shuffle").className = data.shuffle_state ? 'fa fa-random active' : 'fa fa-random'
}

const updateDOMValues = (data) => {_getSongData(data)}

function _getSongData(data){
  document.getElementById("song-title").innerText = data.title
  document.getElementById("artist").innerText = data.artists.map(artist => artist.name).join(', ')
  document.getElementById("cover").src = data.image
  document.getElementById("time-range").max = data.duration
  document.getElementById("time-range").value = data.progress

  document.getElementById("play").className = data.playing ? 'fa fa-pause' : 'fa fa-play'
  document.getElementById("repeat").className = getRepeatClassName(data.repeat_state)
  document.getElementById("shuffle").className = data.shuffle_state ? 'fa fa-random active' : 'fa fa-random'
}

const setState = (data) => {
  playing: data.playing
  shuffle_state: data.shuffle_state
  repeat_state: data.repeat_state
}

const addTextScroll = () => {
  let titleSpan = document.getElementById('song-title')
  let titleScrollBox = document.getElementById('title-scroll-box')
  let artistSpan = document.getElementById('artist')
  let artistScrollBox = document.getElementById('artist-scroll-box')

  _addTextScroll(titleSpan, titleScrollBox)
  _addTextScroll(artistSpan, artistScrollBox)
}

const toggleClass = (icon, classes) => {
  icon.className == classes[0] ? icon.className = classes[1] : icon.className = classes[0]
}

const getRepeatClassName = (repeat_state) => {
  switch(repeat_state){
    case 'track':
      return 'fa fa-repeat active'
    case 'context':
      return 'fa fa-refresh active'
    case 'off':
      return 'fa fa-repeat'
  }
}

function _addTextScroll(span, scrollBox) {
  span.offsetWidth > scrollBox.offsetWidth ? _addHover(scrollBox) : _removeHover(scrollBox)
}
function _addScroll(event) { event.currentTarget.firstElementChild.classList.add('scroll') }
function _removeScroll(event) { event.currentTarget.firstElementChild.classList.remove('scroll') }

function _addHover(el){ 
  el.addEventListener('mouseenter', _addScroll)
  el.addEventListener('mouseleave', _removeScroll)
}

function _removeHover(el) {
  el.removeEventListener('mouseenter', _addScroll)
  el.removeEventListener('mouseleave', _removeScroll)
}

module.exports = {
  setState,
  initDOMValues,
  updateDOMValues,
  addTextScroll,
  toggleClass,
  getRepeatClassName
}