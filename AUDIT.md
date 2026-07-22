# Audit autonome — Sandy's Art Photographies

Date : 2026-07-22
Branche : `audit-auto-20260722` (créée depuis `dev`, propre au moment du démarrage)
Mode : audit + corrections autonomes, garde-fous Phase 0 respectés (voir prompt original).

---

## 🚨 Trouvaille critique à traiter en priorité absolue

### SEC-CRIT-1 — Secrets de production commités dans l'historique git, déjà poussés sur GitHub

`backend/backend.tar.gz` (tracké par git, commit `318c4fa "feat: implement multiple photo upload feature"`) contient un fichier
`.env.production` avec de **vraies valeurs de production** :
- `JWT_SECRET` (56 caractères — clé réelle, pas un placeholder)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` (hash bcrypt de 60 caractères)
- `FRONTEND_URL`, `ALLOWED_ORIGINS`

Ce commit est présent sur la branche `dev`, qui est elle-même synchronisée avec `origin/dev` sur
`https://github.com/Enoxboo/sandysart-photo.git`. **Ces secrets doivent être considérés comme compromis**,
que le dépôt GitHub soit public ou privé (toute personne avec accès en lecture au repo, passé ou présent,
a pu les récupérer).

**Ce que j'ai fait (safe, réversible) :**
- [x] Retiré `backend/backend.tar.gz` et `frontend/frontend.tar.gz` du suivi git (`git rm --cached`)
- [x] Ajouté `*.tar.gz` à `.gitignore` pour empêcher la récidive

**Mise à jour 2026-07-22 (session 2) — historique purgé :**
- [x] `git filter-repo` a retiré définitivement `backend/backend.tar.gz`, `frontend/frontend.tar.gz`
  **et** `backend/.env.production` (fichier vide trouvé en cherchant plus large, sans contenu sensible)
  de tout l'historique des branches `dev`, `main`, `style` et `audit-auto-20260722`.
