# Sentinel AIOps — Project Website

The public research website for **Sentinel AIOps**, built to mirror the structure of the reference
project site (nav → hero → scope → solution → milestones → documents → banner → presentations →
team → contact → footer) while carrying this repository's real content.

```
website/
├── index.html               # the whole site (single page, 8 sections + banner)
├── sre_research_poster.html # linked research poster (copied from Dashboard/)
├── sliit_logos_*.png        # poster + footer logos (copied from Dashboard/)
├── vercel.json              # caching + clean-URL config
└── assets/
    ├── css/styles.css       # design tokens + all component styles, light & dark
    ├── js/main.js           # theme, nav, scrollspy, reveal, live mock, forms
    └── img/                 # favicon + SLIIT logo
```

## Run it

No build step, no dependencies, no `npm install`.

```powershell
cd website
python -m http.server 4321
# → http://127.0.0.1:4321
```

## Deploy

Zero configuration on Vercel, Netlify or GitHub Pages — the folder root **is** the site root.

- **Vercel** — import the repo, set *Root Directory* to `website*. `vercel.json` is already there.
- **Netlify** — drag the `website` folder into the deploy dropzone.
- **GitHub Pages** — push `website/` and enable Pages on that folder.

## Sections (same order as the reference site)

| Section | Anchor | Content |
|---|---|---|
| Hero | `#home` | Title, lede, "Discover all components" CTA, system-overview diagram |
| Scope | `#scope` | Research Project Scope, Research Problem, Research Objectives, 4 component cards, 4 component detail blocks |
| Solution | `#solution` | Solution overview, live-mock demo frame, capability checklist, Tools and Technologies (core-functionality tiles + tech marquee) |
| Milestones | `#milestones` | 8-stage project timeline (awareness → proposal → progress → paper → thesis → viva) |
| Documents | `#documents` | Charter, Proposal, Checklist, Logbook, Research Paper, Thesis |
| Banner | — | "Sentinel AIOps: Proactive Failure Prediction…" + Read More |
| Presentations | `#presentations` | Proposal, Progress 1 & 2, Final, Poster (live link), Demo (live Azure link) |
| Team | `#about` | Supervisor, co-supervisor, 4 members |
| Contact | `#contact` | Contact details + First/Last/Email/Subject/Message form |
| Footer | — | Band, brand, Quick Links (Home, Scope, Milestone, Documents, Presentations, About), newsletter, socials |

Key project numbers (F1 0.951, FAR 1.74%, 86.5% anticipated, 3.67 min lead) are stated in the
component blocks and solution text rather than in separate tables, to match the reference layout.
Full per-project LOPO tables were in an earlier revision; the source CSVs are
`cpu_spike_predictor/outputs/lopo_results.csv` and `MUP/logs/lopo_results.csv`.

## ⚠️ Before publishing — three things to change

1. **Team names.** `index.html` → section `#about` still contains `Author Name` placeholders, because
   the poster in this repository only has `Author_1 … Author_4`. Replace the six `<h3>`/`.role`/`.focus`
   blocks (2 supervisors + 4 members) and delete the `.inst` note that says so.
2. **Contact form.** The form POSTs to `/api/contact`, a Vercel serverless function
   (`website/api/contact.js`) that delivers mail through Gmail SMTP (nodemailer).
   The message is sent **to the email address the visitor typed into the form**
   (a confirmation copy), sent from the site Gmail account, with Reply-To set to
   the site inbox so any reply lands with the team.
   To activate it after deploying on Vercel:
   1. `npm install` inside `website/` (installs `nodemailer` — already declared in `package.json`).
      Vercel does this automatically on deploy; you only need it for local testing.
   2. Project → Settings → Environment Variables, add:
      - `CONTACT_EMAIL_USER` = `chamilasewmini2@gmail.com`
      - `CONTACT_EMAIL_PASS` = the 16-letter Gmail **app password**
        (Google Account → Security → 2-Step Verification → App passwords)
   3. Redeploy. Test by submitting the form — a copy of the message lands in the
      visitor's inbox with subject `[Website] …`.
   Notes: the password lives ONLY in Vercel env settings, never in the repo.
   On a plain static preview (`python http.server`) `/api/contact` doesn't exist and the
   form shows a direct-email notice instead — that is expected.

