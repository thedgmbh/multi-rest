const path = require('path');
const AWS = require('aws-sdk');
const fs = require('fs-extra');
const _ = require('lodash');

module.exports = (options, file, key, callback) => {
	const s3 = new AWS.S3({ endpoint: options.driver.endpoint, signatureVersion: options.driver.signatureVersion, region: options.driver.region });
	if (file.path) {
		let newPath = path.join(options.driver.path, key, file.name);
		s3Upload(s3, options, newPath, file, (err, data) => {
			if (err) {
				callback(err)
			} else {
				fs.unlinkSync(file.path);
				file.ETag = data.ETag.replace('"');
				file.path = newPath;
				if (file.thumbnail) {
					if (typeof file.thumbnail == 'object') {
						_.forEach(file.thumbnail, (value, number) => {
							let newPath = path.join(options.driver.path, key, '/thumbnails/', `${ path.parse(value).base.toString()}`).toString();
							s3Upload(s3, options, newPath, {path: value, type: 'image/jpeg'}, (err, data) => {
								fs.unlinkSync(value);
								file.thumbnail[number] = newPath;
								if ( number == file.thumbnail.length -1 && data ) {
									callback(null, file)
								}		
							});
						});
					} else {
						let newPath = path.normalize(path.join(options.driver.path, key, '/thumbnails/', `${file.name.split(".")[0]}.jpg`).toString());
						s3Upload(s3, options, newPath, {path: file.thumbnail, type: 'image/jpeg'}, (err, data) => {
							fs.unlinkSync(file.thumbnail);
							file.thumbnail = newPath;
							callback(null, file)		
						});
					}
				} else {
					callback(null, file)		
				}
			}
		})
		
	}	
}

// private function to upload to s3
let s3Upload = (s3, options, key, file, callback) => {
	let params = {Bucket: options.driver.bucketName, Key: key, ContentType: file.type, Body: fs.createReadStream(file.path)};
	s3.upload(params, function(err, data) {
		if (err) return callback(err, null)
		if (data) return callback(null, data);	
	});
}