const {Model, DataTypes} = require('sequelize');
const db = require("../services/pool");

class UsersAndQuestionnaire extends Model {

}

UsersAndQuestionnaire.init({
	id: {
		type: DataTypes.BIGINT.UNSIGNED,
		autoIncrement: true,
		primaryKey: true,
	},
}, {
	sequelize: db,
	tableName: 'usersAndQuestionnaire',
	modelName: 'usersAndQuestionnaire',
});

module.exports = UsersAndQuestionnaire;
