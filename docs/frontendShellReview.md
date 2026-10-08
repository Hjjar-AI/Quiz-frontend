# Frontend shell, layout and token review — 2026-10-08

## Additional visual follow-up — addressed (2026-10-08)

- Medium: selected theme/language rows lose their tinted background. `navigation.css:481` and `:603` use one-class active selectors; the later `buttons.css:27` ghost background has equal specificity and wins. The row components render both class sets. Use the shared active-button API or scoped active selectors with explicit precedence. Production CSS in jsdom confirmed both selected backgrounds resolve to transparent.
- Medium: native `select.form-control` arrows are reversed. `forms.css:43` puts the arrow on the left in LTR, while `:48` puts it on the right in RTL, although padding is reserved at inline-end. BasePagination's per-page select uses these styles. Arrow placement should follow the padded inline-end side. Production CSS/jsdom confirmed the two physical positions.
- Medium: pagination buttons retain the 36px compact minimum on coarse pointers. `pagination.css:2` has no equivalent to the BaseButton coarse-pointer rule, so previous/next/jump controls are inconsistent with the 44px shared touch policy. Native pagination buttons do not carry BaseButton classes. Add an appropriate shared coarse-pointer rule.
- Print behavior clarification: the user confirmed that theme-aware print colors are intentional. The review identified accidental specificity dependencies, not a reason to replace the selected theme with a fixed palette. Preserve theme hues while making their paper derivations explicit and readable.

These are additional findings, separate from the eight corrected below. No application code changed during this follow-up. Narrow navbar fit, long dialog title/footer wrapping and mobile safe-area/keyboard clearance remain browser-verification risks rather than confirmed measurements. No builds, test suites or dependency/version changes were performed.

### Corrections and print enhancement

- Scoped selected theme/language row selectors now outrank ghost button backgrounds. Native select arrows follow inline-end (right in LTR, left in RTL), matching reserved padding. Pagination buttons gain 44px block/inline minimums on coarse pointers; the per-page select widens to 5rem for its value and arrow.
- Theme definitions keep original semantic seeds in `--color-palette-*` and alias screen colors to those seeds. All 55 semantic seed values across 11 themes remain identical to the previous screen palettes. Print preserves these hues, retaining light-theme seeds and deepening bright dark-theme seeds at 45% against black. Neutral paper surfaces/foregrounds and derivation inputs are explicit at shared themed-root specificity, eliminating accidental precedence and variable cycles.
- Print scroll containers expand fully, sticky cells become static, mobile card tables return to tables with repeated headers, all priority columns display, and long cell values can wrap. Paper borders use a stronger neutral weight. Existing RTL direction and printer color-adjust settings are retained.
- All 55 computed printed accent/white contrast ratios exceed 4.5:1 (minimum 5.54:1); this is a source-color calculation, not a printer/PDF measurement. Production CSS/jsdom verified both select directions; source checks verified selected-row precedence, touch sizing, print containers and token references. Whitespace checks passed. No builds, test suites, installs, configured versions, backend or Android edits were made.
- Actual print pagination/background retention and browser/device rendering remain pending verification.

Reviewed App/Layout/PageShell, navbar and mobile navigation, theme/locale/density wiring, shared controls/popovers/modals, table containers, CSS import ordering and feature layout consumers. The findings below describe the review-time source; all eight have now been corrected.

## Findings from the review

1. **High — Analytics disappears from mobile shell navigation.** `Navbar.vue:112–122` classifies analytics as a core link and excludes it from More. `navigation.css:348` hides all core links at widths up to 768px. `navigationLinks.js:17` does not include analytics in the bottom bar. Keep mobile secondary destinations in More unless they actually appear in the bottom bar.

2. **Medium — Desktop hamburger is visible because primitive CSS overrides shell CSS.** `navigation.css:78` sets `.navbar__toggle { display: none }`, but `index.css:63` imports buttons later, and `buttons.css:5` sets `.base-button { display: inline-flex }` with equal specificity. BaseIconButton renders BaseButton, so both classes apply. The desktop toggle occupies width and operates a state that only changes mobile panel visibility. Use explicit shell selectors or deliberate cascade layers rather than relying on import order.

3. **Medium — Navbar height token does not match actual control geometry.** `tokens.css:282` defines 48px, while `navigation.css:26` adds 0.35rem top/bottom padding and a border around controls with a 44px minimum. At the 18px root size the minimum required outer height is 58.6px; a min-height of 48px cannot cap it. Anchor and viewport-sticky offsets using that token can sit underneath the navbar. Derive offsets from actual shell height or define geometry that really matches the token, including touch targets and density.

4. **Medium — Offline banner and navbar compete for the same sticky position.** `alerts.css:61–63` and `navigation.css:14–16` both use sticky top zero and the same z-index. App renders the offline banner before the routed Layout/navbar, so their sticky positions overlap after scrolling and the later navbar can cover the warning. Share a stacked shell offset or combine these surfaces into one sticky region.

