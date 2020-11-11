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
const usersDB = {
  "bmn34n": {
    id: "bmn34n",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "id3rt5": {
    id: "id3rt5",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



// ------------Helper Functions----------- 

//<-- creats a random shortURl made of 6 Characters
const generateRandomString = () => Math.random().toString(36).substring(2, 8);

// --- Lookup user in DB using ID------
const fetchUserById = (db, userId) => {
  for (let id in db) {
    if (id === userId) {
      return db[id];
    }
  }
  return null;
};

// --- Lookup user in DB using Email------
const fetchUserByEmail = (db, userEmail) => {
  for (let id in db) {
    if (db[id].email === userEmail) {
      return db[id];
    }
  }
  return null;
};

//---------------------ROUTES----------------------
// 
app.get('/', (req, res) => {
  res.send('Hello!');
});

//------------URL Route --------------
app.get('/urls', (req, res) => {
  const user = fetchUserById(usersDB, req.cookies.userid);

  const templateValues = { urls: urlDatabase, user };

  res.render('urls_index', templateValues);
});

//------------User Registration Page ------------
app.get('/register', (req, res) => {
  const user = fetchUserById(usersDB, req.cookies.userid);

  const templateValues = { urls: urlDatabase, user };

  res.render('register', templateValues);
});

// -----Submit registration form---------
app.post('/register', (req, res) => {

  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.sendStatus(400);
  } else if (fetchUserByEmail(usersDB, email)) {
    res.sendStatus(400);
  } else {
    const userId = generateRandomString();
    const newUser = {
      id: userId,
      email,
      password
    };
    usersDB[userId] = newUser;
    res.cookie('userid', userId);

    res.redirect('/urls');

  }
});

//------------User Log in ------------
app.post('/login', (req, res) => {

  const user = fetchUserById(usersDB, req.cookies.userid);
  res.cookie('userid', user.id);

  res.redirect('/urls');
});

//------------User Log out ------------
app.post('/logout', (req, res) => {

  res.clearCookie('username');

  res.redirect('/urls');
});


//------------New URL ---------------
app.get('/urls/new', (req, res) => {
  const user = fetchUserById(usersDB, req.cookies.userid);
  const templateValues = { urls: urlDatabase, user };
  res.render('urls_new', templateValues);
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
  const templateValues = { urls: urlDatabase, user };
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
