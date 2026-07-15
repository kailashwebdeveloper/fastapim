# Backend Testing and Quality Guide

## Overview

This project includes a structured backend testing and quality-assurance setup for:

- Unit testing
- Integration testing
- API testing
- Database-focused testing
- Mocking for external dependencies
- Code coverage reporting
- Linting
- Static type checking
- Security scanning

The goal is to validate backend behavior without changing existing application logic.

---

## Project Testing Structure

The test suite is organized under the tests folder:

- tests/test_unit.py
  - Verifies the core password hashing and verification helpers.
  - Confirms that hashed passwords can be validated correctly and rejected when wrong.

- tests/test_integration.py
  - Checks the FastAPI app behavior at the integration level.
  - Validates that routes respond correctly and that the application wiring behaves as expected.

- tests/test_api.py
  - Tests API-level behavior for authentication endpoints.
  - Uses mocking to simulate database access and ensure the endpoints handle validation and success flows correctly.

- tests/test_database.py
  - Covers database-related logic using mocked connections and cursors.
  - Ensures the database helper functions behave predictably under test conditions.

---

## Environment Setup

It is recommended to use the project virtual environment.

Create or activate the environment:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
.venv\Scripts\python.exe -m pip install -r requitements.txt
```

---

## Running Tests

Run all tests:

```bash
.venv\Scripts\python.exe -m pytest
```

Run tests with coverage output:

```bash
.venv\Scripts\python.exe -m pytest --cov=main --cov-report=term-missing
```

Run a specific test file:

```bash
.venv\Scripts\python.exe -m pytest tests/test_api.py
```

Run a specific test case:

```bash
.venv\Scripts\python.exe -m pytest tests/test_unit.py -k verify_password
```

---

## Linting

Run Ruff to check code style and simple quality issues:

```bash
.venv\Scripts\python.exe -m ruff check .
```

---

## Type Checking

Run mypy for static type validation:

```bash
.venv\Scripts\python.exe -m mypy main.py db.py
```

---

## Security Scanning

Run Bandit against the application code:

```bash
.venv\Scripts\python.exe -m bandit -r . -c .bandit
```

The project uses a dedicated Bandit config file, .bandit, to exclude local tooling and frontend folders so the scan stays focused on the backend code.

---

## One-Click Quality Check Script

On Windows, you can run the full quality suite with:

```bash
.\run_quality_checks.bat
```

This script runs:

1. Pytest
2. Ruff
3. Mypy
4. Bandit

---

## Current Verified Results

The following checks were verified successfully in the current environment:

- Pytest: 8 tests passed
- Coverage: generated for main.py
- Ruff: all checks passed
- Mypy: no issues found in 2 source files
- Bandit: 0 issues identified

---

## Notes for Future Reference

- Keep tests focused on behavior rather than implementation details.
- Use mocks for database access where direct database dependencies are not required.
- Preserve existing application logic while adding tests.
- If a dependency is missing, install it through the virtual environment using pip.
- If a test fails unexpectedly, first verify the environment and installed packages before changing application code.
- For future changes, rerun the full quality suite before considering the backend ready.

---

## Recommended Development Workflow

Before finishing backend work, run:

```bash
.\run_quality_checks.bat
```

This provides a fast and repeatable way to confirm the backend remains stable and secure.

---

## Testing Tools and Their Uses

The backend quality setup uses the following tools:

- pytest
  - Main test runner for unit, integration, API, and database tests.
  - Supports test discovery, assertions, and reporting.

- pytest-cov
  - Generates test coverage reports.
  - Helps identify which parts of the backend are covered by tests.

- httpx / FastAPI TestClient
  - Used for API-level testing and endpoint validation.
  - Allows requests to be sent to the FastAPI application during tests.

- ruff
  - Linter for style and basic code quality checks.
  - Helps catch formatting and potential issues early.

- mypy
  - Static type checker.
  - Helps ensure the backend code remains type-safe and easier to maintain.

- bandit
  - Security scanner for common Python security issues.
  - Helps detect risky patterns in the backend code.

- psycopg
  - Database driver used by the backend to connect to PostgreSQL.
  - Covered indirectly through database-related tests and app integration.

---

## Backend Endpoint Reference for Contributors

The backend exposes a small FastAPI service for authentication and user management.

### Authentication Endpoints

- POST /auth/signup
  - Creates a new user account.
  - Expects JSON fields: name, email, and password.
  - The password is hashed before being stored.

- POST /auth/login
  - Authenticates a user with email and password.
  - Validates that both fields are present.
  - Verifies the supplied password against the stored hash.

### User Management Endpoints

- GET /users
  - Returns the list of users from the database.

- POST /users
  - Creates a new user record.
  - Accepts the user payload and stores it through the configured database connection.

- GET /users/{user_id}
  - Returns a single user by ID.

- PUT /users/{user_id}
  - Updates an existing user record.

- DELETE /users/{user_id}
  - Deletes a user by ID.

### Notes for Contributors

- Passwords are never stored in plain text; they are hashed before persistence.
- The frontend communicates with these endpoints through JSON payloads.
- Any change to request/response shapes should be reflected in both the backend and frontend code.
- When adding new endpoints, add matching tests so the behavior stays covered.
