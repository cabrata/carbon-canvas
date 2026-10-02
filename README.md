# carbon-canvas

**English** | [Bahasa Indonesia](https://github.com/cabrata/carbon-canvas/blob/main/README.id.md) | [Documentation](https://cabrata.github.io/carbon-canvas/)

Create beautiful images of your source code like [carbon.now.sh](https://carbon.now.sh), directly from **Node.js**. No browser, no Puppeteer, no Chromium.

Rendering is done with [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas) (Skia, prebuilt binaries, no system dependencies) and syntax highlighting with [`highlight.js`](https://highlightjs.org). Themes, layout metrics, shadows, and window controls are ported from the source code of [carbon-app/carbon](https://github.com/carbon-app/carbon).

![default](https://raw.githubusercontent.com/cabrata/carbon-canvas/main/docs/assets/default.png)

![dracula](https://raw.githubusercontent.com/cabrata/carbon-canvas/main/docs/assets/dracula.png)

![one-light](https://raw.githubusercontent.com/cabrata/carbon-canvas/main/docs/assets/one-light.png)

## Features

- All 29 built-in Carbon themes (seti, dracula, monokai, nord, one-dark, and more)
- Automatic language detection (same language subset as Carbon) or set it manually
- 3 bundled monospace fonts: Hack, Fira Code (with ligatures), JetBrains Mono
- macOS style, `bw`, or `boxy` window controls, plus a window title
- Line numbers with a custom starting number
- Drop shadow, padding, background color (or transparent)
- High resolution export (2x by default, same as Carbon)
- Synchronous and fast, returns a PNG `Buffer` ready to send (WhatsApp/Telegram/Discord bots, APIs, etc.)

## Installation

```bash
npm install carbon-canvas
# or with Bun
bun add carbon-canvas
```

Alternatively, install directly from GitHub:

```bash
npm install github:cabrata/carbon-canvas
# or with Bun
bun add github:cabrata/carbon-canvas
```

Requires Node.js 18 or newer.

## Usage

```js
const fs = require('fs')
const { render } = require('carbon-canvas')

const code = `function hello(name) {
  return \`Hello, \${name}!\`
}`

const png = render(code, { language: 'javascript' })
fs.writeFileSync('code.png', png)
```

### TypeScript / ESM

Type definitions ship with the package, no separate `@types/carbon-canvas` needed. Works with CommonJS, ESM, TypeScript, and [Bun](https://bun.sh).

```ts
import { render, type RenderOptions } from 'carbon-canvas'
// or: import carbon from 'carbon-canvas'

const options: RenderOptions = { theme: 'dracula', language: 'typescript', windowTheme: 'boxy' }
const png: Buffer = render('const x: number = 1', options)
```

With Bun you can run TypeScript directly:

```ts
// index.ts -> bun index.ts
import { render } from 'carbon-canvas'
await Bun.write('code.png', render('console.log("bun")', { theme: 'nord' }))
```

Theme IDs, fonts, and `windowTheme` autocomplete in your editor, and a typo like `windowTheme: 'round'` fails at compile time.

With all options:

```js
const png = render(code, {
  theme: 'dracula',
  language: 'javascript',
  fontFamily: 'Fira Code',
  fontSize: 14,
  lineHeight: 1.33,
  lineNumbers: true,
  firstLineNumber: 1,
  title: 'utils.js',
  windowControls: true,
  windowTheme: 'none',
  backgroundColor: 'rgba(74,144,226,1)',
  paddingVertical: 56,
  paddingHorizontal: 56,
  dropShadow: true,
  dropShadowOffsetY: 20,
  dropShadowBlurRadius: 68,
  scale: 2,
})
```

### Example: Express API

```js
const express = require('express')
const { render } = require('carbon-canvas')

const app = express()
app.use(express.json({ limit: '16kb' }))

app.post('/carbon', (req, res) => {
  const code = req.body?.code
  if (typeof code !== 'string' || code.length > 8000 || code.split('\n').length > 100) {
    return res.status(400).json({ error: 'Use a string of up to 8000 characters and 100 lines' })
  }
  try {
    res.type('png').send(render(code, { language: 'javascript', scale: 1 }))
  } catch {
    res.status(500).json({ error: 'Unable to render image' })
  }
})

app.listen(3000)
```

For a public API, add authentication/rate limiting or a worker queue. Never pass arbitrary untrusted render options straight to native canvas.

## API

### `render(code, options?) => Buffer`

Renders `code` (a string) to a PNG. Throws if `code` is not a string or the theme does not exist.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `theme` | `string \| object` | `'seti'` | Theme ID (see list below) or a custom theme object |
| `language` | `string` | `'auto'` | highlight.js language name (`javascript`, `python`, `go`, ...) or `'auto'` |
| `fontFamily` | `string` | `'Hack'` | `Hack`, `Fira Code`, `JetBrains Mono`, or a font registered with `registerFont` |
| `fontSize` | `number` | `14` | Font size (px) |
| `lineHeight` | `number` | `1.33` | Line height multiplier |
| `lineNumbers` | `boolean` | `false` | Show line numbers |
| `firstLineNumber` | `number` | `1` | First line number |
| `windowControls` | `boolean` | `true` | Show window controls |
| `windowTheme` | `string` | `'none'` | `none` (macOS colors), `bw` (outline), `boxy` (Windows style) |
| `title` | `string` | `''` | Title centered in the title bar |
| `backgroundColor` | `string` | `'rgba(171, 184, 195, 1)'` | Any CSS color, or `'transparent'` |
| `paddingVertical` | `number` | `56` | Top and bottom padding (px) |
| `paddingHorizontal` | `number` | `56` | Left and right padding (px) |
| `dropShadow` | `boolean` | `true` | Shadow under the window |
| `dropShadowOffsetY` | `number` | `20` | Shadow Y offset (px) |
| `dropShadowBlurRadius` | `number` | `68` | Shadow blur (px) |
| `scale` | `number` | `2` | Export scale (1x, 2x, 4x) |
| `minWidth` | `number` | `90` | Minimum window width (px) |
| `maxWidth` | `number` | `1024` | Maximum window width (px), longer lines get clipped |

### `THEMES`

Array of all themes `{ id, name, highlights }`.

### `DEFAULTS`

The default options object.

### `FONTS`

Array of bundled font names.

### `registerFont(path, name)`

Register your own TTF/OTF font:

```js
const { render, registerFont } = require('carbon-canvas')
registerFont('./fonts/CascadiaCode.ttf', 'Cascadia Code')
render(code, { fontFamily: 'Cascadia Code' })
```

## Themes

See every theme in the **[web gallery](https://cabrata.github.io/carbon-canvas/#themes)** or **[THEMES.md](https://github.com/cabrata/carbon-canvas/blob/main/THEMES.md)**.

`3024-night`, `a11y-dark`, `blackboard`, `base16-dark`, `base16-light`, `cobalt`, `dracula`, `duotone-dark`, `hopscotch`, `lucario`, `material`, `monokai`, `night-owl`, `nord`, `oceanic-next`, `one-light`, `one-dark`, `panda-syntax`, `paraiso-dark`, `seti`, `shades-of-purple`, `solarized dark`, `solarized light`, `synthwave-84`, `twilight`, `verminal`, `vscode`, `yeti`, `zenburn`

### Custom theme

```js
render(code, {
  theme: {
    id: 'my-theme',
    highlights: {
      background: '#1e1e2e',
      text: '#cdd6f4',
      keyword: '#cba6f7',
      string: '#a6e3a1',
      number: '#fab387',
      comment: '#6c7086',
      definition: '#89b4fa',
      variable: '#f38ba8',
      property: '#89dceb',
      attribute: '#f9e2af',
      operator: '#94e2d5',
      meta: '#f5c2e7',
      tag: '#f38ba8',
    },
  },
})
```

Missing keys fall back to the `text` color.

## Tips

- Auto detection can guess wrong on short snippets (for example JS detected as CoffeeScript). Set `language` explicitly for consistent results.
- Tabs are converted to 2 spaces.
- For a transparent background use `backgroundColor: 'transparent'`, usually together with `dropShadow: false`.

## Limitations

- No word wrap yet, lines wider than `maxWidth` are clipped.
- No background image or watermark support yet.
- Only 3 bundled fonts (Carbon has 13), add others with `registerFont`.
- Themes that ship extra CSS in Carbon (night-owl, nord, one-dark, one-light, synthwave-84, verminal) only use their base colors, so they may look slightly different from carbon.now.sh (e.g. no synthwave glow).

## Tests

For development, clone the repository and run `npm install` first. Use `require('./')` or `import … from './index.mjs'` to load the local library.

```bash
npm test
npm run test:types
bun test ./test.bun.ts
npm run test:docs
```

Writes sample images to the `out/` folder. Regenerate the theme previews with `npm run themes`.

## GitHub Pages

The documentation is a static site in `docs/`, without a framework or build step. To deploy your fork, open **Settings → Pages**, select **Deploy from a branch**, then choose **main /docs**. All local URLs are relative so repository subpaths work.

## Credits

- Themes, layout, and design from [Carbon](https://github.com/carbon-app/carbon) by Dawn Labs (MIT)
- Fonts: [Hack](https://github.com/source-foundry/Hack) (MIT/Bitstream Vera), [Fira Code](https://github.com/tonsky/FiraCode) (OFL 1.1), [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) (OFL 1.1)

## License

The JavaScript library is MIT-licensed. Bundled fonts retain their own licenses. See [NOTICE](https://github.com/cabrata/carbon-canvas/blob/main/NOTICE) and the full font notices in `fonts/`.
