# IntuneWin Command Builder

Application de bureau pour générer automatiquement les commandes `IntuneWinAppUtil.exe` et créer des packages `.intunewin` pour Microsoft Intune.

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-lightgrey)

## À propos

IntuneWin Command Builder simplifie la création de packages `.intunewin` en générant automatiquement la ligne de commande PowerShell nécessaire. Plus besoin de mémoriser la syntaxe ou de taper manuellement les chemins - sélectionnez vos dossiers via une interface graphique intuitive et l'application assemble la commande pour vous.

### Fonctionnalités

- Interface graphique moderne et intuitive
- Sélection de dossiers/fichiers via des dialogues natifs
- Génération automatique de la commande PowerShell
- Copie en un clic vers le presse-papiers
- Exécution directe dans PowerShell
- Support du mode silencieux (`-q`)
- Configuration persistante du chemin vers `IntuneWinAppUtil.exe`
- Thème sombre professionnel

## Captures d'écran

![Interface principale](docs/screenshot-main.png)
*Interface principale de l'application*

## Prérequis

### Pour utiliser l'application

- **Système d'exploitation** : Windows 10 ou Windows 11
- **IntuneWinAppUtil.exe** : [Télécharger l'outil officiel Microsoft](https://github.com/microsoft/Microsoft-Win32-Content-Prep-Tool)
  - Vous pouvez configurer son emplacement lors de la première utilisation ou plus tard via le menu Fichier > Paramètres

### Pour développer

- Node.js (v16 ou supérieur)
- npm ou yarn
- Git

## Installation

### Option 1 : Télécharger l'exécutable (Recommandé)

1. Rendez-vous sur la page [Releases](https://github.com/nono013/IntuneWin-Command-Builder/releases)
2. Téléchargez la dernière version : `IntuneWin-Command-Builder-x.x.x.exe` (version portable)
3. Placez le fichier dans un dossier de votre choix (ex: `C:\Tools\`)
4. Double-cliquez pour lancer l'application
5. Au premier lancement, configurez le chemin vers `IntuneWinAppUtil.exe`

**Note** : Aucune installation requise - l'application est entièrement portable et peut être lancée depuis n'importe quel emplacement (y compris une clé USB).

### Option 2 : Build depuis les sources

```bash
# Cloner le repository
git clone https://github.com/nono013/IntuneWin-Command-Builder.git
cd IntuneWin-Command-Builder

# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Builder l'application
npm run build
```

Les fichiers buildés seront dans le dossier `dist/`.

## Utilisation

### Première utilisation

1. **Lancer l'application**
2. **Configurer IntuneWinAppUtil.exe**
   - Un modal s'affiche au premier lancement
   - Cliquez sur "Choisir" pour sélectionner l'emplacement de `IntuneWinAppUtil.exe`
   - Cliquez sur "Continuer"

### Génération d'une commande

1. **Dossier source (-c)** : Cliquez sur "Choisir" et sélectionnez le dossier contenant votre installeur et ses fichiers
2. **Fichier setup (-s)** : Cliquez sur "Choisir" et sélectionnez le fichier d'installation (`.exe`, `.msi`, etc.)
3. **Dossier de sortie (-o)** : Cliquez sur "Choisir" et sélectionnez où créer le package `.intunewin`
4. **Mode silencieux** (optionnel) : Cochez la case pour ajouter le flag `-q`

La commande est générée automatiquement au fur et à mesure.

### Exécution

Deux options :
- **Copier** : Copie la commande dans le presse-papiers pour la coller dans PowerShell
- **Exécuter** : Ouvre directement PowerShell avec la commande prête à être exécutée

### Modifier la configuration

**Fichier > Paramètres** (ou `Ctrl+,` / `Cmd+,`)
- Modifiez le chemin vers `IntuneWinAppUtil.exe` si nécessaire

## Structure du projet

```
IntuneWin-Command-Builder/
├── electron-main.js          # Processus principal Electron
├── preload.js                # Script de préchargement (sécurité)
├── package.json              # Configuration npm et build
├── src/
│   ├── index.html            # Interface utilisateur
│   ├── css/
│   │   └── style.css         # Styles de l'application
│   └── js/
│       └── main.js           # Logique du renderer process
├── dist/                     # Builds (ignoré par git)
└── node_modules/             # Dépendances (ignoré par git)
```

## Technologies utilisées

- **Electron** : Framework pour applications de bureau cross-platform
- **Node.js** : Runtime JavaScript
- **electron-builder** : Outil de packaging et distribution
- **Vanilla JavaScript** : Pas de framework frontend, code simple et performant

## Configuration

La configuration de l'application est stockée dans :
```
%APPDATA%\intunewin-command-builder\config.json
```

Contenu du fichier :
```json
{
  "intuneWinAppUtilPath": "C:\\Tools\\IntuneWinAppUtil.exe"
}
```

## Développement

### Scripts disponibles

```bash
# Lancer en mode développement
npm start

# Builder pour Windows
npm run build

# Builder l'installateur NSIS + version portable
npm run build
```

### Architecture

L'application suit l'architecture Electron standard :

- **Main Process** ([electron-main.js](electron-main.js)) : Gère la fenêtre, les dialogues système, la configuration
- **Renderer Process** ([src/js/main.js](src/js/main.js)) : Interface utilisateur et logique client
- **IPC Communication** : Communication bidirectionnelle entre les processus via `ipcMain` et `ipcRenderer`

### Ajouter des fonctionnalités

1. Ajouter des handlers IPC dans [electron-main.js](electron-main.js) si besoin d'accès système
2. Ajouter la logique UI dans [src/js/main.js](src/js/main.js)
3. Modifier l'interface dans [src/index.html](src/index.html)
4. Styler dans [src/css/style.css](src/css/style.css)

## Dépannage

### L'application ne démarre pas

- Vérifiez que vous avez Windows 10 ou 11
- Essayez la version portable si l'installateur pose problème

### La commande ne s'exécute pas

- Vérifiez que PowerShell n'est pas bloqué par votre politique d'exécution
- Vérifiez que le chemin vers `IntuneWinAppUtil.exe` est correct

### Le modal de configuration s'affiche toujours

- Vérifiez que vous avez bien cliqué sur "Continuer" ou "Enregistrer"
- Vérifiez les permissions d'écriture dans `%APPDATA%`

### Problèmes de permissions

- L'application ne nécessite **pas** de droits administrateur
- Si PowerShell demande des droits admin, c'est lié à `IntuneWinAppUtil.exe`, pas à cette application

## Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines

- Suivez le style de code existant
- Testez vos changements avant de soumettre
- Mettez à jour la documentation si nécessaire

## FAQ

**Q : L'application fonctionne-t-elle sur macOS ou Linux ?**
R : Non, elle est conçue spécifiquement pour Windows car `IntuneWinAppUtil.exe` est un outil Windows uniquement.

**Q : Puis-je utiliser cette application sans IntuneWinAppUtil.exe ?**
R : L'application génère la commande même sans l'outil, mais vous ne pourrez pas l'exécuter directement. Vous devrez copier la commande et l'exécuter plus tard.

**Q : Les données sont-elles envoyées quelque part ?**
R : Non, l'application fonctionne 100% en local. Aucune donnée n'est envoyée sur Internet.

**Q : Puis-je modifier les chemins manuellement ?**
R : Oui, les champs sont éditables. Vous pouvez taper ou coller des chemins directement.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

**nono013**

- GitHub : [@nono013](https://github.com/nono013)
- Repository : [IntuneWin-Command-Builder](https://github.com/nono013/IntuneWin-Command-Builder)

## Remerciements

- Microsoft pour l'outil [IntuneWinAppUtil](https://github.com/microsoft/Microsoft-Win32-Content-Prep-Tool)
- La communauté Electron pour la documentation et les ressources

## Support

Pour toute question ou problème :
- Ouvrez une [Issue sur GitHub](https://github.com/nono013/IntuneWin-Command-Builder/issues)
- Consultez les [Issues existantes](https://github.com/nono013/IntuneWin-Command-Builder/issues) avant de créer la vôtre

---

⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile sur GitHub !
