var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("GET /");
   res.send("Connect to poll notificaitons");
});

router.post('/', function(req, res, next) {
    console.log("POST /");
    res.send("Create a notification");
})

module.exports = router;
