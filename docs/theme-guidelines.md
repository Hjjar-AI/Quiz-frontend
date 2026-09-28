# Theme guidelines

The theme system is defined in `src/assets/tokens.css`. Components consume
semantic tokens; they do not branch on theme names or introduce palette hex
values locally.

## Palette rules

- Define the five semantic seeds: primary, success, danger, warning, and info.
  Their light, dark, glow, border, and selected variants are derived by the
  shared `:root[data-theme]` rule.
- Keep primary and warning visibly separated in hue and/or lightness. Warning
  must remain recognizable as a state, not as a second brand accent.
- Normal-size text must reach at least 4.5:1 against its surface. This applies
  both to semantic colors used as text on a card and to each solid semantic
  fill against its `--color-on-*` foreground. The Contrast theme targets 7:1.
- Semantic text on tinted surfaces uses `--color-*-soft-text`: the derived
  dark value in light themes and the brighter seed in dark themes.
- Form boundaries use `--color-border-strong` and must remain at least 3:1
  against the control background. Placeholder text must remain at least 4.5:1.
- A light theme's elevation shadows use a low-alpha tint of that palette's
  primary text color. Dark themes use neutral black shadows.
- Streak and rank colors are part of each palette. Do not let a new light
  theme silently inherit Stone's gamification colors.

Category colors are different: they are user-authored, persisted data and are
also used in exports. They stay stable across themes so category identity does
not change. Every category color marker must be adjacent to its category name
and have a theme-derived outline; color alone must not carry meaning.

Charts use `--color-chart-1` through `--color-chart-6`, not semantic status
colors. Series also use point shapes and dash patterns so color is never the
only distinction.

## Type and shape rules

- Letter spacing is zero by default. Latin tracking is enabled through the
  `[data-locale="en"]` token overrides in `src/assets/index.css`; never apply
  tracking directly to Arabic labels.
- Radius roles are consistent: `sm` for compact controls, `md` for inputs and
  containers, `lg`/`xl` for cards and panels, `pill` for buttons/badges/chips,
  and `circle` for avatars and circular icons.
- Avatar containers use the `--avatar-size-*` scale. Dense user lists may use
  the deterministic `avatarToneClass()` helper; state such as inactive status
  still overrides the decorative tone.
- Border widths use `--border-width` and `--border-width-strong`, including
  transparent and dashed borders.

## Adding a theme

1. Add a complete palette block in `tokens.css`; only Onyx may share Dark's
   semantic block because it is deliberately a surface-only variant.
2. Add the canonical name to `THEMES` and the appropriate entry in
   `THEME_GROUPS` in `src/utils/constants.js`, then update the pre-paint
   allowlist and body-color map in `index.html`.
3. Add its selector icon and locale label used by the theme menu and
   accessibility announcement.
4. Add it to `DARK_THEMES` if it uses dark native controls.
5. Add the matching PDF palette to
   `backend/apps/questions/services/exporting/pdf_export.py`. If a palette is
   retired, add an alias in both front-end and PDF registries so saved
   preferences and old requests continue to work.
6. Run `tests/unit/themeTokens.test.js`; it checks text and placeholder
   contrast, control boundaries, semantic fills/tints, and chart separation.
7. Confirm the grouped theme menu, Auto light/dark resolution, browser chrome,
   charts, native date inputs, focus rings, print view, streaks, ranks, and
   avatar tones.

Use the repeatable [visual QA checklist](./visual-qa-checklist.md) for every
theme and density before release.

Print semantics use the fixed `--color-print-*` tokens. Screen themes must not
override them; this keeps print readable without a duplicated palette snapshot.
