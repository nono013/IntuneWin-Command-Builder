const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Chemin du fichier de configuration
const configPath = path.join(app.getPath('userData'), 'config.json');

// Charger la configuration
function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
    }
    return { intuneWinAppUtilPath: '' };
}

// Sauvegarder la configuration
function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
        return false;
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        backgroundColor: '#0b1220',
        icon: path.join(__dirname, 'icon.png')
    });

    mainWindow.loadFile('src/index.html');

    // Ouvrir les DevTools en développement (à commenter pour la production)
    // mainWindow.webContents.openDevTools();

    // API pour ouvrir le sélecteur de dossier
    ipcMain.handle('select-folder', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        return result.canceled ? null : result.filePaths[0];
    });

    // API pour ouvrir le sélecteur de fichier
    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile']
        });
        return result.canceled ? null : result.filePaths[0];
    });

    // API pour exécuter la commande dans PowerShell
    ipcMain.handle('execute-command', async (_event, command) => {
        return new Promise((resolve, reject) => {
            // Ouvre PowerShell et exécute la commande
            const psCommand = `start powershell -NoExit -Command "${command.replace(/"/g, '\\"')}"`;

            exec(psCommand, (error) => {
                if (error) {
                    reject({ success: false, error: error.message });
                } else {
                    resolve({ success: true });
                }
            });
        });
    });

    // API pour charger la configuration
    ipcMain.handle('load-config', async () => {
        return loadConfig();
    });

    // API pour sauvegarder la configuration
    ipcMain.handle('save-config', async (_event, config) => {
        return saveConfig(config);
    });

    // API pour sélectionner le fichier IntuneWinAppUtil.exe
    ipcMain.handle('select-intune-exe', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Executable', extensions: ['exe'] },
                { name: 'Tous les fichiers', extensions: ['*'] }
            ],
            title: 'Sélectionner IntuneWinAppUtil.exe'
        });
        return result.canceled ? null : result.filePaths[0];
    });

    // API pour ouvrir le modal de paramètres depuis le menu
    ipcMain.handle('open-settings', async () => {
        mainWindow.webContents.send('open-settings-modal');
    });

    return mainWindow;
}

function createApplicationMenu(mainWindow) {
    const isMac = process.platform === 'darwin';

    const template = [
        // Menu App (Mac uniquement)
        ...(isMac ? [{
            label: app.name,
            submenu: [
                {
                    label: 'À propos de ' + app.name,
                    role: 'about'
                },
                { type: 'separator' },
                {
                    label: 'Paramètres...',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.send('open-settings-modal');
                    }
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // Menu Fichier
        {
            label: 'Fichier',
            submenu: [
                ...(!isMac ? [
                    {
                        label: 'Paramètres',
                        accelerator: 'CmdOrCtrl+,',
                        click: () => {
                            mainWindow.webContents.send('open-settings-modal');
                        }
                    },
                    { type: 'separator' }
                ] : []),
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        // Menu Édition
        {
            label: 'Édition',
            submenu: [
                { role: 'undo', label: 'Annuler' },
                { role: 'redo', label: 'Rétablir' },
                { type: 'separator' },
                { role: 'cut', label: 'Couper' },
                { role: 'copy', label: 'Copier' },
                { role: 'paste', label: 'Coller' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle', label: 'Coller et adapter le style' },
                    { role: 'delete', label: 'Supprimer' },
                    { role: 'selectAll', label: 'Tout sélectionner' }
                ] : [
                    { role: 'delete', label: 'Supprimer' },
                    { type: 'separator' },
                    { role: 'selectAll', label: 'Tout sélectionner' }
                ])
            ]
        },
        // Menu Affichage
        {
            label: 'Affichage',
            submenu: [
                { role: 'reload', label: 'Recharger' },
                { role: 'forceReload', label: 'Forcer le rechargement' },
                { role: 'toggleDevTools', label: 'Outils de développement' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Zoom réel' },
                { role: 'zoomIn', label: 'Zoom avant' },
                { role: 'zoomOut', label: 'Zoom arrière' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Plein écran' }
            ]
        },
        // Menu Fenêtre
        {
            label: 'Fenêtre',
            submenu: [
                { role: 'minimize', label: 'Réduire' },
                { role: 'zoom', label: 'Zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front', label: 'Tout mettre au premier plan' },
                    { type: 'separator' },
                    { role: 'window', label: 'Fenêtre' }
                ] : [
                    { role: 'close', label: 'Fermer' }
                ])
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    const mainWindow = createWindow();
    createApplicationMenu(mainWindow);

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});