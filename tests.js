"use strict";

const restify = require('restify');
const Multi = require('./index');
const uuid = require('uuid');

var server = restify.createServer();


var upload_disk = new Multi({  
							 	driver: {
									type: 'local',
									path: "./uploads/" 
								},	
								filename: (name) => { // the extention will be added automaticlly 
									return uuid.v4();
								}, 
							    filefields: {
							        video: {
							            type: 'video',
							            thumbnail: {
							            	height: 100,
							            	time: ['00:01:03'],
							            	count: 1
							            },
							            required: false,
							            extensions: ['mp4']
							        },
							        image: {
							            type: 'picture',
							            thumbnail: {
							            	width: 400,
							            	height: 300
							            },
							            required: false,
							            extensions: ['png', 'jpg']
							        }
							    },
							});

var upload_s3 = new Multi({
						    driver: {
						        type: 's3',
						        endpoint: 's3-accelerate.amazonaws.com',
						        signatureVersion: 'v4',
						        region: 'eu-central-1',
						        bucketName: 'bucketName',
						        path: ''
						    },
						    filename: (name) => { // the extention will be added automaticlly 
						        return uuid.v4();
						    },
						    filefields: {
						        video: {
						            type: 'video',
						            thumbnail: {
						                height: 100,
						                time: ['00:01:03'],
						                count: 1
						            },
						            required: false,
						            extensions: ['mp4']
						        },
						        image: {
						            type: 'picture',
						            thumbnail: {
						                width: 400,
						                height: 300
						            },
						            required: false,
						            extensions: ['png', 'jpg']
						        }
						    },
						});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.post('/upload/s3', upload_s3 ,function (req, res, next){
    res.send(req.files);
});

server.post('/upload/disk', upload_disk ,function (req, res, next){
    res.send(req.files);
});

server.listen(4000, function() {
  console.log('%s listening at %s', server.name, server.url);
});