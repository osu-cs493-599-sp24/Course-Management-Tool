const jwt = require("jsonwebtoken");
const secretKey = "SuperSecret";

exports.generateAuthToken = function (userId, userAdmin) {
  const payload = {
    sub: userId,
    admin: userAdmin
  };
  return jwt.sign(payload, secretKey, { expiresIn: "24h" });
};

exports.requireAuthentication = function (req, res, next) {
  const authHeader = req.get("Authorization") || "";
  const authHeaderParts = authHeader.split(" ");
  const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub
    req.admin = payload.admin
    next()
  } catch (e) {
      res.status(401).send({
          error: "Non-valid token"
      })
  }
};