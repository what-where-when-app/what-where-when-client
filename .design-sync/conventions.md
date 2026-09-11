## Using this library

No provider or root wrapper is needed — every component reads its styling from
static values baked in at build time, not from React context. Just import and
use components directly, e.g. `import { Button, Text, Card } from "..."`.

**This library has no separate icon component.** `leftIcon`/`rightIcon`/`left`/
`right`-style props on `Tag`, `CardRow`, `ListItem`, `NavBar`, etc. take a plain
`ReactNode` — compose your own icon/graphic (an SVG, an emoji, a small colored
shape) into those slots; don't assume an `Icon` export exists.

## Styling idiom: props, not CSS classes

There is no `className`/CSS-class API anywhere in this library. Every visual
variation is a typed prop. The two vocabularies that carry the design language:

**`Text` — `variant` prop** (headings): `h1` `h2` `h3` `h4` `h5` — (body):
`bodyXL` `bodyL` `bodyM` `bodyS` `bodyXS` — (actions): `actionL` `actionM`
`actionS` — (caption): `captionM` — (secondary): `muted`.

**`Button` — `variant` prop**: `primary` (filled, brand color) `secondary`
(outlined) `tertiary` (text-only). Plus `size="md"` (only size today),
`disabled`, `loading` booleans, `leftIcon`/`rightIcon` slots.

**`Box` — layout primitive via system props**, not a `div`+CSS: `p`/`px`/`py`/
`pt`/`pb` (padding), `m`/`mt`/`mb` (margin), `gap` — all keyed into the spacing
scale `0→0px 1→4px 2→8px 3→12px 4→16px 5→20px 6→24px 8→32px 16→64px`; `radius`
keyed into `sm→8px md→12px lg→16px xl→20px`; `bg` — either a `"group.shade"`
palette path (below) or a raw CSS color string; `flex` (number), `row`
(boolean → horizontal layout), `align`/`justify` (flexbox alignItems/
justifyContent), `width`/`maxWidth`/`height`. Reach for `Box` instead of a bare
`View`+inline-style whenever you need spacing/color/layout — it's the
project's real layout idiom.

## Color palette (`"group.shade"` — used by `Box`'s `bg` prop and worth
matching by eye elsewhere)

- `highlight` (brand blue): `darkest #006FFD` `dark #2897FF` `medium #6FBAFF`
  `light #B4DBFF` `lightest #EAF2FF`
- `neutralLight`: `darkest #C5C6CC` `dark #D4D6DD` `medium #E8E9F1`
  `light #F8F9FE` `lightest #FFFFFF`
- `neutralDark`: `darkest #1F2024` `dark #2F3036` `medium #494A50`
  `light #71727A` `lightest #8F9098`
- `success`: `dark #298267` `medium #3AC0A0` `light #E7F4E8`
- `warning`: `dark #E86339` `medium #FFB37C` `light #FFF4E4`
- `error`: `dark #ED3241` `medium #FF616D` `light #FFE2E5`

Example: `<Box bg="highlight.lightest" p={4} radius="lg">`.

## Where the truth lives

This palette and spacing/radius scale are the project's actual token values —
there's no separate live token file bound alongside this library, so treat the
tables above as the source of truth (not just documentation) when picking a
color or spacing value. Each component's exact prop contract is in its own
`<Name>.d.ts`; usage guidance and examples are in its `<Name>.prompt.md`.

## A realistic composed example

```tsx
<Box bg="neutralLight.light" p={4} radius="lg" style={{ gap: 8 }}>
  <Text variant="h4">Weekly trivia night</Text>
  <Text variant="bodyS" style={{ color: "#71727A" }}>
    Fridays · 8:00 PM
  </Text>
  <Button title="Join game" variant="primary" onPress={() => {}} />
</Box>
```
