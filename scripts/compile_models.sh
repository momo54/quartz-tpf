#!/bin/bash
# compile all models for a set of queries stored in a file

QUERIES=$1
# SERVERS='http://52.39.116.115/watDiv_100 http://52.33.245.25/watDiv_100'
SERVERS='http://52.39.116.115/watDiv_100 http://35.177.243.45/watDiv_100'
cpt=1

if [ "$#" -ne 1 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./compile_models.sh <queries-file>"
  exit
fi

# rm -rf models
mkdir -p models/

while IFS='' read -r line || [[ -n "$line" ]]; do
  QFILE="queries/query$cpt"
  echo $line > $QFILE
  bin/tpf-client.js model $SERVERS -f $QFILE -o models/query$cpt-london.json
  rm -f $QFILE
  cpt=$((cpt+1))
done < "$QUERIES"
