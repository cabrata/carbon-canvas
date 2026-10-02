// ESM entry: wraps the CommonJS build so `import` works in Node and TypeScript.
import cc from './index.js'

export const { render, THEMES, DEFAULTS, FONTS, registerFont } = cc
export default cc
