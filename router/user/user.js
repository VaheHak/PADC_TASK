const express = require('express');
const router = express.Router();

const {Limiter, SpeedLimiter} = require("../../services/limiters");
const xApiKey = require("../../middlewares/apiKey");
const userType = require("../../middlewares/permission");

// Controllers
const UserController = require('../../controllers/user/UserController');

//GET
router.get('/profile', xApiKey, userType['validateUser'], UserController.profile);

//POST
router.post('/user/signin', xApiKey, new Limiter, new SpeedLimiter, UserController.login);
router.post('/refresh/token', xApiKey, new Limiter, new SpeedLimiter, UserController.resetToken);
router.post('/user/signup', xApiKey, new Limiter, new SpeedLimiter, UserController.register);
router.post('/user/signup/verify', xApiKey, new Limiter, new SpeedLimiter, UserController.checkRegistration);
router.post('/forgot', xApiKey, new Limiter, new SpeedLimiter, UserController.forgotPassword);
router.post('/forgot/check', xApiKey, new Limiter, new SpeedLimiter, UserController.forgotChangePassword);

module.exports = router;
