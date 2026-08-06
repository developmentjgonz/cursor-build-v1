# PRD — cursor-build-v1

## Overview

**cursor-build-v1** is a Vite + React + TypeScript web app hosted on Vercel, used as the starting surface for iterative product builds in Cursor.

| | |
|---|---|
| **Status** | Scaffold live |
| **Repo** | https://github.com/developmentjgonz/cursor-build-v1 |
| **Production** | https://cursor-build-v1.vercel.app |
| **Stack** | React 19, TypeScript, Vite 5, Vercel |

## Problem

We need a public, auto-deploying app repo where product work can ship quickly from Cursor without setup friction (GitHub + Vercel already wired).

## Goals

1. Keep a production URL that updates on every push to `main`.
2. Provide a clean React/TS codebase agents and humans can extend.
3. Document product intent in-repo so builds stay aligned to this PRD.

## Non-goals (for now)

- Auth, payments, or multi-tenant backend
- Native mobile apps
- Design system / component library publication

## Users

| Persona | Need |
|---|---|
| Builder (you) | Fast iterate → push → see live |
| Cursor agent | Clear product constraints and file layout |
| Visitor | Load a working page at the production URL |

## Current product

- Default Vite React starter UI (logos, counter, HMR demo)
- Public GitHub repo with `main` as production branch
- Vercel project linked for automatic production + preview deploys

## Requirements

### Must have

- [x] Public GitHub repository
- [x] Vercel production deploy from `main`
- [x] TypeScript React app that builds successfully
- [ ] Product UI beyond the Vite template (define below)
- [ ] This PRD linked from the README

### Should have

- [ ] Clear information architecture for the first real screen(s)
- [ ] Basic accessibility (semantic HTML, keyboard use, contrast)
- [ ] Responsive layout for mobile and desktop

### Could have

- [ ] Analytics
- [ ] Preview deploy checks on PRs
- [ ] CI lint/typecheck on PRs

## Proposed direction (fill in)

> Replace this section when the product idea is locked.

- **One-liner:** _TBD_
- **Primary user action:** _TBD_
- **Success metric:** _TBD_

## Out of scope / open questions

1. What is the first shippable feature after the scaffold?
2. Do we need any env secrets or third-party APIs?
3. Branding: name, tone, visual direction?

## Milestones

| Milestone | Outcome |
|---|---|
| M0 — Scaffold | Repo + Vercel live (done) |
| M1 — PRD | In-repo PRD + README link |
| M2 — First feature | Replace starter UI with first real screen |
| M3 — Harden | A11y pass, polish, optional CI |

## References

- App entry: `src/App.tsx`
- Deploy target: Vercel project `cursor-build-v1`, production branch `main`
