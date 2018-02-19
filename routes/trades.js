const express = require('express');
const Trade = require('mongoose').model('trades');
const Book = require('mongoose').model('books');
const User = require('mongoose').model('users');
const History = require('mongoose').model('history');
const router = express.Router();

router.post('/add', function(req, res, next) {

	console.log('request to add trade')
	const tradeData = {
    sourceUserId: req.body.sourceUserId.trim(),
  	sourceBookId: req.body.sourceBookId.trim(),
    targetUserId: req.body.targetUserId.trim(),
  	targetBookId: req.body.targetBookId.trim()
  };

  const time = new Date();

  const sourceHistoryData = {
    userId: tradeData.sourceUserId,
    time: time
  }
  const targetHistoryData = {
    userId: tradeData.targetUserId,
    time: time
  }

  Book.findOne( { _id : tradeData.sourceBookId, userId : tradeData.sourceUserId}, (err, book) => {
    if (err) {res.status(400).json({errors:'book lookup failed'})};
      
    if (!book) {
      res.status(400).json({errors:'Sorry, you don\'t seem to own that book anymore. Someone might have accepted your trade. Try refreshing the page.'});
    }  else {
      
      sourceHistoryData.userbook = book.title;
      targetHistoryData.otherbook = book.title;

      Book.findOne( { _id: tradeData.targetBookId, userId : tradeData.targetUserId }, (err, book) => {
        if (err) {res.status(400).json({errors:'book lookup failed'})};

        if (!book) {
          res.status(400).json({errors:'Sorry, that user doesn\'t seem to own that book anymore. They may have accepted a trade for it. Try refreshing the page.'});
        } else if (!book.tradeable) {
          res.status(400).json({errors:'Sorry, that book is not available for trade. The user may have removed it from the trade block. Try refreshing the page.'});
        } else {
          sourceHistoryData.otherbook = book.title;
          targetHistoryData.userbook = book.title;

          const newTrade = new Trade(tradeData);

          newTrade.save((err) => {
            if (err) {res.status(401).json({errors: "failed to add trade"})}

            userIds = [tradeData.sourceUserId, tradeData.targetUserId];

            User.find( { _id : { $in : userIds}}, (err, users) => {
              if (err) {res.status(400).json({errors:'user lookup failed'})};

              const sourceUser = users[users.findIndex(u => u._id == tradeData.sourceUserId)].username;
              const targetUser = users[users.findIndex(u => u._id == tradeData.targetUserId)].username;

              sourceHistoryData.action = "You requested to trade with " + targetUser;
              targetHistoryData.action = sourceUser + " requested to trade with you";

              History.insertMany([sourceHistoryData, targetHistoryData], (err, docs) => {
                if (err) {res.status(401).json({errors: "failed to add history"})};
                res.status(200).end();
              });
            });
          })
        }
      })
    }
  })
});

router.post('/usertrades', function(req, res, next) {

    console.log('request for user trades')
    const userId = req.body.userId.trim();

    Trade.find({ sourceUserId: userId }, (err, trades) => {
      if (err) {res.status(400).json({errors:'trade lookup failed'})};
      
      let userIds = [];
      let bookIds = [];

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
      }

      Book.find( { _id : { $in : bookIds}}, (err, books) => {
        if (err) {res.status(400).json({errors:'book lookup failed'})};

        User.find( { _id : { $in : userIds}}, (err, users) => {
          if (err) {res.status(400).json({errors:'user lookup failed'})};

          let myRequests = [];
          for (let i = 0; i < trades.length; i++) {
            myRequests.push({
              tradeId: trades[i]._id,
              mybook: books[books.findIndex(b => b._id == trades[i].sourceBookId)],
              targetbook: books[books.findIndex(b => b._id == trades[i].targetBookId)],
              otheruser: users[users.findIndex(u => u._id == trades[i].targetUserId)].username
            })
          }

          res.status(200).json(myRequests);
        })
      });
    })
});

