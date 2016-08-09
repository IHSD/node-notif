#!/bin/bash
#
# We need to create a new environment file with random values
#
# TO read to environmemt, run `export $(cat .env | xargs)` then start server
#

function gen_string() {
    for i in {0..31}; do string+=$(printf "%x" $(($RANDOM%16)) ); done;  echo $string
}

FILENAME='/opt/.env'

API_KEY=$(gen_string)
API_SECRET=$(gen_string)

echo "API_KEY=${API_KEY}"       >> ${FILENAME}
echo "API_SECRET=${API_SECRET}" >> ${FILENAME}
