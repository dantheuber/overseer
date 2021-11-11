#!/bin/bash

node proxy-server.mjs &
P1=$!
echo "started proxy: $P1"
cd dashboard && yarn start &
P2=$!
echo "started devserver: $P2"
wait $P1 $P2