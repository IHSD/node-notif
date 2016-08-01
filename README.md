### Node-Notif

IHS Server for realtime notifications.

### Quick start

```shell
git clone https://github.com/IHSD/node-notif
cd node-notif
docker-compose up
```

This will start a NodeJS server with a few access points

| Endpoint | Description |
| ------------- |---------------|
| `GET /`| Render the demo index page |
| `POST /notifications` | Create a new notification|

By default, the server serves HTTP requests on 8080, and the Websocket on 3000. These can be changed using environment variables.

### Environment Variables

| Variable | Description |
|-------------|----------|
| API_KEY | Server API Key |
| API_SECRET | Server API Secret |
| DB_HOST | Database Host (mongodb) |
| DB_USER | Database User (app_user) |
| DB_PASS | Database Password (password) |
| DB_PORT | Database Port (27017) |
| DB_NAME | Database Name (notifications) |
| HTTP_PORT | Port to server HTTP requests |
| WS_PORT | Port to server websockets |

To generate a random set of variables:
`chmod +x ./bin/gen_env.sh && ./bin/gen_env.sh`
Add `--export=TRUE` if you want them exported to the system
### Authentication

To create notifications, we need to specify 2 headers.
 - X-Notif-Api-Key: Raw API Key for the server
 - X-Notif-User-Id: User ID to notify.

```shell
curl -X POST --data '{"name":"test"}' -H "Content-Type: application/json" \
-H "X-Notif-Api-Key: 3C5F133AC0141FCF5B34DE492B219891F5472842C29DB5B3A2008E85730F70C0" \
-H "X-Notif-User-Id: cc3470691b92c098023b30a672e24164621b9ac852e868cecd725d69622007a3" \
localhost:3000/notifications
```

The User ID can be whatever you wish. We use the SHA-256 Hash of the application User ID and the API Secret
This is currently the only reason we have an API Secret

For a client to connect, simply pass the same User ID to the websocket connection.

```html
<script src="/socket.io/socket.io.js"></script>
<script src="http://code.jquery.com/jquery.js"></script>
<script type='text/javascript'>
    var socket = io.connect({query: "user=cc3470691b92c098023b30a672e24164621b9ac852e868cecd725d69622007a3"});
    socket.on('notification', function(data) {
        console.log(data);
    })
</script>
```

Once the client is connected, any created notifications will be sent directly to the client on creation. Notifications are stored in the MongoDB, but currently cannot be fetched.

### TODO
- Add Storage and retrieval of past notifications.
- Add rate limiting and user profile creation
- Admin Panel?
