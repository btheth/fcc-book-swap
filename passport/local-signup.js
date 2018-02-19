const jwt = require('jsonwebtoken');
const User = require('mongoose').model('users');
const History = require('mongoose').model('history');
const PassportLocalStrategy = require('passport-local').Strategy;


/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
  usernameField: 'username',
  passwordField: 'passone',
  session: false,
  passReqToCallback: true
}, (req, username, password, done) => {

  const userData = {
    username: username.trim(),
    password: password.trim(),
    email: req.body.email.trim(),
    firstname: req.body.firstname.trim(),
    lastname: req.body.lastname.trim(),
    addr1: req.body.addr1.trim(),
    addr2: req.body.addr2.trim()
  };

  const newUser = new User(userData);

  newUser.save((err) => {
      if (err) { return done(err); };
      
      const payload = {
        sub: newUser._id
      };

      const historyData = {
        action: "Joined BookSwap",
        userbook: "N/A",
        otherbook: "N/A",
        userId: newUser._id,
        time: new Date()
      };

      newHistory = new History(historyData);

      newHistory.save((err) => {
        // create a token string
        const token = {token: jwt.sign(payload, process.env.JWTSECRET), id: newUser._id};

        const data = {
          username: newUser.username
        };

        return done(null, token, data);
      });


    //if (err) { return done(err); }

    //return done(null);
  });
});