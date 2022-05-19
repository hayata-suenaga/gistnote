import { Octokit } from '@octokit/rest';
import * as vscode from 'vscode';
import { getFileName } from './utils';

export const createNewGist = async (
  githubClient: Octokit,
  uri: vscode.Uri | undefined,
  isPublic: boolean
) => {
  const editor = vscode.window.activeTextEditor;

  if (editor === undefined) {
    vscode.window.showErrorMessage(
      'To use this command, please open an editor and select a text'
    );
    return;
  }

  const content = editor.document.getText(editor.selection);

  console.log('content:', content);

  if (!content) {
    vscode.window.showErrorMessage('Please select a text');
    return;
  }

  const description = await vscode.window.showInputBox({
    placeHolder: 'optional',
    prompt: 'Optional gist description',
  });

  const fileName = await vscode.window.showInputBox({
    /* Show current file name as placeholder */
    placeHolder: getFileName(uri),
    prompt: 'Give name for the gist file',
  });

  if (!fileName) {
    vscode.window.showErrorMessage(
      'Please give a file name to create a new gist'
    );
    return;
  }

  await githubClient.gists.create({
    description,
    files: { [fileName]: { content } },
    public: isPublic,
  });

  vscode.window.showInformationMessage('New gist was created');
};
