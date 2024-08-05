const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await new User({
      username: username,
      email: email,
      password: hashedPassword,
    }).save();
    res
      .status(201)
      .json({ message: "User was successfully created!", userId: user._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A User with this email could not be found!");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong Password");
      error.statusCode = 401;
      throw error;
    }
    const token = await jwt.sign(
      { email: user.email, userId: user._id },
      "idvbkjrvbuivbrkjs23kjcrw",
      { expiresIn: "2h" }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not Found!");
      error.statusCode = 404;
      throw error;
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "http://localhost:3000/",
      port: 587,
      secure: false,
      auth: {
        user: "artakartakyan2@gmail.com",
        pass: "pzeu shvr xolj oiwl",
      },
    });
    transporter.sendMail({
      from: "Artak Botoian <artakartakyan2@gmail.com>",
      to: email,
      subject: "Reset Password Request",
      html: `<div><h2>You requested a password request</h2><a href="http://localhost:3000/reset-password/${user._id.toString()}">Please Click this link!</a><p>NOTE: If you have not requested the password request, please ignore this email!</p></div>`,
    });
    return res
      .status(200)
      .json({ message: `Reset password link was sent to ${email}` });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  const password = req.body.password;
  const userId = req.body.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not Found!");
      error.statusCode = 404;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      message: `The password of ${user.email} was successfully changed!`,
      userId: userId,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
