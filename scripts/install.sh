#!/bin/bash
set -xe

echo "===== START INSTALL ====="

APP_DIR=/opt/python-app

echo "Current user:"
whoami

echo "Changing to application directory..."
cd "$APP_DIR"

echo "Current directory:"
pwd

echo "Application files:"
ls -la

python3 --version

# Create virtual environment only if it doesn't already exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate

python -m pip install --upgrade pip

pip install -r requirements.txt

echo "===== INSTALL COMPLETE ====="
