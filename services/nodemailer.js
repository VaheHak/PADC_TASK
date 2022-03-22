const nodemailer = require('nodemailer');
const templates = require('./templates');

const {
	NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASS, NODEMAILER_SECURE
} = process.env;

const transporter = nodemailer.createTransport({
	host: NODEMAILER_HOST,
	port: NODEMAILER_PORT,
	secure: NODEMAILER_SECURE === 'true',
	auth: {
		user: NODEMAILER_USER,
		pass: NODEMAILER_PASS,
	},
	tls: {
		ciphers: 'SSLv3',
		rejectUnauthorized: false
	}
});

const SendMail = (template, {...params}, subject, to) => {
	const html = templates[template](params);
	transporter.sendMail({
		from: `"Test" <${ NODEMAILER_USER }>`,
		to,
		subject,
		text: html,
		html,
	});
};

module.exports = SendMail;
