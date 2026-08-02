#!/bin/bash
set -e

# Current deployment directory (where appspec.yaml is located)
DEPLOY_DIR=$(pwd)

APP_DIR=/opt/python-app

mkdir -p $APP_DIR

cp -r "$DEPLOY_DIR"/* "$APP_DIR"/

cd "$APP_DIR"

python3 -m venv venv

source venv/bin/activate

pip install --upgrade pip

pip install -r requirements.txt