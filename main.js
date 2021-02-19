module.exports = {startApp:startApp, authenticate: authenticate}
const { app, BrowserWindow, shell } = require('electron')
const auth = require('./auth.js')
const settings = require("electron-settings")
settings.configure({ fileName: 'Settings' })

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
    title: "Selenite"
  })

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
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('currently-playing', {
      'title': body.item.name,
      'artists': body.item.artists,
      'image': body.item.album.images[0].url,
      'duration': body.item.duration_ms,
      'progress': body.progress_ms
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)