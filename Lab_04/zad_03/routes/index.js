const { User, hashPassword, checkPassword, generateToken } = require("../db");

var express = require("express");
var router = express.Router();

router.post("/login", async function (req, res, next) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Body must contain: email, password.");
  }

  let user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    return res
      .status(404)
      .send("User with email " + req.body.email + " was not found");
  }

  if (!(await checkPassword(user, req.body.password))) {
    return res.status(401).send("Incorrect password");
  }

  return res.status(200).json({
    token: generateToken(user),
  });
});

router.post("/register", async function (req, res, next) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Body must contain: email, password.");
  }

  let user = await User.findOne({ where: { email: req.body.email } });

  if (user) {
    return res.status(409).send("User with that email already exists");
  }

  user = await User.create({
    email: req.body.email,
    password: await hashPassword(req.body.password),
  });

  return res.status(201).json({
    id: user.id,
  });
});

module.exports = router;
