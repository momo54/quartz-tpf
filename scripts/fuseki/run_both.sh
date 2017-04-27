#!/bin/bash
# run three times the same workload

SORTED=$1
SERVICES=$2
OUTPUTREF=$3
OUTPUT=$4

if [ "$#" -ne 4 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_both.sh <queries-sorted> <queries-service> <output-ref> <output-prototype>"
  exit
fi

mkdir -p $OUTPUTREF/run1/ $OUTPUT/run1/

./scripts/fuseki/run_queries.sh $SORTED $OUTPUTREF

./scripts/fuseki/run_queries.sh $SERVICES $OUTPUT
