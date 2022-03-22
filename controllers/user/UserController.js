const _ = require("lodash");
const HttpError = require('http-errors');
const jwt = require("jsonwebtoken");
const {v4} = require('uuid');
const {successHandler, errorHandler} = require("../../utils/responseHandlers");
const {
	login_error, login, check_registration, registration_checked, email_err, user_exist_err, error_message_refreshToken,
	not_authenticate, user_not_verified, check_forgot, password_changed, pass_already_changed,
} = require("../../utils/resMessage");
const Validate = require("../../services/validate");
const Users = require("../../models/user");
const SendMail = require("../../services/nodemailer");

const {JWT_SECRET, JWT_REFRESH_SECRET} = process.env;

class UserController {

	static async profile(req, res, next) {
		try {
			const user = await Users.findByPk(req.userId);

			const myAccount = successHandler('ok', user);
			res.json(myAccount);
		} catch(e) {
			next(e);
		}
	}

	static async login(req, res, next) {
		try {
			await Validate(req.body, {
				email: 'required|email',
				password: 'required|minLength:8|maxLength:20',
			})

			const {email, password} = req.body;

			const user = await Users.findOne({where: {email, verifyStatus: 'activated'}});

			if(!user || !Users.passwordCheck(password, user.getDataValue('password'))){
				throw HttpError(403, login_error);
			}

			let accessToken, refreshToken;
			if(!_.isEmpty(user)){
				accessToken = jwt.sign({userId: user.id, role: user.role}, JWT_SECRET, {expiresIn: '1h'});
				refreshToken = jwt.sign({userId: user.id, role: user.role}, JWT_REFRESH_SECRET, {expiresIn: '7d'});
				await Users.update({checked: true, refreshToken}, {
					where: {id: user.id}
				});
			}

			const result = successHandler(login, {tokens: {accessToken, refreshToken}, user: user});
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async resetToken(req, res, next) {
		try {
			await Validate(req.body, {
				refreshToken: 'required|string',
			})
			const {refreshToken} = req.body;

			const user = await Users.findOne({where: {refreshToken}});

			if(!refreshToken || !user){
				const error = errorHandler(error_message_refreshToken)
				return res.json(error);
			}

			jwt.verify(refreshToken, JWT_REFRESH_SECRET, void 0, async (err, data) => {
				if(!err){
					const user = await Users.findByPk(data.userId);
					if(_.isEmpty(user)){
						const error = errorHandler(not_authenticate);
						return res.status(401).json(error);
					}
					if(user.deletedAt){
						const error = errorHandler(user_exist_err);
						return res.status(401).json(error);
					}

					const accessToken = jwt.sign({userId: data.userId, role: data.role}, JWT_SECRET, {expiresIn: '1h'});
					const refToken = jwt.sign({userId: user.id, role: user.role}, JWT_REFRESH_SECRET, {expiresIn: '7d'});
					await Users.update({refreshToken: refToken}, {where: {id: user.id}});

					const result = successHandler("ok", {accessToken, refreshToken: refToken})
					return res.json(result);
				} else{
					throw HttpError(401, {status: false, errors: not_authenticate, data: null});
				}
			});
		} catch(e) {
			next(e);
		}
	}

	static async register(req, res, next) {
		try {
			const {firstName, lastName, email, password} = req.body;
			await Validate(req.body, {
				firstName: 'string|required|alpha|minLength:1|maxLength:20',
				lastName: 'string|required|alpha|minLength:1|maxLength:20',
				email: 'required|email',
				password: 'required|minLength:8|maxLength:20',
			})

			const uniqueEmail = await Users.findOne({where: {email}})
			if(uniqueEmail){
				return res.status(422).json({errors: {email: email_err}});
			}

			const activationCode = v4();

			const user = await Users.create({
				firstName, lastName, email, password, activationCode,
			});

			await SendMail('Verification', {firstName, lastName, activationCode}, 'Email Verification', email);

			const result = successHandler(check_registration, user)
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async checkRegistration(req, res, next) {
		try {
			await Validate(req.body, {
				activationCode: 'required|string',
			});

			const {activationCode} = req.body;

			const user = await Users.findOne({where: {activationCode}});

			if(user){
				await Users.update({verifyStatus: 'activated'}, {where: {id: user.id}});

				const result = successHandler(registration_checked)
				return res.json(result);
			}

			const result = errorHandler(user_exist_err)
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async forgotPassword(req, res, next) {
		try {
			await Validate(req.body, {
				email: 'required|email',
			});

			const {email} = req.body;

			const user = await Users.findOne({where: {email}});

			if(user && user.getDataValue('verifyStatus') !== "activated"){
				const error = errorHandler(user_not_verified);
				return res.status(422).json(error);
			}

			if(user){
				const activationCode = v4();
				await Users.update({activationCode, forgotStatus: 'pending'}, {where: {email}});

				await SendMail('ResetPassword', {user, email, activationCode}, 'Email Confirmation', email);

				const result = successHandler(check_forgot);
				return res.json(result);
			}

			const error = errorHandler(user_exist_err);
			res.status(200).json(error);
		} catch(e) {
			next(e);
		}
	}

	static async forgotChangePassword(req, res, next) {
		try {
			await Validate(req.body, {
				activationCode: 'required|string',
				password: 'required|minLength:8|maxLength:20',
			});
			const {activationCode, password} = req.body;
			const user = await Users.findOne({where: {activationCode}});

			if(user){
				if(user.getDataValue('forgotStatus') !== 'pending'){
					const error = errorHandler(pass_already_changed);
					return res.status(200).json(error);
				}

				await Users.update({password, forgotStatus: 'activated'}, {where: {id: user.id}});

				const result = successHandler(password_changed);
				return res.json(result);
			}

			const error = errorHandler(user_exist_err);
			res.status(200).json(error);
		} catch(e) {
			next(e);
		}
	}

}

module.exports = UserController;
