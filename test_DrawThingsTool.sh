#!/bin/bash

# Define the paths and commands
TOOL="./DrawThingsTool.js"
PROJECT_FILE="sampleProject.js"

echo "Starting test script for DrawThingsTool..."

# Test 1: Display version information in verbose mode
echo "Test 1: Display version information in verbose mode"
node $TOOL --verbose

# Test 2: Generate command with limit and preview in verbose mode
echo "Test 2: Generate command with limit and preview in verbose mode"
node $TOOL generate -l 2 -p -j $PROJECT_FILE -r "A {height} person with {hair_color} hair" --verbose

# Test 3: Generate command with only preview mode
echo "Test 3: Generate command with only preview mode"
node $TOOL generate -p -j $PROJECT_FILE -r "A {height} person with {hair_color} hair"

# Test 4: Generate command with limit, preview, and specific prompt override
echo "Test 4: Generate command with limit, preview, and specific prompt override"
node $TOOL generate -l 1 -p -r "A {emotion} {fName} with {hair_color} hair" --verbose

# Test 5: Config command to display the current active configuration in verbose mode
echo "Test 5: Config command to display the current active configuration in verbose mode"
node $TOOL config -j $PROJECT_FILE -r "A {height} person with {hair_color} hair" --verbose

# Test 6: Generate command with preview, using am adhoc combinatorial
echo "Test 6: Generate command with preview, using am adhoc combinatorial"
node $TOOL generate -j $PROJECT_FILE -r "A {short+(very tall)} person with {purple+pink} hair" --verbose -p

# Test 7: Generate command with preview, using a adhoc replacement
echo "Test 7: Generate command with preview, using a adhoc replacement"
node $TOOL generate -j $PROJECT_FILE -r "A {short|tall} person with {purple|pink} hair" --verbose -p

# Test 8: Generate command with preview, using a limited placeholder
echo "Test 8: Generate command with preview, using a limited placeholder"
node $TOOL generate -j $PROJECT_FILE -r "A {ethnicity:5} person with orange hair" --verbose -p


echo "Test script for DrawThingsTool completed."