#!/bin/bash
# Run the tpf client with a workload of queries

WORKLOAD=$1
touch execution_times.csv
for f in $WORKLOAD; do
  ./run_with_time.sh $f
done
