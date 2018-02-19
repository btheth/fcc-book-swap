const express = require('express');
const fetch = require('node-fetch');
const Book = require('mongoose').model('books');
const User = require('mongoose').model('users');
const Trade = require('mongoose').model('trades');
const History = require('mongoose').model('history');
const router = express.Router();

router.post('/add', function(req, res, next) {

	console.log('request to add book')
	const bookData = {
    	title: req.body.title.trim(),
    	author: req.body.author.trim(),
    	description: req.body.description.trim(),
    	imageurl: req.body.imageurl.trim(),
    	userId: req.body.userId.trim(),
      tradeable: false
  	};

  	const newBook = new Book(bookData);

  	const historyData = {
  		action: "Added book to collection",
  		userbook: bookData.title,
  		otherbook: "N/A",
  		userId: bookData.userId,
  		time: new Date()
  	}

  	newHistory = new History(historyData);

  	newBook.save((err) => {
  		if (err) {res.status(401).json({errors: "failed to add book"})}

  		newHistory.save((err) => {
  			if (err) {res.status(401).json({errors: "failed to add history"})}
  			res.status(200).end();
  		})
  	})
});

router.post('/alluserbooks', function(req, res, next) {

  console.log('request for user books')
  const userId = req.body.userId.trim();

  Book.find({ userId: userId }, (err, books) => {
    if (err) {res.status(400).json({errors:'book lookup failed'})};
    res.status(200).json(books);
  })
});

router.post('/tradeableuserbooks', function(req, res, next) {

	console.log('request for user books')
	const userId = req.body.userId.trim();

	Book.find({ userId: userId, tradeable: true }, (err, books) => {
		if (err) {res.status(400).json({errors:'book lookup failed'})};
		res.status(200).json(books);
	})
});

router.post('/nonuserbooks', function(req, res, next) {

	console.log('request for non-user books')
	const userId = req.body.userId.trim();

	Book.find({ userId: {$ne: userId}, tradeable: true }, (err, books) => {
		if (err) {res.status(400).json({errors:'book lookup failed'})};
		res.status(200).json(books);
	})
});

router.post('/removebook', function(req, res, next) {

	console.log('request to delete book')
	const bookId = req.body.bookId.trim();
	const userId = req.body.userId.trim();

	const time = new Date();

	Book.findOne({ _id: bookId }, (err, book) => {
		if (err) {res.status(400).json({errors:'book lookup failed'})};

		if (!book || book.userId !== userId) {
			res.status(400).json({errors:'Sorry, we can\'t find that book. It may have been accepted as a trade. Try refreshing the page.'});
		} else {

			const removeHistory = {
				action: "Removed book from collection",
  				userbook: book.title,
  				otherbook: "N/A",
  				userId: userId,
  				time: time
			};

			Trade.find( { $or:[ {sourceBookId:bookId}, 
            	                {targetBookId:bookId} ]}, (err, trades) => {
            	if (err) {res.status(400).json({errors:'Error: trade lookup failed'})};

            	let userIds = [userId];
            	let bookIds = [bookId];

              	for (let i = 0; i < trades.length; i++) {
              		if (userIds.indexOf(trades[i].sourceUserId) === -1) {
                		userIds.push(trades[i].sourceUserId);
              		}

		            if (userIds.indexOf(trades[i].targetUserId) === -1) {
		            	userIds.push(trades[i].targetUserId);
		            }

		            if (bookIds.indexOf(trades[i].sourceBookId) === -1) {
		            	bookIds.push(trades[i].sourceBookId);
		            }

		            if (bookIds.indexOf(trades[i].targetBookId) === -1) {
		            	bookIds.push(trades[i].targetBookId);
		            }   

            		trades[i].remove();
            	}

            	User.find( { _id : { $in : userIds}}, (err, users) => {
              		if (err) {res.status(400).json({errors:'user lookup failed'})};
                
              		Book.find( {_id: {$in : bookIds }}, (err, books) => {
                		if (err) {res.status(400).json({errors:'book lookup failed'})};

                		historyArray = [removeHistory];

                		for (let i = 0; i < trades.length; i++) {
                 			const sourceUser = users[users.findIndex(u => u._id == trades[i].sourceUserId)].username;
                  			const targetUser = users[users.findIndex(u => u._id == trades[i].targetUserId)].username;

                  			const sourceBook = books[books.findIndex(b => b._id == trades[i].sourceBookId)].title;
                  			const targetBook = books[books.findIndex(b => b._id == trades[i].targetBookId)].title;

                    		const cancelHistSource = {
                      			action: "Canceled trade request with " + targetUser,
                      			userbook: sourceBook,
                      			otherbook: targetBook,
                      			userId: trades[i].sourceUserId,
                      			time: time
                    		}

                    		const cancelHistTarget = {
                      			action: sourceUser + " canceled trade request",
                      			userbook: targetBook,
                      			otherbook: sourceBook,
                      			userId: trades[i].targetUserId,
                      			time: time
                    		}

                   			historyArray.push(cancelHistSource);
                    		historyArray.push(cancelHistTarget);
                		}

                		History.insertMany(historyArray, (err, docs) => {
                  	  if (err) {res.status(401).json({errors: "failed to add history"})};

                  	  book.remove();
            				  Book.find({ userId: userId }, (err, books) => {
								      if (err) {res.status(400).json({errors:'book lookup failed'})};

								      let response = [];

								      for (let i = 0; i < books.length; i++) {
									      if (books[i]._id != bookId) {
										      response.push(books[i]);
									      }
								      }

								  res.status(200).json(response);
							});
						});
        	});
        });
			});
		}
	})
});

