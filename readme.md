# Github Webhook that Receives Comments from Pull Requests

## Installation
 - Clone the repository `git clone https://github.com/jamesfullspeed/github-comments-webhook`
 - Create an ENV file with contents PORT and GITHUB_TOKEN
   - For GITHUB_TOKEN, create it in [Github Tokens](https://github.com/settings/tokens) and generate a classic token
 - For running locally, an Ngrok account and auth token is needed
   - Go to [Ngrok Authtoken](https://dashboard.ngrok.com/get-started/your-authtoken) page to get a token
   - Once a auth token has been generated, enter `ngrok config edit` in terminal to paste the new token
 - Run in the root directory of the cloned project `npm install`

## Running the App Locally
 - First, open a terminal and locate the root directory of the project
 - Then run `node server.js`
 - Then open another terminal and run `ngrok http 3000` where port 3000 is the value specified in .env for PORT