#!/bin/sh

echo 'Sending POST request'

curl -X POST \
     -d '{"text":"I am a test message","link":"http://google.com"}' \
     -H "Content-Type: application/json" \
     -H "X-Notif-Access-Token: srandom_api_key" \
     -H "X-Notif-User-Id: 12341234" \
     localhost:8080/notifications
