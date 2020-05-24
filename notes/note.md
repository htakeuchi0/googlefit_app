# 開発ノート

## 概要

本アプリケーション開発のノートです．    
サーバアプリケーションの作成は初めてなので，所見を残しておきます．

開発環境は以下のとおりです．
* OS: Ubuntu 18.04.4 LTS 

## 準備

以下の要領で Node.js と npm をインストールしました．

```
#!/bin/bash
sudo apt install -y nodejs
sudo apt install -y npm

sudo npm cache clean
sudo npm install -g n

sudo n latest

sudo apt purge -y nodejs
sudo apt purge -y npm
sudo apt autoremove -y
exec $SHELL -l
```

apt で入手できる Node.js のバージョンが古いため，npm 経由で入れ直しました．    
不要となった apt 上の nodejs と npm は完全に削除しました．

次に，express-generator を使って，プロジェクトを用意しました．    
よいディレクトリ構成がわからなかったため，参考のために利用しました．

```
#!/bin/bash
if [ ! -e googlefit_app ]; then
	sudo npm install express-generator -g
	express --view=pug googlefit_app

	cd googlefit_app
	sudo npm init
	cd ..
fi

cd googlefit_app
sudo npm install express --save
sudo npm install firebase-admin --save
sudo npm install googleapis --save
sudo npm install request --save
sudo npm install
cd ..
```

`express googlefit_app` とすると，デフォルトが `--view=jade` ですが，    
deprecated とのことなので，pug で作り直しました．

なお，Node.js の v12.14.0 をインストールした Synology の    
DiskStation Manager (DSM) 上で `npm init` を実行すると zlib 関連のエラーが出ます．    
DSM上でそのコマンドを実行する必要はなさそうなので，特に問題はないようです．

逆に，DSM の Node.js のデフォルトのバージョンは8なので，    
バージョン12をインストールする必要があります．

なお，本アプリケーションで利用している request も deprecated なので，    
今後実装を修正予定です．

`npm init` では，以下のように入力しました．

```
version: (0.0.0) 
description: Weight management application with Google Nest Hub
entry point: (app.js) 
git repository: 
keywords: 
author: htakeuchi0
license: (ISC) 
```

## 実装

[README.md](../README.md) の参考文献 [2] のとおりですが，    
以下の点を変更しています．

サーバアプリケーションは，ホームネットワークの Synology 上で動くため，    
OAuth 2.0 authorize は起動後に別PCから行う想定となります．    
この場合，OAuth 2.0 authorization 完了後に localhost にリダイレクトできないため，    
out of band (oob) を利用して authorize を行う方式を採用しています． 
  
データソースはアプリケーション内で作成することにしています．    
既に存在する場合は409エラーが返されるので，    
エラーメッセージをパースすることで，データソースIDが得られます．    
この目的のための Google APIs Node.js Client のうまい使い方がわからなかったため，    
直接リクエストを投げています．

## 備考

mochimochi はサーバ名です．

