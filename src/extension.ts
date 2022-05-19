import { Credential } from './credentials';
import * as vscode from 'vscode';
import { TreeDataProvider } from './treeDataProvider';
import { TextDocumentContentProvider } from './documentContentProvider';
import { createNewGist } from './gistsCreator';

/* Extension is activated open invocation of any of the commands or display of gists browser */
export async function activate(context: vscode.ExtensionContext) {
  const credential = new Credential(context);
  const githubClient = await credential.getGithubClient();

  /* Register document content provider for the "gists" schema */
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

  /* Open a specified gist file as a virtual document in the editor */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gistsBrowser.openGist',
      async (fileURL: string) => {
        /* Get the uri of the document to be displayed */
        const uri = vscode.Uri.parse(`gistSchema:${fileURL}`);
        /* Fetch the content and open the document */
        const doc = await vscode.workspace.openTextDocument(uri);
        /* Show the read only document */
        await vscode.window.showTextDocument(doc, { preview: false });
      }
    )
  );

  /* Fetch updated list of gists for the authenticated user */
  context.subscriptions.push(
    vscode.commands.registerCommand('gistsBrowser.refreshGists', () => {
      treeDataProvider.refresh();
    })
  );

  /* Create a new public gist that holds a file with the selected text as its content */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gistsBrowser.createPublicGist',
      async (uri: vscode.Uri | undefined) => {
        await createNewGist(githubClient, uri, true);
        treeDataProvider.refresh();
      }
    )
  );

  /* Create a new secrete gist that holds a file with the selected text as its content */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gistsBrowser.createSecreteGist',
      async (uri: vscode.Uri | undefined) => {
        await createNewGist(githubClient, uri, false);
        treeDataProvider.refresh();
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
