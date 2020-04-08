# Testing

### General Overview

-   `src/tests` contains all tests
-   Supertest is used to send HTTP Requests
-   Jest is used as test runner and for assertions
-   Tests are ran on seperate test database
-   `src/tests/mocks/data.ts` contains mock data
-   `src/tests/mocks/seed.ts` contains Mongo queries to add data to the database

### Global Test Suite Setup

-   Database conneection is established at the start and closed when all tests in the file are completed
-   Data is added and removed before and after every single test to get same data for every test
-   Each test file contains `describe` block indicating the base route
-   Login credentials are calculated for User, Admin and SuperAdmin before running the tests

### Testing for Routes

-   Every route has a `describe` block with the HTTP Request type and the base URL
-   Every route can have any of the following type of test
    -   Valid Request Tests - Tests that return valid response
    -   Validation Tests - Tests to validate if valid data is sent
    -   Auth Validation Tests - Tests to validate unauthenticated user not to get access to private routes
    -   Access Validation Tests - Tests to validate the access to the route
-   Every test asserts status code and the response
