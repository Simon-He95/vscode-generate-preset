import path from 'node:path'

const messageInTemplate = /\/\/\s+vscode-message:\s*(.*)\n*/

export type TemplateFilePath = string | { fsPath: string }
export type TemplateValue = string | string[]

export function resolveTemplatePath(filePath: TemplateFilePath, filename: string) {
  const basePath = typeof filePath === 'string' ? filePath : filePath.fsPath
  return path.join(basePath, filename)
}

export function splitTemplateMessage(template: string) {
  let messageContent = ''
  let copyText = ''

  return {
    template: template.replace(messageInTemplate, (_, content: string) => {
      [messageContent, copyText] = content.split(' | ')
      return ''
    }),
    messageContent,
    copyText,
  }
}
