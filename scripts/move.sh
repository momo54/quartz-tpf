#!/bin/bash
# Move all importants directories and file to another place

destination=$1

if [ "$#" -ne 1 ]; then
  echo "Illegal number of parameters."
  echo "Usage: ./move.sh <destination-dir>"
  exit
fi

mv execution_times.csv $destination/
mv results $destination/
mv errors $destination/
