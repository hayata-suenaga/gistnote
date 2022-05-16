import * as vscode from 'vscode';

class Person {
  name: string;
  children: Person[];
  constructor(name: string, children: Person[] = []) {
    this.name = name;
    this.children = children;
  }
}

export const treeDataProvider = new (class
  implements vscode.TreeDataProvider<Person>
{
  people = [
    new Person('Tom', [
      new Person('Tom1.1'),
      new Person('Tom1.2', [new Person('Tom2.1')]),
    ]),
    new Person('Alex'),
  ];

  getTreeItem(person: Person): vscode.TreeItem {
    const collapsibleState: vscode.TreeItemCollapsibleState =
      person.children.length === 0
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed;

    return new vscode.TreeItem(person.name, collapsibleState);
  }

  getChildren(person?: Person): vscode.ProviderResult<Person[]> {
    if (person === undefined) {
      return this.people;
    }
    return person.children;
  }
})();

// export default treeDataProvider;
