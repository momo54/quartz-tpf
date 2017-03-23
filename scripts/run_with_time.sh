#!/bin/bash
# Run the tpf client with the time in seconds printed in stderr

FILE=$1
SERVERS='http://localhost:5000/dbpedia_3_8 http://fragments.mementodepot.org/dbpedia_3_8'
/usr/bin/time -f %e -o execution_times.csv -a node bin/tpf-client.js -f $FILE $SERVERS > log 2>> err
