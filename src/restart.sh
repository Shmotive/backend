#!/bin/bash

docker compose down
docker rmi $(docker images -a -q)
printf "y\n" | docker system prune
docker compose up