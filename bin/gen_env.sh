#!/bin/bash
#
# We need to create a new environment file with random values
#
function gen_string() {
    for i in {0..31}; do string+=$(printf "%x" $(($RANDOM%16)) ); done;  echo $string
}

API_KEY=$(gen_string)
API_SECRET=$(gen_string)
DB_PASS=$(gen_string)
DB_HOST="mongodb"
DB_USER='app_user'
DB_PORT=27017
DB_NAME='notifications'
WS_PORT=3000
HTTP_PORT=8080

export API_KEY=${API_KEY}
export API_SECRET=${API_SCRET}
export DB_HOST=${DB_HOST}
export DB_USER=${DB_USER}
export DB_PASS=${DB_PASS}
export DB_PORT=${DB_PORT}
export DB_NAME=${DB_NAME}
