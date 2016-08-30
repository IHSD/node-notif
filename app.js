var config = {
    api_key     : process.env.API_KEY,
    api_secret  : process.env.API_SECRET,
    ws_port     : process.env.WS_PORT,
    http_port   : process.env.HTTP_PORT,
    ssl : {
        key     : process.env.SSL_KEY,
        cert    : process.env.SSL_CERT,
        ca      : process.env.SSL_CA
    }
};

console.log("----------------------------------");
console.log("NodeJS Notification Server started");
console.log("----------------------------------");
console.log("API_KEY : "+config.api_key);
console.log("API_SECRET : "+config.api_secret);
var fs = require('fs');
var app = require('express')();
var https = require('https');
var port = 8443;
var options = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert),
    //ca: fs.readFileSync(config.ssl.ca),
    rejectUnauthorized: false,
    requestCert: false
};
if(config.ssl.ca) options.ca = fs.readFileSync(config.ssl.ca);

var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});
var io = require('socket.io')(server);
var parser = require('body-parser');
server.listen(port);
/**
 * Our connected sockets
 */
var sockets = [];

app.use(parser.json());

app.get('/admin/connections', function(req, res, next) {
    res.send(JSON.stringify({
        sockets: sockets
    }));
})
/**
 * Create notification
 */
app.post('/notifications', function(req, res, next) {
    // Check  supplied API Key
    var api_key = req.headers['x-notif-api-key'];
    var uid = req.headers['x-notif-user-id'];
    if(api_key !== config.api_key) {
        console.log("Invalid API Key supplied");
        return res.send(JSON.stringify({
            error: "Invalid API Key"
        }));
    }

    if(!sockets[uid]) {
        console.log("No clients connected for user "+uid);
        return res.end();
    }
    var socket = sockets[uid][0];
    var notif_data = {
        'text' : req.body.text,
        'link' : req.body.link,
        'subject' : req.body.subject
    };
    socket.emit("notification", notif_data);
    res.send();
});

app.post('/trigger', function(req, res, next) {
  var api_key = req.headers['x-notif-api-key'];
  var uid = req.headers['x-notif-user-id'];
  var event = req.headers['x-notif-event'];
  if(api_key !== config.api_key) {
    console.log("Trigger event received");
    return res.json({
      error: "Invalid API Key"
    });
  }

  if(!sockets[uid]) {
    return res.end();
  }

  var socket = sockets[uid][0];
  var notif_data = req.body;
  console.log("Emitting socket event");
  console.log(notif_data);
  console.log(event);
  socket.emit(event, notif_data);
  res.end();
})

/**
 * Handle socket connections
 */
io.on('connection', function(socket) {
    var user_id = socket.request._query['user'];
    if(!sockets[user_id]) sockets[user_id] = [];
    sockets[user_id].push(socket);
    socket.emit('onload', 'success');
})
