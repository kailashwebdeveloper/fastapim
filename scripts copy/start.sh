#!/bin/bash
set -e

systemctl daemon-reload

systemctl enable python-app

systemctl restart python-app

systemctl restart nginx
