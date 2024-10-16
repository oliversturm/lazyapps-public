#!/bin/sh

docker compose logs -f | node ../../log-highlight/index.js
