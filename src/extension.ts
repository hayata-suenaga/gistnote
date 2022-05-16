import * as vscode from 'vscode';
import * as path from 'path';
import { treeDataProvider } from './treeDataProvider';
import { textDocumentContentProvider } from './textDocumentContentProvider';

/* Extension is lazily activated open invocation of any of the commands */
export async function activate(context: vscode.ExtensionContext) {
  /* Register provider for the "gists" schema */
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'gists',
      textDocumentContentProvider
    )
  );

  /* Register tree data provider for gists explorer */
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('gists', treeDataProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('helloworld.helloWorld', async () => {
      /* Get the URL of the gist file to be fetched */
      const content = await vscode.window.showInputBox({
        placeHolder: 'File name',
      });
      /* Get the uri of the document to be provided */
      const uri = vscode.Uri.parse(`gists:${content}`);
      /* Fetch the content and open the document */
      const doc = await vscode.workspace.openTextDocument(uri);
      /* Show the read only document */
      await vscode.window.showTextDocument(doc, { preview: false });
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
