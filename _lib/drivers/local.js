const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

module.exports = (options, file, key, callback) => {
	if (file.path) {
		let newPath = path.join(options.driver.path, key, file.name);
		fs.copySync(file.path, newPath);
		fs.unlinkSync(file.path);
		file.path = newPath;
	}
	if (file.thumbnail) {
		if (typeof file.thumbnail == 'object') {
			_.forEach(file.thumbnail, (value, number) => {
				let newPath = path.join(options.driver.path, key, '/thumbnails/', `${ path.parse(value).base.toString()}`).toString();
				fs.copySync(value, newPath);
				fs.unlinkSync(value);
				file.thumbnail[number] = newPath;
			});
		} else {
			let newPath = path.normalize(path.join(options.driver.path, key, '/thumbnails/', `${file.name.split(".")[0]}.jpg`).toString());
			fs.copySync(file.thumbnail, newPath);
			fs.unlinkSync(file.thumbnail);
			file.thumbnail = newPath;
		}
	}
	callback(null, file)
}