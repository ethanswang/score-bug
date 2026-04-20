const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 110,
    alwaysOnTop: true,
    frame: false, 
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    }
  })

  win.loadURL('http://localhost:5173')
}

app.whenReady().then(createWindow)

ipcMain.on('close-window', () => app.quit())
ipcMain.on('resize-window', (_, height) => win.setSize(400, height))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})