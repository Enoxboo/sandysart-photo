# Sandy's Art Photographies — Frontend

Photography portfolio site for Sandy Limousin, a professional photographer based in Le Vernet, Haute-Garonne (31810), France. Specialises in pregnancy, newborn, family, wedding, and portrait photography.

**Live URL:** https://sandysartphotographies.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.1.1 |
| Router | React Router DOM 7.9.5 |
| Build tool | Vite 7.1.7 |
| HTTP client | Axios 1.13.1 |
| Styling | Plain CSS with custom properties (no UI library) |
| Fonts | Cormorant Garamond (headings) + Inter (body) via Google Fonts CDN |
| Backend proxy | localhost:5000 (Node/Express — lives in a sibling `backend/` directory) |

---

## Architecture

```
frontend/
├── public/               # Static assets served at root
│   ├── about.webp        # Sandy's portrait (199 KB)
│   ├── about_banner.webp # About-page banner (169 KB) — currently unused in JSX
│   ├── robots.txt
│   ├── sitemap.xml
│   └── favicons (ico, png, apple-touch, android-chrome)
├── src/
│   ├── main.jsx          # React entry, StrictMode
│   ├── index.css         # Global reset, typography, animation classes
│   ├── App.jsx           # BrowserRouter + all routes + persistent Header/Footer
│   ├── styles/
│   │   └── variables.css # CSS custom properties (colours, spacing, shadows, transitions)
│   ├── components/
│   │   ├── Header.jsx/css      # Fixed nav, scroll effect, mobile burger overlay
│   │   ├── Footer.jsx/css      # 4-col grid, social links, copyright
│   │   ├── SEO.jsx             # Dynamic meta/OG/Twitter/geo tag manager (no lib)
│   │   └── UploadSection.jsx   # Reusable multi-file upload form (used in Admin)
│   ├── pages/
│   │   ├── Home.jsx/css        # Hero carousel + "Sélection du moment" masonry grid
│   │   ├── Gallery.jsx/css     # Full portfolio, tag filters, lightbox
│   │   ├── About.jsx/css       # Bio, specialties, contact section
│   │   ├── Contact.jsx/css     # Phone-first contact cards
│   │   ├── Admin.jsx/css       # JWT-protected dashboard (upload, manage, toggle)
│   │   ├── RGPD.jsx/css        # Privacy policy + legal notices (French)
│   │   └── NotFound.jsx        # 404 fallback
│   ├── services/
│   │   └── api.js              # Axios instance with JWT interceptor + all API calls
│   └── utils/
│       └── contact.js          # Obfuscated email/phone helpers
```

### Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Home | Hero carousel + weekly picks |
| `/gallery` | Gallery | Full portfolio + tag filter + lightbox |
| `/about` | About | Bio, specialties |
| `/contact` | Contact | Phone-only contact |
| `/admin` | Admin | Protected by client-side JWT check only |
| `/rgpd` | RGPD | Privacy policy + `#mentions` anchor |
| `*` | NotFound | 404 |

### Design System

- **Primary:** `#1A1A1A` (dark), **Accent:** `#C9A86A` (gold), **Background:** `#FAFAFA`
- Fluid spacing with `clamp()` for all major sizes
- Animation: pure CSS keyframes + `IntersectionObserver` for scroll reveals (no Framer Motion / GSAP)
- Breakpoints: 768px (mobile), 1024px (tablet)

### API Layer (`src/services/api.js`)

Axios instance with `baseURL: /api`, intercepted to attach `Authorization: Bearer <token>` from `localStorage`.

Key endpoints used:
- `GET /photos` — all photos
- `GET /photos/week` — homepage featured
- `GET /photos/hero` — carousel
- `GET /photos/tag/:tag` — gallery filter
- `POST /photos/upload-multiple` — admin upload
- `PUT /photos/:id` / `DELETE /photos/:id` — admin edit/delete
- `POST /auth/login` / `GET /auth/verify` — JWT auth

---

## Environment Variables (`.env`)

```
VITE_SITE_URL=https://sandysartphotographies.com
VITE_CONTACT_EMAIL=sandysartphotographies@hotmail.com
VITE_CONTACT_PHONE=06 84 90 22 14
VITE_CONTACT_PHONE_TEL=+33684902214
VITE_CONTACT_ADDRESS=203 rue des vieilles vignes
```

The `.env.example` file tracks these keys without values.

---

## Known Flaws — Prioritised Fix List

