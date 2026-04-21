import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveTemplatePath, splitTemplateMessage } from '../src/template-helpers'

describe('template helpers', () => {
  it('resolves string paths', () => {
    expect(resolveTemplatePath('/tmp/demo', 'tailwind.config.js')).toBe(path.join('/tmp/demo', 'tailwind.config.js'))
  })

  it('resolves uri-like paths', () => {
    expect(resolveTemplatePath({ fsPath: '/tmp/demo' }, 'tailwind.config.js')).toBe(path.join('/tmp/demo', 'tailwind.config.js'))
  })

  it('extracts message metadata from template content', () => {
    expect(splitTemplateMessage('// vscode-message: install deps | pnpm add -D tailwindcss\nexport default {}')).toEqual({
      template: 'export default {}',
      messageContent: 'install deps',
      copyText: 'pnpm add -D tailwindcss',
    })
  })

  it('keeps templates without metadata unchanged', () => {
    expect(splitTemplateMessage('export default {}')).toEqual({
      template: 'export default {}',
      messageContent: '',
      copyText: '',
    })
  })
})
