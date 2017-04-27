#!/bin/bash
# Generate queries with join ordering from a workload in a file

QUERIES=$1
OUTPUT=$2
cpt=1

if [ "$#" -ne 2 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./gen_sorted.sh <queries-file> <output-folder>"
  exit
fi

while IFS='' read -r line || [[ -n "$line" ]]; do
  QFILE="queries/query$cpt"
  echo $line > $QFILE
  bin/sort-patterns.js models/query$cpt.json $OUTPUT/query$cpt -f $QFILE
  rm -f $QFILE
  cpt=$((cpt+1))
done < "$QUERIES"
