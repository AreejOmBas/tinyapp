//---- Required Libraries --------
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const app = express();

//------------Helper Functions-----------
const { generateRandomString, getUserByID, getUserByEmail, findUrlsForUser } = require('./helpers');

//---- Middlewear-------
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(flash());  // <---use connect-flash for flash messages stored in session

//---Constant Variables---
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'id3rt5'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'id3rt5'
  },
  '3ght5w': {
    longURL: 'http://www.amazon.com',
    userID: '29k7c8'
  },
  'kj34sd': {
    longURL: 'http://www.github.com',
    userID: '29k7c8'
  }
};

const usersDB = {
  'bmn34n': {
    id: 'bmn34n',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'id3rt5': {
    id: 'id3rt5',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  },
  '29k7c8': {
    id: '29k7c8',
    email: 'user3@example.com',
    password: '$2b$10$7y7IeLg9xlPq7KCziOU85.ZlmyUjjpYCthTtlsgkdWkq0z5eB7KAi' // 1234
  }

};

//---------------------ROUTES----------------------

//--- ROOT Route----
app.get('/', (req, res) => {
  const user = getUserByID(req.session.userid, usersDB);
  if (!user) {
    req.flash('errorMsg', 'Please Login first');
    res.redirect('/login');

  } else {
    res.redirect('/urls');
  }
});

//------------URL Route --------------
app.get('/urls', (req, res) => {

  const user = getUserByID(req.session.userid, usersDB); //<---current logged in user if any
  const urls = (user) ? findUrlsForUser(user.id, urlDatabase) : {}; //<--- urls for the logged in user if any
  res.locals.errorMsg = req.flash('errorMsg');
  const templateValues = { urls, user }; //<---- values to pass to html pages
  res.render('urls_index', templateValues);
});

//------------User Registration Page ------------
app.get('/register', (req, res) => {
  const user = getUserByID(req.session.userid, usersDB);

  if (user) {
    res.redirect('/urls');

  } else {
    const templateValues = { urls: urlDatabase, user };
    res.locals.errorMsg = req.flash('errorMsg');//<--- to show error messages if any
    res.render('register', templateValues);
  }
});

// -----Submit registration form---------
app.post('/register', (req, res) => {

  const { email, password } = req.body;
  if (email === '' || password === '') {
    req.flash('errorMsg', 'Please enter valid inputs');
    res.redirect('/register');

  } else if (getUserByEmail(email, usersDB)) {
    req.flash('errorMsg', 'Email Already Exists');
    res.redirect('/register');

  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = generateRandomString();

    const newUser = {
      id: userId,
      email,
      password: hashedPassword
    };
    usersDB[userId] = newUser;
    req.session.userid = userId;
    res.redirect('/urls');
  }
});

//------------User Log in --------------------------
app.get('/login', (req, res) => {
  const user = getUserByID(req.session.userid, usersDB);

  if (user) {
    res.redirect('/urls');

  } else {
    res.locals.errorMsg = req.flash('errorMsg');//<--- to show error messages if any
    const templateValues = { urls: urlDatabase, user };
    res.render('login', templateValues);
  }


});
//------ User Submit Login Form-----------------
app.post('/login', (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = getUserByEmail(email, usersDB);

  if (user && bcrypt.compareSync(pass, user.password)) {
    req.session.userid = user.id;
    res.redirect('/urls');

  } else {
    req.flash('errorMsg', 'No matching Email/Password found');
    res.redirect('/login');
  }
});

//------------User Log out ------------
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//------------New URL ---------------
app.get('/urls/new', (req, res) => {
  const user = getUserByID(req.session.userid, usersDB);
  if (!user) {
    res.redirect('/login');

  } else {
    const templateValues = { urls: urlDatabase, user };
    res.locals.errorMsg = req.flash('errorMsg');//<--- to show error messages if any
    res.render('urls_new', templateValues);
  }

});

//------------Submitting New URL---------
app.post('/urls/', (req, res) => {

  const user = getUserByID(req.session.userid, usersDB);
  const userID = user.id;
  const shortURL = generateRandomString(); // generate new url
  const longURL = req.body.longURL;
  const url = {
    longURL,
    userID
  };
  if (!user) {
    req.flash('errorMsg', 'Please Log in first');
    res.redirect('/login');

  } else if (longURL !== '') {
    urlDatabase[shortURL] = url;
    res.redirect(`urls/${shortURL}`);

  } else {
    req.flash('errorMsg', 'Please Enter a valid Long url');
    res.redirect('/urls/new');
  }

});

//------------Delete Existing URL--------
app.post('/urls/:shortURL/delete', (req, res) => {

  const user = getUserByID(req.session.userid, usersDB);
  const shortURL = req.params.shortURL;

  if (!user) {
    req.flash('errorMsg', 'Please Log in first');
    res.redirect('/login');
  } else {
    const urls = findUrlsForUser(user.id, urlDatabase);
    if (urls[shortURL] !== undefined) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');

    } else {
      req.flash('errorMsg', 'You do not own this Short Url');
      res.redirect('/urls');
    }
  }

});

//----Show a page for a specific shortURL------
app.get('/urls/:shortURL', (req, res) => {

  const user = getUserByID(req.session.userid, usersDB);
  const shortURL = req.params.shortURL;
  if (!user) {
    req.flash('errorMsg', 'Please Log in first');
    res.redirect('/login');
  } else {
    const urls = findUrlsForUser(user.id, urlDatabase);
    if (urls && urls[shortURL] !== undefined) {
      const longURL = urlDatabase[req.params.shortURL].longURL;
      const templateValues = { longURL, shortURL, user };
      res.locals.errorMsg = req.flash('errorMsg');
      res.render('urls_show', templateValues);

    } else {
      req.flash('errorMsg', 'Requested Short Url either not found or you do not have access to it.');
      res.redirect('/urls');
    }
  }


});

//--------Update an URL---------------
app.post('/urls/:shortURL', (req, res) => {

  const user = getUserByID(req.session.userid, usersDB);
  const shortURL = req.params.shortURL;
  const updatedURL = req.body.updatedLongURL;
  if (!user) {
    req.flash('errorMsg', 'Please Log in first to update the Url');
    res.redirect('/login');
  } else {
    const urls = findUrlsForUser(user.id, urlDatabase);
    if (updatedURL === '') {
      req.flash('errorMsg', 'Please Enter a valid URL');
      res.redirect(`/urls/${shortURL}`);

    } else if (urls[shortURL] !== undefined) { // <-- if User does not own the Short url
      urlDatabase[shortURL].longURL = updatedURL;
      res.redirect(`/urls`);

    } else {
      req.flash('errorMsg', 'You do not own this Short Url');
      res.redirect('/urls');
    }
  }
});

//----- Redirect to the longUrl when requesting the shortURL-------
app.get('/u/:shortURL', (req, res) => {

  if (urlDatabase.hasOwnProperty([req.params.shortURL])) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
    
  } else {
    req.flash('errorMsg', 'Requested Url not found.');
    res.redirect('/urls');
  }

});

//------ Set Up the Server----------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
