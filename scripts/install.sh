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

# Remove existing virtual environment if it exists
if [ -d "venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf venv
fi

# Create a fresh virtual environment
echo "Creating new virtual environment..."
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

python -m pip install --upgrade pip

pip install -r requirements.txt

echo "===== INSTALL COMPLETE ====="

cp -pvrf service/python-app.service /etc/systemd/system/python-app.service
