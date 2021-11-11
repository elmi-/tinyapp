const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

// MIDDLEWARE //
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// TEMP DATABASE //
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// users data store 
// TEMP DATABASE
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// view all urls from urlDatabase
// GET /urls
app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID],
  };

  res.render("urls_index", templateVars);
});

// POST: login and save username as a cookie
app.post("/login", (req, res) => {
  const userID = req.body.userID;
  res.cookie("userID", userID);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});

// add a new URL and redirect to new URL (/urls/generateRandomString())
// POST /urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// GET /register: registration form to add new users
app.get("/register", (req, res) => {
  res.render("register", { error: false });
});

const userLookupHelper = (email, obj) => {
  let found = false;
  for (const key of Object.keys(obj)) {
    if(email === obj[key].email) {
      found = true;
    }
  }
  return found;
};

// POST /register: save users to users data store
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if(email === "" || password === "") {
    res.status(400);
    res.render("register", { error: "Email and Password cannot be empty!" }); 
    return;
  }

  const userFound = userLookupHelper(email, users);
  if(userFound) {
    res.status(400);
    res.render("register", { error: "Email already registered! Try restting password" }); 
    return;
  }

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: email,
    password: password,
  };
  res.cookie("userID", userID);
  return res.redirect("/urls");
});

// renders page for adding new URL
// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID],
  };
  res.render("urls_new", templateVars);
});

// GET: redirect user to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST: delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const userID = req.cookies["userID"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

// POST: edit shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  const userID = req.cookies["userID"];
  const templateVars = {
    urls: urlDatabase,
    user: users[userID],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["userID"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userID],
  };

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
});