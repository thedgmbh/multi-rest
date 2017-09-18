"use strict";

const errors = require('restify-errors');
const async = require('async');
const driver = require('./_lib/drivers');
const path = require('path');
const im = require('imagemagick');
const fs = require('fs-extra');

module.exports = class multi {
	constructor (options) {
		return (req, res, next) => {
			if (typeof options.driver == 'object') {
				this._process(options, req.files, (err, files) => {
					if (err) {
						return next(new errors.InternalServerError({message: err}));
					} else {
						req.files = files;
						return next();	
					}
				})
			} else {
				return next(new errors.InternalServerError({message: 'No driver provided.'}));
			}
		}
	}

	_process (options, files, callback) {
		async.forEachOf(options.filefields, function (value, key, callback) {
			if (value.required && !files[key]) {
				callback('Please add the required fields.');
			} else if (typeof files[key] == 'object'){
				let {name, ext} = filename(files[key].name)
				if (typeof options.filename  == 'function') {
					files[key].name = `${options.filename(name)}.${ext}`;
				} 
				thumbnail(value, files[key].toJSON(), (err, file) => {
					storage(options, file, (err, file) => {
						files[key] = file;	
						callback();
					})
				})
			} else {
				callback();
			}
		}, function (err) {
		    return callback(err, files);
		});
	}
}

let thumbnail = (options, file, callback) => {
	let {root, dir, base, ext, name} = path.parse(file.path);
	let dstPath = `${dir}/thumbnails/${path.basename(file.name, ext)}jpg`
	fs.mkdirpSync(`${dir}/thumbnails/`);
	if (options.type == 'picture'  && typeof options.thumbnail == 'object') {
		im.resize({
			srcPath: file.path,
			dstPath: dstPath,
			format: 'jpg',
			progressive: false,
			width:   options.thumbnail.width || 0,
			height:   options.thumbnail.height || 0
		}, function(err, stdout, stderr){
			if (err) {
				callback('Error while creating the thumbnail.');
			} else {
				file.thumbnail = dstPath;
				callback(null, file);
			}
		});
	} else {
		callback(null, file);
	}
}

let storage = (options, file, callback) => {
	if (options.driver.type == 'local') {
		driver.local(options, file, callback)
	}
}

let filename = (name) => {
	let nameArray = name.split(".");
	return { 
		name: nameArray[0],
		ext: nameArray[1]
	}
}

