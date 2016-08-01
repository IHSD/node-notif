#!/bin/bash
#
# We need to create a new environment file with random values
#
function gen_string() {
    for i in {0..31}; do string+=$(printf "%x" $(($RANDOM%16)) ); done;  echo $string
}

FILENAME='/opt/.env'

API_KEY=$(gen_string)
API_SECRET=$(gen_string)
DB_PASS=$(gen_string)
DB_HOST="mongodb"
DB_USER='app_user'
DB_PORT=27017
DB_NAME='notifications'
WS_PORT=3000
HTTP_PORT=8080

echo "API_KEY=${API_KEY}"       >> ${FILENAME}
echo "API_SECRET=${API_SECRET}" >> ${FILENAME}
echo "DB_HOST=${DB_HOST}"       >> ${FILENAME}
echo "DB_USER=${DB_USER}"       >> ${FILENAME}
echo "DB_PASS=${DB_PASS}"       >> ${FILENAME}
echo "DB_PORT=${DB_PORT}"       >> ${FILENAME}
echo "DB_NAME=${DB_NAME}"       >> ${FILENAME}
