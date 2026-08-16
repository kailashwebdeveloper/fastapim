pipeline {

    agent any

    options {
        timestamps()

        disableConcurrentBuilds()

        timeout(
            time: 30,
            unit: 'MINUTES'
        )

        buildDiscarder(
            logRotator(
                numToKeepStr: '10',
                daysToKeepStr: '30'
            )
        )
    }

    environment {

        // =====================================================
        // REMOTE SERVER
        // =====================================================

        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = '10.0.0.135'

        // =====================================================
        // APPLICATION
        // =====================================================

        REMOTE_APP_DIR = '/opt/fastapi-app'

        // =====================================================
        // SYSTEMD SERVICE
        // =====================================================

        SERVICE_NAME = 'python-app'

        // =====================================================
        // FASTAPI PORT
        // =====================================================

        PORT = '8001'

        // =====================================================
        // PYTHON
        // =====================================================

        PYTHON_BIN = 'python3.14'

        // =====================================================
        // SSH PRIVATE KEY
        // =====================================================

        SSH_KEY = '/var/lib/jenkins/ssh/mykey'
    }


    stages {

        // =====================================================
        // 1. CHECKOUT
        // =====================================================

        stage('Checkout') {

            steps {

                echo '''
========================================
          CHECKOUT STAGE
========================================
'''

                checkout scm

                sh '''
                    set -eu

                    echo "Current directory:"
                    pwd

                    echo ""
                    echo "Git commit:"
                    git rev-parse HEAD

                    echo ""
                    echo "Git branch:"
                    git branch --show-current || true

                    echo ""
                    echo "Files:"
                    ls -la
                '''
            }
        }


        // =====================================================
        // 2. VERIFY JENKINS ENVIRONMENT
        // =====================================================

        stage('Verify Jenkins Environment') {

            steps {

                echo '''
========================================
     VERIFY JENKINS ENVIRONMENT
========================================
'''

                sh '''
                    set -eu

                    echo "Jenkins user:"
                    whoami

                    echo ""
                    echo "Python:"
                    python3 --version

                    echo ""
                    echo "Git:"
                    git --version

                    echo ""
                    echo "SSH:"
                    ssh -V 2>&1

                    echo ""
                    echo "Rsync:"
                    rsync --version | head -n 1

                    echo ""
                    echo "SSH key:"
                    ls -l "${SSH_KEY}"

                    echo ""
                    echo "SSH key permissions:"
                    stat -c "%U:%G %a %n" "${SSH_KEY}"
                '''
            }
        }


        // =====================================================
        // 3. TEST SSH CONNECTION
        // =====================================================

        stage('Test SSH Connection') {

            steps {

                echo '''
========================================
         TEST SSH CONNECTION
========================================
'''

                sh '''
                    set -eu

                    echo "Remote user:"
                    echo "${REMOTE_USER}"

                    echo "Remote host:"
                    echo "${REMOTE_HOST}"

                    echo "SSH key:"
                    echo "${SSH_KEY}"

                    echo ""
                    echo "Testing SSH connection..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "echo 'SSH connection successful'"

                    echo ""
                    echo "Testing remote hostname..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "hostname"

                    echo ""
                    echo "SSH connection verified successfully."
                '''
            }
        }


        // =====================================================
        // 4. BUILD
        // =====================================================

        stage('Build') {

            steps {

                echo '''
========================================
             BUILD STAGE
========================================
'''

                sh '''
                    set -eu

                    echo "Python version:"
                    python3 --version

                    echo ""
                    echo "Creating build virtual environment..."

                    rm -rf .build-venv

                    python3 -m venv .build-venv

                    echo ""
                    echo "Upgrading pip..."

                    .build-venv/bin/python \
                        -m pip install --upgrade pip

                    echo ""
                    echo "Installing dependencies..."

                    .build-venv/bin/python \
                        -m pip install -r requirements.txt

                    echo ""
                    echo "Compiling Python source..."

                    .build-venv/bin/python \
                        -m compileall .

                    echo ""
                    echo "========================================"
                    echo "        BUILD SUCCESSFUL"
                    echo "========================================"
                '''
            }
        }


        // =====================================================
        // 5. DEPLOY APPLICATION
        // =====================================================

        stage('Deploy Application') {

            steps {

                echo '''
========================================
       DEPLOY APPLICATION
========================================
'''

                sh '''
                    set -eu

                    echo "Remote server:"
                    echo "${REMOTE_USER}@${REMOTE_HOST}"

                    echo ""
                    echo "Remote application directory:"
                    echo "${REMOTE_APP_DIR}"

                    echo ""
                    echo "Creating remote application directory..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "sudo mkdir -p '${REMOTE_APP_DIR}' && \
                         sudo chown -R '${REMOTE_USER}:${REMOTE_USER}' '${REMOTE_APP_DIR}'"

                    echo ""
                    echo "Copying application..."

                    rsync \
                        -avz \
                        --delete \
                        --exclude='.git' \
                        --exclude='.build-venv' \
                        --exclude='venv' \
                        --exclude='.env' \
                        --exclude='__pycache__' \
                        --exclude='*.pyc' \
                        -e "ssh -i '${SSH_KEY}' -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no" \
                        ./ \
                        "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/"

                    echo ""
                    echo "Application copied successfully."
                '''
            }
        }


        // =====================================================
        // 6. VERIFY REMOTE FILES
        // =====================================================

        stage('Verify Remote Files') {

            steps {

                echo '''
========================================
         VERIFY REMOTE FILES
========================================
'''

                sh '''
                    set -eu

                    echo "Checking application directory..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "ls -la '${REMOTE_APP_DIR}'"

                    echo ""
                    echo "Checking requirements.txt..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "test -f '${REMOTE_APP_DIR}/requirements.txt'"

                    echo "requirements.txt found."

                    echo ""
                    echo "Checking systemd service file..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "test -f '${REMOTE_APP_DIR}/service/${SERVICE_NAME}.service'"

                    echo "Systemd service file found."

                    echo ""
                    echo "Remote files verified successfully."
                '''
            }
        }


        // =====================================================
        // 7. INSTALL REMOTE DEPENDENCIES
        // =====================================================

        stage('Install Remote Dependencies') {

            steps {

                echo '''
========================================
     INSTALL REMOTE DEPENDENCIES
========================================
'''

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "REMOTE_APP_DIR='${REMOTE_APP_DIR}' PYTHON_BIN='${PYTHON_BIN}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "REMOTE DEPENDENCY INSTALLATION"
echo "========================================"

cd "${REMOTE_APP_DIR}"

echo ""
echo "Application directory:"
pwd


# =====================================================
# CHECK PYTHON
# =====================================================

echo ""
echo "Checking Python..."

if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then

    echo ""
    echo "ERROR: ${PYTHON_BIN} is not installed."

    echo ""
    echo "Available Python versions:"

    command -v python3 || true
    python3 --version || true

    exit 1

fi


echo ""
echo "Python version:"

"${PYTHON_BIN}" --version


# =====================================================
# CHECK / INSTALL PYTHON VENV PACKAGE
# =====================================================

echo ""
echo "Checking Python virtual environment support..."


if "${PYTHON_BIN}" -m venv --help >/dev/null 2>&1; then

    echo "Python venv support is already available."

else

    echo ""
    echo "Python venv support is missing."

    echo ""
    echo "Installing python3.14-venv..."

    sudo apt-get update

    sudo apt-get install -y python3.14-venv

fi


# =====================================================
# VERIFY VENV AFTER INSTALLATION
# =====================================================

echo ""
echo "Verifying Python venv support..."

if ! "${PYTHON_BIN}" -m venv --help >/dev/null 2>&1; then

    echo ""
    echo "ERROR: Python venv support is still unavailable."

    echo ""
    echo "Installed Python packages:"

    dpkg -l | grep -E 'python3.14|python3-venv' || true

    exit 1

fi


echo ""
echo "Python venv support verified successfully."


# =====================================================
# CREATE PRODUCTION VIRTUAL ENVIRONMENT
# =====================================================

echo ""
echo "Creating production virtual environment..."


if [ -d "venv" ]; then

    echo "Existing virtual environment found."

    echo "Removing old virtual environment..."

    rm -rf venv

fi


"${PYTHON_BIN}" -m venv venv


echo ""
echo "Production virtual environment created."


# =====================================================
# VERIFY VIRTUAL ENVIRONMENT
# =====================================================

echo ""
echo "Verifying virtual environment..."

if [ ! -x "venv/bin/python" ]; then

    echo ""
    echo "ERROR: venv/bin/python was not created."

    exit 1

fi


echo ""
echo "Virtual environment Python:"

./venv/bin/python --version


echo ""
echo "Virtual environment pip:"

./venv/bin/python -m pip --version


# =====================================================
# UPGRADE PIP
# =====================================================

echo ""
echo "Upgrading pip..."

./venv/bin/python \
    -m pip install --upgrade pip


# =====================================================
# INSTALL APPLICATION DEPENDENCIES
# =====================================================

echo ""
echo "Installing application dependencies..."

./venv/bin/python \
    -m pip install \
    --no-cache-dir \
    -r requirements.txt


# =====================================================
# VERIFY IMPORTANT PACKAGES
# =====================================================

echo ""
echo "Verifying FastAPI installation..."

./venv/bin/python \
    -c "import fastapi; print('FastAPI:', fastapi.__version__)"


echo ""
echo "Verifying Uvicorn installation..."

./venv/bin/python \
    -c "import uvicorn; print('Uvicorn:', uvicorn.__version__)"


echo ""
echo "========================================"
echo " REMOTE DEPENDENCIES INSTALLED SUCCESSFULLY"
echo "========================================"

REMOTE_SCRIPT
                '''
            }
        }


        // =====================================================
        // 8. INSTALL SYSTEMD SERVICE
        // =====================================================

        stage('Install Systemd Service') {

            steps {

                echo '''
========================================
       INSTALL SYSTEMD SERVICE
========================================
'''

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "REMOTE_APP_DIR='${REMOTE_APP_DIR}' SERVICE_NAME='${SERVICE_NAME}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "SYSTEMD SERVICE INSTALLATION"
echo "========================================"


SERVICE_SOURCE="${REMOTE_APP_DIR}/service/${SERVICE_NAME}.service"

SERVICE_DEST="/etc/systemd/system/${SERVICE_NAME}.service"


echo ""
echo "Service source:"
echo "${SERVICE_SOURCE}"

echo ""
echo "Service destination:"
echo "${SERVICE_DEST}"


if [ ! -f "${SERVICE_SOURCE}" ]; then

    echo ""
    echo "ERROR: Service file not found:"
    echo "${SERVICE_SOURCE}"

    exit 1

fi


echo ""
echo "Installing systemd service..."

sudo cp \
    "${SERVICE_SOURCE}" \
    "${SERVICE_DEST}"


sudo chmod 644 \
    "${SERVICE_DEST}"


echo ""
echo "Reloading systemd..."

sudo systemctl daemon-reload


echo ""
echo "Enabling service..."

sudo systemctl enable "${SERVICE_NAME}"


echo ""
echo "Systemd service installed successfully."

REMOTE_SCRIPT
                '''
            }
        }


        // =====================================================
        // 9. RESTART APPLICATION
        // =====================================================

        stage('Restart Application') {

            steps {

                echo '''
========================================
        RESTART APPLICATION
========================================
'''

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "SERVICE_NAME='${SERVICE_NAME}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "RESTART APPLICATION"
echo "========================================"


echo ""
echo "Restarting service..."

sudo systemctl restart "${SERVICE_NAME}"


echo ""
echo "Waiting for application to start..."

sleep 5


echo ""
echo "Checking service status..."


if sudo systemctl is-active --quiet "${SERVICE_NAME}"; then

    echo ""
    echo "FastAPI service is running successfully."

else

    echo ""
    echo "ERROR: FastAPI service failed to start."

    echo ""
    echo "Systemd status:"

    sudo systemctl status \
        "${SERVICE_NAME}" \
        --no-pager || true


    echo ""
    echo "Recent application logs:"

    sudo journalctl \
        -u "${SERVICE_NAME}" \
        -n 100 \
        --no-pager || true


    exit 1

fi


REMOTE_SCRIPT
                '''
            }
        }


        // =====================================================
        // 10. HEALTH CHECK
        // =====================================================

        stage('Health Check') {

            steps {

                echo '''
========================================
           HEALTH CHECK
========================================
'''

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "PORT='${PORT}' SERVICE_NAME='${SERVICE_NAME}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "FASTAPI HEALTH CHECK"
echo "========================================"


echo ""
echo "Checking port ${PORT}..."


if sudo ss -lntp | grep -q ":${PORT} "; then

    echo "Port ${PORT} is listening."

else

    echo ""
    echo "ERROR: Port ${PORT} is not listening."

    echo ""
    echo "Systemd status:"

    sudo systemctl status \
        "${SERVICE_NAME}" \
        --no-pager || true


    echo ""
    echo "Application logs:"

    sudo journalctl \
        -u "${SERVICE_NAME}" \
        -n 100 \
        --no-pager || true


    exit 1

fi


echo ""
echo "Checking FastAPI /docs endpoint..."


HTTP_STATUS=$(curl \
    -s \
    -o /tmp/fastapi_response.txt \
    -w "%{http_code}" \
    --connect-timeout 10 \
    --max-time 15 \
    "http://127.0.0.1:${PORT}/docs")


echo ""
echo "HTTP Status: ${HTTP_STATUS}"


if [ "${HTTP_STATUS}" = "200" ]; then

    echo ""
    echo "FastAPI health check successful."

else

    echo ""
    echo "ERROR: FastAPI returned HTTP ${HTTP_STATUS}."

    echo ""
    echo "Response:"

    cat /tmp/fastapi_response.txt || true


    echo ""
    echo "Systemd status:"

    sudo systemctl status \
        "${SERVICE_NAME}" \
        --no-pager || true


    echo ""
    echo "Application logs:"

    sudo journalctl \
        -u "${SERVICE_NAME}" \
        -n 100 \
        --no-pager || true


    exit 1

fi


echo ""
echo "========================================"
echo "       HEALTH CHECK SUCCESSFUL"
echo "========================================"

REMOTE_SCRIPT
                '''
            }
        }


        // =====================================================
        // 11. DEPLOYMENT INFORMATION
        // =====================================================

        stage('Deployment Information') {

            steps {

                echo '''
========================================
       DEPLOYMENT INFORMATION
========================================
'''

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "SERVICE_NAME='${SERVICE_NAME}' PORT='${PORT}' REMOTE_APP_DIR='${REMOTE_APP_DIR}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo ""
echo "========================================"
echo "DEPLOYMENT DETAILS"
echo "========================================"

echo ""
echo "Server:"
hostname

echo ""
echo "Application:"
echo "${SERVICE_NAME}"

echo ""
echo "Port:"
echo "${PORT}"

echo ""
echo "Application directory:"
echo "${REMOTE_APP_DIR}"

echo ""
echo "Service status:"

sudo systemctl status \
    "${SERVICE_NAME}" \
    --no-pager

echo ""
echo "Listening port:"

sudo ss -lntp | grep ":${PORT} " || true

REMOTE_SCRIPT
                '''
            }
        }
    }


    // =====================================================
    // POST BUILD
    // =====================================================

    post {

        success {

            echo '''
========================================
       DEPLOYMENT SUCCESSFUL
========================================
'''

            echo "Application : ${SERVICE_NAME}"
            echo "Server      : ${REMOTE_HOST}"
            echo "Port        : ${PORT}"
            echo "Directory   : ${REMOTE_APP_DIR}"
        }


        failure {

            echo '''
========================================
         DEPLOYMENT FAILED
========================================
'''

            echo "Application : ${SERVICE_NAME}"
            echo "Server      : ${REMOTE_HOST}"
            echo "Port        : ${PORT}"
        }


        always {

            echo "Cleaning Jenkins workspace..."

            sh '''
                rm -rf .build-venv || true
            '''
        }
    }
}
