import axios from 'axios';
import 'dotenv/config.js';

// See .env or create it using value from https://api.slack.com/apps/A03S4BNU0V8/oauth?
const SLACK_USER_OAUTH_TOKEN = process.env.SLACK_USER_OAUTH_TOKEN
const headersObj = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${SLACK_USER_OAUTH_TOKEN}`
}

/**
 * Sends message to Slack using axios
 *
 * @param channel
 * @param message
 * @returns {Promise<any>}
 */
const sendMessageToSlack = async (channel, message) => {
    try {
        const response = await axios.post('https://slack.com/api/chat.postMessage', {
            channel: channel, // Replace with your channel ID
            text: message, // Replace with your message
            as_user: true
        }, {
            headers: headersObj
        })
        //console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error sending message to Slack:', error.message)
        throw error
    }
}

export {
    sendMessageToSlack
}