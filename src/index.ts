import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as vscode from 'vscode'

type Option = 'Tailwind - js' | 'Tailwind - ts' | 'Unocss - js' | 'Unocss - ts' | 'Pinia - js' | 'Pinia - ts'
const has = '已存在'
export function activate(context: any) {
  const options: Option[] = [
    'Tailwind - js', 'Tailwind - ts', 'Unocss - js', 'Unocss - ts', 'Pinia - js', 'Pinia - ts',
  ]
  const disposable = vscode.commands.registerCommand('myExtension.myCommand', async (filePath) => {
    const option = await vscode.window.showQuickPick(options) as Option
    generateFile(option, filePath)?.then((r) => {
      if (r === has)
        vscode.window.showInformationMessage(`${option} preset 已存在`)
      else
        vscode.window.showInformationMessage(`${option} preset generate successfully 🎉`)
    })
  })
  context.subscriptions.push(disposable)
}

export function deactivate() {

}

function generateFile(option: Option, filePath: string) {
  const end = option.endsWith('js') ? 'js' : 'ts'
  if (option.startsWith('Tailwind')) {
    const config = fileURLToPath(`${filePath}/tailwind.config.${end}`)
    if (fs.existsSync(config))
      return Promise.resolve(has)

    return fs.promises.writeFile(config, `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,${end}}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
`, 'utf-8')
  }
  else if (option.startsWith('Unocss')) {
    const config = fileURLToPath(`${filePath}/unocss.config.${end}`)
    if (fs.existsSync(config))
      return Promise.resolve(has)

    return fs.promises.writeFile(config, `import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    [
      'btn',
      'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    ],
    [
      'icon-btn',
      'text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600',
    ],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
})
`, 'utf-8')
  }
  else if (option.startsWith('Pinia')) {
    const config = fileURLToPath(`${filePath}/pinia_demo.${end}`)
    if (fs.existsSync(config))
      return Promise.resolve(has)
    return fs.promises.writeFile(config, `// @ts-check
import { defineStore, acceptHMRUpdate } from 'pinia'

/**
 * Simulate a login
 */
function apiLogin(a: string, p: string) {
  if (a === 'ed' && p === 'ed') return Promise.resolve({ isAdmin: true })
  if (p === 'ed') return Promise.resolve({ isAdmin: false })
  return Promise.reject(new Error('invalid credentials'))
}

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    name: 'Eduardo',
    isAdmin: true,
  }),

  actions: {
    logout() {
      this.$patch({
        name: '',
        isAdmin: false,
      })

      // we could do other stuff like redirecting the user
    },

    /**
     * Attempt to login a user
     */
    async login(user: string, password: string) {
      const userData = await apiLogin(user, password)

      this.$patch({
        name: user,
        ...userData,
      })
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
      `, 'utf-8')
  }
}
