const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

const app = express();
const PORT = 8080;

// #region MIDDLEWARE 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key"],
}))
// #endregion

// #region TEMP DATABASE (urlDatabase, users) //
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "asdf",
    createdDateTime: new Date().toLocaleString(),
    modifiedDateTime: null,
  }, 
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "asdf",
    createdDateTime: new Date().toLocaleString(),
    modifiedDateTime: null,
  },
  "b00Vn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
    createdDateTime: new Date().toLocaleString(),
    modifiedDateTime: null,
  }, 
  "99i9Ux": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
    createdDateTime: new Date().toLocaleString(),
    modifiedDateTime: null,
  },
};

// users data store 
// TEMP DATABASE
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  "asdf": {
    id: "asdf", 
    email: "a@a.a", 
    password: bcrypt.hashSync("a", 10),
  },
}
// #endregion

// #region HELPER METHODS
const findUser = (field, search) => {
  for (const id in users) {
    const user = users[id];
    if(user[field] === search) {
      return user;
    }
  }
  return null;
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
  console.log(user);
  if (!user) {
    res.status(400);
    console.log("email not found")
    res.render("login", { error: "Invalid email/password, please try again" }); 
    return;
  }
  
  bcrypt.compare(password, user.password, (err, success) => {
    if(!success){
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
  if(!email || !password) {
    res.status(400);
    res.render("register", { error: "Email and Password cannot be empty!" }); 
    return;
  }

  const user = findUser("email", email);

  if(user) {
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
      console.log(users);
      return res.redirect("login");
    });
  });

});
// #endregion

// view all urls from urlDatabase
// GET /urls
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const user = findUser("id", userID);
  
  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };
  
  res.render("urls_index", templateVars);
});

// TODO: edit and fix issue
// add a new URL and redirect to newly created shortLink
// POST /urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.userID;
  const user = findUser("id", userID);
  
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID,
    modifiedDateTime: new Date().toLocaleString(),
  }

  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };
  console.log(urlDatabase)
  return res.render("urls_index", templateVars);
});

// renders page for adding new URL
// GET /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.status(401);
    res.render("login", { error: "Unauthorized! Please login or register to add new urls!" }); 
    return;
  }

  const user = findUser("id", userID);

  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
    error: null,
  };
  
  res.render("urls_new", templateVars);
});

// GET: redirect user to longURL
app.get("/u/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const user = findUser("id", userID);

  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
    error: "short URL could not be found, please create a new link"
  };
  
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(400);
    res.render("urls_new", templateVars);
  }

  const longURL =  urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// POST: delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  const userID = req.session.userID;
  const user = findUser("id", userID);

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
  const userID = req.session.userID;

  const user = findUser("id", userID);
  
  const templateVars = {
    urls: getUserURLS(userID, urlDatabase),
    user: user,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const user = findUser("id", userID);
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
  // console.log(urlDatabase)
  console.log(users);
});