5. **Medium — Default table containers inherit a viewport offset for container-sticky headers.** `tables.css:42–47` makes all `.table-shared` headers sticky at the navbar height. `tables.css:72` makes BaseTableShell a scroll container; only the optional sticky modifier resets header top to zero. Analytics report tables use BaseTableShell without that modifier. Their headers retain a 48px offset inside their own container rather than the viewport. Keep container headers at zero when opted into sticky behavior; ordinary tables should not inherit unrelated viewport sticky behavior.

6. **Medium — Modal focus handling includes hidden controls.** `BaseModal.vue:151–158` filters only the element's own aria-hidden attribute. Controls under a display-none/hidden/inert ancestor remain candidates; initial focus also selects inputs without visibility checks. Wrapping focus can target an invisible control and fail to contain keyboard navigation. Use visible, enabled, reachable candidates and trap only the topmost modal; handle focus on the modal container and empty candidate lists explicitly. This is a reusable primitive defect reproduced with a synthetic hidden subtree, not a demonstrated failure in every current dialog.

7. **Low — Knowledge-card font token is undefined.** `knowledge-map.css:19` consumes `--font-size-md` with no fallback, but the token scale declares base/sm/lg rather than md. The declaration becomes invalid, and the heading inherits an unintended size. Consume an existing font token.

8. **Low — Spacing scale is reversed at its smallest tiers.** `tokens.css:149–150` defines xs as 0.25rem and 2xs as 0.375rem. Components requesting the smaller tier receive the larger spacing, including navbar gaps and metadata. Normalize the intended scale and check consumers before changing it globally.

## Verification and limits

- Scanned 57 non-test-named production CSS files and 187 declared custom properties; found one undefined no-fallback token after excluding comments. Local import targets resolved.
- Standalone production metadata/CSS checks confirmed missing Analytics mobile coverage, the desktop toggle's inline-flex display, default table header sticky offset, and hidden modal controls remaining focus candidates. Used jsdom and actual production functions/declarations; jsdom does not establish browser layout, accessibility-tree behavior, or touch-device behavior.
- Source-reviewed responsive table labels, shared content-width tiers, coarse-pointer controls, Arabic/English direction, theme seeds/derived tokens, density overrides, scroll lock and reduced-motion rules. Responsive card tables supply data-label values; broad reduced-motion rules are present.
- Dialog title/footer wrapping, safe-area/virtual-keyboard clearance, dropdown collision at narrow widths, long mixed-script content, and navbar fit near 768px need browser measurements. These are remaining verification areas, not additional confirmed rendering defects.
- No builds, compilation tasks, test suites, dependency installation, versions, backend code or Android code were changed. No complete application browser rendering, theme contrast measurement, print rendering, or real-device verification was performed.

## Corrections — 2026-10-08

- Mobile navigation hides only core destinations actually present in the bottom bar. Analytics remains a direct item in the hamburger menu. Existing capability filters and desktop placement remain in use.
- Desktop/mobile hamburger selectors include the navbar scope, giving them precedence over the later BaseButton display rule.
- `useElementHeightToken` observes navbar and offline-banner heights, responds to viewport changes, and removes measurements on disappearance/unmount. Navbar minimum geometry has its own token to permit shrinking; the measured navbar height plus banner height supplies runner/anchor offsets. The navbar parks below the offline banner.
- Ordinary shared table headers no longer inherit viewport-sticky behavior. Explicit sticky BaseTableShell headers continue to stick at zero inside their scrolling container.
- Modal candidates exclude hidden, inert, disconnected, disabled and untabbable controls. Explicit initial targets are checked before use, with safe fallbacks. Tab handling includes container focus/empty lists; outside focus is contained. Only the topmost dialog handles focus and keyboard wrapping; covered dialogs become inert/aria-hidden and focus returns after close. Initial focus waits for the DOM and checks that the dialog is still open/topmost.
- Knowledge headings consume `--font-size-base`. `--space-2xs` is now 0.125rem, below the unchanged 0.25rem xs tier. Consumers keep control/touch minimum heights independently of spacing.

### Verification of corrections

- Forty isolated assertions passed for navigation membership/selectors, sticky-container and token contracts, measured-height growth/shrink/removal/reappearance/cleanup, hidden/disabled/inert focus candidates, explicit target rejection, empty focus lists, forward/backward wrapping, outside containment, nested modal ownership/inertness and focus restoration.
- Executed actual height/focus/modal-stack logic with Vue lifecycle hooks and jsdom. Modal setup code was source-extracted and rendered with a small native-element harness; supplied rectangles replace jsdom's absent layout engine. These checks establish state/DOM behavior under the harness, not actual browser rendering or touch-device behavior.
- Vue SFC structure and JavaScript syntax parsing passed for changed scripts/components. JavaScript lint passed for the three shared helper/composable modules. Normal Vue lint remains blocked by the installed parser's `Invalid Version: main` error; no dependency/version files were altered to bypass it.
- All 57 non-test-named CSS files now have no undefined no-fallback token references. Diff whitespace checks passed.
- Full browser/real-device layout, breakpoint/locale/density/contrast/print checks remain pending. No builds, compilation tasks, test-suite files, installations, versions, backend or Android changes were made.
