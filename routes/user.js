const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("config");
const _ = require("lodash");
const { User } = require("../models/users");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/register", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");
  user = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: await bcrypt.hash(req.body.password, 10),
  });
  try {
    await user.save();
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
     "fdas"
    );
    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(user, ["_id", "name", "email"]));
  } catch (err) {
    console.log("error: ", err);
  }
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.send("this user doesn't exists in the database!");
  res.send(user);
});


router.post("/login", async (req, res) => {

  if (req.user) return res.send("User already logged in!");
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validpassword = await bcrypt.compare(req.body.password, user.password);
  if (!validpassword) return res.status(400).send("invalid email or password");

  const token = jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    "fdas"
  );
  res.header("x-auth-token").send(token);
});

module.exports = router;