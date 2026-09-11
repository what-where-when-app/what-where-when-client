# design-sync notes — what-where-when-client-org

## Repo shape

This repo is an Expo/React Native app, **not** a standalone design-system
package. `src/ui/` (React Native components) and `src/theme/` (colors,
typography, metrics constants) are being synced as the design system, even
though they're not built to a `dist/` and have no Storybook.

## The react-native → react-native-web bridge

The converter (`package-build.mjs`) has no built-in esbuild `alias` support
(checked `lib/bundle.mjs`'s `sharedBuildOptions` — no alias/mainFields hook,
and forking `lib/bundle.mjs` is explicitly off-limits per the skill). Since
`src/ui/*.tsx` imports raw `react-native` primitives (`View`, `Text`,
`Pressable`, `StyleSheet`, `Animated`, etc.), and the real `react-native`
package cannot bundle for a browser target (native bridge, `.ios.js`/
`.android.js` platform-extension resolution Metro-specific, not something
esbuild does), a resolution bridge was built instead of touching the
converter:

- `node_modules/whatwherewhen-ds/` is a **scratch package created for this
  sync only** — copies of `src/ui/*.tsx` (minus `Icon.tsx`/`NumberInput.tsx`,
  see below) and all of `src/theme/*.ts`, mirroring the real repo's
  `src/ui/` + `src/theme/` layout so relative imports (`../theme/colors`)
  and the `@/*` tsconfig alias both resolve identically to the original.
- `node_modules/whatwherewhen-ds/node_modules/react-native/index.js` is a
  one-line shim (`export * from 'react-native-web';`) that intercepts any
  `import ... from "react-native"` inside the scratch copy's files, via
  ordinary Node/esbuild `node_modules` directory-walk resolution — it's
  found BEFORE the real `react-native` in the repo's real `node_modules`
  because the scratch package's own `node_modules/react-native` is closer
  in the walk. **This never touches or shadows the real repo's
  `node_modules/react-native`** — the real app is unaffected.
