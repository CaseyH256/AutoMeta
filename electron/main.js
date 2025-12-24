const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const child_process = require('child_process');
const Store = require('electron-store');
const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Fix for preload load
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
  });

  win.loadURL('http://localhost:5173'); // For dev, or file:// for build
  win.webContents.openDevTools({ mode: 'detach' }); // Force for debug

  // First-run LR path prompt - softer, optional
  if (!store.get('lightroomPath')) {
    const response = dialog.showMessageBoxSync(win, {
      type: 'info',
      message: 'Hey, for auto-exports to Lightroom\'s preset folders, wanna point me to your Lightroom install? (Optional—you can set it later in Settings.)',
      buttons: ['Sure', 'Skip for Now'],
    });
    if (response === 0) { // Sure
      const { filePaths } = dialog.showOpenDialogSync(win, {
        properties: ['openDirectory'],
        defaultPath: process.platform === 'darwin' ? path.join(process.env.HOME, 'Library/Application Support/Adobe/Lightroom') : path.join(process.env.APPDATA, 'Adobe\\Lightroom'),
      });
      if (filePaths && filePaths[0]) {
        store.set('lightroomPath', filePaths[0]);
      }
    }
  }

  // Menu with backup
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Backup Lightroom Stuff',
          click: async () => {
            const lrPath = store.get('lightroomPath');
            if (!lrPath) {
              dialog.showErrorBox('No Path', 'Set Lightroom path first!');
              return;
            }
            const { filePath } = await dialog.showSaveDialog(win, { defaultPath: 'lr_backup.zip' });
            if (filePath) {
              const presetsPath = path.join(lrPath, 'Develop Presets');
              const adjustmentsPath = path.join(lrPath, 'Local Adjustment Presets');
              child_process.exec(`zip -r "${filePath}" "${presetsPath}" "${adjustmentsPath}"`, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Backup error: ${error}`);
                  dialog.showErrorBox('Backup Failed', 'Could not create zip. Ensure zip command is available.');
                  return;
                }
                console.log('Backup complete:', stdout);
              });
            }
          },
        },
        { role: 'quit' },
      ],
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Set Lightroom Path',
          click: async () => {
            const { filePaths } = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
            if (filePaths && filePaths[0]) {
              store.set('lightroomPath', filePaths[0]);
            }
          },
        },
        {
          label: 'Auto-Backup on Close',
          type: 'checkbox',
          checked: store.get('autoBackup', false),
          click: (item) => store.set('autoBackup', item.checked),
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (store.get('autoBackup')) {
    console.log('Auto-backing up...');
    const lrPath = store.get('lightroomPath');
    if (lrPath) {
      const backupPath = path.join(app.getPath('desktop'), `lr_backup_${Date.now()}.zip`);
      const presetsPath = path.join(lrPath, 'Develop Presets');
      const adjustmentsPath = path.join(lrPath, 'Local Adjustment Presets');
      child_process.exec(`zip -r "${backupPath}" "${presetsPath}" "${adjustmentsPath}"`, (error) => {
        if (error) console.error(`Auto-backup error: ${error}`);
      });
    }
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});