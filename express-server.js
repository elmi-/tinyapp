const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

const { urlDatabase, findUser, } = require("./helpers");

const app = express();
const PORT = 8080;

// #region MIDDLEWARE
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: "session",
  keys: ["key"],
}));

// import routers
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const urlsRouter = require("./routes/urls");

// use routers as middleware
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/urls", urlsRouter);
// #endregion

// RENDER index page
// GET: /
app.get("/", (req, res) => {
  const userID = req.session.userID;
  const user = findUser("id", userID);
  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }
  res.redirect("/urls");
});

// POST /logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// GET: redirect user to longURL
app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const user = findUser("id", userID);
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];

  const templateVars = {
    shortURL,
    user,
    url,
    error: "short URL could not be found, please create a new link"
  };

  if (!url) {
    res.status(400);
    res.render("urls_new", templateVars);
  }

  const longURL =  urlDatabase[shortURL].longURL;
  url.visits++;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
});