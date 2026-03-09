#!/bin/bash
set -euo pipefail  # Exit on error, undefined variable, or pipe failure
 
# Welcome message
echo "=== Running Initialization Script ==="
echo "Current time: $(date)"
echo "Hostname: $(hostname)"
 
# Create an output file with a timestamp
OUTPUT_DIR="/app/output"
mkdir -p "$OUTPUT_DIR"  # Ensure output directory exists
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
echo "Script ran successfully at $TIMESTAMP" > "$OUTPUT_DIR/result_$TIMESTAMP.txt"
 
# Print environment variables (passed from docker-compose)
echo -e "\nEnvironment Variables:"
echo "APP_NAME: $APP_NAME"
echo "APP_ENV: $APP_ENV"

pinctrl

echo -e "\n=== Script Execution Complete ==="