- `cfg.pkg = "whatwherewhen-ds"`, `--node-modules` points at the repo's
  real `node_modules` (so `PKG_DIR` resolves to the scratch package above),
  no `--entry` is passed (triggers the converter's synth-entry-from-`src/`
  path, since there's no `dist/`).

**Re-sync risk**: this scratch package is NOT committed (lives under
`node_modules/`, which is gitignored) and must be recreated identically on
every fresh clone / re-sync — regenerate it from `src/ui` + `src/theme`
before re-running the converter. Consider scripting this recreation if
re-syncs become frequent.

**A second shim is needed for previews.** `.design-sync/previews/<Name>.tsx`
files (author-written, e.g. to wrap a component in a `View` for layout) also
need `react-native` → `react-native-web`, but they resolve `react-native`
from their OWN location (`.design-sync/previews/`), not from inside the
scratch package — the scratch package's shim isn't an ancestor of that path,
so it's invisible there and the preview build would otherwise hit the real
(unbundlable) `react-native`. A second, identical shim lives at
`.design-sync/node_modules/react-native/` (gitignored, same as the fork
symlink location documented in the base skill's Troubleshooting section —
regenerate on every fresh clone / re-sync, same content as the scratch
package's shim: `export * from 'react-native-web';`).

## Excluded: Icon, NumberInput

`Icon.tsx` wraps `@expo/vector-icons` (`Feather`/`Ionicons`). That package
imports the **real** `react-native` from ITS OWN location inside the repo's
real `node_modules/@expo/vector-icons/` — which is NOT inside the scratch
package's resolution path, so the shim above can't intercept it there.
Real `react-native`'s internals use Metro-specific platform-extension
resolution (`Platform.ios.js` etc.) that plain esbuild can't resolve, which
would very likely break the *entire* bundle (all components share one
entry), not just Icon. Rather than risk that, `Icon.tsx` and
`NumberInput.tsx` (the only component that renders `<Icon>` at runtime —
"plus"/"minus" glyphs on its increment/decrement buttons) were excluded
from the scratch copy via `cfg.componentSrcMap: {"Icon": null, "NumberInput": null}`
and are NOT in this sync.

**Follow-up for a future sync**: wire `@expo/vector-icons` properly — likely
means either (a) building a browser-safe icon shim backed by the same
Feather/Ionicons webfont `@expo/vector-icons` ships, loaded via
`cfg.extraFonts`/`runtimeFontPrefixes`, and pre-resolving its `react-native`
import the same way as above (would need the shim placed so it's reachable
from `node_modules/@expo/vector-icons`'s own resolution path — not
currently solved), or (b) swapping `Icon`'s implementation for a web-safe
icon library before syncing. 16 of 18 `src/ui` components are synced;
`Icon` and `NumberInput` are the gap.

## Fonts

Brand fonts (Inter Regular/Medium/SemiBold/Bold/ExtraBold) are real files at
`assets/fonts/*.ttf` in the app, loaded at runtime via `expo-font`'s
`useFonts` in `app/_layout.tsx` (though `app/_layout.tsx` itself only calls
`useFonts` with Regular/Medium/SemiBold — Bold/ExtraBold are loaded some
other way or just used by name without an explicit `useFonts` entry;
`src/theme/typography.ts`'s `heading.h1`-`h3` use `InterExtraBold` and `h4`
uses `InterBold`, so both are real design-system font weights regardless).
Wired via `cfg.extraFonts` → `.design-sync/fonts.css` (`@font-face` rules,
paths relative to that CSS file's own location: `../assets/fonts/...`).

**Caught during preview review, not build**: the first pass only wired
Regular/Medium/SemiBold (matching body/action/caption styles) and missed
Bold/ExtraBold (heading styles) — the build and validate both passed clean
either way (a missing `@font-face` degrades to a browser default font
silently, no error/warning), so this was only caught by actually looking at
the `Text` component's authored preview screenshot (headings rendered in a
serif fallback instead of Inter). This is exactly why the skill mandates a
text-heavy component in the solo preview-authoring pass.

## react-native-web stylesheet id vs `[id^=r]` selector — required local patch

`package-validate.mjs`'s render check finds each preview's mount root(s) via
`document.querySelectorAll('#root, [id^="r"]')`. `react-native-web` injects
a runtime stylesheet as `<style id="react-native-stylesheet">` into `<head>`
the first time any component using `StyleSheet.create` renders — and that id
also starts with `"r"`, matching the same selector. `<head>` sorts before
`<body>` in document order, so for any **multi-story (grid-mode) preview**
`roots[0]` picks this always-empty style tag instead of the real `r0` mount,
producing a false `[RENDER] root empty` on content that is actually
rendering correctly (verified directly via Playwright: `texts`/`pngBytes`/
`maxHeight` all showed real, correct content — only `rootEmpty` was wrong).
Single-story/floor-card renders happen not to trip this (a `ds-fallback`
sibling element in their template makes `portals.length > 0`, which
short-circuits `rootEmpty` to `false` before `roots[0]` is even consulted) —
so this only bites once previews have 2+ exports, i.e. every properly
authored component in a react-native-web-based sync.

**Fix applied**: `.ds-sync/package-validate.mjs` line ~526 changed
`document.querySelectorAll(...)` to `document.body.querySelectorAll(...)`
— scoping the mount-root query to `<body>`, where no legitimate mount root
is ever in `<head>`. This only removes the false match; it can't introduce
a false negative. Patch is marked inline with `[PATCH: what-where-when — …]`.

**Re-sync risk**: `.ds-sync/` is gitignored and gets re-copied fresh from
the skill's bundled scripts on every re-sync (per the base skill's "Re-syncs
are one command" step). **This patch must be re-applied to the freshly
copied `package-validate.mjs` every time** until/unless the upstream script
fixes the selector itself — search for `querySelectorAll('#root, [id^="r"]')`
in the newly staged copy and reapply the `document.body.` scoping shown
above.

## `.d.ts` extraction produces empty stubs in synth-entry mode — required `dtsPropsFor` for all 16

With no `dist/`/compiled `.d.ts` tree (this repo has neither), the converter's
`.d.ts` auto-extraction silently falls back to `export interface <Name>Props {
[key: string]: unknown; }` for every component — no error or warning printed
(not even `[DTS_PARSE]`), just a useless stub. Caught by reading the emitted
`Button.d.ts`/`Text.d.ts`/`Box.d.ts` directly while writing the conventions
header (the base skill's own validation step: "check named components... then
the bundle text"). **All 16 components need `cfg.dtsPropsFor` hand-written
props** since none has a real source `.d.ts` to extract from — this isn't a
per-component exception, it's the baseline for this repo's shape. Written from
the actual `src/ui/*.tsx` prop types read during preview authoring. If a
component's props change, `cfg.dtsPropsFor.<Name>` must be updated by hand to
match — there's no automatic re-extraction to fall back on.

## No provider needed

Components read `colors`/`typography`/`metrics` as static imported
constants, not via React context — no `cfg.provider` wrapper needed.

## Preview-authoring notes (from the fan-out waves)

All 16 components have authored previews, every cell graded `good`. Notes
for anyone touching these previews later:

- **NavBar needs a wide preview container, not the 320px row-width
  convention.** NavBar's own style fixes its `side` columns to `width: 120`
  each; at 320px the center title area is only ~80px wide and wraps
  two-word titles. Its preview uses `width: 560`. Any future "screen
  chrome" component (top bars, headers — as opposed to list rows) should
  probably do the same rather than default to the row convention.
- **Several components have deliberately low-contrast states that look
  like rendering bugs but aren't** — verified against source, not preview
  issues: `RadioButton` disabled+unselected (`neutralLight.dark` border
  further dimmed by `opacity: 0.45`, nearly invisible on white);
  `SwitchListItem`/`ListItem` row background (`neutralLight.light`
  `#F8F9FE`) is close to white; `TextField` disabled background is close
  to its default. `ListItem`'s `"empty"` variant intentionally has no
  background at all (`variantStyles.empty = {}`) — don't "fix" any of
  these by adding contrast that isn't in the real component.
- **`TimerBar`'s mount animation** (`Animated.timing`, 1000ms) did not
  cause mid-animation captures in practice — all 3 states (Healthy/
  Warning/Critical) captured with clearly distinct, settled colors/widths.
  Noting as timing-dependent, not guaranteed-safe, in case a future re-sync
  captures mid-transition.
- **Pattern for decorative controls with no label** (Checkbox, RadioButton):
  import an already-synced sibling component (`Text`) into the preview to
  give it realistic labeled context, since the component itself renders no
  text.
- **Pattern for excluded-Icon slots**: a plain `View` dot/shape placeholder
  in `leftIcon`/`rightIcon`-style props reads fine and doesn't need the
  real (excluded) `Icon` component — used in `Tag`, `CardRow`, `ListItem`
  previews.
- **`Box`'s `bg` prop is a union** (`"group.shade"` theme path | raw color
  string) — worth double-checking the emitted `.d.ts`/`.prompt.md` surfaces
  both forms, not just the enumerated theme paths, since a naive extractor
  might only pick up one branch of the union.

## Re-sync risks

- The scratch package (`node_modules/whatwherewhen-ds/`) and both
  `react-native` shims are gitignored and must be regenerated identically
  on every fresh clone / re-sync (see "The react-native → react-native-web
  bridge" and "A second shim is needed for previews" above) — there is no
  script that does this automatically yet; redo it by hand (copy `src/ui`
  minus `Icon.tsx`/`NumberInput.tsx` + `src/theme`, plus the two 2-file
  shims) before running the converter.
- The `package-validate.mjs` patch (`document.body.querySelectorAll`
  instead of `document.querySelectorAll` for the root-empty check) must be
  reapplied to the freshly-copied script on every re-sync until upstream
  fixes it — see "react-native-web stylesheet id vs `[id^=r]` selector"
  above.
- `Icon`/`NumberInput` are excluded from this sync entirely (not just
  un-authored) — see "Excluded: Icon, NumberInput" above. If a future
  re-sync wires up `@expo/vector-icons` properly, both need to be added
  back into the scratch package copy and removed from
  `cfg.componentSrcMap`.
- Preview content (props, realistic copy) was authored once against the
  current component source — if `src/ui/*.tsx` prop signatures change,
  the previews are NOT automatically re-validated against the new shape;
  a re-sync's render check will only catch outright breakage (compile
  errors, empty renders), not "this prop combination is no longer the
  realistic default."
