const express = require("express");
const router = express.Router();
const { generateToken, validateToken } = require("../config/envs");
var cookieParser = require("cookie-parser");
router.use(cookieParser());

function validateUser(req, res, next) {
  const token = req.cookies.token;
  console.log("token-----------------", token);
  const { payload } = validateToken(token);
  console.log("payload-----------------", payload);
  req.user = payload;

  if (payload) return next();

  res.sendStatus(401);
}

module.exports = { validateUser };
