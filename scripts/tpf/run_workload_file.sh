#!/bin/bash
# run the tpf client with a workload of queries, all stored in the same file

QUERIES=$1
OUTPUT=$2
cpt=1

if [ "$#" -ne 2 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_workload_file.sh <queries-file> <output-folder>"
  exit
fi

mkdir -p queries/
mkdir -p $OUTPUT/results/
mkdir -p $OUTPUT/errors/
echo "time" > $OUTPUT/execution_times.csv

while IFS='' read -r line || [[ -n "$line" ]]; do
  QFILE="queries/query$cpt"
  echo $line > $QFILE
  ./scripts/tpf/run_with_time.sh $QFILE $OUTPUT
  rm -f $QFILE
  cpt=$((cpt+1))
done < "$QUERIES"
