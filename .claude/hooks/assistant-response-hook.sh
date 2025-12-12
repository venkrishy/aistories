#!/bin/bash

# Hook that runs after assistant responses to announce completion
# Extracts a brief summary and uses Mac 'say' command

# Get the assistant's response from stdin
response=$(cat)

# Extract the first meaningful line as summary (skip empty lines)
summary=$(echo "$response" | grep -v "^$" | head -n 1 | cut -c 1-80)

# If summary is too long or empty, create a generic one
if [ -z "$summary" ] || [ ${#summary} -gt 80 ]; then
    summary="Task completed successfully"
fi

# Truncate to approximately 10 words
word_count=$(echo "$summary" | wc -w | xargs)
if [ "$word_count" -gt 10 ]; then
    summary=$(echo "$summary" | awk '{for(i=1;i<=10;i++) printf $i" "; print ""}')
fi

# Use say command to announce completion
say "I am done. $summary" &

# Return the original response unchanged
echo "$response"
