#!/bin/bash

docker compose down
docker rmi $(docker images -a -q)
docker volume rm $(docker volume ls -q)
docker compose up