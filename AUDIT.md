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

**Ce que je N'AI PAS fait (nécessite ton action) — voir section "À valider avec Matteo" :**
- Purger le blob de l'historique git (nécessite `git filter-repo`/BFG + `git push --force`, opération
  destructive interdite par les garde-fous sans ton accord explicite)
- **Faire tourner (rotate) `JWT_SECRET` et le mot de passe admin sur le serveur de prod** — je n'ai pas
  accès au serveur live et je n'ai pas le droit de le redéployer

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

## Corrections appliquées dans cette session

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

## À valider avec Matteo

Ces points sont **volontairement non traités automatiquement** car ambigus, risqués, ou visibles côté utilisateur/production :

1. **Rotation des secrets de production (URGENT)** — `JWT_SECRET` et le mot de passe admin (`ADMIN_PASSWORD_HASH`)
   présents dans `backend/backend.tar.gz` doivent être régénérés sur le serveur live. Je n'ai pas accès au serveur
   et je ne dois pas le redéployer.
2. **Purge de l'historique git** — pour retirer définitivement le blob du `.env.production` de l'historique
   (`git filter-repo` ou BFG Repo-Cleaner), il faut un `git push --force` sur `dev`/`main`. Opération destructive
   pour tout collaborateur ayant déjà cloné le repo — nécessite ta décision explicite et une coordination.
3. **Migration JWT vers cookie `httpOnly`** — corrige le vol de token par XSS mais change le contrat d'API
   (login renvoie un cookie au lieu d'un JSON token) et le comportement du frontend (`Admin.jsx`, `api.js`).
   Le plan détaillé existe déjà dans `frontend/CLAUDE.md` (section "5. Move JWT auth to httpOnly cookie").
4. **Endpoint `POST /api/contact`** — le formulaire de contact du frontend appelle une route qui n'existe pas
   côté backend (échec silencieux). Implémentation prête dans `frontend/CLAUDE.md` (nodemailer + Hotmail),
   mais nécessite d'ajouter `CONTACT_EMAIL_PASSWORD` en prod — je ne peux pas configurer ça moi-même.
5. **`npm audit fix --force` (breaking)** — `sharp` a une CVE côté `libvips` mais le correctif bump vers `0.35.x`
   (breaking change). `react-router` a plusieurs CVE hautes mais reste sur la même branche majeure (7.x) donc
   le fix non-cassant a été appliqué ; vérifier que rien ne casse après déploiement.
6. **Pagination de `GET /api/photos`** — change le contrat d'API et potentiellement l'UX de la galerie
   (scroll infini vs. pages). À concevoir avec toi plutôt qu'imposer un choix.
7. **`srcset`/images responsives** — nécessite de régénérer plusieurs tailles par photo côté backend
   (`sharp`) et de changer le schéma de la base (`basename` sans extension). Chantier structurant, pas un patch.
8. **Rate limiting sur `/api/photos/*`** — actuellement seul `/auth/login` est throttlé. Ajouter une limite
   générale est probablement une bonne idée mais je préfère que tu valides les seuils (impact potentiel sur
   l'admin qui upload 20 photos d'un coup).
9. **Auto-hébergement des polices Google Fonts** — gain RGPD/perf, mais change le rendu si les fichiers
   `.woff2` ne sont pas téléchargés/placés correctement. Nécessite une vérification visuelle.
10. **Ajout d'une suite de tests** — 0 % de couverture actuellement. Choix de stack (Vitest/Jest, supertest
    pour le backend) et mise en place de CI à discuter avec toi plutôt qu'imposé.

---

## Résumé de fin de session

**Branche :** `audit-auto-20260722` (9 commits au-dessus de `dev` à `b9c1eb0`, non poussée — reste locale).

### Ce qui a été fait
1. Audit complet écrit dans ce fichier (sécurité, perf, qualité, a11y/SEO, tests).
2. **Trouvaille critique** : secrets de production (`JWT_SECRET`, hash du mot de passe admin) commités
   dans `backend/backend.tar.gz` et déjà présents sur `origin/dev` (GitHub). Le tarball a été retiré du
   suivi git, mais **le secret reste dans l'historique** et **doit être considéré comme compromis**.
3. 8 corrections autonomes appliquées, chacune dans un commit atomique, chacune vérifiée
   (lint, build, ou démarrage serveur + test manuel selon le cas) avant commit :
   - Retrait des tarballs du tracking git + `.gitignore`
   - Fix des erreurs/warnings ESLint (2 erreurs, 2 warnings → 0)
   - `.dockerignore` backend (secrets ne fuitent plus dans l'image Docker)
   - `helmet` pour les headers de sécurité HTTP
   - `npm audit fix` non cassant sur backend (3 CVE corrigées, 1 restante nécessitant un bump majeur de `sharp`)
   - `npm audit fix` non cassant sur frontend (4 CVE corrigées → 0 vulnérabilité restante)
   - Recompression lossless des icônes PNG surdimensionnées (−75 % et −70 %)
   - `backend/.env.example` ajouté (absent jusqu'ici)

### Ce qu'il reste à faire (voir "À valider avec Matteo" pour le détail complet)
- **Urgent — rotation des secrets de prod** (`JWT_SECRET`, mot de passe admin) sur le serveur live.
- Décision sur la purge de l'historique git (nécessite un `git push --force`).
- Migration JWT → cookie `httpOnly` (plan déjà écrit dans `frontend/CLAUDE.md`).
- Implémentation de l'endpoint `POST /api/contact` (le formulaire de contact échoue silencieusement).
- `sharp` → 0.35.x (breaking) pour corriger la dernière CVE backend.
- Pagination de l'API photos, `srcset`/images responsives, auto-hébergement des polices.
- Rate limiting général sur `/api/photos/*`.
- Mise en place d'une suite de tests (0 % de couverture actuellement).

### Ce qui attend ta validation avant tout déploiement
Ne merge/déploie pas cette branche sans avoir traité le point 1 (rotation des secrets) — sinon le nouveau
`.env` de prod resterait potentiellement aligné avec un secret déjà exposé publiquement.
