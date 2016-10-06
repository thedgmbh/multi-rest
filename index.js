const fs = require('fs-extra');
const fileExtension = require('file-extension');
var upload = {};
var options;

upload = function (req, res, next) {
	if (!req.files[options.filefield]) res.send({code: "ExternalError", messege: "Cannot read property '" + options.filefield + "' of undefined"})
	var newPath = options.uploadDir + filename(req.files[options.filefield]) + '.' + fileExtension(req.files[options.filefield].name);
	fs.move(req.files[options.filefield].path,  newPath , function (err) {
		if (err) return console.error(err)
		delete req.files[options.filefield].domain;
		delete req.files[options.filefield]._writeStream;
		delete req.files[options.filefield]._events;
		delete req.files[options.filefield]._eventsCount;
		delete req.files[options.filefield]._maxListeners;
		req.files[options.filefield].path = newPath;
		next();
	})
}

upload.options = function (data) {
	options = data;
}

function filename(options){
	if (options.filename = 'random') {
		return Math.random().toString(36).substring(7);
	} else {
		Math.random().toString(36).substring(7);
	}
}
module.exports = upload;