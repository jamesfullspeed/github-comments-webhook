# Github Webhook that Receives Comments from Pull Requests

## Installation
 - Clone the repository `git clone https://github.com/jamesfullspeed/github-comments-webhook`
 - Create an .env file in the root directory of the project with contents PORT, GITHUB_TOKEN, and SLACK_USER_OAUTH_TOKEN
   - For GITHUB_TOKEN, create it in [Github Tokens](https://github.com/settings/tokens) and generate a classic token
 - For running locally, an Ngrok account and auth token is needed
   - Go to [Ngrok Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken) page to get a token
   - Once a auth token has been generated, enter `ngrok config edit` in terminal to paste the new token
 - Slack token can be obtained [in here](https://api.slack.com/apps/A03S4BNU0V8/oauth)
 - Run in the terminal in the root directory of the cloned project `npm install`

## Running the App Locally
 - First, open a terminal and locate the root directory of the project
 - Then run `node server.js`
 - Then open another terminal and run `ngrok http 3000` where port 3000 is the value specified in .env for PORT
 - Check if the app is accessible in the browser using the Ngrok URL example `https://SOME-RANDOM-STRING.ngrok-free.dev/` where it should display the text "Webhooks for Github Only!"

## Creating a Webhook on Github
 - To be able to send comments/reviews data from a PR, go to the Repository of the project you want this webhook app to be attached
  - Go to the Settings -> Webhooks of that repository, example: `https://github.com/XXX/YYY/settings/hooks` where `XXX` is the Github user (your username) while `YYY` is the repository name
  - Click the "Add Webhook" button and in the Payload URL, enter the Ngrok URL provided `https://SOME-RANDOM-STRING.ngrok-free.dev/github-comments-webhook` if using locally or provide the URL if deployed somewhere else
  - For content-type, select "application/json"
  - For triggers, select individual events and then check "Issue comments" and "Pull request review comments"
  - Then click "Add webhook" button at the bottom to activate the webhook
  - To test, add a test comment on a pull request of the repository where the webhook was created and you should see in the "Recent Deliveries" of that webhook the results (should be 200)

## Events, Properties, and Methods Defined in server.js
 - Under the endpoint `/github-comments-webhook`, there are only two events taken into consideration
   - Event `issue_comment` is an event where a user comments on a pull request in the "Conversation" tab
   - Event `pull_request_review_comment` is an event where a user comments on a pull request in the "Files changed" tab
 - A helper function `getThreadParticipants` is implemented to get all the users involved if the comment is already a thread (comment that has more than 1 participant)

## Sending Data to Slack
 - Same [document can be followed to add scripts](https://docs.google.com/document/d/1GPw_LqtUUgLY49YQMEA7TtkWmdtfkvtxK3uDbY-j1YU/edit?tab=t.0#heading=h.jfnl7lpq69if) to process the data and then send to slack
 - The slack usernames will be the same but it should be matched now with Github usernames instead of Bitbucket

## Sample JSON Files
 - The sample JSON files in this repository are example of data sent by Github to the NodeJS webhook app