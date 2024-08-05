const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");
const router = express.Router();

router.post(
  "/sign-up",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 8 }),
    body("username").trim().isLength({ min: 5 }),
  ],
  authController.signup
);

router.post("/sign-in", authController.signin);

router.post(
  "/reset-password",
  [
    body("email")
      .isEmail()
      .withMessage("Please provided a valid emaill address")
      .normalizeEmail(),
  ],
  authController.resetPassword
);

router.put(
  "/change-password",
  [body("password").trim().isLength({ min: 8 })],
  authController.changePassword
);

module.exports = router;
