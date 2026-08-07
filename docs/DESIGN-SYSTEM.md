# Dilo design system

Stack: **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config.js`), **Radix UI**
primitives, **Motion** (`motion/react`), **lucide-react** icons, **cva** for variants.

## Hard rules

1. **No `.css` files.** No `styled-jsx`, no inline `style` objects except for
   dynamic numeric values (sizes, transforms, chart geometry).
2. **No arbitrary hex colors.** Use theme tokens only: `bg-midnight-800`,
   `text-mint`, `border-violet-neon/40`. If you need a color that does not
   exist, use the closest token rather than inventing one.
3. Compose classes with `cn()` from `src/lib/cn.ts`.
4. Reuse `Button`, `Panel`, `InfoCard`, `Screen`/`ScreenTop`/`ScreenBody`/`ScreenFooter`
   from `src/components/ui/`. Do not re-implement them.
5. Icons come from `lucide-react`. Never use emoji or unicode glyphs as icons.
6. Every animation must degrade: add `motion-reduce:animate-none` to CSS
   animations. Motion respects reduced motion automatically via `useReducedMotion`
   where it matters.
7. Touch targets are at least 44px tall. Use `min-h-11` or the `Button` sizes.
8. Currency and price strings come from `src/lib/format.ts`. Never hand-roll
   `toFixed`.

## Tokens

Surfaces, dark to light: `midnight-950` (page), `midnight-900` (screen),
`midnight-850` (raised panel), `midnight-800` (panel), `midnight-700` (border /
chip), `midnight-600` (border), `midnight-500`/`400` (disabled, inactive icons),
`midnight-300`/`200` (secondary text), `midnight-50` (primary text).

Semantic text: `text-ink` (primary), `text-muted` (secondary), `text-faint`
(tertiary), `text-on-brand` (dark ink for use on gradient fills).

Brand neons: `mint`, `aqua`, `violet-neon`, `magenta-neon`.
Status: `up` (green), `down` (red), `warn` (amber).

Radii: `rounded-xs|sm|md|lg|xl|2xl` (8 / 10 / 14 / 18 / 24 / 30px).
Shadows: `shadow-glow-mint`, `shadow-glow-violet`, `shadow-cta`, `shadow-panel`,
`shadow-raised`, `shadow-device`.

## Custom utilities

- `bg-brand` — the neon gradient as a background fill. Pair with `text-on-brand`.
- `text-brand` — gradient clipped to text. **Only** for the wordmark and hero
  numerals, never body copy.
- `border-brand` — 1px gradient border over a `midnight-800` fill.
- `scrollbar-none`, `pt-safe`, `pb-safe` (safe-area aware padding).

Named animations: `animate-float`, `animate-bob`, `animate-blink`,
`animate-wave`, `animate-shimmer`, `animate-typing`.

## Layout

Every full-screen view uses the `Screen` shell, which is a phone-width column
(`max-w-[440px]`) that becomes a floating device frame on `sm:` and up. Inside
it: `ScreenTop` (fixed header), `ScreenBody` (the only scroll container), and
`ScreenFooter` (pinned actions). Horizontal padding is `px-5`; never add your
own outer padding on top of these slots.

## Type scale

- Hero balance / headline numerals: `text-5xl font-extrabold tracking-[-0.04em]`
- Screen title: `text-[1.75rem] font-extrabold tracking-[-0.035em] leading-tight`
- Section label: `text-xs font-bold uppercase tracking-[0.12em] text-faint`
- Body: `text-[0.9375rem] leading-relaxed text-muted`
- Meta / caption: `text-[0.8125rem] text-faint`

Use `tabular-nums` on any number that updates or sits in a column.

## Motion vocabulary

- Screen enter/exit: handled by `Screen`. Do not re-wrap in another motion div.
- List and card entrances: stagger children by 40ms, `y: 10 -> 0`, spring
  `{ stiffness: 320, damping: 34 }`.
- Press feedback: `whileTap={{ scale: 0.97 }}` (already in `Button`).
- Shared-element highlights: `layoutId` with the same spring.
- Keep total entrance under 400ms. No looping decorative motion outside the
  mascot.
