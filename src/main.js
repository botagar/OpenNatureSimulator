import { app, BrowserWindow } from 'electron'
import path from 'path'
import url from 'url'

let mainWindow
const isDev = process.env.NODE_ENV !== 'production'

function createWindow () {
  mainWindow = new BrowserWindow({ width: 1366, height: 768 })

  if (isDev) {
    mainWindow.loadURL(`http://localhost:9001`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }
  mainWindow.maximize()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus()
    setImmediate(() => {
      mainWindow.focus()
    })
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
