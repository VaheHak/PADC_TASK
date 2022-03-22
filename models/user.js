const {Model, DataTypes} = require('sequelize');
const bcrypt = require('bcrypt');
const md5 = require('md5');
const db = require("../services/pool");

class Users extends Model {

	static passwordHash = (pass) => {
		return bcrypt.hashSync(md5(pass + '_test_'), 12);
	}

	static passwordCheck = (pass, hash) => {
		return bcrypt.compareSync(md5(pass + '_test_'), hash);
	}
}

Users.init({
	id: {
		type: DataTypes.BIGINT.UNSIGNED,
		autoIncrement: true,
		primaryKey: true,
	},
	firstName: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: true,
		unique: 'email',
	},
	password: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
		set(val) {
			this.setDataValue('password', Users.passwordHash(val))
		},
		get() {
			return undefined;
		}
	},
	role: {
		type: DataTypes.ENUM('1', '2'),
		allowNull: false,
		defaultValue: '2',
	},
	activationCode: {
		type: DataTypes.UUID,
		allowNull: true,
		unique: 'active_code',
		trim: true,
		get() {
			return undefined;
		},
	},
	verifyStatus: {
		type: DataTypes.ENUM('pending', 'activated'),
		allowNull: false,
		defaultValue: 'pending',
		get() {
			return undefined;
		}
	},
	refreshToken: {
		type: DataTypes.STRING,
		allowNull: true,
		trim: true,
		get() {
			return undefined;
		}
	},
	forgotStatus: {
		type: DataTypes.ENUM('pending', 'activated'),
		allowNull: true,
		get() {
			return undefined;
		},
	},
}, {
	sequelize: db,
	tableName: 'users',
	modelName: 'users',
	paranoid: true,
});

module.exports = Users;