### 🔴 Critical

#### ~~SEC-1 — Missing `og-image.jpg`~~ ✅ FIXED
Default OG image changed to `/about.webp` (which exists) in `SEO.jsx:14`. Static fallback added in `index.html`.
**Remaining:** Create a proper 1200×630 branded image at `public/og-image.jpg` and update references.

#### SEC-2 — JWT token stored in `localStorage`
`Admin.jsx` reads/writes the auth token directly to `localStorage`.
XSS attacks can steal the token and take over the admin.
**Fix:** Move to `httpOnly` cookie set by the backend (requires backend change).

#### ~~SEO-1 — SPA with no static meta tags in `index.html`~~ ✅ FIXED
Static meta, OG, Twitter tags and JSON-LD added to `index.html`.

#### ~~SEO-2 — No structured data (JSON-LD)~~ ✅ FIXED
`LocalBusiness` schema added to `index.html`.

---

### 🟠 High Priority

#### ~~UI-1 — No contact form (email)~~ ✅ FIXED
Contact form added to `Contact.jsx` with name, email, phone, session type, message fields.
Calls `POST /api/contact` via `api.js`. **Backend must implement `/api/contact` endpoint.**

#### ~~UI-2 — Typo: "moment s précieux"~~ ✅ FIXED
`Contact.jsx` hero subtitle corrected.

#### PERF-1 — No `width`/`height` on `<img>` tags
Gallery, Home carousel, Home masonry — none specify `width`/`height`.
This causes Cumulative Layout Shift (CLS), hurting Core Web Vitals.
**Fix:** Add `aspect-ratio` CSS to `.gallery-item-image img`, `.carousel-slide img`, `.masonry-item img`.

#### PERF-2 — No `srcset` / responsive images
All `<img>` tags serve a single full-resolution file regardless of screen size.
**Fix:** Requires backend to generate multiple sizes. Frontend-side: use `<picture>` + WebP for static images.

#### ~~PERF-3 — Hero carousel images lack `fetchpriority="high"`~~ ✅ FIXED
`Home.jsx` carousel first image now has `fetchpriority="high"`.

#### ~~SEO-3 — No canonical link tag~~ ✅ FIXED
`SEO.jsx` now injects `<link rel="canonical">` on every page.

#### SEO-4 — `sitemap.xml` incomplete
Already had all required fields — no change needed. Update `<lastmod>` dates after each content update.

#### ~~A11Y-1 — Carousel indicators are `<div>`, not `<button>`~~ ✅ FIXED
`Home.jsx` carousel dots now use `<button>` with `aria-label` and `aria-current`.

---

### 🟡 Medium Priority

#### UI-3 — No loading skeleton / placeholder
Pages show plain `.page-loading` text. Next improvement: CSS skeleton grid animation.

#### ~~UI-4 — `window.confirm()` for photo delete~~ ✅ FIXED
`Admin.jsx` now uses inline Yes/No confirmation buttons per photo card.

#### ~~UI-5 — `about_banner.webp` is unused~~ N/A
`About.css` already used `about_banner.webp` as hero background. Path corrected to `/about_banner.webp`.

#### ~~UI-6 — Duplicate contact info between About and Contact pages~~ ✅ FIXED
`About.jsx` contact section replaced with a "Me contacter" button linking to `/contact`.

#### PERF-4 — Google Fonts loaded from CDN
Privacy and performance concern for a French site. Preconnect hints added (`index.html`).
**Next step:** Self-host fonts with WOFF2 + `font-display: swap`.

#### PERF-5 — Large android-chrome-512x512.png
424 KB icon. **Fix:** Re-export compressed PNG (target < 50 KB).

#### ~~SEO-5 — RGPD page claims analytics cookies but none exist~~ ✅ FIXED
Analytics cookies section removed from `RGPD.jsx`.

#### ~~CODE-1 — Stale closure bug in Gallery lightbox keyboard handler~~ ✅ FIXED
`Gallery.jsx` keydown handler now uses inline functional updates with `photos.length` in deps array.

#### ~~CODE-2 — Inline styles mixed with CSS classes~~ ✅ FIXED
Loading/error inline styles moved to `.page-loading` / `.page-error-*` classes in `index.css`.

#### ~~CODE-3 — `UploadSection.jsx` uses 170+ lines of inline `style` objects~~ ✅ FIXED
Extracted to `src/components/UploadSection.css`.

---

