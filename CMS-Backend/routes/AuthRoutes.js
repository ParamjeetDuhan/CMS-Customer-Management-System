const express = require("express");
const router = express.Router();

const {SignUp, Login } = require('../controllers/AuthController');

router.post("/CustomerSignUp",SignUp );
router.post("/CustomerLogin",Login);

module.exports = router;