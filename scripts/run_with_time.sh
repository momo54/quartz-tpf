#!/bin/bash
# Run the tpf client with the time in seconds printed in stderr

FILE=$1

if [ "$#" -ne 1 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_with_time.sh <file>"
  exit
fi

RESULTS=`basename $FILE`
SERVERS='http://localhost:5000/dbpedia_3_8 http://localhost:5000/dbpedia_3_8'
/usr/bin/time -f %e -o execution_times.csv -a bin/tpf-client.js run model.json $SERVERS -f $FILE -t application/sparql-results+xml > results/$RESULTS 2> errors/$RESULTS
# /usr/bin/time -f %e -o execution_times.csv -a ldf-client http://localhost:5000/dbpedia_3_8 -f $FILE -t application/sparql-results+xml > results/$RESULTS 2> errors/$RESULTS
