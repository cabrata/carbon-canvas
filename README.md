# carbon-canvas

Render code images like carbon.now.sh in Node.js, with no browser or puppeteer needed (`@napi-rs/canvas` + `highlight.js`).
The themes (29), layout, and window controls come from [carbon-app/carbon](https://github.com/carbon-app/carbon) (MIT).

```js
const fs = require('fs')
const { render, THEMES } = require('./carbon-canvas')

fs.writeFileSync('code.png', render('console.log("hi")', {
  theme: 'dracula',        // THEMES.map(t => t.id)
  language: 'javascript',  // default 'auto'
  fontFamily: 'Fira Code', // Hack | Fira Code | JetBrains Mono
  lineNumbers: true,
  title: 'index.js',
  windowTheme: 'none',     // none | bw | boxy
  backgroundColor: 'rgba(74,144,226,1)', // or 'transparent'
}))
```

The other options are in `DEFAULTS` in `index.js`. To add more fonts use `registerFont(path, name)`.
Self-check: `node test.js` (writes the output to `out/`).
