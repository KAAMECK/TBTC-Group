# Déploiement de l’API administrative TBTC

## 1. Préparer le Google Sheet

1. Importer `TBTC_Demandes_Administratives.xlsx` dans Google Drive au format Google Sheets.
2. Copier l’identifiant situé entre `/d/` et `/edit` dans l’URL du classeur.
3. Ouvrir **Extensions → Apps Script** depuis le classeur.

## 2. Installer le script

1. Remplacer le contenu de `Code.gs` par celui du présent dossier.
2. Activer l’affichage du manifeste dans les paramètres du projet Apps Script.
3. Remplacer le manifeste par `appsscript.json`.
4. Exécuter une fois :

```javascript
setConfiguration('IDENTIFIANT_DU_CLASSEUR', 'CLE_ADMIN_DU_FICHIER_ACCES')
```

5. Accepter les autorisations demandées par Google.

## 3. Déployer comme application web

1. Cliquer **Déployer → Nouveau déploiement → Application web**.
2. Exécuter en tant que : **Moi**.
3. Accès : **Tout le monde**.
4. Copier l’URL terminant par `/exec`.
5. Reporter cette URL dans `config.js`, dans `apiUrl`.

## 4. Accès administratif

- Le Google Sheet est la vue administrative principale.
- Ajouter les administrateurs avec le bouton **Partager** ou avec :

```javascript
shareWithAdministrators('admin1@example.com,admin2@example.com')
```

- API de lecture : `URL_DU_DEPLOIEMENT?action=list&key=CLE_ADMIN`.
- Ne jamais placer la clé administrateur dans `config.js` ni dans le dépôt public.
