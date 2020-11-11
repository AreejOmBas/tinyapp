//---- Required Libraries --------
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const app = express();

//---- Middlewear-------
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//---Constatnt Variable---
const PORT = 8080;
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};



// Helper Function <-- creats a random shortURl made of 6 Characters
const generateRandomString = () => Math.random().toString(36).substring(2, 8);

//---------------------ROUTES----------------------
// 
app.get('/', (req, res) => {
  res.send('Hello!');
});

//------------URL Route --------------
app.get('/urls', (req, res) => {
  const templateValues = { urls: urlDatabase , username: req.cookies.username};
  
  res.render('urls_index', templateValues);
});

//------------User Log in ------------
app.post('/login', (req,res) => {
  const userName = req.body.username;
  res.cookie('username', userName);
  
  res.redirect('/urls');
});

//------------User Log out ------------
app.post('/logout', (req,res) => {

  res.clearCookie('username');
 
  res.redirect('/urls');
});


//------------New URL ---------------
app.get('/urls/new', (req, res) => {
  res.locals.username = req.cookies.username; 
  res.render('urls_new');
});

//------------Submitting New URL---------
app.post('/urls/', (req, res) => {
  const shortUrl = generateRandomString();
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  res.redirect(`urls/${shortUrl}`);
});

//------------Delete Existing URL--------
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//--------Update an URL---------------
app.post('/urls/:shortURL', (req, res) => {
  const shortUrl = req.params.shortURL
  const updatedURL = req.body.updatedLongURL;

  urlDatabase[shortUrl] = updatedURL;

  res.redirect(`/urls`);
});

//----Show a page for a specific shortUrl------
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render('urls_show', templateVars);
});

//----- Redirect to the longUrl when requesting the shortUrl-------
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//------ Set Up the Server----------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
