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

# tell eventual proxies to move to the next query
GET http://localhost:8000/move-to-query?name=$RESULTS
GET http://localhost:8001/move-to-query?name=$RESULTS

bin/tpf-client.js run models-local/$RESULTS.json -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
