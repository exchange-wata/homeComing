require('dotenv').config()

const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});
const app = express();

const userState = {}

const getUserState = (userId) => userState[userId].hasResponded

const resetUserState = (userId) => {
  userState[userId] = { hasResponded: false }
}

const setActiveUserState = (userId) => {
  userState[userId] = { hasResponded: true }
}

async function handleEvent(event) {
  const userId = event.source.userId

  switch (event.type) {
    case 'message':
      return handleMessageEvent(event, userId)
    case 'postback':
      return handlePostbackEvent(event, userId)
    default:
      return Promise.resolve(null);
  }
}

async function handleMessageEvent(event, userId) {
  if (event.message.text === '帰ります') {
    resetUserState(userId)

    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{
        type: 'template',
        altText: 'お弁当が必要ですか？',
        template: {
          type: 'confirm',
          text: 'お弁当が必要ですか？',
          actions: [
            { label: 'はい', type: 'postback', data: 'needed=true' },
            { label: 'いいえ', type: 'postback', data: 'needed=false' },
          ],
        },
      }]
    });
  }

  return Promise.resolve(null);
}

async function handlePostbackEvent(event, userId) {
  if (getUserState(userId)) {
    return Promise.resolve(null);
  }

  setActiveUserState(userId)
  const postbackData = event.postback.data;
  if (postbackData.includes('needed')) {
    const selected = postbackData.replace('needed=', '')
    // FIXME: 判定方法
    const responseMessage = selected === 'true'
      ? 'お弁当が要ります！'
      : 'お弁当は不要です。';

    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: responseMessage,
        }
      ]
    });
  }
  return Promise.resolve(null);
}

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error("Error handling events:", err);
      res.status(500).send(err);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  try {
    console.log(`listening on port ${port}!`);
  } catch (error) {
    console.error("Error while connecting with ngrok:", error);
  }
});

module.exports = { app, client, handleEvent }
