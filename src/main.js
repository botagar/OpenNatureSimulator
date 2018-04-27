import { app, BrowserWindow } from 'electron'
import path from 'path'
import url from 'url'

let mainWindow
const isDevelopment = process.env.NODE_ENV !== 'production'

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1366, height: 768 })
  // mainWindow.loadURL(url.format({
  //   // pathname: path.join(__dirname, 'src', 'flora', 'index.html'),
  //   pathname: path.join(__dirname, 'index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))
  mainWindow.loadURL(`http://localhost:9001`)
  // mainWindow.webContents.openDevTools()
  mainWindow.maximize()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
