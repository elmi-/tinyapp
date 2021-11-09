const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomStr = '';
  for(let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.random() * 
 chars.length);
  }
  return randomStr;
}

app.get('/', (req, res) => {
  res.send('Hello there!');
  console.log(generateRandomString());
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render('urls_show', templateVars);
});


app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}`);
});