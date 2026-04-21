import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { createExtension, createInput, createSelect, message, openFile, registerCommand, setCopyText } from '@vscode-use/utils'
import JSON5 from 'json5'
import * as vscode from 'vscode'
import templateJson from './template'
import { type TemplateFilePath, type TemplateValue, resolveTemplatePath, splitTemplateMessage } from './template-helpers'

const has = '已存在'

const closers: (() => void)[] = []

export = createExtension(async () => {
  const snippetsDir = getSnippetUrl()
  if (snippetsDir) {
    const templateUri = path.resolve(snippetsDir, 'vscode-generate-preset-template.code-snippets')
    if (!fs.existsSync(templateUri))
      await fs.promises.writeFile(templateUri, JSON.stringify(templateJson))

    return [
      registerCommand('vscode-generate-preset.run', async (filePath: TemplateFilePath | undefined) => {
        if (!filePath) {
          message.error('请在资源管理器中的目录上使用 Select Preset')
          return
        }

        const userJSON = await getUserJSon()
        const template: Record<string, TemplateValue> = Object.assign({}, templateJson, userJSON)
        const options = Object.keys(template)
        const option = await createSelect(options)
        if (!option)
          return
        if (Array.isArray(template[option])) {
          for (const [i, o] of option.split('|').entries()) {
            const url = resolveTemplatePath(filePath, o)
            const { template: templateStr, messageContent, copyText } = splitTemplateMessage(template[option][i])
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
            const result = await generateFile(url, templateStr)
            message.info(result === has
              ? `${o} preset 已存在`
              : `${o} preset generate successfully 🎉`)
            await openFile(url)
          }
        }
        else {
          const { template: templateStr, messageContent, copyText } = splitTemplateMessage(template[option])
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
          const url = resolveTemplatePath(filePath, option)
          const result = await generateFile(url, templateStr)
          message.info(result === has
            ? `${option} preset 已存在`
            : `${option} preset generate successfully 🎉`)
          await openFile(url)
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

        let preTemplateStr: string | undefined
        const saveDisposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
          if (document.uri.fsPath !== tempFile)
            return

          const templateStr = document.getText()
          if (preTemplateStr === templateStr)
            return

          preTemplateStr = templateStr
          const updateUserJson = Object.assign(userJSON, { [filename]: templateStr })
          try {
            await fs.promises.writeFile(templateUri, JSON.stringify(updateUserJson))
          }
          catch (error: any) {
            message.error(error)
          }
        })
        const closeSaveListener = () => saveDisposable.dispose()
        let closeCloseListener = () => undefined
        const cleanupTempFile = () => {
          closeSaveListener()
          closeCloseListener()
          const cleanupIndex = closers.indexOf(cleanupTempFile)
          if (cleanupIndex >= 0)
            closers.splice(cleanupIndex, 1)

          if (fs.existsSync(tempFile))
            fs.rmSync(tempFile)
        }

        const closeDisposable = vscode.workspace.onDidCloseTextDocument((document) => {
          if (document.uri.fsPath !== tempFile)
            return

          cleanupTempFile()
        })
        closeCloseListener = () => closeDisposable.dispose()

        closers.push(cleanupTempFile)
        await openFile(tempFile)
        message.info('保存临时文件后写入模板，关闭标签后清理临时文件')
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
          await fs.promises.writeFile(templateUri, JSON.stringify(userJSON))
          message.info(`${option.join('、')} 模板已被移除`)
        }
        catch (error: any) {
          message.error(error)
        }
      }),
    ]

    async function getUserJSon() {
      let userJSON: Record<string, TemplateValue> = {}
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
    return has

  await fs.promises.writeFile(url, templateStr, 'utf-8')
}
