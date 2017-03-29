#!/bin/bash
# Run the tpf client with a workload of queries

WORKLOAD=$*

if [ "$#" -ne 1 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_workload.sh <queries>"
  exit
fi

rm -rf execution_times.csv results errors
mkdir -p results/
mkdir -p errors/
echo "time" > execution_times.csv

for f in $WORKLOAD; do
  ./scripts/run_with_time.sh $f
done
