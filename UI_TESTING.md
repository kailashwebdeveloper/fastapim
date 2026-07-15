# UI Testing Guide

## Overview

This document records the current UI testing approach for the React/Vite frontend. The goal is to validate the interface behavior separately from the backend while keeping the existing application logic unchanged.

The frontend test setup is already in place and is intended to support both local verification and CI/CD usage.

---

## Current UI Testing Stack

The frontend uses the following tools for automated UI testing:

- Vitest: test runner for unit and component-style tests
- React Testing Library: tests the UI from a user-interaction perspective
- Jest DOM: provides DOM assertions such as toBeInTheDocument and toHaveAttribute
- jsdom: provides a browser-like environment for running tests
- Vite: runs the app and configures the test environment
- Mocked fetch responses: used to simulate backend API calls without needing a live server

---

## Files Related to UI Testing

The current UI testing setup is organized across these files:

- ui/package.json: defines the scripts and test dependencies
- ui/vite.config.js: configures Vitest, jsdom, and the test setup file
- ui/src/setupTests.js: imports the Jest DOM matchers
- ui/src/App.test.jsx: contains the current UI test suite
- ui/src/App.jsx: the component being tested

---

## How to Run the UI Tests Locally

From the project root, run:

```bash
cd ui
npm install
npm test
```

Useful additional commands:

```bash
cd ui
npm run build
npm run lint
```

The current scripts are defined in ui/package.json and include:

- npm test -> runs the Vitest suite
- npm run build -> builds the frontend
- npm run lint -> runs Oxlint for static checks

---

## What the Current UI Tests Cover

The current suite in ui/src/App.test.jsx validates the main user-facing behaviors of the app:

### 1. Authentication Flow

Tests confirm that:

- the login form renders by default
- the signup form appears when the toggle button is clicked
- a successful login transitions the app to the dashboard view
- a failed login displays an error message

### 2. Dashboard Experience

Tests confirm that:

- the dashboard is shown after successful authentication
- the logged-in user information is rendered correctly
- the main UI transitions from the auth form to the dashboard properly

### 3. Add User Flow

Tests confirm that:

- the add user form can be opened from the dashboard
- the form heading is displayed correctly when the add action is triggered

### 4. Delete User Flow

Tests confirm that:

- a user can be removed from the dashboard
- the UI shows a success message after the delete action completes

### 5. Edit User Flow

Tests confirm that:

- an existing user can be opened for editing
- the edit form can accept changed values
- the update action completes and the UI reflects the update flow

### 6. Accessibility and Form Semantics

Tests confirm that:

- form inputs use the expected input types
- buttons and form controls are present with the expected accessible names
- the app exposes a basic level of accessible structure for the current forms

---

## Testing Approach Used

The UI tests are written to validate behavior rather than implementation details.

### Component Testing

The tests verify:

- rendering of forms and buttons
- state-driven UI changes
- successful and failed interaction flows

### Integration-Style Testing

The tests simulate realistic user actions such as:

- typing into login fields
- switching between login and signup views
- opening the dashboard
- triggering add, update, and delete actions

### Mock-Based API Testing

The tests mock fetch responses to simulate backend behavior. This makes the UI tests:

- fast
- reliable
- independent of a running backend
- suitable for CI/CD pipelines

---

## Example Scenarios Covered

The current suite includes checks for these scenarios:

1. Login form is visible by default
2. Signup form appears when switching modes
3. Login success leads to the dashboard
4. Login failure shows an error message
5. Add user form opens from the dashboard
6. Delete action completes successfully
7. Edit action works from the dashboard
8. Form inputs and buttons remain accessible and discoverable

---

## CI/CD Integration

These UI tests can be run automatically in CI/CD pipelines whenever code is pushed or a pull request is created.

A typical pipeline step for the frontend would be:

```bash
cd ui
npm install
npm run build
npm run lint
npm test
```

This ensures that:

- the frontend still builds successfully
- static checks pass
- the UI test suite remains green
- regressions in the user experience are caught early

---

## Notes for Future Expansion

The current setup is a strong base for further testing. Possible additions include:

- Playwright end-to-end tests for browser-level workflows
- more detailed validation tests for empty or invalid form submissions
- visual regression checks for major screens
- additional accessibility checks for keyboard navigation and screen-reader support

---

## Important Guideline

The UI tests are intended to protect the existing functionality and improve confidence in the frontend without changing the app’s logic. The focus remains on:

- correctness
- reliability
- user experience
- regression prevention

---

## Summary

The current frontend testing setup provides a practical and maintainable way to verify the UI independently from the backend. It covers core authentication, dashboard, CRUD interactions, and basic accessibility expectations, and it is ready to be used in a CI/CD pipeline.
