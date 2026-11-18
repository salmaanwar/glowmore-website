# Glowmore website (desktop)

A live, clickable version of the Glowmore storefront at 1440 px: every Desktop screen designed in the **Glowmore Website** Figma file, built on the **GM Design System** tokens.

## Flows

| Flow | Routes |
|---|---|
| Home + mega menus | `/` (hover a top category for its mega menu) |
| Browse | `/skincare`, `/serums`, `/serums/no-results` |
| Product | `/product`, `/product/shades`, `/product/sold-out`, `/product/reviews` |
| Bag | `/bag/added` (mini bag), `/bag`, `/bag/empty`, `/bag/sticker`, `/bag/gift-wrap` |
| Checkout | `/checkout`, `/checkout/payment`, `/checkout/payment-failed`, `/order/confirmed` |
| Track my order | `/track`, `/track/on-the-way`, `/track/delivered` |
| Sign in + account | `/sign-in`, `/sign-in/code`, `/account/orders`, `/account/profile` |

Routes use the hash (`#/bag`) so deep links work on GitHub Pages.

## How it works

- `src/screens/*.json`: one spec per Figma screen (layout, auto layout, variables, text styles, content), exported from Figma with `data/source/figma_scripts/export_render.js` in the design repo.
- `src/render/Renderer.tsx`: turns a spec into HTML. Auto layout becomes flexbox, Figma variables become CSS custom properties, text styles become `.ts-*` classes, vector art comes from `public/gfx`, photos from `public/img`.
- `scripts/build-tokens.mjs`: generates `src/styles/tokens.css` from `design/tokens.json` (GM Design System variables) and `design/styles.json` (text and shadow styles). Names match Figma (`--color-bg-brand`, `--space-16`, `.ts-display-2xl-semi-bold`).
- `src/behaviors.ts`: what each element does (links, add to bag, checkout steps, sign in, overlays), matched by DS component and label, so the screens stay exactly as designed.
- No backend: prices, products and orders are the designed content.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
```

After changing screens in Figma: export again into `_figma/` (not committed), then `npm run sync-figma`.

## Fonts

Gilroy (body) and Safira March (display) are in `public/fonts`. Check that their licences allow web use before making this repo or the site public for customers.
