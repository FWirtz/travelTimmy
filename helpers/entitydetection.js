// Imports the Google Cloud client library
const LanguageServiceClient = require('@google-cloud/language')
  .LanguageServiceClient;

// Creates a client
const language = new LanguageServiceClient();


// Example call
/*
    entitydetector.getCity("I live in London, Rio, New York and my Hotel room", function(result) {
        res.send(result)
    })
*/

module.exports.getCity = function(text, callback){

  var  document = {content: text, type: 'PLAIN_TEXT'};

  language
  .analyzeEntities({document: document})
  .then(results => {
    const entities = results[0].entities;
    var places = []
    entities.forEach(entity => {
      if (entity.type == 'LOCATION') {
        console.log(entity.name);
        places.push(entity.name);
      }
    });
    callback(places);
  })
  .catch(err => {
    console.error('ERROR:', err);
  });
}
