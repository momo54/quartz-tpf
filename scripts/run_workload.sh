#!/bin/bash
# Run the tpf client with a workload of queries

WORKLOAD=$*
rm -rf execution_times.csv results errors
mkdir -p results/
mkdir -p errors/
touch execution_times.csv
for f in $WORKLOAD; do
  ./scripts/run_with_time.sh $f
done
