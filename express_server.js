//---- Required Libraries --------
const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const app = express();

//---- Middlewear-------
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

//---Constant Variable---
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
};



// ------------Helper Functions-----------

//<-- creates a random shortURl made of 6 Characters
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

const urlsForUser = (id) => {
  let urls = {};

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urls;
};

//---------------------ROUTES----------------------

app.get('/', (req, res) => {
  res.redirect('/urls');
});

//------------URL Route --------------
app.get('/urls', (req, res) => {
  const user = fetchUserById(usersDB, req.cookies.userid);
 
  const urls = (user) ? urlsForUser(user.id) : {};

  const templateValues = { urls, user };

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
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = generateRandomString();
    const newUser = {
      id: userId,
      email,
      password: hashedPassword
    };
    
    usersDB[userId] = newUser;
    res.cookie('userid', userId);

    res.redirect('/urls');

  }
});

//------------User Log in ------------
app.get('/login', (req, res) => {
  const user = fetchUserById(usersDB, req.cookies.userid);

  const templateValues = { urls: urlDatabase, user };

  res.render('login', templateValues);

});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const user = fetchUserByEmail(usersDB, email);

  if (user && bcrypt.compareSync(pass, user.password)) {
    res.cookie('userid', user.id);
    res.redirect('/urls');
  } else {
    res.sendStatus(403); //Forbidden
  }
});

//------------User Log out ------------
app.post('/logout', (req, res) => {

  res.clearCookie('userid');

  res.redirect('/urls');
});


//------------New URL ---------------
app.get('/urls/new', (req, res) => {
  const user = fetchUserById(usersDB, req.cookies.userid);
  if (!user) {
    res.redirect('/login');
  } else {
    const templateValues = { urls: urlDatabase, user };
    res.render('urls_new', templateValues);
  }

});

//------------Submitting New URL---------
app.post('/urls/', (req, res) => {
  const userID = req.cookies.userid;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const url = {
    longURL,
    userID
  };
  if (longURL !== '') {
    urlDatabase[shortURL] = url;
    res.redirect(`urls/${shortURL}`);
  } else {
    res.redirect('/urls/new');
  }

});

//------------Delete Existing URL--------
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//--------Update an URL---------------
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL = req.body.updatedLongURL;

  urlDatabase[shortURL].longURL = updatedURL;

  res.redirect(`/urls`);
});

//----Show a page for a specific shortURL------
app.get('/urls/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const shortURL = req.params.shortURL;

  const user = fetchUserById(usersDB, req.cookies.userid);
  const templateValues = { longURL, shortURL, user };
  res.render('urls_show', templateValues);
});

//----- Redirect to the longUrl when requesting the shortURL-------
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//------ Set Up the Server----------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
