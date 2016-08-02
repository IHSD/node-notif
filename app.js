var config = {
    api_key     : process.env.API_KEY,
    api_secret  : process.env.API_SECRET,
    ws_port     : process.env.WS_PORT,
    http_port   : process.env.HTTP_PORT,
    db : {
        user    : process.env.MONGODB_USER,
        pass    : process.env.MONGODB_PASS,
        host    : process.env.MONGODB_HOST,
        name    : process.env.MONGODB_NAME,
        port    : process.env.MONGODB_PORT
    },
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

/**
 * Instantiate our DB connection
 */
var mongo = require('mongodb');
var db;
var mongodsn = "mongodb://"+config.db.host+":"+config.db.port+"/"+config.db.name;
mongo.connect(mongodsn, function(err, database) {
    if(err) return console.log(err);
    db = database;
});

app.use(parser.json());

/**
 * Render our test home page
 */
app.get('/', function(req, res, next) {
    res.sendFile(__dirname+"/index.html");
})

/**
 * Create notification
 */
app.post('/notifications', function(req, res, next) {
    console.log("Notification received");
    console.log(req.body);
    // Check  supplied API Key
    var api_key = req.headers['x-notif-api-key'];
    var uid = req.headers['x-notif-user-id'];
    if(api_key !== config.api_key) {
        console.log("Invalid API Key supplied");
        return res.send(JSON.stringify({
            error: "Invalid API Key"
        }));
    }

    // Create the notification, and emit to registered clients
    db.collection('notifications').insertOne({
        "text"      : req.body.text,
        "link"      : req.body.link,
        "subject"   : req.body.subject,
        "unread"    : false,
        "user_id"   : uid,
        "created_at": Date.now()
    }, function(err, result) {
        if(err) return console.log(err);
        if(!sockets[uid]) {
            console.log("No clients connected for user "+uid);
            return res.end();
        }
        for(var i = 0; i < sockets[uid].length; i++) {
            var notif_data = {
                'text' : req.body.text,
                'link' : req.body.link,
                'subject' : req.body.subject
            };
            sockets[uid][i].emit("notification", notif_data);
        }
        res.send();
    });
})
/**
 * Handle socket connections
 */
io.on('connection', function(socket) {
    var user_id = socket.request._query['user'];
    console.log("Connection for "+user_id);
    if(!sockets[user_id]) sockets[user_id] = [];
    sockets[user_id].push(socket);
    console.log("Socket connected successfully");
    socket.emit('onload', 'success');
})