- [x] Vérifié avec `git log --branches --full-history -- '*.tar.gz' 'backend/.env.production'` → aucun résultat.
- [x] Tags de sauvegarde créés avant réécriture : `backup-before-purge-20260722-{dev,main,style,audit-auto-20260722}`
  (locaux uniquement, non poussés — pointent vers l'historique original si besoin de comparer).
- [x] `git push --force-with-lease` effectué sur `dev`, `main` et `style` — **l'historique sur GitHub a été
  réécrit**. Les anciens SHA (`b9c1eb0`, `d74096b`, `51eecee`, etc.) n'existent plus sur les branches distantes.

**⚠️ Ce que la purge ne fait PAS :**
- GitHub peut garder en cache les anciens objets (accessibles par SHA direct) pendant un certain temps avant
  son propre garbage collection. Toute personne ayant déjà cloné/forké le repo avant la purge a toujours
  l'ancien historique en local.
- **La purge ne remplace pas la rotation des secrets.** `JWT_SECRET` et le hash du mot de passe admin ont été
  exposés publiquement pendant plusieurs mois avant cette purge — ils doivent toujours être régénérés sur le
  serveur de production. Je n'ai pas accès au serveur live, cette action reste à faire manuellement.

---

## Sécurité

| Priorité | Point | Détail |
|---|---|---|
| 🔴 Critique | Secrets prod commités | Voir SEC-CRIT-1 ci-dessus |
| 🔴 Critique | JWT stocké en `localStorage` | `Admin.jsx` / `api.js` lisent/écrivent le token dans `localStorage`. Un XSS permettrait de voler le token admin. Documenté depuis un audit précédent (`frontend/CLAUDE.md` SEC-2), jamais implémenté côté backend (nécessite cookie `httpOnly`). |
| 🟠 Important | Pas de `.dockerignore` côté backend | `backend/Dockerfile` fait `COPY . .` sans `.dockerignore`. Résultat : `.env`, `node_modules`, `backend.tar.gz` (qui contient lui-même un `.env.production`!), `uploads/`, `photos.db` finissent dans les layers de l'image Docker. Même si `.env` est gitignoré, il fuit dans l'image. |
| 🟠 Important | Pas de headers de sécurité HTTP | Aucun `helmet` (ou équivalent) sur Express : pas de `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, etc. |
| 🟠 Important | Dépendances vulnérables (backend) | `npm audit` : 8 vulnérabilités (4 modérées, 4 hautes) — `multer` (DoS x5), `path-to-regexp` (ReDoS), `qs` (DoS), `sharp` (CVE libvips, nécessite bump majeur). |
| 🟠 Important | Dépendances vulnérables (frontend) | `npm audit` : 5 vulnérabilités (1 modérée, 4 hautes) — `axios` (prototype pollution), `follow-redirects`, `form-data` (CRLF injection), `react-router` (XSS via redirects, CSRF, DoS — plusieurs CVE). |
| 🟡 Moyen | Rate limiting uniquement sur `/auth/login` | Les routes `/api/photos/*` (y compris l'upload, protégé par JWT mais pas throttlé) n'ont aucune limite de requêtes. Un token volé (cf. point localStorage) permettrait un abus/déni de service sans friction. |
| 🟡 Moyen | Pas de validation d'entrée stricte | Les routes `updatePhoto`/`createPhoto` acceptent `title`, `description`, `tags` sans validation de longueur/format (pas de risque d'injection grâce aux requêtes préparées, mais pas de garde-fou contre des payloads abusifs). |
| 🟢 Mineur | `.env.example` frontend correct | Ne contient que des placeholders, RAS. |
| ✅ Point fort | Requêtes SQL paramétrées partout | Aucune concaténation de chaînes dans les requêtes SQL (`better-sqlite3` avec `?`). Pas d'injection SQL détectée. |
| ✅ Point fort | Mots de passe hashés avec bcrypt | `bcryptjs`, comparaison en temps constant via `bcrypt.compare`. |
| ✅ Point fort | CORS restreint | Origines whitelistées en prod (`server.js:14-17`), pas de wildcard. |
| ✅ Point fort | Rate limiting sur le login | `express-rate-limit`, 10 tentatives / 15 min — bonne pratique déjà en place. |
| ✅ Point fort | Validation des types de fichiers à l'upload | `fileFilter` sur extension + mimetype (jpeg/png/gif/webp uniquement), limite de taille (20MB) et de nombre de fichiers (20). |

---

## Performance

| Priorité | Point | Détail |
|---|---|---|
| 🟠 Important | Pas de pagination sur `GET /api/photos` | `SELECT * FROM photos ORDER BY upload_date DESC` sans `LIMIT`/`OFFSET`. Le portfolio entier est chargé à chaque visite de la galerie. Scalable jusqu'à quelques centaines de photos, mais dette à surveiller. Changerait le contrat d'API et l'UX (scroll infini / pagination visible) → non touché automatiquement. |
| 🟠 Important | Pas de `srcset`/images responsives | Toutes les `<img>` servent le fichier plein format quel que soit l'écran (mobile inclus). Nécessite génération de variantes côté backend (`sharp`, déjà une dépendance). |
| 🟡 Moyen | Icônes PNG surdimensionnées | `android-chrome-512x512.png` : 424 Ko (cible < 50 Ko), `apple-touch-icon.png` : 62 Ko (cible < 20 Ko). |
| 🟡 Moyen | Polices Google Fonts via CDN | Chaque visite envoie l'IP du visiteur à Google (`fonts.googleapis.com`). Problème RGPD + FCP plus lent qu'en auto-hébergement. |
| 🟢 Mineur | Pas de layout shift sur le carrousel hero | Le conteneur `.hero-carousel` a une `height: 100vh` fixe — pas de CLS réel malgré l'absence de `width`/`height` sur les `<img>`. |
| 🟢 Mineur | Masonry/galerie sans dimension fixe | `.masonry-item img` / `.gallery-item-image img` n'ont pas de `width`/`height`/`aspect-ratio` explicite — CLS mineur possible, **mais** forcer un `aspect-ratio` casserait l'effet masonry actuel (ratio naturel de chaque photo) → décision de design, non modifié automatiquement. |
| ✅ Point fort | Compression automatique à l'upload | `sharp` redimensionne (max 1920px) et compresse (JPEG q85) chaque photo uploadée côté backend. |
| ✅ Point fort | `loading="lazy"` sur les images hors-écran | Grille masonry de la home. |
| ✅ Point fort | `fetchpriority="high"` sur la première image du carousel | Bonne pratique LCP déjà appliquée. |
| ✅ Point fort | Index SQLite sur les colonnes filtrées | `idx_is_week_photo`, `idx_is_hero_photo`, `idx_upload_date`. |

---

## Qualité du code

| Priorité | Point | Détail |
|---|---|---|
| 🟠 Important | Aucun test automatisé | `backend/package.json` : `"test": "echo \"Error: no test specified\" && exit 1"`. Aucun fichier `*.test.*`/`*.spec.*` dans tout le repo. Zéro couverture sur l'auth, l'upload, les routes photos. |
| 🟡 Moyen | 2 erreurs ESLint (`no-unused-vars`) | `Admin.jsx:67` et `Admin.jsx:83` — variable `error` capturée dans un `catch` mais jamais utilisée. |
| 🟡 Moyen | 2 warnings ESLint (`react-hooks/exhaustive-deps`) | `SEO.jsx:103` (dépendance `siteInfo.author` manquante) et `Gallery.jsx:20` (dépendance `loadAllPhotos` manquante). |
| 🟢 Mineur | Scripts de debug commités à la racine du backend | `debug_uploads.js` (script de diagnostic ad hoc) mélangé avec le code applicatif. Fonctionnel mais nuit à la lisibilité de la structure `src/`. |
| 🟢 Mineur | Gestion d'erreurs incohérente selon les endpoints | `errorHandler.js` est centralisé et bien fait, mais certains handlers (`createPhoto`) dupliquent la logique d'insertion DB dans le bloc `try` et le `catch` au lieu de factoriser. |
| ✅ Point fort | Middleware d'erreurs centralisé et propre | `errorHandler.js` distingue proprement JWT/Multer/SQLite/erreurs applicatives, classe `AppError` réutilisable. |
| ✅ Point fort | `asyncHandler` wrapper | Évite le boilerplate `try/catch` dans chaque contrôleur async. |
| ✅ Point fort | JSDoc présent sur la plupart des fonctions backend | Bonne lisibilité du contrat de chaque fonction. |
| ✅ Point fort | Historique de nettoyage déjà solide | `frontend/CLAUDE.md` montre qu'une passe précédente a déjà corrigé ~25 points (styles inline extraits, closures obsolètes, a11y, SEO statique...). |

---

## Accessibilité / SEO

Le site est public (`sandysartphotographies.com`), donc ce point est pertinent.

| Priorité | Point | Détail |
|---|---|---|
| 🟢 Déjà bon | Meta tags statiques + OG + Twitter Card + JSON-LD `LocalBusiness` | Présents dans `index.html`, avec fallback pour les crawlers sans JS. |
| 🟢 Déjà bon | `<html lang="fr">`, balise `canonical` dynamique, skip-link, `:focus-visible` | Tous déjà en place (cf. `frontend/CLAUDE.md`). |
| 🟢 Déjà bon | Carrousel avec `<button>` + `aria-label`/`aria-current` | Bonne sémantique. |
| 🟡 Moyen | Image OG de fallback non dédiée | `og:image` pointe vers `/about.webp` (portrait de Sandy) au lieu d'une image 1200×630 pensée pour le partage social. Documenté comme reste à faire manuellement (Canva). |
| 🟢 Mineur | `sitemap.xml` à tenir à jour | Les `<lastmod>` ne sont pas régénérés automatiquement à chaque changement de contenu. |

---

## Tests

- **Couverture actuelle : 0 %.** Aucun test unitaire, d'intégration ou e2e sur tout le repo.
- Zones critiques non testées en priorité si des tests sont introduits un jour :
  1. `backend/src/middleware/auth.js` — génération/vérification JWT
  2. `backend/src/routes/auth.js` — login (bruteforce, mauvais identifiants, rate limit)
  3. `backend/src/controllers/photoController.js` — upload multiple (fichiers invalides, échecs partiels, nettoyage des fichiers temp)
  4. `frontend/src/pages/Admin.jsx` — flux de login/logout, protection de route côté client

Je n'ai pas ajouté de suite de tests dans cette session : un premier harnais de test change la structure du projet (choix de framework, config CI) et sort du périmètre "correction sans ambiguïté" de la Phase 2.

---

## Points forts à préserver

- Requêtes SQL 100 % paramétrées, aucune concaténation.
- Rate limiting déjà en place sur le login, bcrypt pour les mots de passe.
- CORS strictement whitelisté en production.
- Pipeline d'optimisation d'image automatique à l'upload (`sharp`).
- Composant `SEO.jsx` fait à la main, complet (OG, Twitter, JSON-LD, canonical, geo tags) sans dépendance externe.
- Une passe d'audit précédente (visible dans `frontend/CLAUDE.md`) a déjà traité ~25 points d'accessibilité/SEO/UX — le site est dans un état nettement plus propre qu'un projet vitrine typique.

---

## Session 1 (2026-07-22) — audit initial + corrections sans ambiguïté

Dans l'ordre chronologique (`git log --oneline b9c1eb0..HEAD`, du plus ancien au plus récent) :

- [x] `9e2ca82` `docs: add autonomous audit report (AUDIT.md)`
- [x] `7412d7d` `security: stop tracking deployment tarballs containing leaked prod secrets` — retire `backend/backend.tar.gz` et `frontend/frontend.tar.gz` du suivi git, ajoute `*.tar.gz` à `.gitignore`. Fichiers locaux conservés sur disque.
- [x] `e643912` `fix: resolve ESLint errors and React hook dependency warnings` — `Admin.jsx` (2 erreurs `no-unused-vars`), `Gallery.jsx` et `SEO.jsx` (dépendances manquantes des `useEffect`). Vérifié avec `npm run lint` (0 problème) et `npm run build`.
- [x] `77a7fd1` `security: add backend .dockerignore to keep secrets out of the image` — empêche `.env`, `node_modules`, `photos.db`, `uploads/` de finir dans l'image Docker.
- [x] `41d6078` `security: add helmet for baseline HTTP security headers` — headers `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Referrer-Policy`, etc. CSP volontairement désactivée (serveur API/fichiers statiques, pas de HTML applicatif). Vérifié : démarrage serveur + headers observés sur une requête réelle.
- [x] `a55471a` `chore: apply non-breaking npm audit fixes (backend)` — corrige `multer`, `path-to-regexp`, `qs`. `sharp` laissé de côté (bump majeur nécessaire).
- [x] `4fb82c4` `chore: apply non-breaking npm audit fixes (frontend)` — corrige `axios`, `follow-redirects`, `form-data`, `react-router`. **0 vulnérabilité restante côté frontend.** Vérifié : lint + build.
- [x] `d959f44` `perf: recompress oversized PNG icons` — `android-chrome-512x512.png` 424 Ko → 107 Ko, `apple-touch-icon.png` 62 Ko → 18 Ko. Recompression lossless (sharp), dimensions/format identiques, vérifié visuellement.
- [x] `beb3683` `docs: add backend/.env.example` — documente les variables réellement lues par le code (`PORT`, `NODE_ENV`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`), placeholders uniquement.

---

## Session 2 (2026-07-22) — purge de l'historique + corrections restantes

Reprise du travail avec autorisation explicite de réécrire l'historique git et de tout traiter sans
liste "à valider" — voir le prompt de la session pour le détail des garde-fous (toujours actifs : pas de
vraies valeurs de secrets dans les fichiers, pas de déploiement, pas de commande destructive hors la purge
explicitement autorisée).

### Purge de l'historique git

- `git filter-repo` a retiré définitivement `backend/backend.tar.gz`, `frontend/frontend.tar.gz` et
  `backend/.env.production` (fichier vide, sans contenu sensible) de tout l'historique des branches
  `dev`, `main`, `style` et `audit-auto-20260722`.
- Vérifié avec `git log --branches --full-history -- '*.tar.gz' 'backend/.env.production'` → aucun résultat.
- Tags de sauvegarde créés avant réécriture (locaux, non poussés) :
  `backup-before-purge-20260722-{dev,main,style,audit-auto-20260722}`.
- `git push --force-with-lease` effectué sur `dev`, `main` et `style` — **l'historique sur GitHub a été
  réécrit**. Les anciens SHA n'existent plus sur les branches distantes.
- **Ce que ça ne fait pas** : GitHub peut garder les anciens objets en cache un moment, et quiconque avait
  déjà cloné le repo a toujours l'ancien historique en local. Surtout : **la purge ne remplace pas la
  rotation des secrets** — voir ci-dessous, c'est le seul point qui reste bloquant.

### Corrections traitées cette session (tout autorisé, plus de liste "à valider")

Chaque point ci-dessous est un commit atomique séparé, vérifié (lint/build/tests ou test manuel via
serveur local + curl) avant commit :

1. **`sharp` bump 0.34.5 → 0.35.3** — corrige les CVE libvips. Pipeline resize/jpeg re-testé, upload
   fonctionnel après coup.
2. **JWT → cookie `httpOnly`** — le token n'est plus jamais accessible en JS. `POST /auth/login` pose un
   cookie `httpOnly; sameSite=strict` (secure en prod uniquement), `POST /auth/logout` ajouté, `api.js` et
   `Admin.jsx` adaptés (`withCredentials`, plus de `localStorage`). Testé de bout en bout (login → verify
   → route protégée → logout → verify échoue) contre une instance réelle.
3. **Rate limiting général sur `/api/photos/*`** — 300 req/15 min/IP, en plus du throttling déjà existant
   sur `/auth/login`.
4. **Fix upload Windows (EBUSY)** — découvert en testant le point précédent : le nettoyage du fichier temp
   après optimisation `sharp` pouvait échouer avec un verrou transitoire (surtout Windows), faisant échouer
   des uploads pourtant réussis. Rendu non bloquant.
5. **`POST /api/contact`** — le formulaire de contact appelait une route qui n'existait pas côté backend
   (échec silencieux depuis son ajout). Implémenté avec nodemailer, validation, rate limiting dédié
   (5 req/15 min/IP), et un 503 explicite si `CONTACT_EMAIL`/`CONTACT_EMAIL_PASSWORD` ne sont pas configurés.
6. **Pagination `GET /api/photos`** — `?page=&limit=` (défaut 1/24, max 1000). `Gallery.jsx` affiche un
   bouton "Charger plus de photos" ; `Admin.jsx` demande une limite haute (1000) pour garder sa vue
   d'ensemble complète du portfolio.
7. **Images responsives (srcset)** — chaque upload génère désormais 3 variantes WebP (400/800/1600px) en
   plus de l'image principale. Colonne `has_variants` ajoutée (migration légère automatique au démarrage)
   pour que les photos existantes, sans variantes, retombent proprement sur l'image simple. `deletePhoto`
   nettoie aussi les variantes. Effet de bord : corrige un bug où le fichier gardait l'extension d'origine
   (`.webp`, `.png`...) alors que le contenu était toujours ré-encodé en JPEG — désormais toujours `.jpg`.
8. **Polices auto-hébergées** — Cormorant Garamond et Inter téléchargées (fichiers variables woff2, un seul
   fichier par famille couvre toute la plage de graisses utilisée) dans `public/fonts/`, `@import` Google
   Fonts remplacé par des `@font-face` locaux, preconnect retirés.
9. **Suite de tests** — 0 % → 23 tests :
   - Backend (Vitest + supertest, 18 tests) : JWT (génération/expiration/cookie), login/verify/logout,
     upload (auth requise, rejet de type de fichier, génération de variantes, nettoyage à la suppression).
     A nécessité de rendre `server.js` testable (export de `app`, `listen()` conditionnel) et la DB
     isolable (`DB_PATH` d'environnement, défaut inchangé).
   - Frontend (Vitest + React Testing Library, 5 tests) : flux complet login/logout d'`Admin.jsx`
     (session déjà valide, login réussi, login échoué, logout).
   - `npm test` fonctionne maintenant dans les deux dossiers (`backend/package.json` avait juste un
     placeholder qui faisait échouer la commande).

### À valider avec Matteo — un seul point bloquant restant

1. **Rotation des secrets de production (URGENT, toujours en attente)** — `JWT_SECRET` et le mot de passe
   admin ont été exposés publiquement sur GitHub pendant plusieurs mois avant la purge de cette session.
   La purge d'historique ne les invalide pas : ils doivent être régénérés sur le serveur live
   (`node backend/scripts/hashPassword.js "NouveauMotDePasse"` pour le hash, une valeur aléatoire longue
   type `openssl rand -hex 32` pour `JWT_SECRET`). Je n'ai pas accès au serveur de production et n'ai pas
   le droit de le redéployer — cette action reste manuelle, par toi.

Tout le reste de la liste précédente (migration cookie, endpoint contact, pagination, srcset, fonts,
tests, rate limiting, bump sharp) a été traité cette session — voir le détail ci-dessus.

---

## Instructions de déploiement

Variables d'environnement à ajouter/vérifier sur le serveur de production (`backend/.env`), en plus de
celles déjà en place :

```
CONTACT_EMAIL=sandysartphotographies@hotmail.com
CONTACT_EMAIL_PASSWORD=<mot de passe d'application Hotmail — à générer si le 2FA est actif>
```

Et, suite à la rotation (voir point bloquant ci-dessus) :

```
JWT_SECRET=<nouvelle valeur aléatoire>
ADMIN_PASSWORD_HASH=<nouveau hash bcrypt>
```

Aucune autre variable d'environnement n'a été ajoutée. Le déploiement lui-même (redémarrage du service,
`npm ci`, etc.) n'a pas été effectué par cette session — je suis resté dans le code.

Point d'attention au premier déploiement post-fusion : `uploads/temp/` est maintenant créé automatiquement
au démarrage du serveur s'il n'existe pas (corrige un bug qui aurait fait échouer tout upload sur un
répertoire `uploads/` fraîchement créé, y compris en production si ce dossier n'existait pas déjà).

---

## Résumé final

**Branche :** `audit-auto-20260722`, fusionnée dans `dev` à la fin de cette session, puis poussée vers
`origin/dev`. Le remote a aussi reçu l'historique réécrit (`main`, `style`) suite à la purge — voir
ci-dessus.

### Bilan des deux sessions
- Audit complet (sécurité, perf, qualité, a11y/SEO, tests) écrit dans ce fichier.
- 1 fuite critique de secrets de production trouvée et son blob purgé de l'historique (rotation des
  secrets eux-mêmes toujours à faire côté serveur — seul point bloquant restant).
- 1 fichier `.env.production` vide additionnel trouvé et purgé au passage.
- ~20 commits atomiques, chacun vérifié avant d'être créé (lint, build, tests, ou test manuel via serveur
  local + curl selon le cas).
- Sécurité : tarballs déstrackés, `.dockerignore` backend, `helmet`, migration JWT vers cookie `httpOnly`,
  rate limiting général, dépendances à jour (0 vulnérabilité `npm audit` frontend, 0 côté backend après le
  bump `sharp`).
- Performance : pagination de l'API photos, images responsives (srcset), polices auto-hébergées, icônes
  compressées.
- Fonctionnalité : endpoint de contact enfin implémenté.
- Qualité : suite de tests créée (0 % → 23 tests), bugs latents corrigés au passage (verrou Windows sur
  l'upload, extension de fichier incohérente, dossier `uploads/temp/` jamais créé).

### Ce qu'il reste à faire
- **Rotation de `JWT_SECRET` et du mot de passe admin sur le serveur de production** (seul point bloquant).
- Configurer `CONTACT_EMAIL_PASSWORD` en prod pour activer le formulaire de contact.
- Nice-to-have non traités (mineurs, pas de blocage) : image OG dédiée 1200×630, mise à jour du
  `sitemap.xml` à chaque changement de contenu, validation d'entrée plus stricte sur les métadonnées photo,
  déplacement de `debug_uploads.js` hors de la racine backend.
