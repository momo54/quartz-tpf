#!/bin/bash
# Run the tpf client with the time in seconds printed in stderr

FILE=$1
RESULTS=`basename $FILE`
SERVERS='http://localhost:5000/dbpedia_3_8 http://localhost:5000/dbpedia_3_8'
/usr/bin/time -f %e -o execution_times.csv -a node --max-old-space-size=8000 bin/tpf-client.js -f $FILE $SERVERS > results/$RESULTS 2> errors/$RESULTS
