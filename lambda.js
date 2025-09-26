import 'dotenv/config.js';
import { getThreadParticipants } from './github-helpers.mjs';
import { sendMessageToSlack } from './slack.mjs';
import { findSlackMemberIdByGithubUsername } from './users.mjs';

export const handler = async function (event, context, callback) {
    console.log('🔔 Incoming request:', event.rawPath, event.requestContext?.http?.method);

    const headers = event.headers || {};
    const githubEvent = headers['x-github-event'] || headers['X-GitHub-Event'];
    const payload = JSON.parse(event.body || '{}');
    const actionType = payload.action ?? '';

    console.log(`🔔 Received GitHub event ${githubEvent} with action type ${actionType}`);

    // Only care about new PR comments
    if (
        !(githubEvent === 'issue_comment' || githubEvent === 'pull_request_review_comment') ||
        actionType !== 'created'
    ) {
        const msg = 'Webhook received but no processing needed (not a PR comment).';
        console.log(msg);
        return { statusCode: 200, body: msg };
    }

    const comment = payload.comment;
    const commentAuthor = comment?.user?.login;
    const commentBody = comment?.body;
    let participants = [];
    let prAuthor = '';

    if (githubEvent === 'issue_comment') {
        prAuthor = payload.issue?.user?.login;
        console.log(`💬 Comment on PR by ${commentAuthor}: "${commentBody}"`);
        console.log(`📝 Pull request author: ${prAuthor}`);
    }

    if (githubEvent === 'pull_request_review_comment') {
        prAuthor = payload.pull_request?.user?.login;
        console.log(`💬 Root review comment by ${commentAuthor}: "${commentBody}"`);
        console.log(`📝 Pull request author: ${prAuthor}`);
    }

    // ✅ Reply in a thread
    if (comment?.in_reply_to_id) {
        console.log(`↩️ Reply in thread by ${commentAuthor}: "${commentBody}"`);
        console.log(`📝 Pull request author: ${prAuthor}`);
        const owner = payload.repository.owner.login;
        const repo = payload.repository.name;
        const pullNumber = payload.pull_request.number;
        const inReplyToId = comment.in_reply_to_id;

        participants = await getThreadParticipants(owner, repo, pullNumber, inReplyToId);
    }

    // Add PR author & comment author
    participants.push(prAuthor, commentAuthor);

    // Remove duplicates
    participants = [...new Set(participants)];

    // Remove Copilot & the comment author
    const participantsToRemove = ['Copilot', commentAuthor];
    participants = participants.filter((p) => !participantsToRemove.includes(p));
    console.log('👥 Thread participants:', participants);

    // Send Slack messages
    const slackCommentAuthorMemberId = findSlackMemberIdByGithubUsername(commentAuthor);
    const prCommentLink = comment.html_url;

    for (const participant of participants) {
        const sendToMember = findSlackMemberIdByGithubUsername(participant);
        const middleSentence =
        participant === prAuthor ? 'your PR' : 'a PR you are involved in';
        const message = `<@${slackCommentAuthorMemberId}>-san commented on ${middleSentence}: ${prCommentLink}`;
        console.log(`➡️ Sending Slack message to ${participant}: "${message}"`);
        await sendMessageToSlack(sendToMember, message);
    }

    return { statusCode: 200, body: 'Webhook processed successfully' };
};
