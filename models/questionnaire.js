const {Model, DataTypes} = require('sequelize');
const db = require("../services/pool");
const Users = require("./user");
const UsersAndQuestionnaire = require("./usersAndQuestionnaire");

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

Questionnaire.belongsToMany(Users, {
	through: UsersAndQuestionnaire,
	as: "questionnaireUsers",
	foreignKey: {
		name: 'questionnaireId',
		allowNull: true,
	},
	onUpdate: 'cascade',
	onDelete: 'SET NULL',
});
Users.belongsToMany(Questionnaire, {
	through: UsersAndQuestionnaire,
	as: "userQuestionnaires",
	foreignKey: {
		name: 'userId',
		allowNull: true,
	},
	onUpdate: 'cascade',
	onDelete: 'SET NULL',
});

module.exports = Questionnaire;
