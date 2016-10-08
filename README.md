# Multi Rest (beta)

> This package is in early stage.

A middleware to handle multi-part request for restify, cause [restify](http://restify.com) cause of body-parser isn't working as is should be (it doesn't work at all), and as all nodejs framework is use http server at the end so I built this as if I'm dealing with http request.


Feel free to contact me [M. Mahrous](mailto:m.mahrous.94@gmail.com) and improve the code.

#### Example:

```javascript

const restify = require('restify');
const upload = require('multi-rest');

var server = restify.createServer();

upload.options({uploadDir: "./uploads/", filename: 'random', filefield: 'image', used: 'maybe'});

server.post('/upload', upload ,function (req, res, next){
	res.send({success: true, message: "file uploaded :)"});
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});

```




#### File naming

Right now it's only support random file naming, will add more later;



#### License
Licensed under MIT
