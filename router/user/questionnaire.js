const express = require('express');
const router = express.Router();

const xApiKey = require("../../middlewares/apiKey");
const userType = require("../../middlewares/permission");

// Controllers
const QuestionnaireController = require('../../controllers/user/QuestionnaireController');

//GET
router.get('/user/questionnaires', xApiKey, userType['validateUser'], QuestionnaireController.getQuestionnaires);
router.get('/user/myQuestionnaires', xApiKey, userType['validateUser'], QuestionnaireController.getMyQuestionnaires);

//POST
router.post('/user/questionnaire', xApiKey, userType['validateUser'], QuestionnaireController.postQuestionnaire);
router.post('/user/answer', xApiKey, userType['validateUser'], QuestionnaireController.postAnswer);

//PUT
router.put('/user/questionnaire', xApiKey, userType['validateUser'], QuestionnaireController.putQuestionnaire);
router.put('/user/answer', xApiKey, userType['validateUser'], QuestionnaireController.putAnswer);

//PUT
router.delete('/user/questionnaire/:id', xApiKey, userType['validateUser'], QuestionnaireController.deleteQuestionnaire);
router.delete('/user/question/:id', xApiKey, userType['validateUser'], QuestionnaireController.deleteQuestion);
router.delete('/user/answer/:id', xApiKey, userType['validateUser'], QuestionnaireController.deleteAnswer);

module.exports = router;
