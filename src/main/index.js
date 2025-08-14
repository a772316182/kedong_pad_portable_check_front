import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import * as fs from 'node:fs'

const electronStore = new Store({})
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      enableRemoteModule: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  // Store
  ipcMain.handle('store-get', (event, arg) => {
    return electronStore.get(arg.key)
  })
  ipcMain.handle('store-set', (event, arg) => {
    electronStore.set(arg.key, arg.value)
    return electronStore.get(arg.key)
  })
  ipcMain.handle('store-has', (event, arg) => {
    return electronStore.has(arg.key)
  })
  ipcMain.handle('store-clear', () => {
    electronStore.clear()
  })
  // Dialogs
  ipcMain.handle('show-dialog', async (event, arg) => {
    return await dialog.showMessageBox(mainWindow, {
      title: arg.title,
      message: arg.message,
      type: 'info'
    })
  })
  // 打开外部链接
  ipcMain.handle('open-url', async (event, url) => {
    await shell.openExternal(url)
  })
  // Chose paper .json file to import
  ipcMain.handle('import-paper-json', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (filePaths.length) {
      const filePath = filePaths[0]
      try {
        // 使用fs.promises.readFile代替fs.readFile以利用async/await
        const fileContent = await fs.promises.readFile(filePath, 'utf-8') // 'utf-8'指定编码格式
        // 如果你需要进一步解析这个JSON字符串，可以这样做：
        return JSON.parse(fileContent) // 或者根据需要返回fileContent
      } catch (err) {
        console.error('Error reading or parsing file:', err)
      }
    }
  })
  // Open URL
  ipcMain.on('open-url', async (event, url) => {
    await shell.openExternal(url)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
