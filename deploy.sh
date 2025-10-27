#!/bin/bash
cd /srv/idea.converter.api
git pull origin master
docker compose down
docker compose up -d --build
