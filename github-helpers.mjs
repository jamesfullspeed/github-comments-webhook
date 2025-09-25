import 'dotenv/config.js';            // Loads environment variables
import { Octokit } from '@octokit/rest';

// Authenticated GitHub client
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function getThreadParticipants(owner, repo, pullNumber, inReplyToId) {
  // 1. Get the root comment (the one being replied to)
  const { data: rootComment } = await octokit.pulls.getReviewComment({
    owner,
    repo,
    comment_id: inReplyToId,
  });

  // 2. Get all review comments for this PR
  const { data: comments } = await octokit.pulls.listReviewComments({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  // 3. Filter replies belonging to this thread
  const threadReplies = comments.filter(
    (c) => c.in_reply_to_id === inReplyToId
  );

  // 4. Collect all participants (root + replies)
  const allUsers = [
    rootComment.user.login,
    ...threadReplies.map((c) => c.user.login),
  ];

  // 5. Deduplicate
  return [...new Set(allUsers)];
}