### 🟢 Low Priority / Nice-to-Have

#### ~~A11Y-2 — No skip-to-content link~~ ✅ FIXED
`.skip-link` added in `App.jsx` before `<Header>`, styled in `index.css`.

#### ~~A11Y-3 — No visible focus ring~~ ✅ FIXED
`:focus-visible` styles added globally in `index.css`.

#### ~~A11Y-4 — Emoji used as content without `aria-hidden`~~ ✅ FIXED
All emoji in `About.jsx` and `Contact.jsx` now have `aria-hidden="true"`.

#### ~~SEO-6 — Missing `<html lang="fr">`~~ ✅ FIXED
`index.html` now has `<html lang="fr">`.

#### ~~UI-7 — No social link on Contact page~~ ✅ FIXED
Instagram and Facebook buttons added to `Contact.jsx`.

#### ~~UI-8 — Home CTA points to `/about` instead of `/contact`~~ ✅ FIXED
`Home.jsx` bottom CTA now links to `/contact`.

#### ~~PERF-6 — No `<link rel="preconnect">` for Google Fonts~~ ✅ FIXED
Preconnect links added to `index.html`.

#### ~~CODE-4 — `robots.txt` blocks `/uploads/`~~ ✅ FIXED
`Disallow: /uploads/` removed from `robots.txt`.

---

## Remaining Manual Work

Do these in priority order. Each section includes exact steps.

---

### 1. Backend contact form endpoint *(high impact — form silently fails without this)*

The Contact page form posts to `POST /api/contact`. This route does not yet exist in the backend.

**Install nodemailer in the backend:**
```bash
npm install nodemailer
```

**Create the route** (adapt path to your backend structure):
```js
// routes/contact.js
const nodemailer = require('nodemailer');

router.post('/contact', async (req, res) => {
  const { name, email, phone, sessionType, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.CONTACT_EMAIL,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: `Demande de séance – ${sessionType || 'Non précisé'} – ${name}`,
    text: `Nom : ${name}\nEmail : ${email}\nTéléphone : ${phone || '—'}\nType : ${sessionType || '—'}\n\n${message}`,
  });

  res.json({ ok: true });
});
```

**Add to backend `.env`:**
```
CONTACT_EMAIL=sandysartphotographies@hotmail.com
CONTACT_EMAIL_PASSWORD=your_hotmail_password
```

> If Hotmail has 2FA enabled, generate an app password in Microsoft account security settings.

---

### 2. Create the OG social-share image *(high impact — social shares show no preview)*

`SEO.jsx` and `index.html` currently fall back to `/about.webp`. A proper branded card is better.

1. Go to **canva.com** → Create design → Custom size → **1200 × 630 px**
2. Add a portfolio photo as background, darkened slightly
3. Overlay: `Sandy's Art Photographies` in Cormorant Garamond, gold `#C9A86A`, plus your tagline
4. Download → **JPG** → rename to `og-image.jpg`
5. Place at `frontend/public/og-image.jpg`
6. In `index.html` update the two static OG image lines:
   ```html
   <meta property="og:image" content="https://sandysartphotographies.com/og-image.jpg" />
   <meta name="twitter:image" content="https://sandysartphotographies.com/og-image.jpg" />
   ```
7. In `src/components/SEO.jsx` line 14 restore:
   ```js
   image = '/og-image.jpg',
   ```

---

### 3. Self-host Google Fonts *(GDPR compliance + faster FCP)*

Currently fonts load from `fonts.googleapis.com`, sending visitor IPs to Google. French law (RGPD) requires a legal basis for this transfer.

