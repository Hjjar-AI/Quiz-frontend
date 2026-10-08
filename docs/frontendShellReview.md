# Frontend shell, layout and token review — 2026-10-08

Reviewed App/Layout/PageShell, navbar and mobile navigation, theme/locale/density wiring, shared controls/popovers/modals, table containers, CSS import ordering and feature layout consumers. Findings below concern current source. Application code is unchanged.

## Findings

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
