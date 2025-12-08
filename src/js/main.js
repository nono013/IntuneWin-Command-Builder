const { ipcRenderer } = require('electron');

const sourceInput = document.getElementById('sourcePath');
const setupInput = document.getElementById('setupPath');
const outputInput = document.getElementById('outputPath');
const commandBox = document.getElementById('commandBox');
const copyBtn = document.getElementById('copyBtn');
const executeBtn = document.getElementById('executeBtn');
const silentFlag = document.getElementById('silentFlag');

// Éléments de modal
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const intuneExePath = document.getElementById('intuneExePath');
const selectIntuneExeBtn = document.getElementById('selectIntuneExeBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

const initialSetupModal = document.getElementById('initialSetupModal');
const initialIntuneExePath = document.getElementById('initialIntuneExePath');
const initialSelectIntuneExeBtn = document.getElementById('initialSelectIntuneExeBtn');
const initialSaveBtn = document.getElementById('initialSaveBtn');

// Variable globale pour stocker le chemin configuré
let intuneWinAppUtilPath = '';

// Écouter l'événement du menu pour ouvrir les paramètres
ipcRenderer.on('open-settings-modal', () => {
    intuneExePath.value = intuneWinAppUtilPath;
    settingsModal.style.display = 'flex';
});

// Gestion des boutons de sélection avec les dialogues natifs Electron
document.querySelectorAll('[data-picker]').forEach(btn => {
    btn.addEventListener('click', async () => {
        const target = btn.dataset.picker;

        if (target === 'source' || target === 'output') {
            // Sélection de dossier
            const folderPath = await ipcRenderer.invoke('select-folder');
            if (folderPath) {
                if (target === 'source') {
                    sourceInput.value = folderPath;
                } else {
                    outputInput.value = folderPath;
                }
                updateCommand();
            }
        } else if (target === 'setup') {
            // Sélection de fichier
            const filePath = await ipcRenderer.invoke('select-file');
            if (filePath) {
                setupInput.value = filePath;
                updateCommand();
            }
        }
    });
});

// Permettre l'édition manuelle des chemins
[sourceInput, setupInput, outputInput, silentFlag].forEach(el => {
    el.addEventListener('input', updateCommand);
    el.addEventListener('change', updateCommand);
});

copyBtn.addEventListener('click', async () => {
    const text = commandBox.textContent || '';
    if (!text || text.startsWith('En attente')) return;
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copié dans le presse-papiers');
    } catch (err) {
        console.error(err);
        showToast('Impossible de copier automatiquement');
    }
});

executeBtn.addEventListener('click', async () => {
    const text = commandBox.textContent || '';
    if (!text || text.startsWith('En attente')) return;
    try {
        await ipcRenderer.invoke('execute-command', text);
        showToast('PowerShell ouvert avec la commande');
    } catch (err) {
        console.error(err);
        showToast('Erreur lors de l\'exécution');
    }
});

// Gestion des modals de paramètres
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

selectIntuneExeBtn.addEventListener('click', async () => {
    const path = await ipcRenderer.invoke('select-intune-exe');
    if (path) {
        intuneExePath.value = path;
    }
});

saveSettingsBtn.addEventListener('click', async () => {
    const path = intuneExePath.value.trim();
    if (!path) {
        showToast('Veuillez spécifier un chemin');
        return;
    }

    const saved = await ipcRenderer.invoke('save-config', { intuneWinAppUtilPath: path });
    if (saved) {
        intuneWinAppUtilPath = path;
        settingsModal.style.display = 'none';
        showToast('Configuration enregistrée');
        updateCommand();
    } else {
        showToast('Erreur lors de la sauvegarde');
    }
});

// Gestion du modal de configuration initiale
initialSelectIntuneExeBtn.addEventListener('click', async () => {
    const path = await ipcRenderer.invoke('select-intune-exe');
    if (path) {
        initialIntuneExePath.value = path;
    }
});

initialSaveBtn.addEventListener('click', async () => {
    const path = initialIntuneExePath.value.trim();
    if (!path) {
        showToast('Veuillez spécifier un chemin');
        return;
    }

    const saved = await ipcRenderer.invoke('save-config', { intuneWinAppUtilPath: path });
    if (saved) {
        intuneWinAppUtilPath = path;
        initialSetupModal.style.display = 'none';
        showToast('Configuration enregistrée');
        updateCommand();
    } else {
        showToast('Erreur lors de la sauvegarde');
    }
});

// Charger la configuration au démarrage
async function loadConfiguration() {
    const config = await ipcRenderer.invoke('load-config');
    intuneWinAppUtilPath = config.intuneWinAppUtilPath || '';

    // N'afficher le modal QUE si aucun chemin n'est configuré
    if (!intuneWinAppUtilPath) {
        initialIntuneExePath.value = '';
        initialSetupModal.style.display = 'flex';
    }

    updateCommand();
}

function updateCommand() {
    const src = sourceInput.value.trim();
    const setup = setupInput.value.trim();
    const out = outputInput.value.trim();
    if (!src || !setup || !out) {
        commandBox.textContent = 'En attente des chemins...';
        return;
    }
    const silent = silentFlag.checked ? ' -q' : '';
    const exePath = intuneWinAppUtilPath || 'IntuneWinAppUtil.exe';
    const cmd = `"${exePath}" -c "${src}" -s "${setup}" -o "${out}"${silent}`;
    commandBox.textContent = cmd;
}

function showToast(text) {
    const tpl = document.getElementById('toast');
    const clone = tpl.content.firstElementChild.cloneNode(true);
    clone.textContent = text;
    document.body.appendChild(clone);
    setTimeout(() => clone.remove(), 2000);
}

// Initialiser l'application
loadConfiguration();
