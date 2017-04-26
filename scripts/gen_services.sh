#!/bin/bash
# Generate service queries from a set of queries in a file

QUERIES=$1
OUTPUT=$2
cpt=1

if [ "$#" -ne 2 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./gen_services.sh <queries-file> <output-folder>"
  exit
fi

while IFS='' read -r line || [[ -n "$line" ]]; do
  QFILE="queries/query$cpt"
  echo $line > $QFILE
  bin/sparql-service.js models/query$cpt.json $OUTPUT/query$cpt.sparql -f $QFILE
  rm -f $QFILE
  cpt=$((cpt+1))
done < "$QUERIES"
