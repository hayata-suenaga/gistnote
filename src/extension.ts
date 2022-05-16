import * as vscode from 'vscode';
import * as path from 'path';
const axios = require('axios').default;

/* Extension is lazily activated open invocation of any of the commands */
export async function activate(context: vscode.ExtensionContext) {
  /* Create a content provider for "gists" schema */
  const contentProvider = new (class
    implements vscode.TextDocumentContentProvider
  {
    /* Implement the provider that returns a string to be rendered as a virtual document */
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
      /* Get the URL of the file to be fetched from the URI path */
      const fileURL = uri.path;
      /* Fetch the file */
      const { data: content } = await axios.get(fileURL);
      /* Return the file content */
      return content;
    }
  })();

  /* Register provider for the "gists" schema */
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'gists',
      contentProvider
    )
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
