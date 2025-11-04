#!/bin/bash

# Test variant generation with provided template JSON
curl -X POST http://localhost:3000/api/convert/variant/generate \
  -H "Content-Type: application/json" \
  -d @example-variant-request.json | jq .

