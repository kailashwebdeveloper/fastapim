#!/bin/bash

docker stop fastapi-app || true
docker rm fastapi-app || true