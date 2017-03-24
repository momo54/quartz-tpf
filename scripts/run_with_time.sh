#!/bin/bash
# Run the tpf client with the time in seconds printed in stderr

FILE=$1
RESULTS=`basename $FILE`
SERVERS='http://localhost:5000/dbpedia_3_8 http://localhost:5000/dbpedia_3_8'
/usr/bin/time -f %e -o execution_times.csv -a node bin/tpf-client.js $SERVERS -f $FILE > results/$RESULTS 2> errors/$RESULTS
