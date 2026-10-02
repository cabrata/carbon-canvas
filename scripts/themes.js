// Generates docs/assets/themes/*.png, THEMES.md, and the static docs gallery.
const fs = require('fs')
const path = require('path')
const { render, THEMES } = require('..')

const root = path.join(__dirname, '..')
const code = `// Fibonacci with memoization
const memo = new Map()
function fib(n) {
  if (n < 2) return n
  if (memo.has(n)) return memo.get(n)
  const value = fib(n - 1) + fib(n - 2)
  memo.set(n, value)
  return value
}

console.log(\`fib(42) = \${fib(42)}\`, [1, 2, 3].map(x => x * 2), { ok: true })`

const slug = s => s.toLowerCase().replace(/\s+/g, '-')
const anchor = s => s.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-')
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const cards = []

fs.mkdirSync(path.join(root, 'docs/assets/themes'), { recursive: true })
let md = `# Theme Preview

Previews of all **${THEMES.length} built-in themes** in carbon-canvas. Every image is rendered with the default options (Hack font, default background) and \`language: 'javascript'\`.

[Web gallery](https://cabrata.github.io/carbon-canvas/#themes)

\`\`\`js
render(code, { theme: '<id>', language: 'javascript' })
\`\`\`

## List

| Name | ID | Background |
| --- | --- | --- |
${THEMES.map(t => `| [${t.name}](#${anchor(t.name)}) | \`${t.id}\` | \`${t.highlights.background}\` |`).join('\n')}

`
for (const t of THEMES) {
  const file = `docs/assets/themes/${slug(t.id)}.png`
  const image = render(code, { theme: t.id, language: 'javascript', title: t.name })
  fs.writeFileSync(path.join(root, file), image)
  md += `## ${t.name}

ID: \`${t.id}\`

![${t.name}](${file})

<details><summary>Color palette</summary>

| Key | Color |
| --- | --- |
${Object.entries(t.highlights).map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')}

</details>

`
  // Native HTML keeps the gallery usable even without JavaScript.
  const url = file.slice('docs/'.length)
  const swatches = Object.entries(t.highlights).map(([key, value]) => {
    if (!/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d.,\s]+\))$/i.test(value)) throw new Error(`Invalid palette color: ${value}`)
    return `<li><span class="swatch" style="background:${escape(value)}" aria-hidden="true"></span>${escape(key)} <code>${escape(value)}</code></li>`
  }).join('\n')
  cards.push(`<article class="theme-card" id="theme-${slug(t.id)}" data-search="${escape(`${t.name} ${t.id}`.toLowerCase())}">
  <div class="theme-meta"><h3>${escape(t.name)}</h3><p>Theme ID: <code>${escape(t.id)}</code></p></div>
  <a href="${url}" aria-label="View full-size ${escape(t.name)} preview"><img src="${url}" alt="JavaScript code in the ${escape(t.name)} theme" loading="lazy" decoding="async" width="${image.readUInt32BE(16)}" height="${image.readUInt32BE(20)}"></a>
  <details><summary>Color palette</summary><ul class="palette">${swatches}</ul></details>
</article>`)
}
md += 'Regenerate: `npm run themes`\n'
fs.writeFileSync(path.join(root, 'THEMES.md'), md)
const page = path.join(root, 'docs/index.html')
const html = fs.readFileSync(page, 'utf8')
const marker = /<!-- themes:start -->[\s\S]*?<!-- themes:end -->/
if (!marker.test(html)) throw new Error('Theme gallery markers missing in docs/index.html')
fs.writeFileSync(page, html.replace(marker, `<!-- themes:start -->\n${cards.join('\n')}\n<!-- themes:end -->`))
console.log(`${THEMES.length} themes -> THEMES.md and docs/index.html`)
