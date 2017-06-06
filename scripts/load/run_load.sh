#!/bin/bash
# Run a load experiment

FILE=$1
OUTPUT=$2
MODE=$3

if [ "$#" -ne 3 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_load.sh <file> <output-folder> <mode>"
  exit
fi

NBCLIENTS=(2 3 4 5 6 7 8 9 10 15 20 25 30 35 45 50 60 70 80 90 100)

echo "time" > $OUTPUT/execution_times.csv

# run with only one client first
./scripts/tpf/run_with_time.sh $FILE $OUTPUT $MODE

# run with different number of clients
for nb in ${NBCLIENTS[@]}; do
  ./scripts/load/loaded_query.sh $FILE $OUTPUT $MODE $nb
done
