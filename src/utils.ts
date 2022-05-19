import { Uri } from 'vscode';

export const getFileName = (uri: Uri | undefined) => {
  if (uri === undefined) return '';
  uri.fsPath.split('/').pop();
};
