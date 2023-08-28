module.exports = {
  startApp: startApp,
  authenticate: authenticate,
  openMenu: openMenuWindow,
};

const { app, BrowserWindow, shell, ipcMain, Menu } = require("electron");
const auth = require("./src/auth.js");
const settings = require("electron-settings");
const spotify = require("./src/spotify.js");
const path = require("path");

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

require("dotenv").config();

const Sentry = require("@sentry/electron");
Sentry.init({ dsn: process.env.SENTRY_DSN });

settings.configure({ fileName: "settings.json", prettify: true });

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 150,
    webPreferences: {
      nodeIntegration: true,
    },
    transparent: true,
    frame: false,
    title: "Selenite",
    hasShadow: false,
    resizable: false,
  });

  if (settings.getSync("window-position")) {
    mainWindow.setPosition(...settings.getSync("window-position"));
  }

  if (settings.hasSync("refresh_token")) {
    auth.refresh();
  } else {
    authenticate();
  }
}

let menuWindow;

function openMenuWindow(options) {
  if (!menuWindow) {
    menuWindow = new BrowserWindow({
      width: 520,
      height: 180,
      webPreferences: {
        nodeIntegration: true,
      },
      resizable: false,
    });

    if (mainWindow) {
      let pos = mainWindow.getPosition();
      menuWindow.setPosition(pos[0], pos[1]);
    };

    menuWindow.loadFile("public/menuInput.html");
    menuWindow.on("close", () => (menuWindow = null));
  }
}

const menuTemplate = [
  {
    label: "Config",
    submenu: [
      {
        label: "Add Spotify Client ID",
        click() {
          openMenuWindow();
        },
      },
      /* {
        label: 'Add Device ID'
      }, */
      {
        type: "separator",
      },
      {
        role: "quit",
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      {
        role: "undo",
      },
      {
        role: "redo",
      },
      {
        type: "separator",
      },
      {
        role: "cut",
      },
      {
        role: "copy",
      },
      {
        role: "paste",
      },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        role: "reload",
      },
      {
        role: "toggledevtools",
      },
    ],
  },
  {
    role: "window",
    submenu: [
      {
        role: "minimize",
      },
      {
        role: "close",
      },
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

function authenticate() {
  shell.openExternal(auth.getAuthUrl());
};

function startApp(body) {
  app.focus({ steal: true });

  setInterval(auth.refresh, 60 * 59 * 1000);

  mainWindow.loadFile("public/index.html");

  mainWindow.webContents.on("did-finish-load", async () => {
    if (body) {
      _updateInfo("init", body).catch((err) => console.log(err));
    } else {
      mainWindow.webContents.send("inactive-device", null);

      let deviceId = await spotify.getDeviceId();
      spotify.setDeviceId(deviceId);
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  };
});

app.on("before-quit", () => {
  settings.setSync("window-position", mainWindow.getPosition());
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    openMenuWindow();
  };
});

app.on("browser-window-blur", () => {
  mainWindow.webContents.send("blur");
});

app.on("browser-window-focus", () => {
  mainWindow.webContents.send("focus");
});

ipcMain.on("add-client-id", (event, id) => {
  auth.setClientId(id)
    .then(() => {
      settings.setSync("client_id", id);
      if (!mainWindow) {
        createMainWindow();
      }
      menuWindow.close();
    })
    .catch(err => {
      menuWindow.webContents.send('client-error')
    });

  

  /* if (settings.getSync("client_id").length > 0) {
    if (!mainWindow) {
      createMainWindow();
    }
  } else {
    openMenuWindow();
  } */
});

ipcMain.on("activate-device", () => {
  spotify
    .transferPlayback(settings.getSync("device_id"))
    .catch((err) => console.log(err.message));

  update();
});

ipcMain.on("play", () => {
  spotify.resume(settings.getSync("access_token"));
});

ipcMain.on("pause", () => {
  spotify.pause(settings.getSync("access_token"));
});

ipcMain.on("update-info", () => {
  update();
});

ipcMain.on("next", () => {
  spotify
    .next(settings.getSync("access_token"))
    .catch((err) => console.log(err));
});

ipcMain.on("prev", () => {
  spotify.prev().catch((err) => console.log(err));
});

ipcMain.on("seek", (event, timestamp) => {
  spotify.seek(timestamp).catch((err) => console.log(err));
});

ipcMain.on("shuffle", (event, shuffle_state) => {
  spotify.shuffle(shuffle_state).catch((err) => console.log(err));
});

ipcMain.on("repeat", (event, repeat_state) => {
  spotify.repeat(repeat_state).catch((err) => console.log(err));
});

ipcMain.on("save-song", (event, song_Id) => {
  spotify.saveSong(song_Id).catch((err) => console.log(err));
});

ipcMain.on("delete-song", (event, song_Id) => {
  spotify.deleteSong(song_Id).catch((err) => console.log(err));
});

async function _updateInfo(channel, body) {
  settings.setSync("device_id", body.device.id);

  let isSaved = await spotify
    .isSavedSong(body.item.id)
    .then((res) =>
      res != null
        ? res[0]
        : spotify.isSavedSong(body.item.id).then((res) => res[0])
    )
    .catch((err) => {
      throw new Error(err);
    });

  let data;

  if (body.currently_playing_type == "track") {
    data = {
      title: body.item.name,
      artists: body.item.artists,
      image: body.item.album.images[0].url,
      duration: body.item.duration_ms,
      progress: body.progress_ms,
      playing: body.is_playing,
      shuffle_state: body.shuffle_state,
      repeat_state: body.repeat_state,
      song_id: body.item.id,
      is_saved: isSaved,
    };
  } else if (body.currently_playing_type == "episode") {
    data = {
      title: body.item.name,
      artists: body.item.show.name,
      image: body.item.images[0].url,
      duration: body.item.duration_ms,
      progress: body.progress_ms,
      playing: body.is_playing,
      shuffle_state: body.shuffle_state,
      repeat_state: body.repeat_state,
      song_id: body.item.id,
      is_saved: null,
    };
  }

  mainWindow.webContents.send(channel, data);
}

const update = () => {
  spotify
    .getCurrentlyPlaying(settings.getSync("access_token"))
    .then((body) => {
      if (body) {
        _updateInfo("currently-playing", body).catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

app.whenReady().then(() => {
  if (!settings.getSync("client_id")) {
    openMenuWindow();
  } else {
    createMainWindow();
  }
});
