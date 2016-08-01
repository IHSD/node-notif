var config = {
    api_key     : process.env.API_KEY,
    api_secret  : process.env.API_SECRET,
    db : {
        user    : process.env.DB_USER,
        pass    : process.env.DB_PASS,
        host    : process.env.DB_HOST,
        name    : process.env.DB_NAME,
        port    : process.env.DB_PORT
    }
};

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(app.listen(3000));
var parser = require('body-parser');

/**
 * Our connected sockets
 */
var sockets = [];

/**
 * Instantiate our DB connection
 */
var mongo = require('mongodb');
var db;
mongo.connect("mongodb://"+config.db.host+":"+config.db.port+"/"+config.db.name, function(err, database) {
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
    // Check  supplied API Key
    var api_key = req.headers['x-notif-api-key'];
    console.log(api_key);
    db.collection('notifications').insertOne({
        "text"      : req.body.text,
        "link"      : req.body.link,
        "subject"   : req.body.subject,
        "unread"    : false,
        "user_id"   : req.body.user_id,
        "created_at": Date.now()
    }, function(err, result) {
        if(err) return console.log(err);
        var uid = req.body.user_id;
        for(var i = 0; i < sockets[uid].length; i++) {
            sockets[uid][i].emit("notification", {
                'text' : req.body.text,
                'link' : req.body.link,
                'subject' : req.body.subject,
                'user_id' : req.body.user_id
            });
        }
        res.send();
    });
})
app.listen(8080);

/**
 * Handle socket connections
 */
io.on('connection', function(socket) {
    var user_id = socket.request._query['user'];
    if(!sockets[user_id]) sockets[user_id] = [];
    sockets[user_id].push(socket);
    socket.emit('onload', 'success');
    // var cursor = db.collection('notifications').find({user_id:user_id}).sort({created_at:1}).limit(20);
    // cursor.each(function(err, doc) {
    //     if(err) return console.log(err);
    //     socket.emit("onload", doc);
    // })
})
