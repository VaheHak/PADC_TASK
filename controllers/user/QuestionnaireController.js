const _ = require("lodash");
const Promise = require('bluebird');
const httpError = require('http-errors');
const {successHandler, errorHandler} = require("../../utils/responseHandlers");
const {
	created, updated, nothing_updated, deleted, nothing_deleted, already_answered_question, no_such_question
} = require("../../utils/resMessage");
const Validate = require("../../services/validate");
const Users = require("../../models/user");
const Questionnaire = require("../../models/questionnaire");
const Questions = require("../../models/questions");
const {getPagination, getPagingData} = require("../../services/pagination");
const Answers = require("../../models/answers");
const sequelize = require("../../services/pool");
const UsersAndQuestionnaire = require("../../models/usersAndQuestionnaire");

const pageSize = 15;

class QuestionnaireController {

	static async getQuestionnaires(req, res, next) {
		try {
			await Validate(req.query, {
				page: 'integer|min:1',
			})
			const {page = 1} = req.query;

			const {limit, offset} = getPagination(page, pageSize);

			await Questionnaire.findAndCountAll({
				include: [{
					model: Questions,
					as: 'questions',
					required: false,
					include: [{
						model: Answers,
						as: 'questionAnswer',
						required: false,
						attributes: ['id', 'answer', 'trueAnswer'],
						include: [{
							model: Users,
							as: 'answerUser',
							required: false,
							attributes: ['id', 'firstName', 'lastName'],
						}],
					}],
				}, {
					model: Users,
					as: 'questionnaireUser',
					required: false,
					attributes: ['id', 'firstName', 'lastName']
				}, {
					model: Users,
					as: 'questionnaireUsers',
					required: false,
					attributes: ['id', 'firstName', 'lastName',
						[sequelize.literal(`(
						SELECT COUNT(*) FROM Answers AS userAnswers INNER JOIN Questionnaire as userQuestionnaire 
						ON userAnswers.questionnaireId = userQuestionnaire.id 
						WHERE userAnswers.trueAnswer = 1 AND userAnswers.questionnaireId = userQuestionnaire.id 
						AND userAnswers.userId = questionnaireUsers.id
						)`), 'rightAnswers']
					],
				}],
				offset: offset,
				limit: limit,
				distinct: true,
			}).then((data) => {
				const result = getPagingData(data, page, limit);
				const questionnaire = successHandler('ok', result);
				return res.json(questionnaire);
			}).catch((err) => {
				return res.status(500).json({errors: err.message});
			});
		} catch(e) {
			next(e);
		}
	}

	static async postQuestionnaire(req, res, next) {
		try {
			await Validate(req.body, {
				title: 'required|string|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
				number: 'required|integer|min:1',
				questions: 'required|array|length:30,1',
				'questions.*.question': 'required|string|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
				'questions.*.answers': 'required|array|length:4,1',
				'questions.*.answers.*': 'required|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
				'questions.*.trueAnswer': 'required|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
			})

			const {title, number, questions} = req.body;

			await Questionnaire.create({title, number, userId: req.userId}).then(async (v) => {
				await Promise.map(questions, async (d) => {
					return await Questions.create({
						question: d.question, answers: d.answers, trueAnswer: d.trueAnswer, questionnaireId: v.id,
					});
				})
			});

			const result = successHandler(created);
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async postAnswer(req, res, next) {
		try {
			await Validate(req.body, {
				questionnaireId: 'required|integer|min:1',
				answers: 'required|array|minLength:1',
				'answers.*.questionId': 'required|integer|min:1',
				'answers.*.answer': 'required|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
			})
			const {questionnaireId, answers} = req.body;

			const create = await Promise.map(answers, async (d) => {
				const answer = await Answers.findOne({where: {questionId: d.questionId, userId: req.userId}});
				if(answer){
					const result = errorHandler(already_answered_question, {answer});
					throw httpError(422, result);
				}

				return await Questions.findByPk(d.questionId).then(async (v) => {
					if(_.isEmpty(v)){
						const result = errorHandler(no_such_question, {question: v});
						throw httpError(422, result);
					}
					return await Answers.create({
						questionId: d.questionId,
						answer: d.answer,
						questionnaireId: v.questionnaireId ? v.questionnaireId : null,
						trueAnswer: v.trueAnswer.toString() === d.answer.toString(),
						userId: req.userId,
					});
				})
			})

			await UsersAndQuestionnaire.create({questionnaireId, userId: req.userId});

			const result = successHandler(created, create);
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async putQuestionnaire(req, res, next) {
		try {
			await Validate(req.body, {
				id: 'required|integer|min:1',
				title: 'string|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
				number: 'integer|min:1',
				questions: 'array|length:30,1',
				'questions.*.id': 'integer|min:1',
				'questions.*.question': 'string|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
				'questions.*.answers': 'array|length:4,1',
				'questions.*.answers.*': 'regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
				'questions.*.trueAnswer': 'regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
			})

			const {id, title, number, questions} = req.body;

			let update = {};
			if(title){
				update.title = title
			}
			if(number){
				update.number = number
			}

			const questionnaire = await Questionnaire.update({...update}, {where: {id}});

			let questionsResult;
			if(!_.isEmpty(questions)){
				questionsResult = await Promise.map(questions, async (d) => {
					if(d.id){
						let qUpdate = {};
						if(d.question){
							update.question = d.question
						}
						if(d.answers){
							update.answers = d.answers
						}
						if(d.trueAnswer){
							update.trueAnswer = d.trueAnswer
						}
						return await Questions.update({...qUpdate}, {where: {id: d.id}});
					} else{
						return await Questions.create({
							question: d.question, answers: d.answers, trueAnswer: d.trueAnswer, questionnaireId: id,
						});
					}
				})
			}

			const result = _.get(questionnaire, 0) === 0 && (_.isEmpty(questionsResult) || _.get(questionnaire, 0) === 0)
				? errorHandler(nothing_updated) : successHandler(updated, {questionnaire, questionsResult});
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async putAnswer(req, res, next) {
		try {
			await Validate(req.body, {
				id: 'required|integer|min:1',
				answer: 'required|regex:[a-zA-Zа-яА-ЯёЁա-ֆԱ-Ֆև0-9 ]$',
			})
			const {id, answer} = req.body;

			let update = {};
			if(answer){
				update.answer = answer;
			}
			const r = await Answers.update({...update}, {where: {id}});

			const result = _.get(r, 0) === 0 ? errorHandler(nothing_updated) : successHandler(updated, r);
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async deleteQuestionnaire(req, res, next) {
		try {
			await Validate(req.params, {
				id: 'required|integer|min:1',
			});

			const {id} = req.params;

			const remove = await Questionnaire.destroy({
				where: {id}, limit: 1,
			});

			const result = remove === 0 ? errorHandler(nothing_deleted) : successHandler(deleted);
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async deleteQuestion(req, res, next) {
		try {
			await Validate(req.params, {
				id: 'required|integer|min:1',
			});

			const {id} = req.params;

			const remove = await Questions.destroy({
				where: {id}, limit: 1,
			});

			const result = remove === 0 ? errorHandler(nothing_deleted) : successHandler(deleted);
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

	static async deleteAnswer(req, res, next) {
		try {
			await Validate(req.params, {
				id: 'required|integer|min:1',
			});

			const {id} = req.params;

			const remove = await Answers.destroy({
				where: {id}, limit: 1,
			});

			const result = remove === 0 ? errorHandler(nothing_deleted) : successHandler(deleted);
			res.json(result);
		} catch(e) {
			next(e);
		}
	}

}

module.exports = QuestionnaireController;
