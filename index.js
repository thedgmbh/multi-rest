"use strict";

const driver = require('./func/driver');
// constractor
function Upload(data){
	return function (req, res, next) {
		moveFile(req.files, data,function(err, files){
			if (err) return res.send(err);
			next();
		});	
	}
}

// moving the files
function moveFile(files, options, callback){
	// check the driver
	if (options.driver && options.driver.type == 's3') {
		driver.s3(options, files, function(err, files){
			if (err) return callback(err, null);
			return callback(null, files)
		})
	}else {
		driver.disk(options, files, function(err, files){
			if (err) return callback(err, null);
			return callback(null, files)
		})
	}
}


module.exports = Upload;