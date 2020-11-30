const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        // debug
        const debug = core.getInput('debug').toLowerCase() == 'true';
        if (debug) {
            console.log(JSON.stringify(github, null, 2));
        }
        const payload = github.context.payload;
        // check event
        if (payload.eventName != 'issue_comment' && payload.issue.pull_request == null) {
            core.setOutput("triggerd", false);
            return
        }
        // check trigger phrase
        const triggerPhrase = core.getInput('trigger-phrase');
        if (payload.comment.body.match(triggerPhrase) == null) {
            core.setOutput("triggerd", false);
            return
        }
        // get pull request
        const githubToken = core.getInput('github-token');
        const octokit = github.getOctokit(githubToken);
        const { data: pullRequest } = await octokit.pulls.get({
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            pull_number: payload.issue.number
        });
        if (debug) {
            console.log(JSON.stringify(pullRequest, null, 2));
        }
        // set outputs
        core.setOutput("triggerd", true);
        core.setOutput("number", payload.issue.number);
        core.setOutput("comment_body", payload.comment.body);
        core.setOutput("user", payload.comment.user.login);
        core.setOutput("ref", pullRequest.head.ref);
        core.setOutput("sha", pullRequest.head.sha);
        core.setOutput("title", pullRequest.title);
        core.setOutput("description", pullRequest.body);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
