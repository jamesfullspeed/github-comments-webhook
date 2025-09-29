import 'dotenv/config.js'; // Loads environment variables
import express from 'express';
import { getThreadParticipants } from './github-helpers.mjs';
import { sendMessageToSlack } from './slack.mjs';
import { findSlackMemberIdByGithubUsername } from './users.mjs';
import { appendRow } from "./sheets.mjs";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON payloads
app.use(express.json());

app.get('/', (req, res) => {
  console.log('Home page accessed');
  return res.status(200).send('Webhooks for Github Only!');
});

// Webhook endpoint
app.post('/github-comments-webhook', async (req, res) => {
  const event = req.headers['x-github-event']; // e.g. "issue_comment" or "pull_request_review_comment"
  const payload = req.body;
  const actionType = payload.action ?? ''; // e.g. "created", "edited", "deleted"

  console.log(`🔔 Received GitHub event ${event} with action type ${actionType}`);

  // We only care about new comments (created) in pull requests
  if (
    (event !== 'issue_comment' || event !== 'pull_request_review_comment') &&
    (actionType !== 'created')
  ) {
    const noActionMessage = `Webhook received but no additional processing needed because it is not a PR comment.`
    console.log(noActionMessage);
    return res
      .status(200)
      .send(noActionMessage);
  }

  console.log(payload)
  const comment = payload.comment;
  const commentAuthor = comment?.user?.login;
  const commentBody = comment?.body;
  let participants = []
  let prAuthor = '';
  if (event === 'issue_comment') {
    prAuthor = payload.issue?.user?.login;
    console.log(`💬 Comment on PR by ${commentAuthor}: "${commentBody}"`);
    console.log(`📝 Pull request author: ${prAuthor}`);
  }
  if (event === 'pull_request_review_comment') {
    prAuthor = payload.pull_request?.user?.login;
    const commentBody = comment?.body;
    console.log(`💬 Root review comment by ${commentAuthor}: "${commentBody}"`);
    console.log(`📝 Pull request author: ${prAuthor}`);
  }
  // ✅ This is a reply in a review thread
  if (comment.in_reply_to_id) {
    console.log(`↩️ Reply in thread by ${commentAuthor}: "${commentBody}"`);
    console.log(`📝 Pull request author: ${prAuthor}`);
    // Fetch all participants of this comment thread
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const pullNumber = payload.pull_request.number;
    const inReplyToId = comment.in_reply_to_id;
    // This is to get the users who were previously involved in this thread
    participants = await getThreadParticipants(owner, repo, pullNumber, inReplyToId);
  }
  // Add to the participants the PR author and the comment author
  participants.push(prAuthor);
  participants.push(commentAuthor); // For testing
  // Remove duplicates
  participants = [...new Set(participants)];
  // Remove Copilot and the comment author because we do not want to notify them in Slack
  //const participantsToRemove = ['Copilot', commentAuthor]
    const participantsToRemove = ['Copilot']
  participants = participants.filter(item => !participantsToRemove.includes(item))
  console.log('👥 Thread participants:', participants);

  // Send Slack message to users involved
  const slackCommentAuthorMemberId = findSlackMemberIdByGithubUsername(commentAuthor)
  const prCommentLink = comment.html_url
  participants.forEach(async (participant) => {
    const sendToMember = findSlackMemberIdByGithubUsername(participant)
    const middleSentence = (participant == prAuthor) ? 'your PR' : 'a PR you are involved in'
    const message = `<@${slackCommentAuthorMemberId}>-san commented on ${middleSentence}: ${prCommentLink}`
    console.log(`➡️ Sending Slack message to ${participant}: "${message}"`);
    await sendMessageToSlack(sendToMember, message)
  });

  // Append to Google Sheets
  // Attempt to create the ticket link
  const jiraTicketCodeMatch = payload.issue.title.match(/\[([A-Z]{2}-\d+)\]/);
  const jiraTicketCode = jiraTicketCodeMatch ? jiraTicketCodeMatch[1] : '';
  let jiraUrl = '';
  if (jiraTicketCode.length > 0) {
    jiraUrl = `https://for-it.atlassian.net/browse/${jiraTicketCode}`;
  }
  // Call appendRow function in sheets.mjs
  await appendRow({
    Date: new Date().toISOString().split('T')[0],
    Flags: '',
    Ticket: jiraUrl,
    'Pull Request': payload.issue.html_url ? payload.issue.html_url : '',
    Author: prAuthor,
    Comment: `${prCommentLink}\n${commentBody}`,
    Points: 0,
    Commenter: commentAuthor
  })

  // Respond to GitHub
  res.status(200).send('Webhook received');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Webhook listener running on http://localhost:${PORT}`);
});