const bcrypt = require("bcryptjs");

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

const generateRandomString = () => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.random() *
      chars.length);
  }
  return randomStr;
};

const findUser = (field, search) => {
  for (const id in users) {
    const user = users[id];
    if(user[field] === search) {
      return user;
    }
  }
  return null;
};

const findURLS = (userID) => {
  const results = {};
  const keys = Object.keys(urlDatabase);

  for (const shortURL of keys) {
    const url = urlDatabase[shortURL];
    if(url.userID === userID) {
      results[shortURL] = url;
      results[shortURL].shortURL = shortURL;
    }
  }

  return results;
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
  for (const url of Object.values(urlDatabase)) {
    if (url.shortLink === shortLink) {
      return url;
    }
  }
};

module.exports = {
  users,
  urlDatabase,
  generateRandomString,
  findUser,
  findURLS,
  getUserURLS,
  getSingleUserURL,
};