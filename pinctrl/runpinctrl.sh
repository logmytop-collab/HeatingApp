#!/bin/bash
set -euo pipefail  # Exit on error, undefined variable, or pipe failure
 
# Welcome message
echo "=== Running mosquitto pinctrl ==="

mosquitto_sub -t "pinctrl" -v |
   while read payload ; do
      echo Received $payload
      readarray -d ' ' arr <<< $payload
      pin=${arr[1]}
      high=${arr[2]}
      delay=${arr[3]}
      echo "${arr[0]}"
      echo $pin
      echo $high
      echo $delay
      if [ $high == "h" ]; then
         echo "set $pin high for $delay sec"
         pinctrl set $pin op dh 
         sleep $delay
         pinctrl set $pin op dl 
         echo "set $pin low "
      fi
   done


# /pinctrl/pinctrl

echo -e "\n=== Script Execution Complete ==="
