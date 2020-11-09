const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

const generateRandomString = () => Math.random().toString(36).substring(2,8);

app.get("/urls", (req, res) => {
  const templateValues = {urls : urlDatabase}
  res.render('urls_index', templateValues);
});

app.get("/urls/new", (req, res) => {
  
  res.render('urls_new');
});

app.post("/urls/", (req, res) => {
  
  console.log(req.body);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



