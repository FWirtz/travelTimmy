const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs');
var http = require('http');
var https = require('https');

const entitydetector = require('./helpers/entitydetection')
const skyscanner = require('./helpers/skyscanner')
const twist = require('./helpers/twist');

var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

app.get('/', function (req, res) {
    console.log('Hello World');
})

//
// TWIST ROUTES
//

app.post('/command', function (req, res) {
    var command = req.body.command_argument;
    var thread_id = Number(req.body.thread_id);

    if(command){
        console.log(command);
        if(command.length > 0) {
            var city = entitydetector.getCity(command)

            if(city){

            }else{
                twist.postComment(thread_id, 'Without destination I\'m afraid I cannot help you. :(');
                console.log("No destination specified!")
            }
        }
    }else{
        twist.postComment(thread_id, 'Don\'t hesitate to ask me something!');
        console.log('No command recognized!');
    }
})

app.post('/commentadded', function(req, res){
    var comment = req.body.comment;

    if(comment.thread_id && comment.thread_id == twist.thread.thread_id && twist.thread.awaitingResponse){
        twist.processResponse(comment.content);
    }else{
        console.log("No thread specified for added comment or comment was no response to current thread.")
    }
})


//
// Skyscanner routes
//
app.get('/flight/:destination/:dateStart', function(req, res) {
    const params = req.params
    skyscanner.getFlightSuggestion([params.dateStart], params.destination, (result) => {
        res.json(result)
    })
})
app.get('/flight/:destination/:dateStart/:dateEnd', function (req, res) {
    const params = req.params
    skyscanner.getFlightSuggestion([params.dateStart, params.dateEnd], params.destination, (result) => {
        res.json(result)
    })
})

httpServer.listen(3000, function () {
    console.log('Example app listening on port 3000!')
    twist.subscribeToComments();
})
httpsServer.listen(4000, function () {
    console.log('Example app listening on port 4000!')
    twist.subscribeToComments();
})


