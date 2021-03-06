module.exports = {startApp:startApp, authenticate: authenticate}
const { app, BrowserWindow, shell, ipcMain } = require('electron')
const auth = require('./src/auth.js')
const settings = require('electron-settings')
const spotify = require('./src/spotify.js')

settings.configure({ fileName: 'Settings' })
/* settings.reset(); */

let win

function createWindow() {
  win = new BrowserWindow({
    width: 450,
    height: 150,
    webPreferences: {
      nodeIntegration: true
    },
    transparent: true,
    frame: false,
    title: "Selenite",
    hasShadow: false,
    resizable: false
  })

  /* win.webContents.openDevTools() */
  

  if(settings.getSync('window-position')){
    win.setPosition(...settings.getSync('window-position'))
  }

  if(settings.hasSync("refresh_token")){
    auth.refresh(settings.getSync("refresh_token"))
  } else{
    authenticate()
  }
}

function authenticate(){
  shell.openExternal(auth.getAuthUrl())
}

function startApp(body){
  app.focus({steal: true})
  setInterval(auth.refresh, 60*59*1000)
  win.loadFile('public/index.html')

  win.webContents.on('did-finish-load', async () => {
    if(!(body === null)){
      _updateInfo('init', body)
    } else{
      win.webContents.send('inactive-device', null)
      let deviceId = await spotify.getDeviceId()
      spotify.setDeviceId(deviceId)
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  settings.setSync('window-position', win.getPosition())
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('browser-window-blur', () => {
  win.webContents.send('blur')
})

app.on('browser-window-focus', () => {
  win.webContents.send('focus')
})

ipcMain.on('activate-device', () => {
  spotify.transferPlayback(settings.getSync('device_id')).catch(err => console.log(err.message))

  spotify.getCurrentlyPlaying(settings.getSync('access_token'))
    .then(body => {
      if(!(body == null)){
        _updateInfo("currently-playing", body)
      }
    })
    .catch(err => console.log(err))
})

ipcMain.on('play', () => {
  spotify.resume(settings.getSync('access_token'))
})

ipcMain.on('pause', () => {
  spotify.pause(settings.getSync('access_token'))
})

ipcMain.on('update-info', () => {
  spotify.getCurrentlyPlaying(settings.getSync('access_token'))
    .then(body => {
      if(!(body == null)){
        _updateInfo('currently-playing', body)
      }
    })
    .catch(err => console.log(err))
})

ipcMain.on('next', () => {
  spotify.next(settings.getSync('access_token'))
    .catch(err => console.log(err))
})

ipcMain.on('prev', () => {
  spotify.prev()
    .catch(err => console.log(err))
})

ipcMain.on('seek', (event, timestamp) => {
  spotify.seek(timestamp)
    .catch(err => console.log(err))
})

ipcMain.on('shuffle', (event, shuffle_state) => {
  spotify.shuffle(shuffle_state)
    .catch(err => console.log(err))
})

ipcMain.on('repeat', (event, repeat_state) => {
  spotify.repeat(repeat_state)
    .catch(err => console.log(err))
})

ipcMain.on('save-song', (event, song_Id) => {
  spotify.saveSong(song_Id)
    .catch(err => console.log(err))
})

ipcMain.on('delete-song', (event, song_Id) => {
  spotify.deleteSong(song_Id)
    .catch(err => console.log(err))
})

async function _updateInfo(channel, body){
  settings.setSync('device_id', body.device.id)

  let isSaved = await spotify.isSavedSong(body.item.id)
    .then(res => res != null ? res[0]
      : (spotify.isSavedSong(body.item.id).then(res => res[0])))
    .catch(err => err)

  let data
  if(body.currently_playing_type == 'track'){
    data = {
      'title': body.item.name,
      'artists': body.item.artists,
      'image': body.item.album.images[0].url,
      'duration': body.item.duration_ms,
      'progress': body.progress_ms,
      'playing': body.is_playing,
      'shuffle_state': body.shuffle_state,
      'repeat_state': body.repeat_state,
      'song_id': body.item.id,
      'is_saved': isSaved
    }
  } else if(body.currently_playing_type == 'episode') {
    data = {
      'title': body.item.name,
      'artists': body.item.show.name,
      'image': body.item.images[0].url,
      'duration': body.item.duration_ms,
      'progress': body.progress_ms,
      'playing': body.is_playing,
      'shuffle_state': body.shuffle_state,
      'repeat_state': body.repeat_state,
      'song_id': body.item.id,
      'is_saved': null
    }
  }

  win.webContents.send(channel, data)
}

app.whenReady().then(createWindow)