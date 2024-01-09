#!/bin/bash

docker compose down
docker rmi $(docker images -a -q | head -n 1)
printf "y\n" | docker system prune
docker compose up