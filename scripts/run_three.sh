#!/bin/bash
# run three times the same workload

FILE=$1
OUTPUTREF=$2
OUTPUT=$3

if [ "$#" -ne 3 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_three.sh <file> <output-ref> <output-prototype>"
  exit
fi

mkdir -p $OUTPUTREF/run1/ $OUTPUTREF/run2/ $OUTPUTREF/run3/ $OUTPUT/run1/ $OUTPUT/run2/ $OUTPUT/run3/

# run reference
# ./scripts/run_workload_file_ref.sh $FILE $OUTPUTREF/run1/
./scripts/run_workload_file_ref.sh $FILE $OUTPUTREF/run2/
./scripts/run_workload_file_ref.sh $FILE $OUTPUTREF/run3/

# run with prototype
# ./scripts/run_workload_file.sh $FILE $OUTPUT/run1/
./scripts/run_workload_file.sh $FILE $OUTPUT/run2/
./scripts/run_workload_file.sh $FILE $OUTPUT/run3/
