const { getUserByID, getUserByEmail, findUrlsForUser } = require('../helpers');
const { assert } = require('chai');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'userRandomID'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.equal(expectedOutput, user.id);
  });

  it('should return a undefined with invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;

    assert.equal(expectedOutput, user);
  });
});


describe('getUserById', function() {
  it('should return a user with valid id', function() {
    const user = getUserByID("userRandomID", testUsers);
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(expectedOutput, user);
  });

  it('should return a undefined with invalid id', function() {
    const user = getUserByID("userid", testUsers);
    const expectedOutput = undefined;

    assert.equal(expectedOutput, user);
  });
});

describe('findUrlsForUser', function() {
  it('should return a url object for user', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const urls = findUrlsForUser(user.id, testUrlDatabase);
    const expectedOutput = {
      'b2xVn2': 'http://www.lighthouselabs.ca'
      ,
      '9sm5xK': 'http://www.google.com'

    };

    assert.deepEqual(expectedOutput, urls);
  });

  it('should return a empty url with user not having any url', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const urls = findUrlsForUser(user.id, testUrlDatabase);
    const expectedOutput = {};

    assert.deepEqual(expectedOutput, urls);
  });
});


