const Users = require("../models/user");
const Questionnaire = require("../models/questionnaire");
const Questions = require("../models/questions");
const Answers = require("../models/answers");
const UsersAndQuestionnaire = require("../models/usersAndQuestionnaire");

async function main() {
	const models = [
		Users,
		Questionnaire,
		Questions,
		Answers,
		UsersAndQuestionnaire,
	]

	for(const i in models){
		if(models.hasOwnProperty(i)){
			console.log('--->', i)
			await models[i].sync({alter: true});
		}
	}
	process.exit();
}

main().then(r => console.log(r-- > 'Done')).catch(e => console.log(e));
