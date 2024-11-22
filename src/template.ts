import pinia from './template.pinia'
import tailwind from './template.tailwind'
import unocss from './template.unocss'
import postcssConfig from './template.postcss'
import tailwindCss from './template.tailwind.css.ts'

export default {
  'pinia_demo.ts': pinia,
  'tailwind.config.js': tailwind,
  'tailwind.config.js|postcss.config.cjs|tailwind.css': [tailwind, postcssConfig, tailwindCss],
  'unocss.config.ts': unocss,
  'postcss.config.cjs': postcssConfig,
}
