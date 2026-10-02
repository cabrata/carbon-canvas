/// <reference types="node" />

export type HighlightKey =
  | 'background'
  | 'text'
  | 'variable'
  | 'variable2'
  | 'variable3'
  | 'attribute'
  | 'definition'
  | 'keyword'
  | 'operator'
  | 'property'
  | 'number'
  | 'string'
  | 'comment'
  | 'meta'
  | 'tag'

export interface Theme {
  id: string
  name?: string
  highlights: { background: string; text: string } & Partial<Record<HighlightKey, string>>
}

export type ThemeId =
  | '3024-night' | 'a11y-dark' | 'blackboard' | 'base16-dark' | 'base16-light' | 'cobalt'
  | 'dracula' | 'duotone-dark' | 'hopscotch' | 'lucario' | 'material' | 'monokai'
  | 'night-owl' | 'nord' | 'oceanic-next' | 'one-light' | 'one-dark' | 'panda-syntax'
  | 'paraiso-dark' | 'seti' | 'shades-of-purple' | 'solarized dark' | 'solarized light'
  | 'synthwave-84' | 'twilight' | 'verminal' | 'vscode' | 'yeti' | 'zenburn'

export type BuiltinFont = 'Hack' | 'Fira Code' | 'JetBrains Mono'

export interface RenderOptions {
  /** Theme ID or a custom theme object. Default `'seti'`. */
  theme?: ThemeId | (string & {}) | Theme
  /** highlight.js language name or `'auto'`. Default `'auto'`. */
  language?: string
  /** Default `'Hack'`. Custom fonts must be registered with `registerFont`. */
  fontFamily?: BuiltinFont | (string & {})
  fontSize?: number
  lineHeight?: number
  paddingVertical?: number
  paddingHorizontal?: number
  /** Any CSS color or `'transparent'`. */
  backgroundColor?: string
  dropShadow?: boolean
  dropShadowOffsetY?: number
  dropShadowBlurRadius?: number
  windowControls?: boolean
  windowTheme?: 'none' | 'bw' | 'boxy'
  lineNumbers?: boolean
  firstLineNumber?: number
  title?: string
  /** Export scale. Default `2`. */
  scale?: number
  minWidth?: number
  maxWidth?: number
}

/** Render code to a PNG buffer. Throws on non-string code or unknown theme. */
export function render(code: string, options?: RenderOptions): Buffer

export const THEMES: Theme[]
export const DEFAULTS: Required<Omit<RenderOptions, 'theme'>> & { theme: ThemeId }
export const FONTS: BuiltinFont[]
/** Register a TTF/OTF font file under `name`. */
export function registerFont(path: string, name: string): unknown

declare const carbonCanvas: {
  render: typeof render
  THEMES: typeof THEMES
  DEFAULTS: typeof DEFAULTS
  FONTS: typeof FONTS
  registerFont: typeof registerFont
}
export default carbonCanvas
