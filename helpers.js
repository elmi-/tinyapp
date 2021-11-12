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
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "asdf",
    createdDateTime: new Date().toLocaleString(),
    visits: 0,
    uniqueVisits: 0,
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "asdf",
    createdDateTime: new Date().toLocaleString(),
    visits: 0,
    uniqueVisits: 0,
  },
  "b00Vn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
    createdDateTime: new Date().toLocaleString(),
    visits: 0,
    uniqueVisits: 0,
  },
  "99i9Ux": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
    createdDateTime: new Date().toLocaleString(),
    visits: 0,
    uniqueVisits: 0,
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
    if (user[field] === search) {
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
    if (url.userID === userID) {
      results[shortURL] = url;
      results[shortURL].shortURL = shortURL;
    }
  }
  
  return results;
};

module.exports = {
  users,
  urlDatabase,
  generateRandomString,
  findUser,
  findURLS,
};