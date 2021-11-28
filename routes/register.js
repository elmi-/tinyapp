const express = require('express');
const router  = express.Router();
const bcrypt = require("bcryptjs");
const { users, generateRandomString, findUser } = require("../helpers");

// GET /register: registration form to add new users
router.get("/", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  if (user) {
    res.redirect("/urls");
    return;
  }

  res.render("register", { error: null });
});

// POST /register: save users to users data store
router.post("/", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    res.render("register", { error: "Email and Password cannot be empty!" });
    return;
  }

  const user = findUser("email", email);

  if (user) {
    res.status(400);
    res.render("register", { error: "Email already registered! Try restting password" });
    return;
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      const id = generateRandomString();
      users[id] = {
        id,
        email,
        password: hash,
      };
      
      req.session.userID = id;
      return res.redirect("/urls");
    });
  });
});

  module.exports = router;

