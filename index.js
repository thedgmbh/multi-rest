"use strict";

const fs = require('fs-extra');
const fileExtension = require('file-extension');
const Thumbler = require('thumbler');
// constractor
function Upload(data){
	return function (req, res, next) {
		moveFile(req.files, data,function(err, files){
			if (err) return res.send(err);
			next();
		});	
	}
}
// renaming the file
function filename(name, options){
	if (options.filename == "random") {
		return Math.random().toString(36).substring(7) + '.' + fileExtension(name);
	}else if (options.filename == "same") {
		return name.replace(fileExtension(name), '') + fileExtension(name);
	}else if (options.filename == "plus_date") {
		return name.replace('.' + fileExtension(name), '') + '_' + new Date().toString().replace(/ /g, '_') + '.' + fileExtension(name);
	} else {
		return Math.random().toString(36).substring(7) + '.' + fileExtension(name);
	}
}
// clean the file object from unwanted attributes 
function restructure(file){
	return {
		path: file.path,
		type: file.type, 
		size: file.size,
		name: file.name,
		thumbnail: file.thumbnail
	};
}
// moving the files
function moveFile(files, options, callback){
	let l = 1;
	// loop into the files array and move 
	// the file to the the path that used want 
	options.filefields.forEach(function(field, index) {
		if (typeof(files) === 'undefined' || typeof(files[field]) === 'undefined') {
			// check if the field is medtory or not
			if (options.used == "maybe") {
				callback(null, null);
			} else if (options.used == "must") {
				return callback({code: "ExternalError", messege: "Cannot read property '" + field + "' of undefined"}, null)
			}
		}else {
		    var newPath = options.uploadDir + filename(files[field].name, options);
			fs.move(files[field].path,  newPath , function (err) {
				if (err) return callback({code: "InternalError", messege: "Error happen while uploading."}, null)
				if (typeof(options.thumbnail) === 'object') {
					thumbnail(newPath, options, function(err, path){
						files[field].thumbnail = path;
						files[field].path = newPath;
						files[field] = restructure(files[field]);
						if (options.filefields.length - 1 == index) {
						 	return callback(null, files);
						}
					});
				}else {
					files[field].path = newPath;
					files[field] = restructure(files[field]);	
					if (options.filefields.length - 1 == index) {
					 	return callback(null, files);
					}
				}
			});	
		}
	});
}

function thumbnail(path, options, callback){
	fs.mkdirpSync(options.uploadDir+'thumbnails/');
	Thumbler({
		type: options.thumbnail.type, 
		input: path,
		output: options.uploadDir+'thumbnails/'+Math.random().toString(36).substring(7)+'.jpeg', 
		time: '00:00:01',
		size: options.thumbnail.size, 
	}, function(err, path){
	    if (err) return callback(err, null);
	    return callback(null, path)
	});
}
module.exports = Upload;