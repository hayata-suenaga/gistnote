import * as vscode from 'vscode';
import { Credential } from './credentials';
import { TreeDataProvider } from './treeDataProvider';
import { TextDocumentContentProvider } from './documentContentProvider';
import { createNewGist } from './gistsCreator';

/* Extension is activated open invocation of any of the commands or display of gists tree view */
export async function activate(context: vscode.ExtensionContext) {
  const credential = new Credential();
  await credential.init(context);

  /* Register document content provider for the "gists" schema */
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'gistSchema',
      new TextDocumentContentProvider()
    )
  );

  /* Register tree data provider for gists explorer */
  const treeDataProvider = new TreeDataProvider(credential);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('gists', treeDataProvider)
  );

  /* Open a specified gist file as a virtual document in the editor */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gistNote.openGist',
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
    vscode.commands.registerCommand('gistNote.refreshGists', () => {
      treeDataProvider.refresh();
    })
  );

  /* Create a new public gist that holds a file with the selected text as its content */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gistNote.createPublicGist',
      async (uri: vscode.Uri | undefined) => {
        let githubClient = await credential.getGithubClient();
        if (githubClient === null) {
          return;
        }
        await createNewGist(githubClient, uri, true);
        treeDataProvider.refresh();
      }
    )
  );

  /* Create a new secrete gist that holds a file with the selected text as its content */
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'gistNote.createSecreteGist',
      async (uri: vscode.Uri | undefined) => {
        const githubClient = await credential.getGithubClient();
        if (githubClient === null) {
          return;
        }
        await createNewGist(githubClient, uri, false);
        treeDataProvider.refresh();
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
