const initDOMValues = (data) => {
  _getSongData(data)
  document.getElementById("like-button").className = data.is_saved ? 'fa fa-heart' : 'fa fa-heart-o'
}

const updateDOMValues = (data) => {
  _getSongData(data)
}

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
  return {
    playing: data.playing,
    shuffle_state: data.shuffle_state,
    repeat_state: data.repeat_state,
    song_id: data.song_id,
    saved: data.is_saved
  }
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

function addLikeIconHover(saved){
  saved 
    ? _removeHover(document.getElementById('like-button'), [_addLikeIcon, _removeLikeIcon])
    : _addHover(document.getElementById('like-button'), [_addLikeIcon, _removeLikeIcon])
}

function _addLikeIcon(event){ event.target.className = "fa fa-heart"}
function _removeLikeIcon(event) { event.target.className = "fa fa-heart-o" }

function _addTextScroll(span, scrollBox) {
  span.offsetWidth > scrollBox.offsetWidth 
    ? _addHover(scrollBox, [_addScroll, _removeScroll])
    : _removeHover(scrollBox, [_addScroll, _removeScroll])
}

function _addScroll(event) { event.currentTarget.firstElementChild.classList.add('scroll') }
function _removeScroll(event) { event.currentTarget.firstElementChild.classList.remove('scroll') }

function _addHover(el, listeners){ 
  el.addEventListener('mouseenter', listeners[0])
  el.addEventListener('mouseleave', listeners[1])
}

function _removeHover(el, listeners) {
  el.removeEventListener('mouseenter', listeners[0])
  el.removeEventListener('mouseleave', listeners[1])
}


module.exports = {
  setState,
  initDOMValues,
  updateDOMValues,
  addTextScroll,
  toggleClass,
  getRepeatClassName,
  addLikeIconHover
}