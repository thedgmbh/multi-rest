# Multi Rest (beta)

> This package is in early stage.

A middleware to handle multi-part request for restify, cause [restify](http://restify.com) cause of body-parser isn't working as is should be (it doesn't work at all), and as all nodejs framework is use http server at the end so I built this as if I'm dealing with http request, this module can handle diffrent file 

## Features: 
	- Path handler.
	- Filenaming. 
	- Upload more then one file in the same request. 
	- Thumbnails for images & videos.

## In progress 
	- Handling multiple files under the same fieldname.
	- Adding more naming convention.
	- ......


[![NPM](https://nodei.co/npm/multi-rest.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/multi-rest/)

#### Example:

```javascript

const restify = require('restify');
const Multi = require('multi-rest');

var server = restify.createServer();

var upload = new Multi({uploadDir: "./uploads/", filename: 'random', filefields: ['image', 'icon'], used: 'maybe'});

server.post('/upload', upload ,function (req, res, next){
	res.send({success: true, message: "file uploaded :)"});
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

```




#### File naming

##### Random 
This use a Math.random library to create the file name
```
{ filename: 'random' }
```
##### Same name 
This use the name of the uploaded file .
```
{ filename: 'same' }
```
##### Plus date
This will add after the name of the uploaded file the timestamp when the file uploaded.
```
{ filename: 'plus_date' }
```
##### Date
This use new Date() to create the file name (not prefeared when uploading more then one file)
```
{ filename: 'date' }
```
#### License
Licensed under MIT

#### Author
M. Mahrous
Feel free to contact me [M. Mahrous](mailto:m.mahrous.94@gmail.com) and improve the code.
