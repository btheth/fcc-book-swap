const jwt = require('jsonwebtoken');
const User = require('mongoose').model('users');


/**
 *  The Auth Checker middleware function.
 */
module.exports = (req, res, next) => {
  
  if (!req.headers.authorization && req.url !== "/books/tradeableimages") {
    return res.status(401).json({error:"unauthorized access"});
  } else if (req.url == "/books/tradeableimages") {
    return next();
  }

  // get the last part from a authorization header string like "bearer token-value"
  const token = req.headers.authorization.split(' ')[1];

  // decode the token using a secret key-phrase
  return jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
    // the 401 code is for unauthorized status
    if (err) { return res.status(401).end(); }

    const userId = decoded.sub;

    // check if a user exists
    return User.findById(userId, (userErr, user) => {
      if (userErr || !user) {
        return res.status(401).end();
      }

      return next();
    });
  });
};