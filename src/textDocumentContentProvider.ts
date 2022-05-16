import * as vscode from 'vscode';
const axios = require('axios').default;

/* Create a content provider for "gists" schema */
export const textDocumentContentProvider = new (class
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

// export default textDocumentContentProvider;
