#!/bin/bash
# start the proxies

./scripts/proxy.js http://localhost:5000 -p 8000 > /dev/null &
echo $!
./scripts/proxy.js http://52.33.245.25 -p 8001 > /dev/null &
echo $!
