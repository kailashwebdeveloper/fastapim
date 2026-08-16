13:39:36  + echo         BUILD SUCCESSFUL
13:39:36          BUILD SUCCESSFUL
13:39:36  + echo ========================================
13:39:36  ========================================
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Deploy Application)
[Pipeline] echo
13:39:36  
13:39:36  ========================================
13:39:36         DEPLOY APPLICATION
13:39:36  ========================================
13:39:36  
[Pipeline] sh
13:39:36  + set -eu
13:39:36  + echo Remote server:
13:39:36  Remote server:
13:39:36  + echo ubuntu@10.0.0.135
13:39:36  ubuntu@10.0.0.135
13:39:36  + echo 
13:39:36  
13:39:36  + echo Remote application directory:
13:39:36  Remote application directory:
13:39:36  + echo /opt/fastapi-app
13:39:36  /opt/fastapi-app
13:39:36  + echo 
13:39:36  
13:39:36  + echo Creating remote application directory...
13:39:36  Creating remote application directory...
13:39:36  + ssh -i /var/lib/jenkins/ssh/mykey -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@10.0.0.135 sudo mkdir -p '/opt/fastapi-app' &&                          sudo chown -R 'ubuntu:ubuntu' '/opt/fastapi-app'
13:39:37  + echo 
13:39:37  
13:39:37  + echo Copying application...
13:39:37  Copying application...
13:39:37  + rsync -avz --delete --exclude=.git --exclude=.build-venv --exclude=venv --exclude=.env --exclude=__pycache__ --exclude=*.pyc -e ssh -i '/var/lib/jenkins/ssh/mykey' -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no ./ ubuntu@10.0.0.135:/opt/fastapi-app/
13:39:37  sending incremental file list
13:39:37  ./
13:39:37  Jenkinsfile
13:39:37  
13:39:37  sent 2,565 bytes  received 224 bytes  5,578.00 bytes/sec
13:39:37  total size is 53,040  speedup is 19.02
13:39:37  + echo 
13:39:37  
13:39:37  + echo Application copied successfully.
13:39:37  Application copied successfully.
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Verify Remote Files)
[Pipeline] echo
13:39:37  
13:39:37  ========================================
13:39:37           VERIFY REMOTE FILES
13:39:37  ========================================
13:39:37  
[Pipeline] sh
13:39:37  + set -eu
13:39:37  + echo Checking application directory...
13:39:37  Checking application directory...
13:39:37  + ssh -i /var/lib/jenkins/ssh/mykey -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@10.0.0.135 ls -la '/opt/fastapi-app'
13:39:37  total 140
13:39:37  drwxr-xr-x 8 ubuntu ubuntu  4096 Aug 16 08:09 .
13:39:37  drwxr-xr-x 3 root   root    4096 Aug 16 07:41 ..
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   102 Aug 16 05:00 .bandit
13:39:37  -rw-r--r-- 1 ubuntu ubuntu    96 Aug 16 05:00 .dockerignore
13:39:37  -rw-r--r-- 1 ubuntu ubuntu  1450 Aug 16 05:00 Dockerfile
13:39:37  -rw-r--r-- 1 ubuntu ubuntu 23271 Aug 16 08:09 Jenkinsfile
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   136 Aug 16 05:00 New Text Document.txt
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   174 Aug 16 05:00 README.md
13:39:37  -rw-r--r-- 1 ubuntu ubuntu  5899 Aug 16 05:00 TESTING.md
13:39:37  -rw-r--r-- 1 ubuntu ubuntu  5537 Aug 16 05:00 UI_TESTING.md
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   581 Aug 16 05:00 appspec copy.yaml
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   581 Aug 16 05:00 appspec.yaml
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   558 Aug 16 05:00 buildspec copy.yaml
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   877 Aug 16 05:00 buildspec.yaml
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   177 Aug 16 05:00 db.py
13:39:37  -rw-r--r-- 1 ubuntu ubuntu  1286 Aug 16 05:00 docker-compose.yml
13:39:37  -rw-r--r-- 1 ubuntu ubuntu  5932 Aug 16 05:00 main.py
13:39:37  -rw-r--r-- 1 ubuntu ubuntu    92 Aug 16 05:00 package-lock.json
13:39:37  drwxr-xr-x 2 ubuntu ubuntu  4096 Aug 16 05:00 postgres
13:39:37  -rw-r--r-- 1 ubuntu ubuntu    60 Aug 16 05:00 pytest.ini
13:39:37  -rw-r--r-- 1 ubuntu ubuntu    87 Aug 16 05:00 requirements.txt
13:39:37  -rw-r--r-- 1 ubuntu ubuntu   536 Aug 16 05:00 run_quality_checks.bat
13:39:37  drwxr-xr-x 2 ubuntu ubuntu  4096 Aug 16 05:00 scripts
13:39:37  drwxr-xr-x 2 ubuntu ubuntu  4096 Aug 16 05:00 scripts copy
13:39:37  drwxr-xr-x 2 ubuntu ubuntu  4096 Aug 16 05:00 service
13:39:37  drwxr-xr-x 2 ubuntu ubuntu  4096 Aug 16 05:00 tests
13:39:37  drwxrwxr-x 5 ubuntu ubuntu  4096 Aug 16 07:41 venv
13:39:37  + echo 
13:39:37  
13:39:37  + echo Checking requirements.txt...
13:39:37  Checking requirements.txt...
13:39:37  + ssh -i /var/lib/jenkins/ssh/mykey -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@10.0.0.135 test -f '/opt/fastapi-app/requirements.txt'
13:39:38  + echo requirements.txt found.
13:39:38  requirements.txt found.
13:39:38  + echo 
13:39:38  
13:39:38  + echo Checking systemd service file...
13:39:38  Checking systemd service file...
13:39:38  + ssh -i /var/lib/jenkins/ssh/mykey -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@10.0.0.135 test -f '/opt/fastapi-app/service/python-app.service'
13:39:38  + echo Systemd service file found.
13:39:38  Systemd service file found.
13:39:38  + echo 
13:39:38  
13:39:38  + echo Remote files verified successfully.
13:39:38  Remote files verified successfully.
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Install Remote Dependencies)
[Pipeline] echo
13:39:38  
13:39:38  ========================================
13:39:38       INSTALL REMOTE DEPENDENCIES
13:39:38  ========================================
13:39:38  
[Pipeline] sh
13:39:38  + set -eu
13:39:38  + ssh -i /var/lib/jenkins/ssh/mykey -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@10.0.0.135 REMOTE_APP_DIR='/opt/fastapi-app' PYTHON_BIN='python3.14' bash -s
13:39:38  ========================================
13:39:38  REMOTE DEPENDENCY INSTALLATION
13:39:38  ========================================
13:39:38  
13:39:38  Application directory:
13:39:38  /opt/fastapi-app
13:39:38  
13:39:38  Checking Python...
13:39:38  
13:39:38  Python version:
13:39:38  Python 3.14.4
13:39:38  
13:39:38  Checking Python virtual environment support...
13:39:38  Python venv support is already available.
13:39:38  
13:39:38  Verifying Python venv support...
13:39:38  
13:39:38  Python venv support verified successfully.
13:39:38  
13:39:38  Creating production virtual environment...
13:39:38  Existing virtual environment found.
13:39:38  Removing old virtual environment...
13:39:38  The virtual environment was not created successfully because ensurepip is not
13:39:38  available.  On Debian/Ubuntu systems, you need to install the python3-venv
13:39:38  package using the following command.
13:39:38  
13:39:38      apt install python3.14-venv
13:39:38  
13:39:38  You may need to use sudo with that command.  After installing the python3-venv
13:39:38  package, recreate your virtual environment.
13:39:38  
13:39:38  Failing command: /opt/fastapi-app/venv/bin/python3.14
13:39:38  
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Install Systemd Service)
Stage "Install Systemd Service" skipped due to earlier failure(s)
[Pipeline] getContext
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Restart Application)
Stage "Restart Application" skipped due to earlier failure(s)
[Pipeline] getContext
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Health Check)
Stage "Health Check" skipped due to earlier failure(s)
[Pipeline] getContext
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Deployment Information)
Stage "Deployment Information" skipped due to earlier failure(s)
[Pipeline] getContext
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Declarative: Post Actions)
[Pipeline] echo
13:39:39  Cleaning Jenkins workspace...
[Pipeline] sh
13:39:40  + rm -rf .build-venv
[Pipeline] echo
13:39:40  
13:39:40  ========================================
13:39:40           DEPLOYMENT FAILED
13:39:40  ========================================
13:39:40  
[Pipeline] echo
13:39:40  Application : python-app
[Pipeline] echo
13:39:40  Server      : 10.0.0.135
[Pipeline] echo
13:39:40  Port        : 8001
[Pipeline] }
[Pipeline] // stage
[Pipeline] }
[Pipeline] // timeout
[Pipeline] }
[Pipeline] // timestamps
[Pipeline] }
[Pipeline] // withEnv
[Pipeline] }
[Pipeline] // withEnv
[Pipeline] }
[Pipeline] // node
[Pipeline] End of Pipeline
ERROR: script returned exit code 1
Finished: FAILURE
