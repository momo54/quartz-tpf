#!/bin/bash
# Compute completeness of a set of results

reference=$1
results=$2
output=$3

if [ "$#" -ne 3 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./compute_completeness.sh <reference-directory> <results-directory> <output>"
  exit
fi

echo "query,completeness" > $output

ls $reference | while read file; do
  name=`basename $file`
  sort $reference/$file > tempRef
  sort $results/$file > tempRes
  groundTruth=`wc -l tempRef | sed 's/^[ ^t]*//' | cut -d' ' -f1`
  commons=`comm -12 tempRef tempRes | wc -l`
  completeness=`echo "scale=2; $commons/$groundTruth" | bc`
  echo "$name,$completeness" >> $output
done

rm -f tempRef tempRes
