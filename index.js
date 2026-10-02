// Carbon (carbon.now.sh) style code image renderer for Node.js, no browser.
// Themes/layout values ported from carbon-app/carbon (MIT).
const path = require('path')
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas')
const hljs = require('highlight.js')
const THEMES = require('./themes')

const FONTS = { Hack: 'Hack-Regular.ttf', 'Fira Code': 'FiraCode-Regular.ttf', 'JetBrains Mono': 'JetBrainsMono-Regular.ttf' }
for (const [name, file] of Object.entries(FONTS)) GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', file), name)

// carbon DEFAULT_SETTINGS (subset that makes sense without a browser)
const DEFAULTS = {
  theme: 'seti',
  language: 'auto',
  fontFamily: 'Hack',
  fontSize: 14,
  lineHeight: 1.33,
  paddingVertical: 56,
  paddingHorizontal: 56,
  backgroundColor: 'rgba(171, 184, 195, 1)',
  dropShadow: true,
  dropShadowOffsetY: 20,
  dropShadowBlurRadius: 68,
  windowControls: true,
  windowTheme: 'none', // none | bw | boxy
  lineNumbers: false,
  firstLineNumber: 1,
  title: '',
  scale: 2, // carbon exportSize 2x
  minWidth: 90,
  maxWidth: 1024,
}

// highlight.js scope -> carbon highlight key
const SCOPE = {
  keyword: 'keyword', built_in: 'keyword', 'selector-tag': 'keyword', doctag: 'keyword',
  literal: 'number', number: 'number', symbol: 'number', bullet: 'number',
  string: 'string', regexp: 'string', 'template-tag': 'string', 'selector-attr': 'string', link: 'string',
  comment: 'comment', quote: 'comment',
  meta: 'meta', 'meta-keyword': 'meta',
  title: 'definition', section: 'definition', 'selector-id': 'definition', 'selector-class': 'definition',
  attr: 'attribute', attribute: 'attribute', 'selector-pseudo': 'attribute',
  property: 'property',
  variable: 'variable', 'template-variable': 'variable', type: 'variable', class: 'variable', params: 'text',
  operator: 'operator',
  tag: 'tag', name: 'tag',
}

// carbon's auto-detect subset (LANGUAGES with highlight: true), avoids hljs guessing e.g. "dns"
const AUTO = ['apache','shell','csharp','clojure','coffeescript','crystal','css','d','dart','diff','django','dockerfile','elixir','elm','erlang','fsharp','fortran','gherkin','go','groovy','handlebars','haskell','java','javascript','json','julia','kotlin','latex','lisp','lua','markdown','mathematica','matlab','nginx','nim','objectivec','ocaml','perl','php','powershell','python','r','ruby','rust','scala','smalltalk','sql','stylus','swift','tcl','typescript','twig','verilog','vhdl','xquery','yaml','xml','cpp','c']

const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')

// Convert hljs HTML into lines of [{ text, key }]
function tokenize(code, language) {
  const html = language && language !== 'auto' && hljs.getLanguage(language)
    ? hljs.highlight(code, { language, ignoreIllegals: true }).value
    : hljs.highlightAuto(code, AUTO).value
  const lines = [[]]
  const stack = []
  for (const [, open, close, text] of html.matchAll(/<span class="([^"]*)">|(<\/span>)|([^<]+)/g)) {
    if (open !== undefined) {
      const cls = open.split(' ')[0].replace(/^hljs-/, '')
      const parentKey = stack[stack.length - 1]
      stack.push(SCOPE[cls] || SCOPE[cls.split('.')[0]] || parentKey || 'text')
    } else if (close) stack.pop()
    else {
      const key = stack[stack.length - 1] || 'text'
      decode(text).split('\n').forEach((part, i) => {
        if (i) lines.push([])
        if (part) lines[lines.length - 1].push({ text: part, key })
      })
    }
  }
  return lines
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function drawControls(ctx, x, y, theme) {
  const cx = [6, 26, 46]
  if (theme === 'boxy') {
    ctx.strokeStyle = '#878787'
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x + 1, y + 7); ctx.lineTo(x + 11, y + 7)
    ctx.moveTo(x + 47, y + 2); ctx.lineTo(x + 57, y + 12)
    ctx.moveTo(x + 47, y + 12); ctx.lineTo(x + 57, y + 2)
    ctx.stroke()
    roundRect(ctx, x + 24, y + 1, 12, 12, 1)
    ctx.stroke()
    return
  }
  const fills = ['#FF5F56', '#FFBD2E', '#27C93F']
  const strokes = ['#E0443E', '#DEA123', '#1AAB29']
  cx.forEach((c, i) => {
    ctx.beginPath()
    ctx.arc(x + 1 + c, y + 7, 6, 0, Math.PI * 2)
    if (theme === 'bw') {
      ctx.strokeStyle = '#878787'
      ctx.lineWidth = 1
    } else {
      ctx.fillStyle = fills[i]
      ctx.fill()
      ctx.strokeStyle = strokes[i]
      ctx.lineWidth = 0.5
    }
    ctx.stroke()
  })
}