1. Go to **[gwfh.mranftl.com](https://gwfh.mranftl.com/fonts)**
2. Search **Cormorant Garamond** → select weights `300, 400, 500, 600, 700` → copy the CSS block → download ZIP
3. Search **Inter** → select weights `300, 400, 500, 600` → copy the CSS block → download ZIP
4. Create `frontend/public/fonts/` and extract only the `.woff2` files from both ZIPs into it
5. In `src/index.css` **replace** the `@import url('https://fonts.googleapis.com/...')` line with the `@font-face` blocks from the helper. Example structure:
   ```css
   @font-face {
     font-family: 'Cormorant Garamond';
     font-style: normal;
     font-weight: 300;
     font-display: swap;
     src: url('/fonts/cormorant-garamond-v22-latin-300.woff2') format('woff2');
   }
   /* repeat for each weight */

   @font-face {
     font-family: 'Inter';
     font-style: normal;
     font-weight: 400;
     font-display: swap;
     src: url('/fonts/inter-v13-latin-regular.woff2') format('woff2');
   }
   /* repeat for each weight */
   ```
6. Remove the two `<link rel="preconnect" href="https://fonts.googleapis.com">` lines from `index.html` — no longer needed

---

### 4. Compress large favicons *(5 min)*

- `public/android-chrome-512x512.png` — **424 KB**, should be under 50 KB
- `public/apple-touch-icon.png` — **62 KB**, target under 20 KB

1. Go to **[squoosh.app](https://squoosh.app)**
2. Drop in the file → set format to **OxiPNG** → reduce quality until under target size
3. Download and replace the file in `public/`

---

### 5. Move JWT auth to httpOnly cookie *(security — prevents XSS token theft)*

This requires coordinated backend + frontend changes.

**Backend:**

Install cookie-parser:
```bash
npm install cookie-parser
```

Wire it up in your Express app:
```js
app.use(require('cookie-parser')());
```

On `POST /auth/login`, set a cookie instead of returning the token in JSON:
```js
res.cookie('token', jwtToken, {
  httpOnly: true,    // JS cannot read it — blocks XSS theft
  secure: true,      // HTTPS only
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
res.json({ ok: true });
```

On all protected routes, read from `req.cookies.token` instead of `Authorization` header.

Add a logout route:
```js
router.post('/auth/logout', (req, res) => {
  res.clearCookie('token').json({ ok: true });
});
```

**Frontend (`src/services/api.js`):**

Remove the JWT interceptor and add `withCredentials`:
```js
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,  // sends cookie automatically
});
// delete the interceptors.request.use block entirely
```

**Frontend (`src/pages/Admin.jsx`):**

- Remove all `localStorage.getItem/setItem/removeItem('token')` calls
- On login success: just call `setIsAuthenticated(true)`
- On logout: call `await api.post('/auth/logout')` then `setIsAuthenticated(false)`
- The `uploadMultiplePhotos` XHR function at the top also reads `localStorage` — remove that line and add `withCredentials: true` to the XHR request instead:
  ```js
  xhr.withCredentials = true;
  // remove: xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  ```

---

### 6. Responsive images with srcset *(performance — mobile visitors download full-res photos)*

Requires backend changes first, then frontend.

**Backend — generate resized variants on upload:**
```bash
npm install sharp
```
```js
const sharp = require('sharp');
// after saving the original file:
await sharp(originalPath).resize(400).webp({ quality: 80 }).toFile(`${baseName}-400w.webp`);
await sharp(originalPath).resize(800).webp({ quality: 80 }).toFile(`${baseName}-800w.webp`);
await sharp(originalPath).resize(1600).webp({ quality: 80 }).toFile(`${baseName}-1600w.webp`);
// store the base filename (without extension) in the DB so frontend can reconstruct paths
```

**Frontend — update `<img>` tags in `Gallery.jsx` and `Home.jsx`:**
```jsx
<img
  src={`/uploads/${photo.filename}`}
  srcSet={`
    /uploads/${photo.basename}-400w.webp 400w,
    /uploads/${photo.basename}-800w.webp 800w,
    /uploads/${photo.basename}-1600w.webp 1600w
  `}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt={photo.title || photo.original_name}
  loading="lazy"
/>
```

---

## File Map for Quick Navigation

| Task | File | Key Lines |
|------|------|-----------|
| Add og-image | `public/og-image.jpg` | (create) |
| Fix OG fallback | `src/components/SEO.jsx` | 14 |
| Fix typo | `src/pages/Contact.jsx` | 18 |
| Add canonical tag | `src/components/SEO.jsx` | 67–93 |
| Add JSON-LD | `src/components/SEO.jsx` or `index.html` | — |
| Fix carousel a11y | `src/pages/Home.jsx` | 143–148 |
| Fix lightbox stale closure | `src/pages/Gallery.jsx` | 91–102 |
| Add fetchpriority | `src/pages/Home.jsx` | 122 |
| Add contact form | `src/pages/Contact.jsx` | new section |
| Fix inline styles | `src/components/UploadSection.jsx` | 220–397 |
| Self-host fonts | `src/index.css` | 1–10 |
| Fix sitemap | `public/sitemap.xml` | all `<url>` blocks |
| Fix html lang | `index.html` | `<html>` tag |
