## 概要
LineBotのコードです。

## 仕様
1. ユーザーの「帰ります」というメッセージ送信がトリガー
2. 「お弁当が必要ですか？」というYes/Noの質問表示
  3. Yes→「お弁当が要ります！」表示
  4. No→「お弁当は不要です」表示

## ローカル実行
※ ngrokをIP固定して使います。
```bash
# それぞれを同時に実行する
ngrok http --url=<domain> <port>

npm run start
```

## 背景
父が仕事からの帰宅時に、帰宅の旨と次の日のお弁当の有無を連絡してくるため、その連絡を自動化してみようと思った。

## インフラ構成
coming soon....

## 実行内容
・月〜木パターン

![スクリーンショット 2024-11-05 16 15 58](https://github.com/user-attachments/assets/30055c16-f474-4645-b9b1-4a4bbcc57391)

・金曜パターン

![スクリーンショット 2024-11-08 16 50 13](https://github.com/user-attachments/assets/13bafbfc-e209-4f4f-bc9c-56521731594e)
