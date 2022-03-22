const express = require('express');
const router = express.Router();

const user = require('./user/user');
const questionnaire = require('./user/questionnaire');

router.use('/', user);
router.use('/', questionnaire);

module.exports = router;