router.post('/fliptradestatus', function(req, res, next) {
  console.log('request to flip trade status')
  const bookId = req.body.bookId.trim();

  Trade.find( { $or:[ {sourceBookId:bookId},
                      {targetBookId:bookId} ]}, (err, trades) => {

    if (err) {res.status(400).json({errors:'trade lookup failed'})};

    if (trades.length !== 0) {
      res.status(400).json({errors:'Sorry, that book is part of an active trade request. Cancel or reject trades to take book off trade block.'});
    } else {

      Book.findOne({ _id: bookId }, (err, book) => {
        if (err) {res.status(400).json({errors:'book lookup failed'})};

        const userId = book.userId;
        const newStatus = !book.tradeable;

        const historyData = {
          userbook: book.title,
          otherbook: "N/A",
          userId: userId,
          time: new Date()
        }
        historyData.action = (newStatus) ? "Book put up for trade" : "Book taken off trade block";
        newHistory = new History(historyData);

        Book.update( { _id : bookId}, {tradeable : newStatus}, (err, book) => {
          if (err) {res.status(400).json({errors:'book update failed'})};

          newHistory.save((err) => {
            if (err) {res.status(401).json({errors: "failed to add history"})}
              
              Book.find({ userId: userId }, (err, books) => {
                if (err) {res.status(400).json({errors:'book lookup failed'})};
                res.status(200).json(books);
            });
          })
        });
      });
    }
  });
});

router.get('/tradeableimages', function(req, res, next) {
  console.log('request for all tradeable book images');

  Book.find({ imageurl: {$ne: ''}, tradeable: true }, (err, books) => {
    if (err) {res.status(400).json({errors:'book lookup failed'})};

    const imageurls = books.map((d) => d.imageurl);
    res.status(200).json(imageurls);
  })
});

router.post('/booksearch', function(req, res, next) {
  console.log('request for google book search');
  const search = req.body.search.trim();
  const method = req.body.method.trim();

  const apikey = process.env.GBKEY;
  const urlstart = "https://www.googleapis.com/books/v1/volumes?q=in";
  const urlmid = ":'";
  const urlend = "'&maxResults=40&projection=lite&key=" + apikey;

  const url = urlstart + method + urlmid + search + urlend;

  fetch(url)
    .then(results => {
      return results.json();
    }).then(data => {
        const newData = data;
        if (newData.items) {
          for (let i = 0; i < newData.items.length; i++) {
            newData.items[i].selected = false;
          }
        }
        res.status(200).json(newData);
    });
})

router.use('/', (req, res) => {
  res.status(400).end();
});

module.exports = router;