const path = require('path')
const url = require('url')
const { app, BrowserWindow } = require('electron')
const Store = require('electron-store');
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
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		show: false,
		icon: `${__dirname}/assets/icon.png`,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	subWindow = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
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

	Store.initRenderer();

	// set windows to full screen
	mainWindow.maximize();
	subWindow.maximize();

	mainWindow.loadURL(indexPath)
	subWindow.loadURL(subPath)

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()

		// Open devtools if dev
		// if (isDev) {
		// 	const {
		// 		default: installExtension,
		// 		REACT_DEVELOPER_TOOLS,
		// 	} = require('electron-devtools-installer')

		// 	installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
		// 		console.log('Error loading React DevTools: ', err)
		// 	)
		// 	mainWindow.webContents.openDevTools()
		// }
	})

	    ipcMain.on('update-data-tampilan', (event, arg) => {
        // Request to update the label in the renderer process of the second window
        subWindow.webContents.send('update-data-label', arg);
    });

	mainWindow.on('closed', () => (mainWindow = null))

	subWindow.once('ready-to-show', () => {
		subWindow.show()

		// Open devtools if dev
		// if (isDev) {
		// 	const {
		// 		default: installExtension,
		// 		REACT_DEVELOPER_TOOLS,
		// 	} = require('electron-devtools-installer')

		// 	installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
		// 		console.log('Error loading React DevTools: ', err)
		// 	)
		// 	subWindow.webContents.openDevTools()
		// }
	})

	subWindow.on('closed', () => (subWindow = null))
}

app.on('ready', createMainWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		const store = new Store();
		store.delete('token');
		store.delete('data');
		app.quit();
	}
})

// Set and Get Token from Local Storage
ipcMain.on('store-token', (event, token) => {
	const store = new Store();
	store.set('token', token);
	event.returnValue = 'Token stored!';
});
ipcMain.on('get-token', (event) => {
	const store = new Store();
	event.returnValue = store.get('token');
});

// Set and Get Overall Sales Data from Local Storage
ipcMain.on('store-data', (event, data) => {
	const store = new Store();
	store.set('data', data);
	event.returnValue = 'Data stored!';
});
ipcMain.on('get-data', (event) => {
	const store = new Store();
	event.returnValue = store.get('data');
});

// Set & Get current active printer
ipcMain.on('set-printer', (event, data) => {
	const store = new Store();
	store.set('printer', data);
	event.returnValue = 'Current active printer stored!';
});
ipcMain.on('get-printer', (event) => {
	const store = new Store();
	event.returnValue = store.get('printer');
});

// Set & Get branch store's address
ipcMain.on('store-address', (event, data) => {
	const store = new Store();
	store.set('address', data);
	event.returnValue = 'Branch address stored!';
});
ipcMain.on('get-address', (event) => {
	const store = new Store();
	event.returnValue = store.get('address');
});

// Get image logo path
ipcMain.on('get-logo', (event) => {
	let res = {
		path: path.join(__dirname, 'assets/logo.png'),
	}
	event.returnValue = res;
});

// Clear local storage
ipcMain.on('clear-storage', (event) => {
	const store = new Store();
	store.delete('token');
	store.delete('data');
	store.delete('address');
	event.returnValue = 'Storage cleared!';
});

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true