/**
 * Render code to a PNG buffer.
 * @param {string} code
 * @param {Partial<typeof DEFAULTS>} options
 * @returns {Buffer}
 */
function render(code, options = {}) {
  if (typeof code !== 'string') throw new TypeError('code must be a string')
  const o = { ...DEFAULTS, ...options }
  const theme = typeof o.theme === 'object' ? o.theme : THEMES.find(t => t.id === o.theme)
  if (!theme) throw new Error(`Unknown theme "${o.theme}". Available: ${THEMES.map(t => t.id).join(', ')}`)
  const h = theme.highlights
  const color = key => h[key] || h.text

  const lines = tokenize(code.replace(/\t/g, '  ').replace(/\s+$/, ''), o.language)
  const font = `${o.fontSize}px "${o.fontFamily}"`
  const lh = Math.round(o.fontSize * o.lineHeight)

  // measure
  const m = createCanvas(1, 1).getContext('2d')
  m.font = font
  const lineWidth = l => l.reduce((w, t) => w + m.measureText(t.text).width, 0)
  const gutter = o.lineNumbers ? m.measureText(String(o.firstLineNumber + lines.length - 1)).width + 16 : 0
  const textW = Math.max(0, ...lines.map(lineWidth))

  // carbon: .container padding 18px, padding-left 12px, padding-top 48px with window controls
  const padTop = o.windowControls ? 48 : 18
  const winW = Math.min(o.maxWidth, Math.max(o.minWidth, Math.ceil(12 + gutter + textW + 18)))
  const winH = padTop + lines.length * lh + 18
  const W = winW + o.paddingHorizontal * 2
  const H = winH + o.paddingVertical * 2

  const canvas = createCanvas(Math.ceil(W * o.scale), Math.ceil(H * o.scale))
  const ctx = canvas.getContext('2d')
  ctx.scale(o.scale, o.scale)

  if (o.backgroundColor && o.backgroundColor !== 'transparent') {
    ctx.fillStyle = o.backgroundColor
    ctx.fillRect(0, 0, W, H)
  }

  const x0 = o.paddingHorizontal
  const y0 = o.paddingVertical
  ctx.save()
  if (o.dropShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
    ctx.shadowOffsetY = o.dropShadowOffsetY
    ctx.shadowBlur = o.dropShadowBlurRadius
  }
  ctx.fillStyle = h.background
  roundRect(ctx, x0, y0, winW, winH, 5)
  ctx.fill()
  ctx.restore()

  if (o.windowControls) {
    drawControls(ctx, x0 + (o.windowTheme === 'boxy' ? winW - 16 - 58 : o.windowTheme === 'bw' ? 16 : 14), y0 + 16, o.windowTheme)
    if (o.title) {
      ctx.font = '14px sans-serif'
      ctx.fillStyle = color('text')
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(o.title, x0 + winW / 2, y0 + 23, winW - 140)
      ctx.textAlign = 'left'
    }
  }

  // ponytail: no soft wrap, long lines are clipped at maxWidth. Add wrapping if needed.
  ctx.save()
  roundRect(ctx, x0, y0, winW, winH, 5)
  ctx.clip()
  ctx.font = font
  ctx.textBaseline = 'middle'
  lines.forEach((line, i) => {
    const y = y0 + padTop + i * lh + lh / 2
    let x = x0 + 12
    if (o.lineNumbers) {
      ctx.fillStyle = color('comment')
      ctx.globalAlpha = 0.5
      ctx.textAlign = 'right'
      ctx.fillText(String(o.firstLineNumber + i), x + gutter - 16, y)
      ctx.textAlign = 'left'
      ctx.globalAlpha = 1
      x += gutter
    }
    for (const t of line) {
      ctx.fillStyle = color(t.key)
      ctx.fillText(t.text, x, y)
      x += ctx.measureText(t.text).width
    }
  })
  ctx.restore()

  return canvas.toBuffer('image/png')
}

module.exports = { render, THEMES, DEFAULTS, FONTS: Object.keys(FONTS), registerFont: (file, name) => GlobalFonts.registerFromPath(file, name) }
