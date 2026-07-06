const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../utils/validators");

const router = express.Router();

router.post("/signup", validate("signup"), authController.signup);
router.post("/verify-otp", validate("verifyOtp"), authController.verifyOtp);
router.post("/verify-phone-update", requireAuth, validate("onboardingStep"), authController.submitOnboardingStep);
router.post("/complete-signup", requireAuth, validate("completeSignup"), authController.completeSignup);
router.post("/refresh-token", validate("refreshToken"), authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.getMe);

module.exports = router;
