#!/bin/bash
# run three times the same workload

FILE=$1
OUTPUT=$2

if [ "$#" -ne 2 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_three.sh <file> <output-folder>"
  exit
fi

mkdir -p $OUTPUT/run1/ $OUTPUT/run2/ $OUTPUT/run3/

./scripts/run_workload_file.sh $FILE $OUTPUT/run1/
./scripts/run_workload_file.sh $FILE $OUTPUT/run2/
./scripts/run_workload_file.sh $FILE $OUTPUT/run3/
