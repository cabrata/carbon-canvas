// Self-check: node test.js  -> writes out/*.png
const fs = require('fs')
const assert = require('assert')
const { render, THEMES } = require('./')

const code = `const pluckDeep = key => obj => key.split('.').reduce((accum, key) => accum[key], obj)

// "hello" & <world>
const compose = (...fns) => res => fns.reduce((accum, next) => next(accum), res)`

fs.mkdirSync('out', { recursive: true })
const png = render(code, { language: 'javascript' })
assert.deepStrictEqual([...png.subarray(1, 4)], [0x50, 0x4e, 0x47]) // "PNG"
fs.writeFileSync('out/default.png', png)
fs.writeFileSync('out/dracula.png', render(code, { theme: 'dracula', language: 'javascript', fontFamily: 'Fira Code', lineNumbers: true, title: 'index.js', backgroundColor: 'rgba(74,144,226,1)' }))
fs.writeFileSync('out/boxy.png', render('print("hi")', { theme: 'one-light', windowTheme: 'boxy', language: 'python' }))
assert.throws(() => render(code, { theme: 'nope' }), /Unknown theme/)
for (const t of THEMES) render('x', { theme: t.id })
console.log('ok')
