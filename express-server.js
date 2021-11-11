const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

// #region MIDDLEWARE 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// #endregion

// #region TEMP DATABASE (urlDatabase, users) //
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "asdf",
  }, 
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "asdf",
  },
  "b00Vn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  }, 
  "99i9Ux": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
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
  },
  "asdf": {
    id: "asdf", 
    email: "a@a.a", 
    password: "a"
  },
}
// #endregion

// #region HELPER METHODS
const findUserByID = (id, obj) => {
  for (const key of Object.keys(obj)) {
    if(id === key) {
      return obj[key];
    }
  }
  return false;
};

const findUserByEmail = (email, obj) => {
  for (const key of Object.keys(obj)) {
    if(email === obj[key].email) {
      return obj[key];
    }
  }
  return false;
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

const getUserURLS = (userID, urls) => {
  let userObj = [];
  for (const key of Object.keys(urls)) {
    if(userID === urls[key].userID) {
      urls[key]["shortLink"] = key;
      userObj.push(urls[key]);
    }
  }
  return userObj;
};

const getSingleUserURL = (shortLink, urlDatabase) => {
  for (const url of urlDatabase) {
    if (url.shortLink === shortLink) {
      return url;
    }
  }
}
// #endregion 

// RENDER index page
// GET: /
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// #region -------------- LOGIN/LOGOUT/REGISTRATION --------------//
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// POST: login and save username as a cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);
  
  if (!user) {
    res.status(403);
    console.log("email not found")
    res.render("login", { error: "Invalid email/password, please try again" }); 
    return;
  }
  
  if (password !== user.password) {
    res.status(403);
    console.log("wrong password");
    res.render("login", { error: "Invalid email/password, please try again" });
    return;
  }
  
  res.cookie("userID", user.id);
  if (req.get('Referrer') === "http://localhost:8080/urls/new") {
    return res.redirect("/urls/new")
  }
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/login");
});

// GET /register: registration form to add new users
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// POST /register: save users to users data store
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if(email === "" || password === "") {
    res.status(400);
    res.render("register", { error: "Email and Password cannot be empty!" }); 
    return;
  }

  const userFound = findUserByEmail(email, users);

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
  return res.redirect("urls");
});
// #endregion

// view all urls from urlDatabase
// GET /urls
app.get("/urls", (req, res) => {
  const userID = req.cookies["userID"];
  const user = findUserByID(userID, users);
  
  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };
  // console.log(getUserURLS(userID, urlDatabase))
  res.render("urls_index", templateVars);
});

// TODO: edit and fix issue
// add a new URL and redirect to newly created shortLink
// POST /urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  const userID = req.cookies["userID"];
  const user = findUserByID(userID, users);

  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };

  return res.render("urls_index", templateVars);
});

// renders page for adding new URL
// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["userID"];
  if (!userID) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" }); 
    return;
  }
  const user = findUserByID(userID, users);

  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };
  
  res.render("urls_new", templateVars);
});

// GET: redirect user to longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL =  urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// POST: delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  const userID = req.cookies["userID"];
  const user = findUserByID(userID, users);

  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };

  res.render("urls_index", templateVars);
});

// POST: edit shortURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  const userID = req.cookies["userID"];

  const user = findUserByID(userID, users);
  
  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["userID"];
  const user = findUserByID(userID, users);
  const shortLink = req.params.shortURL;

  const templateVars = {
    shortURL: req.params.shortURL,
    url: getSingleUserURL(shortLink, getUserURLS(userID, urlDatabase)),
    user: user
  };
  
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
  // console.log(users)
});