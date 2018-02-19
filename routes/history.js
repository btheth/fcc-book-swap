const express = require('express');
const History = require('mongoose').model('history');
const router = express.Router();

router.post('/userhistory', function(req, res, next) {
	console.log('request for user history');

	const userId = req.body.userId.trim();

	History.find({ userId: userId }, null, {sort: {time: -1}}, (err, history) => {
		if (err) {res.status(400).json({errors:'history lookup failed'})};
		res.status(200).json(history);
	})
});

router.use('/', (req, res) => {
  res.status(400).end();
});

module.exports = router;