"use strict";

const restify = require('restify');
const Multi = require('./index');

var server = restify.createServer();


var upload_disk = new Multi({ 
						uploadDir: "./uploads/", 
						filename: 'random', 
						filefields: ['video'], 
						extensions: ['mp4'],
						thumbnail: {type: 'video'}, 
						used: 'maybe'});

var upload_s3 = new Multi({driver: { type: 's3', 
						endpoint: 's3-accelerate.amazonaws.com', 
						signatureVersion: 'v4', 
						region: 'eu-central-1', 
						bucketName: 'bucketName'
					}, 
					uploadDir: "uploads/", 
					filename: 'random', 
					filefields: ['video'], 
					extensions: ['mp4'],
					thumbnail: {type: 'video'}, 
					used: 'maybe'});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

server.post('/upload/s3', upload_s3 ,function (req, res, next){
    res.send(req.files);
});

server.post('/upload/disk', upload_disk ,function (req, res, next){
    res.send(req.files);
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});