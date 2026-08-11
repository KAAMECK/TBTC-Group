# TBTC Group

Site vitrine responsive de TBTC Group, présentant les six départements du groupe : Construction, Formation, Track, Business, Électronique et Élevage.

## Mise en ligne

Le site est conçu pour GitHub Pages et ne nécessite aucune étape de compilation.

## Structure

- `index.html` : structure et contenus du site
- `styles.css` : identité visuelle et mise en page responsive
- `script.js` : navigation mobile, animations et envoi des demandes vers le registre administratif
- `assets/` : logo vectoriel et photos web optimisées
- `config.js` : URL publique de l’API administrative Google Apps Script
- `google-apps-script/` : API d’enregistrement et guide de déploiement vers Google Sheets

## Administration

Les nouvelles demandes sont enregistrées dans un Google Sheet structuré, puis classées automatiquement de la plus récente à la plus ancienne. La clé de lecture administrative et les liens privés sont conservés uniquement dans le fichier local `Administration/ACCES_ADMIN_TBTC.txt`, exclu de Git.

Les documents de travail, archives sources, classeurs locaux et secrets administratifs sont volontairement exclus du dépôt public.
