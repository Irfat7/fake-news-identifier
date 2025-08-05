const express = require("express")
const router = express.Router()
const { signin, signup, verifyToken, verify } = require("../controllers/authController")
const { createUserValidator, signinValidator } = require("../validators/userValidators")
const validate = require('../middlewares/validate')
const { signinRateLimit, signupRateLimit } = require("../middlewares/rateLimiter")

router.post("/signin", signinRateLimit, signinValidator, validate, signin);
router.post("/signup", signupRateLimit, createUserValidator, validate, signup);
router.get("/verify/:token", verifyToken);
router.get("/verify-token/", verify);

module.exports = router