router.post('/tradesforuser', function(req, res, next) {

    console.log('request for trades for user')
    const userId = req.body.userId.trim();

    Trade.find({ targetUserId: userId }, (err, trades) => {
      if (err) {res.status(400).json({errors:'trade lookup failed'})};
      
      let userIds = [];
      let bookIds = [];

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
      }

      Book.find( { _id : { $in : bookIds}}, (err, books) => {
        if (err) {res.status(400).json({errors:'book lookup failed'})};

        User.find( { _id : { $in : userIds}}, (err, users) => {
          if (err) {res.status(400).json({errors:'user lookup failed'})};

          let myRequests = [];
          for (let i = 0; i < trades.length; i++) {
            myRequests.push({
              tradeId: trades[i]._id,
              mybook: books[books.findIndex(b => b._id == trades[i].targetBookId)],
              sourcebook: books[books.findIndex(b => b._id == trades[i].sourceBookId)],
              sourceuser: users[users.findIndex(u => u._id == trades[i].sourceUserId)].username
            })
          }

          res.status(200).json(myRequests);
        })
      });
    })
});

router.post('/acceptrade', function(req, res, next) {
  console.log('request to accept trade');

  const tradeId = req.body.tradeId.trim();

  Trade.findOne({ _id: tradeId }, (err, trade) => {
    if (err) {res.status(400).json({errors:'trade lookup failed'})};
    
    if (!trade) {
      res.status(400).json({errors:'Sorry, we couldn\'t find that trade. It may have been cancelled. Try refreshing the page.'});
    } else {
    
      const time = new Date();
      const sourceUserId = trade.sourceUserId;
      const targetUserId = trade.targetUserId;
      const sourceBookId = trade.sourceBookId;
      const targetBookId = trade.targetBookId;

      const sourceHistoryData = {
        userId: sourceUserId,
        time: time
      }
      const targetHistoryData = {
        userId: targetUserId,
        time: time
      }

      let userIds = [sourceUserId, targetUserId];
      let bookIds = [sourceBookId, targetBookId];

      Book.update( { _id : sourceBookId}, {userId : targetUserId, tradeable: false}, (err, book) => {
        if (err) {res.status(400).json({errors:'Error: book lookup failed'})};
        sourceHistoryData.userBook = book.title;
        targetHistoryData.otherbook = book.title;

        Book.update( { _id : targetBookId}, {userId : sourceUserId, tradeable: false}, (err, book) => {
         if (err) {res.status(400).json({errors:'Error: book lookup failed'})};

          sourceHistoryData.otherbook = book.title;
          targetHistoryData.userbook = book.title;

          Trade.find( { $or:[ {sourceBookId:sourceBookId}, 
                              {sourceBookId:targetBookId}, 
                              {targetBookId:sourceBookId}, 
                              {targetBookId:targetBookId} ]}, (err, trades) => {
            if (err) {res.status(400).json({errors:'Error: trade lookup failed'})};

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

                historyArray = [];

                for (let i = 0; i < trades.length; i++) {
                  const sourceUser = users[users.findIndex(u => u._id == trades[i].sourceUserId)].username;
                  const targetUser = users[users.findIndex(u => u._id == trades[i].targetUserId)].username;

                  const sourceBook = books[books.findIndex(b => b._id == trades[i].sourceBookId)].title;
                  const targetBook = books[books.findIndex(b => b._id == trades[i].targetBookId)].title;

                  if (trades[i]._id == tradeId) {

                    sourceHistoryData.action = targetUser + " accepted your trade request!";
                     targetHistoryData.action = "Accepted trade request from " + sourceUser;

                     sourceHistoryData.userbook = sourceBook;
                     sourceHistoryData.otherbook = targetBook;

                    targetHistoryData.userbook = targetBook;
                    targetHistoryData.otherbook = sourceBook;

                    historyArray.push(sourceHistoryData);
                    historyArray.push(targetHistoryData);
                  } else {
                    const cancelHistSource = {
                      action: targetUser + " rejected your trade request",
                      userbook: sourceBook,
                      otherbook: targetBook,
                      userId: trades[i].sourceUserId,
                      time: time
                    }

                    const cancelHistTarget = {
                      action: "Rejected trade request from "  + sourceUser,
                      userbook: targetBook,
                      otherbook: sourceBook,
                      userId: trades[i].targetUserId,
                      time: time
                    }

                    historyArray.push(cancelHistSource);
                    historyArray.push(cancelHistTarget);
                  }
                }

                History.insertMany(historyArray, (err, docs) => {
                  if (err) {res.status(401).json({errors: "failed to add history"})};
                  res.status(200).json({message:'success'});
                });
              });
            });
          });
        });
      });
    }
  });
});

