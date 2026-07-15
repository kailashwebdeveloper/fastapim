@echo off
setlocal
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"
set PYTHON_EXE=.venv\Scripts\python.exe

echo Running pytest...
%PYTHON_EXE% -m pytest
if errorlevel 1 goto error

echo Running ruff...
%PYTHON_EXE% -m ruff check .
if errorlevel 1 goto error

echo Running mypy...
%PYTHON_EXE% -m mypy main.py db.py
if errorlevel 1 goto error

echo Running bandit...
%PYTHON_EXE% -m bandit -r . -c .bandit
if errorlevel 1 goto error

echo All backend quality checks passed.
exit /b 0

:error
echo One or more quality checks failed.
exit /b 1
