"use strict";

const ImagesClient = require('./google-image-search');
const secrets = require('./secrets');

const express = require('express');
const app = express();

let client = new ImagesClient(secrets.googleSearch.CSE_ID, secrets.googleSearch.API_Key);

app.get('/*', function (req, res) {
    
  console.log('Found an image query ' + req.params[0]);
    
  client.search(req.params[0])
    .then(function (images) {
      res.send(images);
    });    
});

app.listen(8080, function () {
  console.log('freeCodeCamp Image Search app listening on port 8080.');
});

 
 
