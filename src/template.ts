import pinia from './template.pinia'
import tailwind from './template.tailwind'
import unocss from './template.unocss'
import postcssConfig from './template.postcss'

export default {
  'pinia_demo.ts': pinia,
  'tailwind.config.ts': tailwind,
  'tailwind.config.ts|postcss.config.cjs': [tailwind, postcssConfig],
  'unocss.config.ts': unocss,
  'postcss.config.cjs': postcssConfig,
}
