#!/bin/bash
set -e
source deployment.env

IMAGE=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/python-fastapi:latest

docker pull $IMAGE

docker run -d \
  --name fastapi-app \
  --restart unless-stopped \
  -p 80:8000 \
  --env-file /opt/python-app/.env \
  $IMAGE