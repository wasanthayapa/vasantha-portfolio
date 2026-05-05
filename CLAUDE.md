# CLAUDE.md

## Project Overview

Personal portfolio site for Vasantha Bandara Yapa — a Senior Java Full-Stack / Cloud-Native architect. It is a single-page Next.js application with a dark glassmorphism design.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Fonts | Geist / Geist Mono via `next/font/google` |
| Compiler | React Compiler (`babel-plugin-react-compiler`) |
| Linting | ESLint 10 with `eslint-config-next` (core-web-vitals + typescript) |

## Repository Structure

```
vasantha-portfolio/
├── src/
│   ├── app/
│   │   ├── page.tsx        # Single-page app — all sections live here
│   │   ├── layout.tsx      # Root layout: fonts, <html>, metadata
│   │   └── globals.css     # Tailwind import + CSS theme variables
│   └── lib/
│       └── data.ts         # All editable content: caseStudies, competencies
├── public/
│   └── resume.pdf          # PDF served at /resume.pdf (replace to update)
├── next.config.ts          # React Compiler enabled
├── tsconfig.json           # Path alias: @/* → ./src/*
├── eslint.config.mjs
└── postcss.config.mjs
```

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # Run ESLint
```

## Architecture

### Single Page Layout (`src/app/page.tsx`)

All sections are rendered in one file in this order:

1. **Top Nav** — anchor links to `#focus`, `#case-studies`, `#competencies`, `#contact`
2. **Hero** — name, role pills, description, CTA buttons (resume PDF, LinkedIn, contact anchor)
3. **Architecture Focus** — 6 hardcoded cards defined inline in `page.tsx`
4. **Case Studies** — rendered from `caseStudies` in `src/lib/data.ts`
5. **Core Competencies** — rendered from `competencies` in `src/lib/data.ts`
6. **Contact** — email, phone, LinkedIn links hardcoded in `page.tsx`

### Data Layer (`src/lib/data.ts`)

The two exported arrays are the primary content surface to edit:

- **`caseStudies`** — array of `{ title, tags, problem, approach, outcome }` objects
- **`competencies`** — array of `{ title, items[] }` group objects

For case studies and competency groups, edit `src/lib/data.ts`. For personal details (name, contact info, hero text, CTA links), edit `src/app/page.tsx` directly.

### Inline Components

Two small components are defined at the top of `page.tsx` (not extracted to separate files):

- `Pill` — small badge with frosted-glass border, used for role tags and case study tags
- `SectionTitle` — `<h2>` with optional subtitle paragraph

### Design System

- **Background**: `bg-gradient-to-b from-[#070b14] to-[#0b1220]` on `<main>`
- **Cards**: `rounded-2xl border border-white/10 bg-white/5 p-6` (or `rounded-3xl` for hero/contact)
- **Body text**: `text-white/70` for secondary, `text-white` for primary
- **Labels/pills**: `text-xs text-white/80` with `border-white/10 bg-white/5`
- **Accent**: `bg-[#6ea8fe]/20` on the primary CTA button
- **Fonts**: `font-geist-sans` (body) / `font-geist-mono` (code); applied via CSS variables in `layout.tsx`

## Key Conventions

- **No separate component files** — `Pill` and `SectionTitle` stay inline in `page.tsx`. Extract to `src/components/` only if they are used across multiple pages.
- **Content vs. layout** — content that is likely to change goes in `src/lib/data.ts`; structural/layout code stays in `page.tsx`.
- **Path alias** — always use `@/` for imports from `src/` (e.g., `import { caseStudies } from "@/lib/data"`).
- **TypeScript strict** — `strict: true` is enabled. No `any` types; no type assertions unless unavoidable.
- **Tailwind inline** — use Tailwind utility classes directly on elements; no separate CSS files for component styles.
- **No comments on obvious code** — only add a comment when the reason is non-obvious.
- **React Compiler is active** — do not add manual `useMemo`/`useCallback` unless profiling shows a real need; the compiler handles memoization.

## Updating Content

### Add/edit a case study
Edit `src/lib/data.ts` — append or modify an entry in the `caseStudies` array:
```ts
{
  title: "...",
  tags: ["Tag1", "Tag2"],
  problem: "...",
  approach: "...",
  outcome: "...",
}
```

### Add/edit a competency group
Edit `src/lib/data.ts` — append or modify an entry in the `competencies` array:
```ts
{
  title: "Group Name",
  items: ["Item one", "Item two"],
}
```

### Update personal details
Edit `src/app/page.tsx`:
- Hero text, role pills, and CTA button links are inline JSX near the top of `Home()`
- Contact cards (email, phone, LinkedIn) are in the `#contact` section near the bottom

### Replace the resume
Drop a new file at `public/resume.pdf`. The `href="/resume.pdf"` link in `page.tsx` already points there.

### Update page metadata
Edit `src/app/layout.tsx` — the `metadata` export sets `<title>` and `<meta name="description">`.

## Deployment

The project is Vercel-ready. `npm run build` produces an optimized static + SSR output in `.next/`. No environment variables are required for the base portfolio.
