const {Model, DataTypes} = require('sequelize');
const db = require("../services/pool");
const Questions = require("./questions");
const Users = require("./user");
const Questionnaire = require("./questionnaire");

class Answers extends Model {

}

Answers.init({
	id: {
		type: DataTypes.BIGINT.UNSIGNED,
		autoIncrement: true,
		primaryKey: true,
	},
	answer: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
	},
	trueAnswer: {
		type: DataTypes.BOOLEAN,
		allowNull: true,
	},
}, {
	sequelize: db,
	tableName: 'answers',
	modelName: 'answers',
});

Answers.belongsTo(Questionnaire, {
	foreignKey: {
		name: 'questionnaireId',
		allowNull: true,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'answerQuestionnaire',
});
Questionnaire.hasMany(Answers, {
	foreignKey: {
		name: 'questionnaireId',
		allowNull: true,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'questionnaireAnswer'
});

Answers.belongsTo(Questions, {
	foreignKey: {
		name: 'questionId',
		allowNull: false,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'answerQuestion',
});
Questions.hasMany(Answers, {
	foreignKey: {
		name: 'questionId',
		allowNull: false,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'questionAnswer'
});

Answers.belongsTo(Users, {
	foreignKey: {
		name: 'userId',
		allowNull: true,
	},
	onUpdate: 'cascade',
	onDelete: 'set null',
	as: 'answerUser',
});
Users.hasMany(Answers, {
	foreignKey: {
		name: 'userId',
		allowNull: true,
	},
	onUpdate: 'cascade',
	onDelete: 'set null',
	as: 'userAnswers'
});

module.exports = Answers;
