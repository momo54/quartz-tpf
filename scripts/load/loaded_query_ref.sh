#!/bin/bash
# Run the reference tpf client while generating load on TPF servers

FILE=$1
OUTPUT=$2
NBCLIENTS=$3

if [ "$#" -ne 3 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./loaded_query_ref.sh <file> <output-folder> <nb-concurrent-clients>"
  exit
fi

RESULTS=`basename $FILE`
SERVER="http://52.39.116.115/watDiv_100"
# SERVER="http://localhost:8000/watDiv_100"
pids=()
echo -n "$NBCLIENTS," >> $OUTPUT/execution_times.csv

# tell eventual proxies to move to the next query
# GET http://localhost:8000/move-to-query?name=$RESULTS
# GET http://localhost:8001/move-to-query?name=$RESULTS

# generate load
for (( c=1; c<=$NBCLIENTS; c++ ))
do
  bin/reference.js $SERVER -f $FILE -s > /dev/null 2> /dev/null &
  pids+=($!)
done

bin/reference.js $SERVER -f $FILE -m $OUTPUT/execution_times.csv > $OUTPUT/results/$RESULTS-$NBCLIENTS 2> $OUTPUT/errors/$RESULTS-$NBCLIENTS

# kill remainings pids
kill -9 ${pids[@]} > /dev/null 2> /dev/null
