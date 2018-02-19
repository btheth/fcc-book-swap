const express = require('express');
const validator = require('validator');
const passport = require('passport');

const router = new express.Router();

function validateSignupForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';
  //console.log(payload)

  if (!payload || typeof payload.firstname !== 'string' || payload.firstname.trim().length === 0) {
    //|| !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.firstname = 'Please provide a first name.';
  }

  if (!payload || typeof payload.lastname !== 'string' || payload.lastname.trim().length === 0) {
    //|| !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.lastname = 'Please provide a last name.';
  }

  if (!payload || typeof payload.addr1 !== 'string' || payload.addr1.trim().length === 0) {
    //|| !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.addr1 = 'Please provide address line 1.';
  }

  if (!payload || typeof payload.addr2 !== 'string' || payload.addr2.trim().length === 0) {
    //|| !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.addr2 = 'Please provide address line 2.';
  }

  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    //|| !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.email = 'Please provide a correct email address.';
  }

  if (!payload || typeof payload.passone !== 'string' || payload.passone.trim().length < 2) {
    isFormValid = false;
    errors.passone = 'Password must have at least 2 characters.';
  }

  if (!payload || typeof payload.username !== 'string' || payload.username.trim().length === 0) {
    isFormValid = false;
    errors.username = 'Please provide a username.';
  }

  if (!payload || payload.passone.trim() !== payload.passtwo.trim()) {
    isFormValid = false;
    errors.passtwo = 'Passwords must match.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

function validateLoginForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (!payload || typeof payload.username !== 'string' || payload.username.trim().length === 0) {
    isFormValid = false;
    errors.username = 'Please provide your email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

router.post('/register', (req, res, next) => {
  //console.log('register')
  //console.log(req.body)
  const validationResult = validateSignupForm(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }

  //console.log('valid')

  return passport.authenticate('local-signup', (err, token, userData) => {
    if (err) {
      //console.log(err)
      if (err.name === 'BulkWriteError' && err.code === 11000) {
        // the 11000 Mongo code is for a duplication email error
        // the 409 HTTP status code is for conflict error
        return res.status(409).json({
          success: false,
          message: 'Form contains issues',
          errors: {
            username: 'Username is taken.'
          }
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Could not process the form, try again.'
      });
    }

    return res.json({
      success: true,
      message: 'You have successfully logged in!',
      token,
      user: userData
    });
  })(req, res, next);
});


router.post('/login', (req, res, next) => {
  //console.log('login');
  const validationResult = validateLoginForm(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }
  //console.log('valid')

  return passport.authenticate('local-login', (err, token, userData) => {
    //console.log('authenticating');
    if (err) {
      if (err.name === 'IncorrectCredentialsError') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      //(console.log('checked'));
      return res.status(400).json({
        success: false,
        message: 'Could not process the form, try again.'
      });
    }

    //console.log('double checked')
    return res.json({
      success: true,
      message: 'You have successfully logged in!',
      token,
      user: userData
    });
  })(req, res, next);
});

router.use((req,res) => {
  //console.log('badauth');
  return res.status(400).json({
    success: false
  });
})


module.exports = router;