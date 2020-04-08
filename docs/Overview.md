# Overview

### General Overview

-   All files related to the back-end are in `src` folder
-   All files outside `src` are docs and config/setup files for development and testing
-   `src/config` contains configuration for database connection and authentication
-   `src/models` contains models for the database
-   `src/controllers` contains controllers
-   `src/routes` contains Auth and API routes
-   `src/utils` contains validation and other utility functions
-   `src/tests` contains test suites

### Entry Point

-   `src/server.ts` is the file that starts the back-end
-   Environment variables are set
-   Initialization of passport for authentication and cookie parser
-   MongoDB connection is established
-   Routes are set

### Models

-   `src/models` contains models that defines the structure of the document

### Controllers

-   `src/controllers` contains controllers for each route
-   All `GET` requests are on the top of the file followed by `POST`, `PUT`, `PATCH` and `DELETE`
-   Every controller returns a response in JSON format with a status code (except `200` as it is the default)
-   The error responses contains `4xx` or `5xx` status codes with error and error message

### Routes

-   `src/routes` contains routes that use the controllers

### Utils

-   `src/utils` contains utility functions
-   Files with model name in front (ex. `tracks.utils.ts`) contains validation functions
-   `utils.ts` contains functions to slugify the strings
