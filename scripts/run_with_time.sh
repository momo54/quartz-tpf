#!/bin/bash
# Run the tpf client with the time in seconds printed in stderr

FILE=$1

if [ "$#" -ne 1 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_with_time.sh <file>"
  exit
fi

RESULTS=`basename $FILE`
SERVERS='http://52.39.116.115/watDiv_100 http://52.33.245.25/watDiv_100'
/usr/bin/time -f %e -o execution_times.csv -a bin/tpf-client.js run models/$RESULTS.json $SERVERS -f $FILE -t application/sparql-results+xml > results/$RESULTS 2> errors/$RESULTS
# /usr/bin/time -f %e -o execution_times.csv -a ldf-client http://52.39.116.115/watDiv_100 -f $FILE -t application/sparql-results+xml > results/$RESULTS 2> errors/$RESULTS
