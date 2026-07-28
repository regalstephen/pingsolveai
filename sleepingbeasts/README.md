# Support page — deployment brief

The public **How to Play / FAQ / Support** page for *Sleeping Beasts: AR Stealth*,
built to sit alongside the existing pages on <https://pingsolveai.com/>.

| Source | Must be published at |
|---|---|
| `sleepingbeasts-support.html` | `https://pingsolveai.com/sleepingbeasts-support.html` |
| `sleepingbeasts-img/` (15 PNGs) | `https://pingsolveai.com/sleepingbeasts-img/` |

Upload the HTML file to the web root and the **whole `sleepingbeasts-img/`
folder** next to it, keeping the folder name. The page references images as
`sleepingbeasts-img/<name>.png` — a relative path, so the folder must be a
sibling of the HTML file. The folder is namespaced rather than called `img/`
specifically so it cannot collide with anything already on the site.

Total weight is about 2.9 MB, essentially all of it beast art.

## Brief for whoever publishes this

- One HTML file. All CSS is inline, there is **no JavaScript at all**, and the
  FAQ accordion is native `<details>`/`<summary>` — nothing to wire up.
- Responsive; verified at 1280px and at 375px (iPhone) widths.
- **Restyle freely** to match the rest of the site — swap the CSS, wrap it in the
  site's header/nav/footer, port it to whatever templating the site uses. Please
  keep the safety guidance in the "For grown-ups" section and the microphone
  explanation intact; both are referenced by the App Store listing and by the
  privacy policy, and they need to stay consistent with those.
- The only external request is Google Fonts (**Baloo 2** and **Nunito**). Those
  two faces are the app's own typography, so keep them if you can. Self-hosting
  them is fine and would remove the third-party request entirely; the CSS falls
  back to system sans-serif if they fail to load.
- The page cross-links to `sleepingbeasts-privacy.html` and
  `sleepingbeasts-terms.html` (see `../legal/`). Publish all three together or
  those links will 404.
- No cookie banner is needed — the page sets no cookies and stores nothing.

## Once it is live

Set it as the **Support URL** in App Store Connect (App Information → Support
URL). That field is required, reviewers do click it, and a page that actually
explains the game is worth more there than a site root. It is already recorded
in [../metadata.md](../metadata.md).

## Regenerating the images

```bash
node scripts/build-web-assets.js
```

Run from the repo root. It rebuilds `sleepingbeasts-img/` from the art in
`assets/beasts/`, and is the only supported way to change those files — do not
hand-edit them.

Worth knowing about what that script does, because the source art is messy:

- The ten Safari creatures exist in `assets/beasts/` only as **Meshy turnaround
  sheets** — four labelled views on an opaque grey backdrop, 2000+ px, 5–6 MB
  each. Unusable on a web page. The script pulls the single keyed pose from
  `assets/beasts/references/<beast>_0.png` instead.
- The **Pumpkin Cat** sprite has a wedge of wooden floor fused to its lower left,
  left behind by the original keying pass. It is a single connected shape, so it
  cannot simply be dropped as a stray island; the script keys it out by colour
  (the plank is desaturated warm `floorLight`, the cat is saturated orange) and
  seeds the fill only from the frame edge so it can never reach into the cat.

> ⚠️ **That Pumpkin Cat flaw is also in the shipped app sprite**
> (`assets/beasts/pumpkin-cat.png`), where it shows on the home screen and level
> tiles. Only the web copy is cleaned here. Fixing the app asset is a separate,
> unscheduled job.
