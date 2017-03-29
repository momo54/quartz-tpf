#!/bin/bash
# Select a random number of queries contained in a file

FILE=$1
N=$2
OUT=$3

if [ "$#" -ne 3 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./random_queries.sh <file> <nb-queries> <output>"
  exit
fi

touch $OUT

cat $FILE | sort -R | tail -n $N |while read line; do
  echo $line >> $OUT
done
