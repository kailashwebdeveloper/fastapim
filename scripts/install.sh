#!/bin/bash
set -xe

echo "===== START INSTALL ====="

echo "Current user:"
whoami

echo "Current directory:"
pwd

echo "Files in current directory:"
ls -la

echo "Recursive listing:"
find .

APP_DIR=/opt/python-app

mkdir -p "$APP_DIR"

echo "Copying files..."
cp -rv ./* "$APP_DIR"/

echo "Copied successfully"

cd "$APP_DIR"

pwd
ls -la

python3 --version

python3 -m venv venv

source venv/bin/activate

python -m pip install --upgrade pip

pip install -r requirements.txt

echo "===== INSTALL COMPLETE ====="