pipeline {

    agent any

    options {
        timestamps()
        disableConcurrentBuilds()

        timeout(time: 20, unit: 'MINUTES')

        buildDiscarder(
            logRotator(
                numToKeepStr: '10',
                daysToKeepStr: '30'
            )
        )
    }

    environment {

        // ============================================
        // REMOTE SERVER
        // ============================================

        REMOTE_USER = 'ubuntu'
        REMOTE_HOST = '10.0.0.135'

        REMOTE_APP_DIR = '/opt/fastapi-app'

        // ============================================
        // SYSTEMD
        // ============================================

        SERVICE_NAME = 'python-app'

        // ============================================
        // FASTAPI
        // ============================================

        PORT = '8001'

        // ============================================
        // SSH
        // ============================================

        /*
         * Create this SSH credential in Jenkins:
         *
         * Manage Jenkins
         *     -> Credentials
         *     -> Global
         *     -> Add Credentials
         *
         * Kind:
         *     SSH Username with private key
         *
         * ID:
         *     fastapi-ec2-ssh
         *
         * Username:
         *     ubuntu
         *
         * Private Key:
         *     Your EC2 SSH private key
         */
        SSH_CREDENTIAL_ID = 'fastapi-ec2-ssh'
    }


    stages {

        // =========================================================
        // STAGE 1 - CHECKOUT
        // =========================================================

        stage('Checkout') {

            steps {

                echo '========================================'
                echo '          CHECKOUT STAGE'
                echo '========================================'

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


        // =========================================================
        // STAGE 2 - VERIFY JENKINS ENVIRONMENT
        // =========================================================

        stage('Verify Jenkins Environment') {

            steps {

                echo '========================================'
                echo '     VERIFY JENKINS ENVIRONMENT'
                echo '========================================'

                sh '''
                    set -eu

                    echo "Jenkins user:"
                    whoami

                    echo ""
                    echo "Python version:"
                    python3 --version

                    echo ""
                    echo "Git version:"
                    git --version

                    echo ""
                    echo "SSH version:"
                    ssh -V 2>&1

                    echo ""
                    echo "Rsync version:"
                    rsync --version | head -n 1
                '''
            }
        }


        // =========================================================
        // STAGE 3 - TEST SSH CONNECTION
        // =========================================================

        stage('Test SSH Connection') {

            steps {

                echo '========================================'
                echo '         TEST SSH CONNECTION'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

                    sh '''
                        set -eu

                        echo "Testing SSH connection to:"
                        echo "${REMOTE_USER}@${REMOTE_HOST}"

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "echo 'SSH connection successful'"

                        echo "SSH connection verified successfully."
                    '''
                }
            }
        }


        // =========================================================
        // STAGE 4 - BUILD
        // =========================================================

        stage('Build') {

            steps {

                echo '========================================'
                echo '             BUILD STAGE'
                echo '========================================'

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


        // =========================================================
        // STAGE 5 - DEPLOY APPLICATION
        // =========================================================

        stage('Deploy Application') {

            steps {

                echo '========================================'
                echo '       DEPLOY APPLICATION'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

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
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "sudo mkdir -p '${REMOTE_APP_DIR}' && \
                             sudo chown -R '${REMOTE_USER}:${REMOTE_USER}' '${REMOTE_APP_DIR}'"

                        echo ""
                        echo "Copying application..."

                        rsync -avz \
                            --delete \
                            --exclude='.git' \
                            --exclude='.build-venv' \
                            --exclude='venv' \
                            --exclude='.env' \
                            --exclude='__pycache__' \
                            --exclude='*.pyc' \
                            -e "ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no" \
                            ./ \
                            ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/

                        echo ""
                        echo "Application copied successfully."

                        echo ""
                        echo "Remote application files:"

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "ls -la '${REMOTE_APP_DIR}'"
                    '''
                }
            }
        }


        // =========================================================
        // STAGE 6 - VERIFY REMOTE FILES
        // =========================================================

        stage('Verify Remote Files') {

            steps {

                echo '========================================'
                echo '         VERIFY REMOTE FILES'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

                    sh '''
                        set -eu

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "test -f '${REMOTE_APP_DIR}/requirements.txt'"

                        echo "requirements.txt found."

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "test -f '${REMOTE_APP_DIR}/service/${SERVICE_NAME}.service'"

                        echo "Systemd service file found."

                        echo ""
                        echo "Remote files verified successfully."
                    '''
                }
            }
        }


        // =========================================================
        // STAGE 7 - INSTALL REMOTE DEPENDENCIES
        // =========================================================

        stage('Install Remote Dependencies') {

            steps {

                echo '========================================'
                echo '     INSTALL REMOTE DEPENDENCIES'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

                    sh '''
                        set -eu

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "REMOTE_APP_DIR='${REMOTE_APP_DIR}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "REMOTE DEPENDENCY INSTALLATION"
echo "========================================"

cd "${REMOTE_APP_DIR}"

echo "Application directory:"
pwd

echo ""
echo "Python version:"
python3 --version


if [ ! -d "venv" ]; then

    echo ""
    echo "Creating production virtual environment..."

    python3 -m venv venv

else

    echo ""
    echo "Production virtual environment already exists."

fi


echo ""
echo "Upgrading pip..."

./venv/bin/python \
    -m pip install --upgrade pip


echo ""
echo "Installing application dependencies..."

./venv/bin/python \
    -m pip install -r requirements.txt


echo ""
echo "Checking installed packages..."

./venv/bin/python \
    -m pip list


echo ""
echo "Remote dependencies installed successfully."

REMOTE_SCRIPT
                    '''
                }
            }
        }


        // =========================================================
        // STAGE 8 - INSTALL SYSTEMD SERVICE
        // =========================================================

        stage('Install Systemd Service') {

            steps {

                echo '========================================'
                echo '       INSTALL SYSTEMD SERVICE'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

                    sh '''
                        set -eu

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "REMOTE_APP_DIR='${REMOTE_APP_DIR}' SERVICE_NAME='${SERVICE_NAME}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "SYSTEMD SERVICE INSTALLATION"
echo "========================================"


SERVICE_SOURCE="${REMOTE_APP_DIR}/service/${SERVICE_NAME}.service"

SERVICE_DEST="/etc/systemd/system/${SERVICE_NAME}.service"


echo "Service source:"
echo "${SERVICE_SOURCE}"

echo ""
echo "Service destination:"
echo "${SERVICE_DEST}"


if [ ! -f "${SERVICE_SOURCE}" ]; then

    echo "ERROR: Systemd service file not found:"
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


echo ""
echo "Service configuration:"

sudo systemctl cat "${SERVICE_NAME}"


REMOTE_SCRIPT
                    '''
                }
            }
        }


        // =========================================================
        // STAGE 9 - RESTART APPLICATION
        // =========================================================

        stage('Restart Application') {

            steps {

                echo '========================================'
                echo '        RESTART APPLICATION'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

                    sh '''
                        set -eu

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "SERVICE_NAME='${SERVICE_NAME}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "RESTARTING APPLICATION"
echo "========================================"


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
        }


        // =========================================================
        // STAGE 10 - HEALTH CHECK
        // =========================================================

        stage('Health Check') {

            steps {

                echo '========================================'
                echo '           HEALTH CHECK'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

                    sh '''
                        set -eu

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "PORT='${PORT}' SERVICE_NAME='${SERVICE_NAME}' bash -s" << 'REMOTE_SCRIPT'

set -eu

echo "========================================"
echo "FASTAPI HEALTH CHECK"
echo "========================================"


echo "Checking port ${PORT}..."


if sudo ss -lntp | grep -q ":${PORT} "; then

    echo "Port ${PORT} is listening."

else

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
        }


        // =========================================================
        // STAGE 11 - SHOW DEPLOYMENT INFORMATION
        // =========================================================

        stage('Deployment Information') {

            steps {

                echo '========================================'
                echo '       DEPLOYMENT INFORMATION'
                echo '========================================'

                sshagent(credentials: [env.SSH_CREDENTIAL_ID]) {

                    sh '''
                        set -eu

                        ssh \
                            -o BatchMode=yes \
                            -o ConnectTimeout=10 \
                            -o StrictHostKeyChecking=no \
                            ${REMOTE_USER}@${REMOTE_HOST} \
                            "SERVICE_NAME='${SERVICE_NAME}' PORT='${PORT}' bash -s" << 'REMOTE_SCRIPT'

set -eu

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
    }


    // =========================================================
    // POST BUILD
    // =========================================================

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

            echo "Please check the failed stage above."
            echo "Application : ${SERVICE_NAME}"
            echo "Server      : ${REMOTE_HOST}"
        }


        always {

            echo 'Cleaning Jenkins workspace...'

            sh '''
                rm -rf .build-venv || true
            '''

            cleanWs(
                deleteDirs: true,
                disableDeferredWipeout: true
            )
        }
    }
}
