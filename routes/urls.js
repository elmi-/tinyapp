const express = require('express');
const router  = express.Router();
const { urlDatabase, generateRandomString, findUser, findURLS } = require("../helpers");

// view all urls from urlDatabase
// GET /urls
router.get("/", (req, res) => {
  const userID = req.session.userID;
  const user = findUser("id", userID);
  const urls = findURLS(userID);

  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }

  const templateVars = {
    urls,
    user: user,
  };
  
  res.render("urls_index", templateVars);
});

// add a new URL and redirect to urls_index
// POST /urls
router.post("/", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.userID;
  const user = findUser("id", userID);
  const longURL = req.body.longURL;

  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }

  if (!userID) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }

  urlDatabase[shortURL] = {
    longURL,
    userID,
    createdDateTime: new Date().toLocaleString(),
    visits: 0,
    uniqueVisits: 0,
  };

  res.redirect(`/urls/${shortURL}`);
});

// renders page for adding new URL
// GET /urls/new
router.get("/new", (req, res) => {
  const userID = req.session.userID;
  const user = findUser("id", userID);
  const urls = findURLS(userID);

  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }

  if (!userID) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }


  const templateVars = {
    urls,
    user,
    error: null,
  };
  
  res.render("urls_new", templateVars);
});

// POST: delete URL
router.post("/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  const userID = req.session.userID;
  const user = findUser("id", userID);
  const urls = findURLS(userID);

  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to edit/add new urls!" });
    return;
  }

  delete urlDatabase[shortURL];

  const templateVars = {
    urls,
    user,
  };

  res.render("urls_index", templateVars);
});

// GET: shortURL edit page
router.get("/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  const user = findUser("id", userID);
  const urls = findURLS(userID);

  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to edit/add new urls!" });
    return;
  }

  if (!urls[shortURL]) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to edit/add new urls!" });
    return;
  }

  const url =  urlDatabase[shortURL];

  const templateVars = {
    shortURL,
    url,
    user,
    error: "short URL could not be found, please create a new link"
  };
  
  if (!urlDatabase[shortURL]) {
    res.status(400);
    res.render("urls_new", templateVars);
  }

  res.render("urls_show", templateVars);
});

// POST: edit shortURL
router.post("/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  const user = findUser("id", userID);
  const urls = findURLS(userID);

  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to edit/add new urls!" });
    return;
  }

  if (!userID) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }

  urlDatabase[shortURL].longURL = longURL;

  const templateVars = {
    urls,
    user,
  };

  res.render("urls_index", templateVars);
});

module.exports = router;