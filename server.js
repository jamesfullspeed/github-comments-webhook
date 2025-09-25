require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const { getThreadParticipants } = require("./github-helpers");

// Middleware to parse JSON payloads
app.use(express.json());

app.get("/", (req, res) => {
  console.log("Home page accessed");
  return res.status(200).send("Webhooks for Github Only!");
});

// Webhook endpoint
app.post("/github-comments-webhook", async (req, res) => {
  const event = req.headers["x-github-event"]; // e.g. "issue_comment" or "pull_request_review_comment"
  const payload = req.body;

  console.log(`🔔 Received GitHub event: ${event}`);

  if (event === "issue_comment") {
    console.log(payload);
    const commentAuthor = payload.comment?.user?.login;
    const prAuthor = payload.issue?.user?.login;
    const commentBody = payload.comment?.body;

    console.log(`💬 Comment on PR by ${commentAuthor}: "${commentBody}"`);
    console.log(`📝 Pull request author: ${prAuthor}`);
  }

  if (event === "pull_request_review_comment") {
    console.log(payload);
    const comment = payload.comment;
    const commentAuthor = comment?.user?.login;
    const prAuthor = payload.pull_request?.user?.login;
    const commentBody = comment?.body;

    // ✅ This is a reply in a review thread
    if (comment.in_reply_to_id) {
      console.log(`↩️ Reply in thread by ${commentAuthor}: "${commentBody}"`);
      console.log(`📝 Pull request author: ${prAuthor}`);

      // Fetch all participants of this comment thread
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const pullNumber = payload.pull_request.number;
      const inReplyToId = comment.in_reply_to_id;

      // This is to get the users who previously involved to this thread
      const participants = await getThreadParticipants(owner, repo, pullNumber, inReplyToId);
      console.log("👥 Thread participants:", participants);
      
    } else {
      // ✅ This is a root review comment
      console.log(`💬 Root review comment by ${commentAuthor}: "${commentBody}"`);
      console.log(`📝 Pull request author: ${prAuthor}`);
    }
  }

  // Respond to GitHub
  res.status(200).send("Webhook received");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Webhook listener running on http://localhost:${PORT}`);
});