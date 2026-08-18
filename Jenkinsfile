pipeline {

    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
    }

    environment {
        REMOTE_USER    = 'ubuntu'
        REMOTE_HOST    = '10.0.0.135'
        REMOTE_APP_DIR = '/opt/fastapi-app'
        PYTHON_BIN     = 'python3.14'
        SERVICE_NAME   = 'python-app'
        PORT           = '8001'
        SSH_KEY        = '/var/lib/jenkins/ssh/mykey'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -eu

                    rm -rf .build-venv

                    python3 -m venv .build-venv

                    .build-venv/bin/python -m pip install \
                        --upgrade pip

                    .build-venv/bin/python -m pip install \
                        --no-cache-dir \
                        -r requirements.txt

                    .build-venv/bin/python -m compileall .

                    echo "BUILD SUCCESSFUL"
                '''
            }
        }

        stage('Test SSH') {
            steps {
                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "echo SSH connection successful"
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "sudo mkdir -p '${REMOTE_APP_DIR}' && \
                         sudo chown -R '${REMOTE_USER}:${REMOTE_USER}' '${REMOTE_APP_DIR}'"

                    rsync \
                        -avz \
                        --delete \
                        --exclude='.git' \
                        --exclude='.build-venv' \
                        --exclude='venv' \
                        --exclude='venv_new' \
                        --exclude='.env' \
                        --exclude='__pycache__' \
                        --exclude='*.pyc' \
                        -e "ssh -i '${SSH_KEY}' -o BatchMode=yes -o StrictHostKeyChecking=no" \
                        ./ \
                        "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "REMOTE_APP_DIR='${REMOTE_APP_DIR}' PYTHON_BIN='${PYTHON_BIN}' bash -s" <<'REMOTE_SCRIPT'

set -eu

cd "${REMOTE_APP_DIR}"

if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
    echo "ERROR: ${PYTHON_BIN} not found"
    exit 1
fi

if ! dpkg-query -W -f='\\${Status}' python3.14-venv 2>/dev/null | \
    grep -q "install ok installed"; then

    sudo apt-get update
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y python3.14-venv
fi

rm -rf venv venv_new

"${PYTHON_BIN}" -m venv venv

./venv/bin/python -m pip install \
    --upgrade pip

./venv/bin/python -m pip install \
    --no-cache-dir \
    -r requirements.txt

./venv/bin/python -c \
    "from main import app; print('FastAPI import successful')"

REMOTE_SCRIPT
                '''
            }
        }

        stage('Install Service') {
            steps {
                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "REMOTE_APP_DIR='${REMOTE_APP_DIR}' SERVICE_NAME='${SERVICE_NAME}' bash -s" <<'REMOTE_SCRIPT'

set -eu

SERVICE_SOURCE="${REMOTE_APP_DIR}/service/${SERVICE_NAME}.service"
SERVICE_DEST="/etc/systemd/system/${SERVICE_NAME}.service"

test -f "${SERVICE_SOURCE}"

sudo cp "${SERVICE_SOURCE}" "${SERVICE_DEST}"

sudo chmod 644 "${SERVICE_DEST}"

sudo systemd-analyze verify "${SERVICE_DEST}"

sudo systemctl daemon-reload

sudo systemctl enable "${SERVICE_NAME}"

REMOTE_SCRIPT
                '''
            }
        }

        stage('Restart') {
            steps {
                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "SERVICE_NAME='${SERVICE_NAME}' bash -s" <<'REMOTE_SCRIPT'

set -eu

sudo systemctl restart "${SERVICE_NAME}"

sleep 3

if ! sudo systemctl is-active --quiet "${SERVICE_NAME}"; then

    sudo systemctl status \
        "${SERVICE_NAME}" \
        --no-pager || true

    sudo journalctl \
        -u "${SERVICE_NAME}" \
        -n 50 \
        --no-pager || true

    exit 1
fi

REMOTE_SCRIPT
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "PORT='${PORT}' SERVICE_NAME='${SERVICE_NAME}' bash -s" <<'REMOTE_SCRIPT'

set -eu

sudo systemctl is-active --quiet "${SERVICE_NAME}"

sudo ss -lnt | grep -q ":${PORT} "

HTTP_STATUS=\$(curl \
    -s \
    -o /dev/null \
    -w "%{http_code}" \
    --connect-timeout 10 \
    --max-time 15 \
    "http://127.0.0.1:\${PORT}/docs")

if [ "\${HTTP_STATUS}" != "200" ]; then
    echo "Health check failed: HTTP \${HTTP_STATUS}"

    sudo journalctl \
        -u "${SERVICE_NAME}" \
        -n 50 \
        --no-pager || true

    exit 1
fi

echo "HEALTH CHECK SUCCESSFUL"

REMOTE_SCRIPT
                '''
            }
        }
    }

    post {

        success {
            echo "DEPLOYMENT SUCCESSFUL - ${SERVICE_NAME} on ${REMOTE_HOST}:${PORT}"
        }

        failure {
            echo "DEPLOYMENT FAILED - ${SERVICE_NAME} on ${REMOTE_HOST}:${PORT}"
        }

        always {
            sh 'rm -rf .build-venv || true'
        }
    }
}
