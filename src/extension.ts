import { Credential } from './Credential';
import * as vscode from 'vscode';
import * as path from 'path';
import { TreeDataProvider } from './TreeDataProvider';
import { TextDocumentContentProvider } from './DocumentContentProvider';

/* Extension is lazily activated open invocation of any of the commands */
export async function activate(context: vscode.ExtensionContext) {
  const credential = new Credential(context);
  const githubClient = await credential.getGithubClient();

  /* Register provider for the "gists" schema */
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'gistSchema',
      new TextDocumentContentProvider()
    )
  );

  /* Register tree data provider for gists explorer */
  const treeDataProvider = new TreeDataProvider(githubClient);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('gists', treeDataProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gistsBrowser.openGist',
      async (fileURL: string) => {
        /* Get the uri of the document to be provided */
        const uri = vscode.Uri.parse(`gistSchema:${fileURL}`);
        /* Fetch the content and open the document */
        const doc = await vscode.workspace.openTextDocument(uri);
        /* Show the read only document */
        await vscode.window.showTextDocument(doc, { preview: false });
      }
    )
  );

  /* Command for fetching updated list of gists for the authenticated user */
  context.subscriptions.push(
    vscode.commands.registerCommand('gistsBrowser.refreshGists', () => {
      treeDataProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('gistsBrowser.test', async () => {
      vscode.window.showInformationMessage('Test');
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
