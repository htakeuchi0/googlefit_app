const { google } = require('googleapis');

/**
 * OAuth2.0に関する情報を管理するクラス．
 */
class OAuth2 {
	/**
	 * 初期化をする．
	 */
	constructor() {
		const clientkey = require('../config/clientsecret.json');

		this.oauth2client = new google.auth.OAuth2(
			clientkey.installed.client_id,
			clientkey.installed.client_secret,
			clientkey.installed.redirect_uris[0],
		);

		this.token = null;
	}

	/**
	 * アクセストークンを設定する．
	 *
	 * @param token アクセストークン
	 */ 
	setToken(token) {
		this.token = token;
	}

	/** アクセストークンを返す． */
	getToken() {
		return this.token;
	}

	/** OAuth2.0クライアントを返す． */
	getOauth2client() {
		return this.oauth2client;
	}
}

module.exports = new OAuth2();
