import * as vscode from 'vscode'

export function activate(context: any) {
  const disposable = vscode.commands.registerCommand('myExtension.myCommand', () => {
    vscode.window.showInformationMessage('Hello World!')
  })
  context.subscriptions.push(disposable)
}

export function deactivate() {

}
