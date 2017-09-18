const fs = require('fs-extra');
const path = require('path');

module.exports = (options, file, callback) => {
	if (file.path) {
		let newPath = path.join(options.driver.path, file.name);
		fs.copySync(file.path, newPath);
		fs.unlinkSync(file.path);
		file.path = newPath;
	}
	if (file.thumbnail) {
		let newPath = path.normalize(`${options.driver.path}/thumbnails/${file.name.split(".")[0]}.jpg`);
		fs.copySync(file.thumbnail, newPath);
		fs.unlinkSync(file.thumbnail);
		file.thumbnail = newPath;
	}
	callback(null, file)
}