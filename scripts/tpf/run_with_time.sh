#!/bin/bash
# Run the tpf client while measuring the execution time

FILE=$1
OUTPUT=$2
MODE=$3

if [ "$#" -ne 3 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_with_time.sh <file> <output-folder> <mode>"
  exit
fi

RESULTS=`basename $FILE`

# tell eventual proxies to move to the next query
# GET http://localhost:8000/move-to-query?name=$RESULTS
# GET http://localhost:8001/move-to-query?name=$RESULTS

if [[ "$MODE" = "peneloop" ]]; then
  bin/tpf-client.js run models/$RESULTS.json -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -l 0 -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
elif [[ "$MODE" = "quartz" ]]; then
  bin/tpf-client.js run models/$RESULTS.json -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
else
  bin/tpf-client.js run models-local/$RESULTS.json -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
fi