router.post('/rejecttrade', function(req, res, next) {
  console.log('request to reject trade');
  const tradeId = req.body.tradeId.trim();

  Trade.findOne({ _id: tradeId }, (err, trade) => {
    if (err) {res.status(400).json({errors:'Error: trade lookup failed'})};

    if (!trade) {
      res.status(400).json({errors:'Sorry, we couldn\'t find that trade. It may have been cancelled. Try refreshing the page.'});
    } else {
      trade.remove();
      const time = new Date();

      const sourceHistoryData = {
        userId: trade.sourceUserId,
        time: time
      }
      const targetHistoryData = {
        userId: trade.targetUserId,
        time: time
      }

      const bookIds = [trade.sourceBookId, trade.targetBookId];
      const userIds = [trade.sourceUserId, trade.targetUserId];

      User.find( { _id : { $in : userIds}}, (err, users) => {
        if (err) {res.status(400).json({errors:'user lookup failed'})};

        const sourceUser = users[users.findIndex(u => u._id == trade.sourceUserId)].username;
        const targetUser = users[users.findIndex(u => u._id == trade.targetUserId)].username;

        sourceHistoryData.action = targetUser + " rejected your trade request";
        targetHistoryData.action = "Rejected trade request from " + sourceUser;

        Book.find( {_id: {$in : bookIds }}, (err, books) => {
          if (err) {res.status(400).json({errors:'book lookup failed'})};
          
          const sourceBook = books[books.findIndex(b => b._id == trade.sourceBookId)].title;
          const targetBook = books[books.findIndex(b => b._id == trade.targetBookId)].title;

          sourceHistoryData.userbook = sourceBook;
          sourceHistoryData.otherbook = targetBook;
          targetHistoryData.userbook = targetBook;
          targetHistoryData.otherbook = sourceBook;

          History.insertMany([sourceHistoryData, targetHistoryData], (err, docs) => {
                if (err) {res.status(401).json({errors: "failed to add history"})};
                res.status(200).end();
          })
        });
      })
    }
  });
});

router.post('/canceltrade', function(req, res, next) {
  console.log('request to cancel trade');
  const tradeId = req.body.tradeId.trim();

  Trade.findOne({ _id: tradeId }, (err, trade) => {
    if (err) {res.status(400).json({errors:'trade lookup failed'})};

    if (!trade) {
      res.status(400).json({errors:'Sorry, we couldn\'t find that trade. It may have already been accepted or rejected. Try refreshing the page.'});
    } else {
      trade.remove();
      const time = new Date();

      const sourceHistoryData = {
        userId: trade.sourceUserId,
        time: time
      }
      const targetHistoryData = {
        userId: trade.targetUserId,
        time: time
      }

      const bookIds = [trade.sourceBookId, trade.targetBookId];
      const userIds = [trade.sourceUserId, trade.targetUserId];

      User.find( { _id : { $in : userIds}}, (err, users) => {
        if (err) {res.status(400).json({errors:'user lookup failed'})};

        const sourceUser = users[users.findIndex(u => u._id == trade.sourceUserId)].username;
        const targetUser = users[users.findIndex(u => u._id == trade.targetUserId)].username;

        sourceHistoryData.action = "Canceled trade request with " + targetUser;
        targetHistoryData.action = sourceUser + " canceled trade request";

        Book.find( {_id: {$in : bookIds }}, (err, books) => {
          if (err) {res.status(400).json({errors:'book lookup failed'})};
          
          const sourceBook = books[books.findIndex(b => b._id == trade.sourceBookId)].title;
          const targetBook = books[books.findIndex(b => b._id == trade.targetBookId)].title;

          sourceHistoryData.userbook = sourceBook;
          sourceHistoryData.otherbook = targetBook;
          targetHistoryData.userbook = targetBook;
          targetHistoryData.otherbook = sourceBook;

          History.insertMany([sourceHistoryData, targetHistoryData], (err, docs) => {
                if (err) {res.status(401).json({errors: "failed to add history"})};
                res.status(200).end();
          })
        });
      })
    }
  })
});

router.post('/getnumbertrades', function(req, res, next) {
  console.log('request for number of trades');
  const userId = req.body.userId.trim();

  Trade.find({ targetUserId: userId }, (err, trades) => {
    if (err) {res.status(400).json({errors:'trade lookup failed'})};
    res.status(200).json({numtrades:trades.length});
  });
});

router.use('/', (req, res) => {
  res.status(400).end();
});

module.exports = router;