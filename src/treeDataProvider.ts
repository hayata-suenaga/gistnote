import * as vscode from 'vscode';

class TreeItem extends vscode.TreeItem {
  children?: { [key: string]: File };

  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    children?: { [key: string]: File }
  ) {
    super(label, collapsibleState);
    this.children = children;
  }
}

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  gists: Gist[];

  /* Constructor takes an array of gists return from the GitHub Gist api endpoint */
  constructor(gists: Gist[]) {
    this.gists = gists;
  }

  /* Because custom TreeItem extends vscode.TreeItem, it can be returned without any modification */
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  /* Tree has the height of two level. getChildren is only invoked for the root */
  getChildren(gist?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    /* When invoked on the root, return an array of gist, each of which is wrapped by TreeItem */
    if (gist === undefined) {
      return this.gists.map((gist: Gist) => {
        console.log('file:', Object.values(gist.files)[0]);
        const description =
          !gist.description || !gist.description.trim()
            ? Object.values(gist.files)[0]
              ? Object.values(gist.files)[0].filename
              : 'Gist with no title'
            : gist.description;

        return new TreeItem(
          description,
          vscode.TreeItemCollapsibleState.Collapsed,
          gist.files
        );
      });
    }
    /* When a gist doesn't have any file, return an empty array */
    if (gist.children === undefined) {
      return [];
    }
    /* Get files in a gist, wrap each of them by TreeItem, and return an array of these wrapped files */
    return Object.values(gist.children).map(
      file => new TreeItem(file.filename, vscode.TreeItemCollapsibleState.None)
    );
  }
}
