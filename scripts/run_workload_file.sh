#!/bin/bash
# un the tpf client with a workload of queries, all stored in the same file

cpt=1
QUERIES=$1
while IFS='' read -r line || [[ -n "$line" ]]; do
  QFILE="query$cpt"
  echo $line > $QFILE
  ./scripts/run_with_time.sh $QFILE
  rm -f tempQuery.sparql
  cpt=$((cpt+1))
done < "$QUERIES"
