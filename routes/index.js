var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');

require('dotenv').load();
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const nlu = new NaturalLanguageUnderstandingV1({
  'username': process.env.username,
  'password': process.env.password,
  'version_date': '2017-02-27'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/analysis', function(req, res, next) {
  var parameters = {
    'url': req.body.url,
    'features': {
      'emotion': {}
    }
  }


  nlu.analyze(parameters, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      res.send(response)
  });

});

router.post('/news', function(req, res, next) {
  var urlBase="https://newsapi.org/v1/articles?source="
  urlBase += req.body.source + "&sortBy=top&apiKey=" + process.env.news_api_key;

  request(urlBase, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(body);
      }
  })
});

module.exports = router;
