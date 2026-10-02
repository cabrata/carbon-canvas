// ESM entry: wraps the CommonJS build so `import` works in Node, TypeScript, and Bun.
import cc from './index.js'

export const { render, THEMES, DEFAULTS, FONTS, registerFont } = cc
export default cc
