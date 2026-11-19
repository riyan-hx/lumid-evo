# Evo — web app

Emotional-support wellness web app (responsive desktop, tablet, mobile web, installable PWA).
The native mobile app is phase 2.

**Source of truth**
- Designs: Figma `Lumid-Evo-UI` → page "Evo v5 — Complete flows"
- Build spec: Figma → page "Dev Docs — Web App v1 (handoff)" (boards 00–21)

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · motion · Hugeicons.
Read `node_modules/next/dist/docs/` before writing Next.js code (see AGENTS.md).

Fonts: Helvetica Now Display is licensed — drop the files into `public/fonts/` (git-ignored).

## Build steps (one commit or PR each)
1. **Scaffold** — project, tokens, lint, typecheck
2. **Design-system primitives** — Button, Chip, Card, IconTile, EvoOrb, Icon, Toggle, IntensitySlider (Dev Docs 04)
3. **App shell** — SideNav / icon rail / BottomNav, right context panel, crisis link, route groups (Dev Docs 02–03)
4. **Global states** — loading, empty, error, offline banner, toasts (Dev Docs 05)
5. **Onboarding** — 1.1–1.9: welcome, sign-in, verify, age, guardian, weighing, privacy, personalise, first day
6. **Home + classic check-in** — 2.1–2.8
7. **Check-in system v2** — C1–C13
8. **Chat system** — X1–X14 + 3.x modes (UI with mocked streaming first)
9. **Thought record + tools** — 4.x, 5.x
10. **Calm (offline)** — 6.x + service worker
11. **Small steps** — 7.x
12. **Safety** — 8.x (clinician sign-off before release)
13. **You & settings** — 9.x
14. **Discover** — O1–O11
15. **Backend** — API route handlers, auth (OTP), data, AI pipeline + safety gate (Dev Docs 06–07)
16. **Quality** — analytics, a11y, i18n (EN/ML), Playwright (Dev Docs 08)

## Scripts
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck`
