var express = require('express');
var router = express.Router();

const oauth2 = require('./oauth2')

/** データアクセス対象 */
const scope = [ 'https://www.googleapis.com/auth/fitness.body.write' ];

/** OAuth2.0設定用URL */
const oauthUrl = oauth2.getOauth2client().generateAuthUrl({
	access_type: 'offline',
    prompt: 'consent',
	scope: scope
});

router.get('/', function(req, res, next) {
	if (!req.query.code) {
		// コードが指定されなかった場合はコード入力用画面を表示
		res.render('auth', { title: 'OAuth Authorization', oauthUrl: oauthUrl } );
	}
	else {
		// コードを取得
		var code = req.query.code.trim()
		console.log('CODE: ' + code)

		// OAuth2.0クライアントを取得．
		const oauth2Client = oauth2.getOauth2client();

		// アクセストークンを取得してアプリ内に保存．
		oauth2Client.getToken(code, (err, tokens) => {
			if (err) {
				console.error('Failed to get token.');
				return next(err);
			}

			oauth2Client.credentials = tokens;
			
			console.log('CREDENTIALS: ')
			console.log(oauth2Client.credentials);

			// アクセストークンを保存
			access_token = oauth2Client.credentials.access_token
			oauth2.setToken(access_token);

			res.redirect('/');
		});
	}
});

module.exports = router;
