"use strict";

const fs = require('fs-extra');
const fileExtension = require('file-extension');

// constractor
function Upload(data){
	return function (req, res, next) {
		moveFile(req.files, data,function(err, files){
			if (err) return res.send(err);
			req.files = files;
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
		name: file.name
	};
}
// moving the files
function moveFile(files, options, callback){
	let l = 1;
	// loop into the files array and move 
	// the file to the the path that used want 
	options.filefields.forEach(function(field) {
		if (typeof files[field] == 'undefined') {
			// check if the field is medtory or not
			if (options.used == "maybe") {
				next()
			} else if (options.used == "must") {
				return callback({code: "ExternalError", messege: "Cannot read property '" + field + "' of undefined"}, null)
			}
		}else {
		    var newPath = options.uploadDir + filename(files[field].name, options);
			fs.move(files[field]
				.path,  newPath , function (err) {
				if (err) return callback({code: "InternalError", messege: "Error happen while uploading."}, null)
				files[field].path = newPath;
				files[field] = restructure(files[field]);
				if (options.filefields.length == l) {
					clean();
				 	return callback(null, files);
				}else{
					l++;	
				}
			});	
		}
	});
	
}
// cleaning unwanted file after handling the files
function clean(){
	fs.removeSync('./upload_*')
}
module.exports = Upload;
