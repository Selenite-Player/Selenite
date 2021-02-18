module.exports = {startApp:startApp}
const { app, BrowserWindow, shell } = require('electron')
const server = require('./index.js')

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

  shell.openExternal("http://localhost:8888/login")
}

function startApp(body){
  console.log(body)
  win.loadFile('public/index.html')
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('currently-playing', {
      'title': body.item.name,
      'artists': body.item.artists,
      'image': body.item.album.images[0].url
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