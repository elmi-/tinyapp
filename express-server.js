const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

const { users, urlDatabase, generateRandomString, findUser, findURLS } = require("./helpers");

const app = express();
const PORT = 8080;

// #region MIDDLEWARE
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key"],
}));
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

// #region -------------- LOGIN/LOGOUT/REGISTRATION --------------//
app.get("/login", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  if (user) {
    res.redirect("/urls");
    return;
  }

  res.render("login", { error: null });
});

// POST: login and save username as a cookie
app.post("/login", (req, res) => {
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

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// GET /register: registration form to add new users
app.get("/register", (req, res) => {
  const userID = req.session.userID;
  const user = users[userID];
  
  if (user) {
    res.redirect("/urls");
    return;
  }

  res.render("register", { error: null });
});

// POST /register: save users to users data store
app.post("/register", (req, res) => {
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
// #endregion

// view all urls from urlDatabase
// GET /urls
app.get("/urls", (req, res) => {
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

// TODO: edit and fix issue
// add a new URL and redirect to urls_index
// POST /urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.userID;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL,
    userID,
    createdDateTime: new Date().toLocaleString(),
    visits: 0,
    uniqueVisits: 0,
  };

  res.redirect("/urls");
});

// renders page for adding new URL
// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  const urls = findURLS(userID);

  if (!userID) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" });
    return;
  }

  const user = findUser("id", userID);

  const templateVars = {
    urls,
    user,
    error: null,
  };
  
  res.render("urls_new", templateVars);
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
  
  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to edit/add new urls!" });
    return;
  }

  if (!url) {
    res.status(400);
    res.render("urls_new", templateVars);
  }

  const longURL =  urlDatabase[shortURL].longURL;
  url.visits++;
  res.redirect(longURL);
});

// POST: delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  const userID = req.session.userID;
  const user = findUser("id", userID);
  const urls = findURLS(userID);

  if (!user) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to edit/add new urls!" });
    return;
  }

  const templateVars = {
    urls,
    user,
  };

  res.render("urls_index", templateVars);
});

// GET: shortURL edit page
app.get("/urls/:shortURL", (req, res) => {
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
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  const userID = req.session.userID;
  const user = findUser("id", userID);
  const urls = findURLS(userID);

  const templateVars = {
    urls,
    user,
  };

  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
});