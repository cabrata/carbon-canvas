// Generates assets/themes/*.png and THEMES.md. Run: npm run themes
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

fs.mkdirSync(path.join(root, 'assets/themes'), { recursive: true })
let md = `# Theme Preview

Preview semua **${THEMES.length} tema** bawaan carbon-canvas. Semua gambar dirender dengan opsi default (font Hack, background default) dan \`language: 'javascript'\`.

\`\`\`js
render(code, { theme: '<id>', language: 'javascript' })
\`\`\`

## Daftar

| Nama | ID | Background |
| --- | --- | --- |
${THEMES.map(t => `| [${t.name}](#${anchor(t.name)}) | \`${t.id}\` | \`${t.highlights.background}\` |`).join('\n')}

`
for (const t of THEMES) {
  const file = `assets/themes/${slug(t.id)}.png`
  fs.writeFileSync(path.join(root, file), render(code, { theme: t.id, language: 'javascript', title: t.name }))
  md += `## ${t.name}

ID: \`${t.id}\`

![${t.name}](${file})

<details><summary>Palet warna</summary>

| Key | Warna |
| --- | --- |
${Object.entries(t.highlights).map(([k, v]) => `| \`${k}\` | \`${v}\` |`).join('\n')}

</details>

`
}
md += 'Regenerate: `npm run themes`\n'
fs.writeFileSync(path.join(root, 'THEMES.md'), md)
console.log(`${THEMES.length} themes -> THEMES.md`)
