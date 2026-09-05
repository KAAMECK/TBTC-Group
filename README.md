# TBTC Group

Site vitrine multipage de TBTC Group, publié avec GitHub Pages.

## Pages

- `index.html` — accueil, aperçu des six services et formulaire de demande
- `a-propos.html` — présentation, engagements et méthode du groupe
- `departements.html` — les six pôles d’expertise
- `realisations.html` — galerie de conceptions architecturales
- `contact.html` — redirection de compatibilité vers l’accueil

## Formulaire administratif

Le formulaire demande le nom complet, le téléphone du client, le département, la provenance et une brève description du besoin. Le nom et le téléphone du commissionnaire sont obligatoires uniquement pour « Recommandé par un commissionnaire ». Pour les réseaux sociaux, le réseau doit être précisé. L’application Web Google Apps Script configurée dans `config.js` ajoute automatiquement la date, l’heure et la référence.

Les liens des offres préremplissent le département, que le client peut modifier. L’objet est associé au département finalement choisi. Téléphone et département utilisent leurs colonnes existantes ; la colonne Source contient la provenance, son mode (préremplie ou déclarée) et, le cas échéant, le nom et le téléphone du commissionnaire. Cette compatibilité évite de perdre les nouvelles données avec le déploiement Apps Script actuel.

La provenance est préremplie depuis `utm_source` (prioritaire) ou le domaine référent externe et reste modifiable. Elle est conservée pendant 30 minutes dans la session de l’onglet pour les navigations internes ; aucun nom ni téléphone n’est conservé dans cette session. Sans information transmise, le formulaire demande la source : une adresse saisie, un favori et un lien sans référent ne peuvent pas être distingués automatiquement. Cette indication n’est pas une preuve d’attribution d’une commission.

Liens de diffusion à utiliser pour un préremplissage fiable :
- Facebook : `https://kaameck.github.io/TBTC-Group/?utm_source=facebook&utm_medium=social`
- WhatsApp : `https://kaameck.github.io/TBTC-Group/?utm_source=whatsapp&utm_medium=social`
- Instagram : `https://kaameck.github.io/TBTC-Group/?utm_source=instagram&utm_medium=social`

Les visuels de la charte sont optimisés en WebP dans `assets/images/departements/`.

Présentation locale : http://127.0.0.1:8092/TBTC/ (serveur PHP local actif).
Les modifications locales ne doivent être publiées que sur demande explicite.

## Publication

Site public : https://kaameck.github.io/TBTC-Group/

## Galerie architecturale

Les rendus sélectionnés sont publiés dans `assets/images/architecture/` avec des noms descriptifs. La vitrine donne la priorité aux plans, façades et perspectives 3D avant les images de chantier.
