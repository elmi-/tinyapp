const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

// MIDDLEWARE //
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// TEMP DATABASE //
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.random() *
      chars.length);
  }
  return randomStr;
};

// RENDER index page
// GET: /
app.get("/", (req, res) => {
  res.send("Hello there!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// view all urls from urlDatabase
// GET /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// add a new URL and redirect to new URL (/urls/generateRandomString())
// POST /urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// renders page for adding new URL
// GET /urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// GET: redirect user to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST: delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// POST: edit shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
});