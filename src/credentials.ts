import * as vscode from 'vscode';
import * as Octokit from '@octokit/rest';

const GITHUB_PROVIDER_ID = 'github';

export class Credential {
  private githubClient: Octokit.Octokit | undefined;

  constructor(context: vscode.ExtensionContext) {
    (async () => {
      this.registerSessionListener(context);
      await this.initializeGitHubClient();
    })();
  }

  async initializeGitHubClient() {
    /* Get the session if available. Even if session is not available, don't make user login at this point. */
    const session = await vscode.authentication.getSession(
      GITHUB_PROVIDER_ID,
      ['gist'],
      {
        createIfNone: false,
      }
    );

    /* If there is available session, initialize github client using the access token. Otherwise, leave the client uninitialized */
    this.githubClient = session
      ? new Octokit.Octokit({ auth: session.accessToken })
      : undefined;
  }

  registerSessionListener(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.authentication.onDidChangeSessions(async event => {
        if (event.provider.id !== GITHUB_PROVIDER_ID) {
          return;
        }
        /* If the state of github session changes, re-initialize github client */
        await this.initializeGitHubClient();
      })
    );
  }

  async getGithubClient(): Promise<Octokit.Octokit> {
    /* If the client is already available, return it */
    if (this.githubClient) {
      return this.githubClient;
    }

    /* If the client is not available, make the user login and get a session */
    const session = await vscode.authentication.getSession(
      GITHUB_PROVIDER_ID,
      ['gist'],
      {
        createIfNone: true,
      }
    );

    /* Using the created session, initialize a github client */
    this.githubClient = new Octokit.Octokit({ auth: session.accessToken });

    /* Return the newly initialized github client */
    return this.githubClient;
  }
}
