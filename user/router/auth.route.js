const express = require("express");
const router = express.Router();

const authController = require("../controller/auth.controller");
const authValidator = require("../validator/auth.validator");

const { verifyJWTToken } = require("../../middleware/jwt.middleware");
const limiteRewuest = require("../../middleware/limited.request.middleware");

router.post("/signup", limiteRewuest, authValidator.signUp, authController.signUp);
router.post("/login", authValidator.login, authController.login);
router.post("/send/otp", authValidator.sendOtp, authController.sendOtp);
router.patch("/verify/otp", authValidator.verifyOtp, authController.verifyOtp);
router.put("/change/password", authValidator.changePassword, verifyJWTToken, authController.changePassword);
router.patch("/forgot/password/verify/otp", authValidator.forgetPasswordVerifyOtp, authController.forgetPasswordVerifyOtp);
router.put("/reset/password", authValidator.resetPassword, verifyJWTToken, authController.resetPassword);

module.exports = router;
