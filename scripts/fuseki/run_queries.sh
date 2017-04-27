#!/bin/bash
# run the reference with a workload of queries, stored in individual files, against a fuseki-hdt endpoint

QUERIES=$1
OUTPUT=$2
cpt=1
ENDPOINT="http://52.39.116.115/watDiv_100/query"

if [ "$#" -ne 2 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./run_reference.sh <queries-folder> <output-folder>"
  exit
fi

mkdir -p queries/
mkdir -p $OUTPUT/results/
mkdir -p $OUTPUT/errors/
echo "time" > $OUTPUT/execution_times.csv

# while IFS='' read -r line || [[ -n "$line" ]]; do
#   QUERY="query$cpt"
#   QFILE="queries/query$cpt"
#   echo "$line" > $QFILE
#   echo $QFILE
#   /usr/bin/time -f %e -o $OUTPUT/execution_times.csv -a s-query --service $ENDPOINT --query $QFILE --output xml > $OUTPUT/results/$QUERY 2> $OUTPUT/errors/$QUERY
#   rm -f $QFILE
#   cpt=$((cpt+1))
# done < "$QUERIES"

ls -d -1 $QUERIES/* | while read QFILE; do
  name=`basename $QFILE`
  /usr/bin/time -f %e -o $OUTPUT/execution_times.csv -a s-query --service $ENDPOINT --query $QFILE --output xml > $OUTPUT/results/$name 2> $OUTPUT/errors/$name
done
