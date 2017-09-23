"use strict";

const errors = require('restify-errors');
const async = require('async');
const driver = require('./_lib/drivers');
const path = require('path');
const im = require('imagemagick');
const fs = require('fs-extra');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);


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
					storage(options, file, key, (err, file) => {
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
		}, (err, stdout, stderr) => {
			if (err) {
				callback('Error while creating the thumbnail.');
			} else {
				file.thumbnail = dstPath;
				callback(null, file);
			}
		});
	} else if (options.type == 'video'  && typeof options.thumbnail == 'object') {
		ffmpeg.ffprobe(file.path, (err, metadata) => {
			let v_width = metadata.streams[0].width;
			let v_height = metadata.streams[0].height;
			let t_width = v_width;
			let t_height = v_height;
			if (options.thumbnail.width && options.thumbnail.height) {
				t_width = options.thumbnail.width;
				t_height = options.thumbnail.height;
			} else if (options.thumbnail.width) {
				t_width = options.thumbnail.width;
				t_height = (v_height* t_width/v_width);
			} else if (options.thumbnail.height) {
				t_height = options.thumbnail.height;
				t_width = (t_height* v_width/v_height);
			}
			if (!options.thumbnail.time || metadata.format.duration < 2) {
				options.thumbnail.time = ['00:00:01'];
			}
			let thumbnails = [];
			let filename; 
			if (options.thumbnail.count > 1) {
				filename = `${file.name.split(".")[0]}-%i.jpg`;
			} else {
				filename = `${file.name.split(".")[0]}.jpg`;
			}
		    ffmpeg(file.path)
		    .on('filenames', (filenames) => {
		    	if (options.thumbnail.count > 1) {
		    		thumbnails = filenames.map( (n) => {
		    			return `${dir}/thumbnails/${n}`
		    		});
		    	}
		    })
		    .on('end', () => {
		    	file.thumbnail = (thumbnails.length > 1) ? thumbnails : `${dir}/thumbnails/${file.name.split(".")[0]}.jpg`;
		    	callback(null, file);
		    })
		    .screenshots({
		    	count: options.thumbnail.count || 1,
		    	size: `${Math.floor(t_width)}x${Math.floor(t_height)}`,
		    	filename: filename,
		    	timestamps: options.thumbnail.time,
		    	folder: `${dir}/thumbnails`
		    });	
		});
	} else {
		callback(null, file);
	}
}

let storage = (options, file, key, callback) => {
	if (options.driver.type == 'local') {
		driver.local(options, file, key, callback)
	} else if (options.driver.type == 's3') {
		driver.s3(options, file, key, callback)
	}
}

let filename = (name) => {
	let nameArray = name.split(".");
	return { 
		name: nameArray[0],
		ext: nameArray[1]
	}
}

