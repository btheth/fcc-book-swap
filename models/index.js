const mongoose = require('mongoose');

module.exports.connect = (uri) => {
	//console.log('connecting')
  	mongoose.connect(uri);
  	// plug in the promise library:
  	mongoose.Promise = global.Promise;

 	mongoose.connection.on('error', (err) => {
    	console.error(`Mongoose connection error: ${err}`);
    	process.exit(1);
  	});

  	// load models
  	require('./user');
    require('./book');
    require('./trade');
    require('./history');
  	//console.log('connected')
};