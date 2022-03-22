const jwt = require('jsonwebtoken');
const httpError = require('http-errors');
const {not_auth} = require("../utils/resMessage");
const {JWT_SECRET} = process.env;

const EXCLUDE = [
	['/user/signin', ['POST', 'GET']],
	['/refresh/token', ['POST', 'GET']],
	['/user/signup', ['POST', 'GET']],
	['/user/signup/verify', ['POST', 'GET']],
	['/forgot', ['POST', 'GET']],
	['/forgot/check', ['POST', 'GET']],
];

function authorization(req, res, next) {
	try {
		const {authorization} = req.headers;
		const {path, method} = req;
		for ( let i = 0; i < EXCLUDE.length; i++ ){
			if ((EXCLUDE[i][0] === path && EXCLUDE[i][1].includes(method)) || method === 'OPTIONS'){
				next();
				return;
			}
		}
		let token;
		if (authorization){
			token = authorization.replace('Bearer ', '');
		} else{
			throw httpError(401, not_auth);
		}
		jwt.verify(token, JWT_SECRET, void 0, (err, data) => {
			if (!err){
				req.userId = data.userId;
				req.role = data.role;
				next();
			} else{
				throw httpError(401, not_auth);
			}
		});
	} catch (e) {
		next(e);
	}
}

module.exports = authorization;
