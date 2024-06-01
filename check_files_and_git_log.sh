#!/bin/bash

# Check if a text fragment was provided as a parameter
if [ -z "$1" ]; then
  echo "Usage: $0 <text_fragment>"
  exit 1
fi

TEXT_FRAGMENT="$1"

# Search for files containing the text fragment
MATCHING_FILES=$(grep -rl "$TEXT_FRAGMENT" .)

# Check if any files were found
if [ -z "$MATCHING_FILES" ]; then
  echo "No files found containing the text fragment: $TEXT_FRAGMENT"
  exit 0
fi

# Initialize an array to hold files that have been committed
COMMITTED_FILES=()

# Check each matching file to see if it has been committed to Git
for FILE in $MATCHING_FILES; do
  if git ls-files --error-unmatch "$FILE" > /dev/null 2>&1; then
    COMMITTED_FILES+=("$FILE")
  fi
done

# Check if any committed files were found
if [ ${#COMMITTED_FILES[@]} -eq 0 ]; then
  echo "No committed files found containing the text fragment: $TEXT_FRAGMENT"
else
  echo "Committed files containing the text fragment: $TEXT_FRAGMENT"
  for FILE in "${COMMITTED_FILES[@]}"; do
    echo "$FILE"
  done
fi