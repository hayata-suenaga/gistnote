import * as vscode from 'vscode';
const axios = require('axios').default;

class GistTreeItem extends vscode.TreeItem {
  gist: Gist;

  constructor(gist: Gist) {
    super(getGistDescription(gist), vscode.TreeItemCollapsibleState.Collapsed);
    this.gist = gist;
  }

  getFiles() {
    return Object.values(this.gist.files);
  }
}

class FileTreeItem extends vscode.TreeItem {
  constructor(file: File) {
    const command: vscode.Command = {
      command: 'gistsBrowser.openGist',
      title: 'open',
      arguments: [file.raw_url],
    };

    super(file.filename, vscode.TreeItemCollapsibleState.None);
    this.command = command;
  }
}

export class TreeDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  gists: Gist[] = [];

  /* Constructor takes an array of gists return from the GitHub Gist api endpoint */
  constructor() {
    (async () => {
      this.gists = await getPublicGists();
      this.refresh();
    })();
  }

  /* Because custom TreeItem extends vscode.TreeItem, it can be returned without any modification */
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  /* Tree has the height of two level. getChildren is only invoked for the root */
  getChildren(
    gistTreeItem?: GistTreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    /* When invoked on the root, return an array of GistTreeItems */
    if (gistTreeItem === undefined) {
      return this.gists.map((gist: Gist) => new GistTreeItem(gist));
    }

    /* When invoked on a GistTreeItem, return an array of FileTreeItems that represent files in the gist */
    return gistTreeItem.getFiles().map(file => new FileTreeItem(file));
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined | null | void
  > = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<
    vscode.TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  async refresh() {
    this.gists = await getPublicGists();
    this._onDidChangeTreeData.fire();
  }
}

const getGistDescription = (gist: Gist): string => {
  const description =
    !gist.description || !gist.description.trim()
      ? Object.values(gist.files)[0]
        ? Object.values(gist.files)[0].filename
        : 'Gist with no title'
      : gist.description;

  return description;
};

const getPublicGists = async () => {
  const { data: gists } = await axios.get(
    'https://api.github.com/gists/public'
  );

  return gists;
};
