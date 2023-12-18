const jwt = require("jsonwebtoken");
const SECRET = "clave";
const generateToken = function (payload) {
  const token = jwt.sign({ payload }, SECRET, { expiresIn: "2h" });
  return token;
};

function validateToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, validateToken };
