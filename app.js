require('dotenv').config()

const line = require('@line/bot-sdk');
const express = require('express');
// const ngrok = require("ngrok");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});
const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error("Error handling events:", err); // エラーをキャッチしてログ出力
      res.status(500).send(err);
    });
});

const userStates = {}; // ユーザーの状態を保持するオブジェクト

async function handleEvent(event) {
  const userId = event.source.userId; // ユーザーIDを取得

  // 初期状態設定: 「帰ります」が押された場合、選択状態を初期化
  if (event.type === 'message' && event.message.text === '帰ります') {
    userStates[userId] = { hasResponded: false }; // 状態をリセット
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

  if (event.type === 'postback') {
    if (userStates[userId]?.hasResponded) {
      return Promise.resolve(null); // 既に応答済みの場合は何もしない
    }

    userStates[userId] = { hasResponded: true }; // 応答済み状態に設定

    // postbackデータを確認してメッセージを送信
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
  }

  return Promise.resolve(null); // その他のメッセージが来た場合は無視
}


const port = process.env.PORT || 3000;
app.listen(port, async () => {
  try {
    console.log(`listening on port ${port}!`);
    // const ngrokUrl = await ngrok.connect(port);
    // console.log(`Ngrok URL: ${ngrokUrl}/webhook`);
  } catch (error) {
    console.error("Error while connecting with ngrok:", error);
  }
});
