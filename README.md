# Au fil de soi

Site vitrine + reservation + administration locale pour une entreprise de head spa.

## Lancer le site

```bash
node server.js
```

Puis ouvrir `http://127.0.0.1:4173`.

Si le port est deja occupe :

```bash
PORT=4180 node server.js
```

## Administration

Identifiants actuels :

- Email : `admin@aufildesoi.fr`
- Mot de passe : `Admin2026!`

Le mot de passe et l'email autorise restent modifiables depuis l'onglet `Securite`.

Le serveur cree automatiquement un compte admin au premier lancement si `data/admin-auth.json` n'existe pas.

Pour definir les identifiants au premier lancement :

```bash
ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="mot-de-passe-long" node server.js
```

Changez le mot de passe depuis l'onglet `Securite` avant une mise en ligne publique.

## Modifiable depuis l'admin

- Textes du hero, presentation, soins, galerie, video, avis, reservation et contact.
- Navigation et libelles principaux.
- Logo, image/video hero, image de presentation, galerie et video par glisser-deposer ou selection de fichier.
- Prestations avec nom, duree, prix et description.
- Avis clients, uniquement ajoutes manuellement.
- Rendez-vous, disponibilites, creneaux bloques et statistiques.
- Configuration complete via l'onglet `Avance` en JSON.
- Sauvegarde globale avec le bouton fixe en bas de l'admin : les changements ne sont conserves apres rechargement qu'apres clic sur `Sauvegarder les modifications`.

## Donnees et confidentialite

- Les donnees sont stockees localement dans `data/site-data.json`.
- Les avis sont vides par defaut : aucun faux avis n'est genere.
- L'API publique des creneaux ne renvoie que `time` et `status`.
- Les noms, emails, telephones et notes de rendez-vous ne sont accessibles qu'apres connexion admin.

## Assets

Les images locales par defaut sont generees avec :

```bash
node scripts/generate-assets.js
```

## Verification

Controle de syntaxe :

```bash
node --check server.js
node --check public/app.js
node --check scripts/generate-assets.js
node --check scripts/smoke-test.js
```

Smoke test visuel, si Playwright et ses navigateurs sont installes :

```bash
NODE_PATH=/Users/nolanmiot/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
ADMIN_PASSWORD="votre-mot-de-passe" \
node scripts/smoke-test.js
```
