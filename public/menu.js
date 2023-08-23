const { ipcRenderer } = require('electron');

function saveId() {
  let id = document.querySelector('input').value;
  ipcRenderer.send("add-client-id", id);
  window.close();
}