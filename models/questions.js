const {Model, DataTypes} = require('sequelize');
const db = require("../services/pool");
const Questionnaire = require("./questionnaire");

class Questions extends Model {

}

Questions.init({
	id: {
		type: DataTypes.BIGINT.UNSIGNED,
		autoIncrement: true,
		primaryKey: true,
	},
	question: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
	},
	answers: {
		type: DataTypes.JSON,
		allowNull: true,
	},
	trueAnswer: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
	},
}, {
	sequelize: db,
	tableName: 'questions',
	modelName: 'questions',
});

Questions.belongsTo(Questionnaire, {
	foreignKey: {
		name: 'questionnaireId',
		allowNull: false,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'questionnaire',
});
Questionnaire.hasMany(Questions, {
	foreignKey: {
		name: 'questionnaireId',
		allowNull: false,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'questions'
});

module.exports = Questions;
