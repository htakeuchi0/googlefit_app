# Google Nest Hub による体重管理のためのサーバアプリケーション

## 概要

[1, 2] を参考に作成した，Google Nest Hub に体重の登録を呼びかけるだけで，
Google Fit に体重データを追加できるようにするための，サーバアプリケーションです．

ホームネットワーク上の Synology DiskStation 上で動かすことを目標にしています．

* サーバ: Synology DiskStation (DS218), DSM 6.2.2-24922 Update 2
* Node: v12.14.0
* IPアドレス: 192.168.10.6

このアプリケーションは，[2] で解説されているような，
事前に作成した Firebase の Realtime DB に体重データが追加されると，
Google Fit にそのデータを反映する機能をもちます．

## 準備

以下の準備が終わっているものとします．

* Firebase のプロジェクトを作成し，Realtime DB に以下の形式で格納できるようルールを設定する．
  * `/fitness-test/log/$key/weight`: 0以上200未満の数値 
* IFTTT の "Say a phrase with a number" の Webhook で，
  Google Assistant から Firebase の DB に体重が登録できるようにする．
* Firebase アプリの秘密鍵を生成して `config/firebase.json` に保存する．
  * https://firebase.google.com/docs/admin/setup?authuser=0
* `Google APIs>認証情報>認証情報を作成>OAuth クライアントID` から
  `デスクトップ アプリ` 向けの認証情報を作成し，`config/clientsecret.json` に保存する．

## 使いかた

ソースコード一式を Synology DiskStation に配置し，アプリケーションを実行します．

たとえば，`./bin/www` の絶対パスを `/path/to/bin/www` とすると，
`コントロール パネル>タスク スケジューラー>作成>予約タスク>ユーザー指定のスクリプト` から，
タスク設定のユーザー指定のスクリプトに `node /path/to/bin/www` と記入し，
適当な時間に実行されるように設定すればよいです．

アプリケーションを実行したら，同じネットワーク内のPCから
`http://192.168.10.6:3000` にアクセスします．

このアプリケーションは OAuth 2.0 による authorinzation が必要です．
同一ネットワーク内のPCのブラウザから `http://192.168.10.6:3000/auth` にアクセスすると
設定用のページが表示されます．

このページは，`http://192.168.10.6:3000` にもリンクをはっています．

一度 authorization ができれば，
あとは Google Nest Hub に事前に設定したキーワードとともに体重の登録を呼びかけるだけです．

## 備考

開発ノートは，[ノート](./notes/node.md) に残しています．

## 参考文献
[1] Google Home から音声で Google Fit にアクティビティを追加する１（Firebase・IFTTT 編）, http://mid0111.hatenablog.com/entry/2017/12/23/131954 , 閲覧: 2020/5/24.
[2] Google Home から音声で Google Fit にアクティビティを追加する２（nodejs・Google Fit 編）, http://mid0111.hatenablog.com/entry/2017/12/23/132048 , 閲覧: 2020/5/24.
