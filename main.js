module.exports = {startApp:startApp, authenticate: authenticate}
const { app, BrowserWindow, shell, ipcMain } = require('electron')
const auth = require('./auth.js')
const settings = require("electron-settings")
settings.configure({ fileName: 'Settings' })
const spotify = require('./spotify.js')

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
    resizable: false
  })

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
  setInterval(auth.refresh, 60*59*1000)
  win.loadFile('public/index.html')
  if(!(body === null)){
    win.webContents.on('did-finish-load', () => {
      _updateInfo('init', body)
    })
  }
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

function _updateInfo(channel, body){
  win.webContents.send(channel, {
    'title': body.item.name,
    'artists': body.item.artists,
    'image': body.item.album.images[0].url,
    'duration': body.item.duration_ms,
    'progress': body.progress_ms,
    'playing': body.is_playing,
    'shuffle_state': body.shuffle_state,
    'repeat_state': body.repeat_state
  })
}

app.whenReady().then(createWindow)