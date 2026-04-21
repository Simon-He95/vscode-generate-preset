import pinia from './template.pinia'
import postcssConfig from './template.postcss'
import tailwind from './template.tailwind'
import tailwindCss from './template.tailwind.css'
import unocss from './template.unocss'

export default {
  'pinia_demo.ts': pinia,
  'tailwind.config.js': tailwind,
  'tailwind.config.js|postcss.config.cjs|tailwind.css': [tailwind, postcssConfig, tailwindCss],
  'unocss.config.ts': unocss,
  'postcss.config.cjs': postcssConfig,
}
