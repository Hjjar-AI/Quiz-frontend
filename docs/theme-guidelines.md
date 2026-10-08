# Theme guidelines

Theme definitions: `src/assets/tokens.css`; components consume semantic tokens, never theme-name branches/local hex palettes.

## Palette rules

- Define the five semantic seeds: primary, success, danger, warning, and info. Their light, dark, glow, border, and selected variants are derived by the shared `:root[data-theme]` rule.
- Keep primary and warning visibly separated in hue and/or lightness. Warning must stay recognizable as a state, not as a second brand accent.
- Normal-size text must reach at least 4.5:1 against its surface. This applies both to semantic colors used as text on a card and to each solid semantic fill against its `--color-on-*` foreground. The Contrast theme targets 7:1.
- Semantic text on tinted surfaces uses `--color-*-soft-text`: the derived dark value in light themes and the brighter seed in dark themes.
- Form boundaries use `--color-border-strong` and must stay at least 3:1 against the control background. Placeholder text must stay at least 4.5:1.
- A light theme's elevation shadows use a low-alpha tint of that palette's primary text color. Dark themes use neutral black shadows.
- Streak and rank colors are part of each palette. Do not let a new light theme silently inherit Stone's gamification colors.

Category colors are persisted user data shared with exports; keep theme-stable identity. Pair markers with category names/theme outlines; never color alone.

Charts: `--color-chart-1` through `--color-chart-6`, not status colors; use point shapes/dashes beyond color.

## Type and shape rules

- Text font choice is browser-local (`pref_font`), handled by `useFont` and the `data-font` root attribute. Preserve the shared body/heading tokens. Register only active project-font styles from Google Fonts; no text-font preload, eager FontFace loading or local-server fallback. Device mode registers no text-font styles. Arabic glyphs missing from Latin fonts use installed device fallbacks.

- Letter spacing is zero by default. Latin tracking is enabled through the `[data-locale="en"]` token overrides in `src/assets/index.css`; never apply tracking directly to Arabic labels.
- Radius roles are consistent: `sm` for compact controls, `md` for inputs and containers, `lg`/`xl` for cards and panels, `pill` for buttons/badges/chips, and `circle` for avatars and circular icons.
- Avatar containers use the `--avatar-size-*` scale. Dense user lists may use the deterministic `avatarToneClass()` helper; state such as inactive status still overrides the decorative tone.
- Border widths use `--border-width` and `--border-width-strong`, including transparent and dashed borders.

## Adding a theme

1. Add a complete palette block in `tokens.css`; only Onyx may share Dark's semantic block because it is deliberately a surface-only variant.
2. Add the canonical name to `THEMES` and the appropriate entry in `THEME_GROUPS` in `src/utils/constants.js`, then update the pre-paint allowlist and body-color map in `index.html`.
3. Add its selector icon and locale label used by the theme menu and accessibility announcement.
4. Add it to `DARK_THEMES` if it uses dark native controls.
5. Add the matching PDF palette to `backend/apps/questions/services/exporting/pdf_export.py`. If a palette is retired, add an alias in both front-end and PDF registries so saved preferences and old requests keep working.
6. With explicit test-work authorization, run `tests/unit/themeTokens.test.js`; it checks text and placeholder contrast, control boundaries, semantic fills/tints, and chart separation.
7. Confirm the grouped theme menu, Auto light/dark resolution, browser chrome, charts, native date inputs, focus rings, print view, streaks, ranks, and avatar tones.

Use the repeatable [visual QA checklist](./visual-qa-checklist.md) for every theme and density before release.

Print intentionally preserves the selected theme's semantic hues on a white canvas. `--color-palette-*` stores each theme's original seeds independently of screen/print derivations, avoiding duplicated palettes and variable cycles. Light-theme accents retain their seeds; dark-theme accents use `--print-accent-weight` to deepen them for paper. Print resets neutral surfaces, foregrounds and derivation inputs at themed-root specificity. Check accent/white contrast, table pagination and actual browser print output; `--color-print-*` remains the default Stone seed source.
