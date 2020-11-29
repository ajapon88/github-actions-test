const core = require('@actions/core');
const github = require('@actions/github');

try {
    // check event
    if (github.event != 'issue_comment' && github.event.issue.pull_request == null) {
        core.setOutput("triggerd", false);
        return
    }
    // check trigger phrase
    const triggerPhrase = core.getInput('trigger-phrase');
    if (github.event.comment.body.match(triggerPhrase) == null) {
        core.setOutput("triggerd", false);
        return
    }
    // get pull request
    const githubToken = core.getInput('github-token');
    const octokit = github.getOctokit(githubToken)
    const { data: pullRequest } = octokit.pulls.get({
        owner: github.repository_owner,
        repo: github.event.repository.name,
        pull_number: github.event.issue.number
    });
    // set outputs
    core.setOutput("triggerd", true);
    core.setOutput("number", github.event.issue.number);
    core.setOutput("comment_body", github.event.comment.body);
    core.setOutput("user", github.event.comment.user.login);
    core.setOutput("ref", pullRequest.head.ref);
    core.setOutput("sha", pullRequest.head.sha);
    core.setOutput("title", pullRequest.title);
    core.setOutput("description", pullRequest.body);
} catch (error) {
    core.setFailed(error.message);
}
