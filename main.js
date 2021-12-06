const path = require('path')
const url = require('url')
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron');
//Electron pos printer


let mainWindow
let subWindow

let isDev = false

if (
	process.env.NODE_ENV !== undefined &&
	process.env.NODE_ENV === 'development'
) {
	isDev = true
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 800,
		show: false,
		icon: `${__dirname}/assets/icon.png`,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	subWindow = new BrowserWindow({
		width: 800,
		height: 800,
		show: false,
		icon: `${__dirname}/assets/icon.png`,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	let indexPath
	let subPath

	if (isDev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			hash:'/',
			pathname: 'index.html',
			slashes: true,
		})
		subPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			hash:'/tampilan',
			pathname: 'index.html',
			slashes: true,
		})
	} else {
		indexPath = url.format({
			protocol: 'file:',
			hash:'/',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		})
		subPath = url.format({
			protocol: 'file:',
			hash:'/tampilan',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		})
	}

	mainWindow.loadURL(indexPath)
	subWindow.loadURL(subPath)

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()

		// Open devtools if dev
		if (isDev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer')

			installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
				console.log('Error loading React DevTools: ', err)
			)
			mainWindow.webContents.openDevTools()
		}
	})

	    ipcMain.on('update-data-tampilan', (event, arg) => {
        // Request to update the label in the renderer process of the second window
        subWindow.webContents.send('update-data-label', arg);
    });

	mainWindow.on('closed', () => (mainWindow = null))

	subWindow.once('ready-to-show', () => {
		subWindow.show()

		// Open devtools if dev
		if (isDev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer')

			installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
				console.log('Error loading React DevTools: ', err)
			)
			subWindow.webContents.openDevTools()
		}
	})

	subWindow.on('closed', () => (subWindow = null))
}

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true
