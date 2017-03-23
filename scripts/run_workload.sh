#!/bin/bash
# Run the tpf client with a workload of queries

WORKLOAD=$*
touch execution_times.csv
for f in $WORKLOAD; do
  ./scripts/run_with_time.sh $f
done
