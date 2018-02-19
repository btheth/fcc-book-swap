const express = require('express');
const User = require('mongoose').model('users');
const History = require('mongoose').model('history');
const router = express.Router();

function validateEditForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';
  console.log(payload)

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

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

router.post('/userinfo', function(req, res, next) {

	console.log('user info requested');
	const userId = req.body.userId.trim()

	User.findOne({ _id: userId }, (err, user) => {
		if (err) {res.status(400).json({errors:'user lookup failed'})};
		res.status(200).json(user);
	})
});

router.post('/update', function(req, res, next) {

	console.log('user update requested');

    const validationResult = validateEditForm(req.body);
  	if (!validationResult.success) {
    	return res.status(400).json({
      		success: false,
      		message: validationResult.message,
      		errors: validationResult.errors
    	});
  	}

	  const userId = req.body.userId.trim();
    const email = req.body.email.trim();
    const firstname = req.body.firstname.trim();
    const lastname = req.body.lastname.trim();
    const addr1 = req.body.addr1.trim();
    const addr2 = req.body.addr2.trim();

	User.update({ _id: userId }, {email : email, firstname: firstname, lastname: lastname, addr1: addr1, addr2: addr2}, (err, user) => {
		if (err) {res.status(400).json({errors:'user lookup failed'})};

    const historyData = {
      action: "Updated user information",
      userbook: "N/A",
      otherbook: "N/A",
      userId: userId,
      time: new Date()
    };

    newHistory = new History(historyData);

    newHistory.save((err) => {
        if (err) {res.status(401).json({errors: "failed to add history"})}
        res.status(200).json(user);
    })
	})
});

router.use('/', (req, res) => {
  	res.status(400).end();
});

module.exports = router;