## Test the contact form on your own machine

Everything the form needs already lives in `website/` (`api/`, `package.json`,
`.env.example`, `local-api.js`). To prove it end-to-end before deploying:

```powershell
cd website
npm install                  # once (installs nodemailer)
copy .env.example .env       # then put the real Gmail app password in .env
npm run local                # serves http://127.0.0.1:4321 + POST /api/contact
```

Open the page, submit the form, and a copy lands in the visitor's inbox.
**Delete `.env` afterwards** (or never upload it) — on Vercel the same values
come from Project → Settings → Environment Variables.

## Deploy checklist (Vercel) — read this if the form says "Failed to fetch"

`Failed to fetch` means the browser could not reach ANY backend — the page you are
looking at is being served statically, so `/api/contact` does not exist there.
The form can only send when **all** of these hold:

1. **Deployed on Vercel** (or another Node host that runs serverless functions).
   GitHub Pages / Netlify-drop / `python http.server` / double-clicking `index.html`
   can never send mail — they serve files only.
2. **Root Directory = `website`** (Vercel → Project → Settings → General → Root Directory).
   If the root is the repo top level, `/api/contact` 404s because the function lives
   under `website/api/`.
3. **Env vars set**: `CONTACT_EMAIL_USER` + `CONTACT_EMAIL_PASS`, then **Redeploy**
   (env changes need a new deployment to take effect).
4. **Gmail allows it**: 2-Step Verification ON, a valid 16-letter app password,
   no "suspicious sign-in blocked" alert in the Gmail inbox.

Diagnose with DevTools (F12 → Network → submit the form → click `contact`):
| Status | Meaning | Fix |
|---|---|---|
| request never appears / red | no backend at this URL | checklist items 1–2 |
| 400 | validation failed | fill every field with a valid email |
| 500 "not configured" | env vars missing | checklist item 3 |
| 502 | Gmail refused the password | checklist item 4 |
3. **Document / presentation links.** The Documents cards and three Presentation cards show
   "Link to be added" — replace with the team's Google Drive links. Poster and Demo already link to
   the real poster page and the live Azure app.
4. **Metric discrepancy.** The website presents the poster's published benchmark
   (F1 **0.951**, precision 0.956, recall 0.946, FAR 1.74%, 86.5% of events anticipated, μ = 3.67 min).
   Cross-check before you defend it:
   - CPU LOPO in `cpu_spike_predictor/outputs/lopo_results.csv` averages F1 **0.9513**, FAR **1.76%** — supported.
   - The **memory** model is F1 **0.883** (`MUP/models/model_metadata.json`), not 0.951. The 0.951 figure
     is the *combined CPU predictor* result.
   - `PRESENTATION_GUIDE.md` §7 warns to re-run validation before presenting the 37-event /
     86.49% / 3.67-minute numbers as final.

## Design tokens

Colours, fonts and radii are taken from the live SRE Command Center UI
(`Dashboard/dashboard-ui/src/index.css`) so the site and the dashboard read as one product.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#eef1f5` | `#0b0e13` |
| `--panel` | `#ffffff` | `#141922` |
| `--accent` | `#0f62c9` | `#5aa2f7` |
| `--critical` | `#e0393e` | `#ff5f63` |
| `--warning` | `#c77700` | `#f0a92e` |
| `--healthy` | `#17794b` | `#33b981` |

Type: **Inter** (UI) + **IBM Plex Mono** (numbers, code), both from Google Fonts.
Theme choice persists in `localStorage` and is applied before first paint to avoid a flash.

All text/background pairs were measured and clear **WCAG AA (4.5:1)** in both themes.

## Accessibility & behaviour notes

- Skip-to-content link, semantic landmarks, `aria-label`s on icon buttons, visible focus rings.
- `prefers-reduced-motion` disables reveal animations, the marquee and the pulsing dot.
- The nav collapses to a burger below **900px**.
- The "live" command-center frame in the Solution section is a **simulated** animation for illustration —
  it is not wired to `http://localhost:5173`. To show real numbers, point it at the gateway
  (`Dashboard/server.py` on port 8766) and replace `renderMock()` in `assets/js/main.js`.
- Decorative SVG architecture diagram carries a `role="img"` + `aria-label`; decorative icons are `aria-hidden`.
