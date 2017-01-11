"use strict";

const ImagesClient = require('./google-image-search');
const secrets = require('./secrets');

const express = require('express');

const mongo = require('mongodb').MongoClient;

const app = express();

const mongoUrl = 'mongodb://localhost:27017/imagesearch';

let client = new ImagesClient(secrets.googleSearch.CSE_ID, secrets.googleSearch.API_Key);

var insertSearch = function insertSearch (searchTerm) {
    
  mongo.connect(mongoUrl, function(err, db) {
  
    if (err) {
      console.log(err);
      throw(err);
    }
  
    var collection = db.collection('searchterms');
  
    collection.insert(
      {
        term: searchTerm,
        when: new Date()
      }
    );
        
    db.close();
    
  })
};

var getTerms = function getTerms (callback) {
    
  mongo.connect(mongoUrl, function(err, db) {
  
    if (err) {
      console.log(err);
      throw(err);
    }
  
    var collection = db.collection('searchterms');
  
    var options = {
      limit: 10,
      sort: [['when','desc']]
    };
  
    collection.find(
      {},
      { _id: false },
      options
    ).toArray(function(err, docs) {
      if (err) {
        console.log(err);
        throw(err);
      }     
      
      callback(docs);
      db.close();

    });
    
  })
};


app.get('/latest/imagesearch', function (req, res) {
  
  getTerms(function (docs) {
    res.send(docs);
  });
});

app.get('/*', function (req, res) {
    
  console.log('Found an image query ' + req.params[0]);

  insertSearch(req.params[0]);

  if ( ! req.params[0]) {
    res.send('You need to specify a search query at the end of the URL.');
    return;
  }

  client.search(req.params[0], { page: req.query.offset })
    .then(function (images) {
      
      var out = (images.items || []).map(function (item) {
        return {
            url: item.link,
            snippet: item.snippet,
            thumbnail: item.image.thumbnailLink,
            context: item.image.contextLink
          };
      });

      res.send(out);
    });    
});

app.listen(8080, function () {
  console.log('freeCodeCamp Image Search app listening on port 8080.');
});

 
 
