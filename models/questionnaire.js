const {Model, DataTypes} = require('sequelize');
const db = require("../services/pool");
const Users = require("./user");

class Questionnaire extends Model {

}

Questionnaire.init({
	id: {
		type: DataTypes.BIGINT.UNSIGNED,
		autoIncrement: true,
		primaryKey: true,
	},
	title: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
	},
	number: {
		type: DataTypes.INTEGER,
		allowNull: true,
		trim: true,
	},
}, {
	sequelize: db,
	tableName: 'questionnaire',
	modelName: 'questionnaire',
});

Questionnaire.belongsTo(Users, {
	foreignKey: {
		name: 'userId',
		allowNull: false,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'questionnaireUser',
});
Users.hasMany(Questionnaire, {
	foreignKey: {
		name: 'userId',
		allowNull: false,
	},
	onUpdate: 'cascade',
	onDelete: 'cascade',
	as: 'userQuestionnaire'
});

module.exports = Questionnaire;
