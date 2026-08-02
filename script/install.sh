#!/bin/bash
set -e

APP_DIR=/opt/python-app

mkdir -p $APP_DIR

cd $APP_DIR

python3 -m venv venv

source venv/bin/activate

pip install --upgrade pip

pip install -r requirements.txt

cp service/python-app.service /etc/systemd/system/python-app.service

systemctl daemon-reload