#!/bin/bash
# un the tpf client with a workload of queries, all stored in the same file

cpt=1
QUERIES=$1
rm -rf execution_times.csv queries results errors
mkdir -p queries/
mkdir -p results/
mkdir -p errors/
touch execution_times.csv
while IFS='' read -r line || [[ -n "$line" ]]; do
  QFILE="queries/query$cpt"
  echo $line > $QFILE
  ./scripts/run_with_time.sh $QFILE
  rm -f $QFILE
  cpt=$((cpt+1))
done < "$QUERIES"
