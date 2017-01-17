"use strict";

const AWS = require('aws-sdk');
const mime = require('mime');
const fs = require('fs-extra');
const f = require('./functions');

const driver = {};

driver.s3 = function (options, files, callback) {
	var s3 = new AWS.S3({ endpoint: options.driver.endpoint, signatureVersion: options.driver.signatureVersion, region: options.driver.region });
	options.filefields.forEach(function(field, index) {
		f.check(files, field, options, function(err, next){
			if (err) return callback(err, null);
			if (next) {
				var key = options.uploadDir + f.filename(files[field].name, options);
				s3Put(s3, options.driver.bucketName, key, files[field].path, files[field].type, function(err, done){
					if (err) return callback(err, null)
					if (done)
						if (typeof(options.thumbnail) === 'object') {
							f.thumbnail(files[field].path, options, function(err, path){
								if (err) return callback(err, null)
								if (path)
									s3Put(s3, options.driver.bucketName, path, path, mime.lookup(path), function(err, done){
										if (err) return callback(err, null)
										if (done)
											f.clean([files[field].path, path]); // remove files from tmp disk
											files[field].thumbnail = path;
											files[field].path = key;
											files[field] = f.restructure(files[field]);
											if (options.filefields.length - 1 == index) return callback(null, files);
									})
							});
						} else { 
							f.clean([files[field].path]); // remove files from tmp disk
							files[field].path = key;
							files[field] = f.restructure(files[field]);
							if (options.filefields.length - 1 == index) return callback(null, files);
						}
				})
			} else {
				return callback(null, null);
			}
		});
	});
}

driver.disk = function (options, files, callback) {
	options.filefields.forEach(function(field, index) {
		f.check(files, field, options, function(err, next){
			if (err) return callback(err, null);
			if (next) { 
			    var newPath = options.uploadDir + f.filename(files[field].name, options);
				fs.move(files[field].path,  newPath , function (err) {
					if (err) return callback({code: "InternalError", messege: "Error happen while uploading."}, null)
					if (typeof(options.thumbnail) === 'object') {
						f.thumbnail(newPath, options, function(err, path){
							files[field].thumbnail = path;
							files[field].path = newPath;
							files[field] = f.restructure(files[field]);
							if (options.filefields.length - 1 == index) return callback(null, files);
						});
					}else {
						files[field].path = newPath;
						files[field] = f.restructure(files[field]);	
						if (options.filefields.length - 1 == index) return callback(null, files);
					}
				});	
			} else {
				return callback(null, null);
			}
		});
	});
}


// private function to upload to s3
function s3Put(s3, bucketName, key, file, type, callback){
	let params = {Bucket: bucketName, Key: key, ContentType: type, Body: fs.createReadStream(file)};
	s3.putObject(params, function(err, data) {
		if (err) return callback(err, null)
		if (data) return callback(null, true);	
	});
}


module.exports = driver;