import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import process from 'node:process'
import { createExtension, createInput, createSelect, message, openFile, registerCommand, setCopyText } from '@vscode-use/utils'
import JSON5 from 'json5'
import templateJson from './template'

const has = '已存在'

const closers: (() => void)[] = []

export = createExtension(async () => {
  const snippetsDir = getSnippetUrl()
  if (snippetsDir) {
    const templateUri = path.resolve(snippetsDir, 'vscode-generate-preset-template.code-snippets')
    if (!fs.existsSync(templateUri))
      await fs.promises.writeFile(templateUri, JSON.stringify(templateJson))

    return [
      registerCommand('vscode-generate-preset.run', async (filePath) => {
        const userJSON = await getUserJSon()
        const template: Record<string, string> = Object.assign({}, templateJson, userJSON)
        const options = Object.keys(template)
        const option = await createSelect(options)
        if (!option)
          return
        const messageInTempalte = /\/\/\s+vscode-message:\s*(.*)\n*/
        if (Array.isArray(template[option])) {
          option.split('|').forEach((o: string, i: number) => {
            const url = fileURLToPath(`${filePath}/${o}`)
            let messageContent = ''
            let copyText = ''
            const templateStr = template[option][i].replace(messageInTempalte, (_, content) => {
              [messageContent, copyText] = content.split(' | ')
              return ''
            })
            if (messageContent) {
              copyText
                ? message.info({
                  message: messageContent,
                  buttons: [
                    '复制内容',
                  ],
                }).then((choose) => {
                  if (choose === '复制内容') {
                    setCopyText(copyText || messageContent)
                  }
                })
                : message.info(messageContent)
            }
            generateFile(url, templateStr)?.then((r) => {
              message.info(r === has
                ? `${o} preset 已存在`
                : `${o} preset generate successfully 🎉`)
              openFile(url)
            })
          })
        }
        else {
          let messageContent = ''
          let copyText = ''
          const templateStr = template[option].replace(messageInTempalte, (_, content) => {
            [messageContent, copyText] = content.split(' | ')
            return ''
          })
          if (messageContent) {
            copyText
              ? message.info({
                message: messageContent,
                buttons: [
                  '复制内容',
                ],
              }).then((choose) => {
                if (choose === '复制内容') {
                  setCopyText(copyText || messageContent)
                }
              })
              : message.info(messageContent)
          }
          const url = fileURLToPath(`${filePath}/${option}`)
          generateFile(url, templateStr)?.then((r) => {
            message.info(r === has
              ? `${option} preset 已存在`
              : `${option} preset generate successfully 🎉`)
            openFile(url)
          })
        }
      }),
      registerCommand('vscode-generate-preset.add', async () => {
        const userJSON = await getUserJSon()

        const filename = await createInput({
          title: '添加模板名',
          value: '',
          placeHolder: '对应下拉选项和文件名',
          validate(v) {
            if (!v)
              return '文件名不能为空'
          },
        })
        if (!filename)
          return
        // 临时创建一个文件用来储存模板
        const tempFile = path.join(os.tmpdir(), `${filename}.tmp`)
        await fs.promises.writeFile(tempFile, '')
        openFile(tempFile)

        // Listen for the tempFile to be closed
        let preTemplateStr = ''
        const watcher = fs.watch(tempFile, async (eventType, _filename) => {
          if (eventType === 'rename' && !_filename) {
            // tempFile has been closed
            // Add your code here to handle the event
            fs.promises.unlink(tempFile)
            watcher.close()
          }
          else if (eventType === 'change') {
            const templateStr = await fs.promises.readFile(tempFile, 'utf-8')
            if (!preTemplateStr)
              preTemplateStr = templateStr
            else if (preTemplateStr === templateStr)
              return
            else
              preTemplateStr = templateStr
            const updateUserJson = Object.assign(userJSON, { [filename]: templateStr })
            try {
              fs.promises.writeFile(templateUri, JSON.stringify(updateUserJson))
            }
            catch (error: any) {
              message.error(error)
            }
          }
        })
        closers.push(watcher.close)
      }),
      registerCommand('vscode-generate-preset.delete', async () => {
        const userJSON = await getUserJSon()
        const options = Object.keys(userJSON)
        if (!options.length)
          return
        const option = await createSelect(options, {
          canSelectMany: true,
        })
        if (!option || !option.length)
          return

        (option).forEach((k: string) => delete userJSON[k])

        try {
          fs.promises.writeFile(templateUri, JSON.stringify(userJSON))
          message.info(`${option.join('、')} 模板已被移除`)
        }
        catch (error: any) {
          message.error(error)
        }
      }),
    ]

    async function getUserJSon() {
      let userJSON: Record<string, string> = {}
      try {
        const d = await fs.promises.readFile(templateUri, 'utf-8')
        const result = d.replace(/(\/\/[^\n]*\n)|(\n\s*\/\/[^\n]*)/g, '')
        userJSON = JSON5.parse(result)
      }
      catch (e) {
        message.error(`${templateUri}的配置不是一个可以被解析的 json`)
        console.error(e)
      }
      return userJSON
    }
  }
}, () => {
  closers.forEach(close => close())
  closers.length = 0
})

function getSnippetUrl() {
  let snippetsDir: string = ''
  switch (os.platform()) {
    case 'win32':
      snippetsDir = path.join(process.env.APPDATA!, 'Code', 'User', 'snippets')
      break
    case 'darwin':
      snippetsDir = path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'snippets')
      break
    case 'linux':
      snippetsDir = path.join(os.homedir(), '.config', 'Code', 'User', 'snippets')
      break
    default:
      console.error('Unsupported platform')
  }
  return snippetsDir
}

async function generateFile(url: string, templateStr: string) {
  if (fs.existsSync(url))
    return Promise.resolve(has)

  return fs.promises.writeFile(url, templateStr, 'utf-8')
}
