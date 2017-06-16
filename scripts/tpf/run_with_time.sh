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

# SERVERS="http://52.39.116.115/watDiv_100 http://52.33.245.25/watDiv_100"
# SERVERS="http://localhost:8000/watDiv_100 http://localhost:8001/watDiv_100"
# SERVERS="http://localhost:8000/peneloop http://localhost:8001/peneloop http://localhost:8002/peneloop http://localhost:8003/peneloop http://localhost:8004/peneloop"
SERVERS="http://localhost:8000/peneloop http://localhost:8001/peneloop"

RESULTS=`basename $FILE`

# tell eventual proxies to move to the next query
# GET http://localhost:8000/move-to-query?name=$RESULTS
# GET http://localhost:8001/move-to-query?name=$RESULTS

if [[ "$MODE" = "peneloop" ]]; then
  # bin/tpf-client.js run models/$RESULTS.json -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -l 0 -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
  timeout 1800s bin/quartz.js $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -l 0 -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
  #bin/quartz.js $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -l 0 -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
elif [[ "$MODE" = "quartz" ]]; then
  # bin/tpf-client.js run models/$RESULTS.json -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
  bin/quartz.js $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
else
  # bin/tpf-client.js run models-local/$RESULTS.json -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
  bin/quartz.js $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
fi
