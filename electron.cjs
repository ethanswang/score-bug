const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')


function createWindow() {
  const win = new BrowserWindow({
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
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  } else {
    win.loadURL('http://localhost:5173')
  }

  ipcMain.on('resize-window', (_, height) => {
    win.setSize(400, height)
  })

  ipcMain.on('close-window', () => {
    app.quit()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})