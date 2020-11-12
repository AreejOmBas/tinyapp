/* ------------------------Helper Functions ------------- */

//<-- creates a random string made of 6 Characters used in generating user id and Short Url
const generateRandomString = () => Math.random().toString(36).substring(2, 8);

// --- Lookup user in DB using ID------
const getUserByID = (userId, db) => {
  for (let id in db) {
    if (id === userId) {
      return db[id];
    }
  }
  return undefined;
};

// --- Lookup user in DB using Email------
const getUserByEmail = (userEmail, db) => {
  for (let id in db) {
    if (db[id].email === userEmail) {
      return db[id];
    }
  }
  return undefined;
};

// --- Returns an object containing the shortUrls and corresponding Long Urls a user has created---
const findUrlsForUser = (id, db) => {
  let urls = {};

  for (let shortURL in db) {
    if (db[shortURL].userID === id) {
      urls[shortURL] = db[shortURL].longURL;
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  getUserByID,
  getUserByEmail,
  findUrlsForUser
};