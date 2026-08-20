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

        CONTAINER_NAME = 'fastapi-app'
        IMAGE_NAME     = 'fastapi-app'
        PORT           = '8001'

        SSH_KEY        = '/var/lib/jenkins/ssh/mykey'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -eu

                    docker build \
                        -t "${IMAGE_NAME}:latest" \
                        .
                '''
            }
        }

        stage('Test Docker Image') {
            steps {
                sh '''
                    set -eu

                    docker run -d \
                        --name "${CONTAINER_NAME}-test" \
                        -p 18001:8001 \
                        "${IMAGE_NAME}:latest"

                    sleep 5

                    if ! curl -f \
                        --connect-timeout 10 \
                        http://127.0.0.1:18001/docs; then

                        echo "Docker health check failed."

                        docker logs "${CONTAINER_NAME}-test" || true

                        docker rm -f "${CONTAINER_NAME}-test" || true

                        exit 1
                    fi

                    docker rm -f "${CONTAINER_NAME}-test"
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
                        -o ConnectTimeout=10 \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "mkdir -p '${REMOTE_APP_DIR}'"

                    rsync \
                        -avz \
                        --delete \
                        --exclude='.git' \
                        --exclude='.build-venv' \
                        --exclude='venv' \
                        --exclude='.env' \
                        --exclude='__pycache__' \
                        --exclude='*.pyc' \
                        -e "ssh -i '${SSH_KEY}' -o BatchMode=yes -o StrictHostKeyChecking=no" \
                        ./ \
                        "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/"

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "cd '${REMOTE_APP_DIR}' && \
                         docker build -t '${IMAGE_NAME}:latest' . && \
                         docker rm -f '${CONTAINER_NAME}' 2>/dev/null || true"

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "docker run -d \
                         --name '${CONTAINER_NAME}' \
                         --restart unless-stopped \
                         -p ${PORT}:8001 \
                         '${IMAGE_NAME}:latest'"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -eu

                    sleep 5

                    ssh \
                        -i "${SSH_KEY}" \
                        -o BatchMode=yes \
                        -o StrictHostKeyChecking=no \
                        "${REMOTE_USER}@${REMOTE_HOST}" \
                        "curl -f \
                         --connect-timeout 10 \
                         --max-time 15 \
                         http://127.0.0.1:${PORT}/docs"

                    echo "HEALTH CHECK SUCCESSFUL"
                '''
            }
        }
    }

    post {

        success {
            echo "DEPLOYMENT SUCCESSFUL"
            echo "Application : ${CONTAINER_NAME}"
            echo "Server      : ${REMOTE_HOST}"
            echo "Port        : ${PORT}"
        }

        failure {
            echo "DEPLOYMENT FAILED"

            sh '''
                ssh \
                    -i "${SSH_KEY}" \
                    -o BatchMode=yes \
                    -o StrictHostKeyChecking=no \
                    "${REMOTE_USER}@${REMOTE_HOST}" \
                    "docker ps -a --filter name=${CONTAINER_NAME}; \
                     docker logs ${CONTAINER_NAME} 2>/dev/null || true" \
                    || true
            '''
        }

        always {
            sh '''
                docker rm -f "${CONTAINER_NAME}-test" 2>/dev/null || true
                docker rmi "${IMAGE_NAME}:latest" 2>/dev/null || true
            '''
        }
    }
}
