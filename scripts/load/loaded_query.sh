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

RESULTS=`basename $FILE`
pids=()

# tell eventual proxies to move to the next query
# GET http://localhost:8000/move-to-query?name=$RESULTS
# GET http://localhost:8001/move-to-query?name=$RESULTS

# generate load
for (( c=1; c<=$NBCLIENTS; c++ ))
do
  if [[ "$MODE" = "peneloop" ]]; then
    bin/tpf-client.js run models-local/$RESULTS.json -f $FILE -t application/sparql-results+xml -l 0 -p -s > /dev/null 2> /dev/null &
  elif [[ "$MODE" = "quartz" ]]; then
    bin/tpf-client.js run models-local/$RESULTS.json -f $FILE -t application/sparql-results+xml -s > /dev/null 2> /dev/null &
  else
    bin/tpf-client.js run models-local/$RESULTS.json -f $FILE -t application/sparql-results+xml -p -s > /dev/null 2> /dev/null &
  fi
  pids+=($!)
done

./scripts/tpf/run_with_time.sh $FILE $OUTPUT $MODE

# kill remainings pids
kill -9 ${pids[@]} > /dev/null 2> /dev/null
