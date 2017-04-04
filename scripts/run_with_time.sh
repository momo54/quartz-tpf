#!/bin/bash
# Run the tpf client with the time in seconds printed in stderr

FILE=$1
OUTPUT=$2

if [ "$#" -ne 2 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_with_time.sh <file> <output-folder>"
  exit
fi

RESULTS=`basename $FILE`
SERVERS='http://52.39.116.115/watDiv_100 http://52.33.245.25/watDiv_100'
bin/tpf-client.js run models/$RESULTS.json $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
# bin/reference.js http://52.39.116.115/watDiv_100 -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
