const express = require('express');
const router  = express.Router();
const bcrypt = require("bcryptjs");
const { users, findUser } = require("../helpers");

// GET /login
router.get("/", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  if (user) {
    res.redirect("/urls");
    return;
  }

  res.render("login", { error: null });
});

// POST: /login and save username as a cookie
router.post("/", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    res.render("login", { error: "Email and Password cannot be empty!" });
    return;
  }

  const user = findUser("email", email);
  if (!user) {
    res.status(400);
    console.log("email not found");
    res.render("login", { error: "Invalid email/password, please try again" });
    return;
  }
  
  bcrypt.compare(password, user.password, (err, success) => {
    if (!success) {
      res.status(400);
      console.log("wrong password");
      res.render("login", { error: "Invalid email/password, please try again" });
      return;
    }

    req.session.userID = user.id;
    return res.redirect("/urls");
  });
});

module.exports = router;