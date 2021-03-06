#!/bin/bash
# Run the tpf client while generating load on TPF servers

FILE=$1
OUTPUT=$2
MODE=$3
NBCLIENTS=$4

if [ "$#" -ne 4 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./loaded_query.sh <file> <output-folder> <mode> <nb-concurrent-clients>"
  exit
fi

SERVERS="http://52.39.116.115/watDiv_100 http://52.33.245.25/watDiv_100"
# SERVERS="http://localhost:8000/watDiv_100 http://localhost:8001/watDiv_100"
RESULTS=`basename $FILE`
pids=()

echo -n "$NBCLIENTS," >> $OUTPUT/execution_times.csv

# tell eventual proxies to move to the next query
# GET http://localhost:8000/move-to-query?name=$RESULTS
# GET http://localhost:8001/move-to-query?name=$RESULTS

# generate load
for (( c=1; c<=$NBCLIENTS; c++ ))
do
  if [[ "$MODE" = "peneloop" ]]; then
    # bin/tpf-client.js run models/$RESULTS.json -f $FILE -t application/sparql-results+xml -l 0 -p -s > /dev/null 2> /dev/null &
    bin/quartz-forever.js $SERVERS -f $FILE -t application/sparql-results+xml -l 0 -p > /dev/null 2> /dev/null &
  elif [[ "$MODE" = "quartz" ]]; then
    # bin/tpf-client.js run models/$RESULTS.json -f $FILE -t application/sparql-results+xml -s > /dev/null 2> /dev/null &
    bin/quartz-forever.js $SERVERS -f $FILE -t application/sparql-results+xml > /dev/null 2> /dev/null &
  else
    # bin/tpf-client.js run models/$RESULTS.json -f $FILE -t application/sparql-results+xml -p -s > /dev/null 2> /dev/null &
    bin/quartz-forever.js $SERVERS -f $FILE -t application/sparql-results+xml -p > /dev/null 2> /dev/null &
  fi
  pids+=($!)
done

sleep 5

# ./scripts/tpf/run_with_time.sh $FILE $OUTPUT $MODE
if [[ "$MODE" = "peneloop" ]]; then
  bin/quartz.js $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -l 0 -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
elif [[ "$MODE" = "quartz" ]]; then
  bin/quartz.js $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
else
  bin/quartz.js $SERVERS -f $FILE -t application/sparql-results+xml -m $OUTPUT/execution_times.csv -p > $OUTPUT/results/$RESULTS 2> $OUTPUT/errors/$RESULTS
fi

# kill remainings pids
kill -9 ${pids[@]} > /dev/null 2> /dev/null
