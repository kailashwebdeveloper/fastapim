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

        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = '10.0.0.135'

        REMOTE_APP_DIR = '/opt/fastapi-app'

        PYTHON_BIN = 'python3.14'

        SERVICE_NAME = 'python-app'

        PORT = '8001'

        SSH_KEY = '/var/lib/jenkins/ssh/mykey'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '========================================'
                echo 'CHECKOUT STAGE'
                echo '========================================'

                checkout scm

                sh '''
                    set -eu

                    echo "Workspace:"
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

        stage('Verify Jenkins Environment') {
            steps {
                echo '========================================'
                echo 'VERIFY JENKINS ENVIRONMENT'
                echo '========================================'

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
                    test -f "${SSH_KEY}"
                    ls -l "${SSH_KEY}"

                    echo ""
                    echo "SSH key permissions:"
                    stat -c "%U:%G %a %n" "${SSH_KEY}"
                '''
            }
        }

        stage('Test SSH Connection') {
            steps {
                echo '========================================'
                echo 'TEST SSH CONNECTION'
                echo '========================================'

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "echo SSH connection successful"

                    echo ""

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "hostname"

                    echo ""
                    echo "SSH connection verified."
                '''
            }
        }

        stage('Build') {
            steps {
                echo '========================================'
                echo 'BUILD STAGE'
                echo '========================================'

                sh '''
                    set -eu

                    echo "Python version:"
                    python3 --version

                    echo ""
                    echo "Removing old Jenkins build environment..."

                    rm -rf .build-venv

                    echo ""
                    echo "Creating Jenkins build virtual environment..."

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
                    echo "BUILD SUCCESSFUL"
                    echo "========================================"
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                echo '========================================'
                echo 'DEPLOY APPLICATION'
                echo '========================================'

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

        stage('Verify Remote Files') {
            steps {
                echo '========================================'
                echo 'VERIFY REMOTE FILES'
                echo '========================================'

                sh '''
                    set -eu

                    echo "Application directory:"
                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "ls -la '${REMOTE_APP_DIR}'"

                    echo ""
                    echo "Checking main.py..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "test -f '${REMOTE_APP_DIR}/main.py'"

                    echo "main.py found."

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
                    echo "Checking systemd service..."

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "test -f '${REMOTE_APP_DIR}/service/${SERVICE_NAME}.service'"

                    echo "Systemd service found."

                    echo ""
                    echo "Remote files verified successfully."
                '''
            }
        }

        stage('Install Remote Dependencies') {
            steps {
                echo '========================================'
                echo 'INSTALL REMOTE DEPENDENCIES'
                echo '========================================'

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "REMOTE_APP_DIR='${REMOTE_APP_DIR}' PYTHON_BIN='${PYTHON_BIN}' bash -s" <<'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "REMOTE DEPENDENCY INSTALLATION"
echo "========================================"

cd "${REMOTE_APP_DIR}"

echo ""
echo "Application directory:"
pwd

echo ""
echo "Checking Python..."

if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
    echo "ERROR: ${PYTHON_BIN} not found."
    exit 1
fi

echo ""
echo "Python binary:"
command -v "${PYTHON_BIN}"

echo ""
echo "Python version:"
"${PYTHON_BIN}" --version

echo ""
echo "Checking python3.14-venv package..."

VENV_PACKAGE="python3.14-venv"

if dpkg-query -W -f='\${Status}' "${VENV_PACKAGE}" 2>/dev/null | \
    grep -q "install ok installed"; then

    echo "${VENV_PACKAGE} is already installed."

else

    echo "${VENV_PACKAGE} is not installed."

    echo ""
    echo "Updating apt package index..."

    sudo apt-get update

    echo ""
    echo "Installing ${VENV_PACKAGE}..."

    sudo DEBIAN_FRONTEND=noninteractive \
        apt-get install -y "${VENV_PACKAGE}"

fi

echo ""
echo "Verifying ensurepip..."

"${PYTHON_BIN}" -c \
    "import ensurepip; print('ensurepip is available')"

echo ""
echo "Verifying venv module..."

"${PYTHON_BIN}" -m venv --help >/dev/null

echo "Python venv support verified."

echo ""
echo "Creating temporary virtual environment..."

TEMP_VENV="${REMOTE_APP_DIR}/venv_new"

rm -rf "${TEMP_VENV}"

"${PYTHON_BIN}" -m venv "${TEMP_VENV}"

echo ""
echo "Temporary virtual environment created."

echo ""
echo "Checking temporary Python..."

"${TEMP_VENV}/bin/python" --version

echo ""
echo "Checking temporary pip..."

"${TEMP_VENV}/bin/python" -m pip --version

echo ""
echo "Upgrading pip..."

"${TEMP_VENV}/bin/python" \
    -m pip install --upgrade pip

echo ""
echo "Installing application dependencies..."

"${TEMP_VENV}/bin/python" \
    -m pip install \
    --no-cache-dir \
    -r requirements.txt

echo ""
echo "Testing FastAPI import..."

"${TEMP_VENV}/bin/python" \
    -c "from main import app; print('FastAPI application import successful')"

echo ""
echo "Replacing production virtual environment..."

if [ -d "venv" ]; then
    rm -rf venv
fi

mv "${TEMP_VENV}" venv

echo ""
echo "Final Python version:"

./venv/bin/python --version

echo ""
echo "Final pip version:"

./venv/bin/python -m pip --version

echo ""
echo "Remote dependencies installed successfully."

REMOTE_SCRIPT
                '''
            }
        }

        stage('Install Systemd Service') {
            steps {
                echo '========================================'
                echo 'INSTALL SYSTEMD SERVICE'
                echo '========================================'

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "REMOTE_APP_DIR='${REMOTE_APP_DIR}' SERVICE_NAME='${SERVICE_NAME}' bash -s" <<'REMOTE_SCRIPT'

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
    echo "ERROR: Service file not found."
    exit 1
fi

echo ""
echo "Service file:"
cat "${SERVICE_SOURCE}"

echo ""
echo "Installing service..."

sudo cp \
    "${SERVICE_SOURCE}" \
    "${SERVICE_DEST}"

sudo chmod 644 \
    "${SERVICE_DEST}"

echo ""
echo "Validating service..."

sudo systemd-analyze verify \
    "${SERVICE_DEST}"

echo ""
echo "Reloading systemd..."

sudo systemctl daemon-reload

echo ""
echo "Enabling service..."

sudo systemctl enable \
    "${SERVICE_NAME}"

echo ""
echo "Systemd service installed successfully."

REMOTE_SCRIPT
                '''
            }
        }

        stage('Restart Application') {
            steps {
                echo '========================================'
                echo 'RESTART APPLICATION'
                echo '========================================'

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "SERVICE_NAME='${SERVICE_NAME}' bash -s" <<'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "RESTART APPLICATION"
echo "========================================"

echo ""
echo "Stopping existing service..."

sudo systemctl stop \
    "${SERVICE_NAME}" || true

echo ""
echo "Starting service..."

sudo systemctl start \
    "${SERVICE_NAME}"

echo ""
echo "Waiting for application..."

sleep 5

echo ""
echo "Checking service..."

if sudo systemctl is-active --quiet "${SERVICE_NAME}"; then

    echo ""
    echo "FastAPI service is running."

else

    echo ""
    echo "ERROR: FastAPI service failed to start."

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

REMOTE_SCRIPT
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '========================================'
                echo 'HEALTH CHECK'
                echo '========================================'

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "PORT='${PORT}' SERVICE_NAME='${SERVICE_NAME}' bash -s" <<'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "FASTAPI HEALTH CHECK"
echo "========================================"

echo ""
echo "Checking systemd service..."

if sudo systemctl is-active --quiet "${SERVICE_NAME}"; then
    echo "Service is active."
else
    echo "ERROR: Service is not active."

    sudo systemctl status \
        "${SERVICE_NAME}" \
        --no-pager || true

    sudo journalctl \
        -u "${SERVICE_NAME}" \
        -n 100 \
        --no-pager || true

    exit 1
fi

echo ""
echo "Checking port ${PORT}..."

if sudo ss -lntp | grep -q ":${PORT} "; then
    echo "Port ${PORT} is listening."
else
    echo "ERROR: Port ${PORT} is not listening."

    sudo systemctl status \
        "${SERVICE_NAME}" \
        --no-pager || true

    sudo journalctl \
        -u "${SERVICE_NAME}" \
        -n 100 \
        --no-pager || true

    exit 1
fi

echo ""
echo "Checking FastAPI /docs..."

HTTP_STATUS=\$(curl \
    -s \
    -o /tmp/fastapi_response.txt \
    -w "%{http_code}" \
    --connect-timeout 10 \
    --max-time 15 \
    "http://127.0.0.1:\${PORT}/docs")

echo ""
echo "HTTP Status: \${HTTP_STATUS}"

if [ "\${HTTP_STATUS}" = "200" ]; then

    echo ""
    echo "FastAPI /docs is working."

else

    echo ""
    echo "ERROR: FastAPI returned HTTP \${HTTP_STATUS}."

    echo ""
    echo "Response:"

    cat /tmp/fastapi_response.txt || true

    echo ""
    echo "Systemd status:"

    sudo systemctl status \
        "\${SERVICE_NAME}" \
        --no-pager || true

    echo ""
    echo "Application logs:"

    sudo journalctl \
        -u "\${SERVICE_NAME}" \
        -n 100 \
        --no-pager || true

    exit 1

fi

echo ""
echo "========================================"
echo "HEALTH CHECK SUCCESSFUL"
echo "========================================"

REMOTE_SCRIPT
                '''
            }
        }

        stage('Deployment Information') {
            steps {
                echo '========================================'
                echo 'DEPLOYMENT INFORMATION'
                echo '========================================'

                sh '''
                    set -eu

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "SERVICE_NAME='${SERVICE_NAME}' PORT='${PORT}' REMOTE_APP_DIR='${REMOTE_APP_DIR}' bash -s" <<'REMOTE_SCRIPT'

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
echo "Python:"
"${REMOTE_APP_DIR}/venv/bin/python" --version

echo ""
echo "Pip:"
"${REMOTE_APP_DIR}/venv/bin/python" -m pip --version

echo ""
echo "Service status:"

sudo systemctl status \
    "${SERVICE_NAME}" \
    --no-pager

echo ""
echo "Listening port:"

sudo ss -lntp | grep ":${PORT} " || true

echo ""
echo "FastAPI docs:"

curl \
    -I \
    --connect-timeout 10 \
    --max-time 15 \
    "http://127.0.0.1:${PORT}/docs" || true

echo ""
echo "========================================"
echo "DEPLOYMENT DETAILS COMPLETE"
echo "========================================"

REMOTE_SCRIPT
                '''
            }
        }
    }

    post {

        success {
            echo '========================================'
            echo 'DEPLOYMENT SUCCESSFUL'
            echo '========================================'

            echo "Application : ${SERVICE_NAME}"
            echo "Server      : ${REMOTE_HOST}"
            echo "Port        : ${PORT}"
            echo "Directory   : ${REMOTE_APP_DIR}"
        }

        failure {
            echo '========================================'
            echo 'DEPLOYMENT FAILED'
            echo '========================================'

            echo "Application : ${SERVICE_NAME}"
            echo "Server      : ${REMOTE_HOST}"
            echo "Port        : ${PORT}"
            echo "Directory   : ${REMOTE_APP_DIR}"
        }

        always {
            echo "Cleaning Jenkins workspace..."

            sh '''
                rm -rf .build-venv || true
            '''
        }
    }
}
