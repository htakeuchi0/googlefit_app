const admin = require('firebase-admin');
const request = require('request')

// Google Fit
const { google } = require('googleapis');
const fitness = google.fitness('v1');

// OAuth 2.0関連
const oauth2 = require('./oauth2')

/** データソースID */
var dataSourceId = null;

/**
 * FirebaseのRealtime DBにデータが追加されたときの処理を定義する．
 */
function setHook() {
	// Firebaseの設定
	const serviceAccount = require('../config/firebase.json');

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
		databaseURL: `https:\/\/${serviceAccount.project_id}.firebaseio.com`
	});

	const db = admin.database()
	const ref = db.ref('fitness-test/log');

	// FirebaseのRealtime DBにデータが追加されたときの処理を定義
	var weight = null;
	ref.on('child_added', (snapshot, prevChildKey) => {
		// 体重 [kg] を取得．
		var record = snapshot.val();
		weight = record['weight'];

		console.log(`Add weight: ${weight}`);
		console.log(`dataSourceId: ${dataSourceId}`)

		// 一つ前のデータを削除
		if (prevChildKey != null) {
			var logRef = ref.child(prevChildKey);
			logRef.set(null);
		}

		// データソースを作成
		createDataSource(oauth2.getToken()).then((value) => {
			// データソースを作成しなかった場合はnull
			if (value == null) {
				return;
			}

			// データソースが作成できなかった場合はエラーメッセージを出力
			if (dataSourceId == null) {
				console.error('An unexpected error has been occurred. (data source is null)\n')
				return;
			}

			console.log(`Add weight: ${weight} to the data source`);

			// データセットを追加
			createDataSets(weight).then(() => {
				console.log('Successed.\n');	
			}).catch((error) => {
				console.error('Failed to regist dataset to Google Fit.\n')
				console.error(error);
			});
		}).catch((error) => {
			console.error(error);
		});
	}, (err) => {
		console.error('Failed to read data');
		console.error(err);
	});
}

/**
 * データソースを追加する．
 *
 * @param access_token アクセストークン
 */
function createDataSource(access_token) {
	// アクセストークンが指定されなかった場合は何もせず終了．
	if (access_token == null) {
		return new Promise((resolve, reject) => {
			console.log('Access token is null.')
			resolve(null);
		})
	}

	// データソースの定義
	var param = {
		dataStreamName: 'WeightDataSource',
		type: 'derived',
		application: {
			detailsUrl: 'http://192.168.10.6:3000',
			name: 'Weight management application with Google Nest Hub',
			version: '1'
		},
		dataType: {
			field: [{
				name: 'weight',
				format: 'floatPoint'
			}],
			name: 'com.google.weight'
		},
		device: {
			manufacturer: 'Google',
			model: 'Google Nest Hub',
			type: 'tablet',
			uid: '1000001',
			version: '1'
		}
	}

	// ヘッダ
	var headers = {
		Authorization: `Bearer ${access_token}`,
		'Content-Type': 'application/json; encoding=utf-8'
	}

	// リクエストのオプション
	var options = {
		method: 'POST',
		json: true,
		headers: headers,
		url: 'https://www.googleapis.com/fitness/v1/users/me/dataSources',
		body: param
	}

	// 作成処理の実行
	return new Promise((resolve, reject) => {
		request(options, (err, res, body) => {
			if (err) {
				return reject(err)
			}

			if ('dataStreamId' in body) {
				// データソースが作成できた場合は，dataStreamIdから取得．
				console.log('Data source created.')
				dataSourceId = body.dataStreamId
			}
			else if (('error' in body) && body.error.code == 409) {
				// 既にデータソースが存在している場合は，エラーメッセージをパースする．
				console.log('Data source has been already created.')
				var message = body.error.message
				dataSourceId = message.match(/Data Source: (.*) already exists/)[1]
			}
			else {
				// それ以外の状況は想定していない．
				console.log('An unexpected error has been occurred.')
			}
			return resolve(body)
		})
	});
}

/**
 * データセットを追加する．
 *
 * @param weight 体重
 */
function createDataSets(weight) {
	// 開始時刻
	var start = (new Date().getTime() - 1) * 1000000;

	// 終了時刻
	var end = new Date().getTime() * 1000000;

	// 登録
	return new Promise((resolve, reject) => {
		var params = {
			auth: oauth2.getOauth2client(),
			userId: 'me',
			dataSourceId: dataSourceId,
			datasetId: `${start}-${end}`,
			resource: {
				dataSourceId: dataSourceId,
				maxEndTimeNs: end,
				minStartTimeNs: start,
				point: [{
					dataTypeName: 'com.google.weight',
					endTimeNanos: end,
					originDataSourceId: '',
					startTimeNanos: start,
					value: [{
						fpVal: weight
					}]
				}]
			}
		};
		
		fitness.users.dataSources.datasets.patch(params, (err) => {
			if (err) {
				return reject(err);
			}
		
			return resolve();
		});
	});
}

module.exports = setHook
