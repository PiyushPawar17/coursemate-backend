## 1.2.0 (September 19, 2020)

### Added

-   Cors
-   `/api/user` to get current user

### Updated

-   Google Auth callback to point to localhost in development
-   `/api/tags` to get only approved tags

## 1.1.0 (July 1, 2020)

### Removed

-   Comments from tutorials

## 1.0.0 (April 9, 2020)

### Added

-   Documentation

### Updated

-   Contributing Guide

## 0.7.0 (April 8, 2020)

### Removed

-   Notifications from user
-   Tests for notifications

## 0.6.0 (April 7, 2020)

### Added

-   Tests for slugify utils
-   Mock data to test utils
-   Tests for `MongoId` and `404` validation

### Updated

-   Updated handling of error responses using `Promise.reject()`
-   Updated error responses to include full error message
-   Updated tests that asserted from mock data arrays

## 0.5.0 (April 6, 2020)

### Added

-   Added remaining routes for user
-   Tests for user

### Updated

-   Updated authentication check in user routes
-   `trackId` field to `track` in User model
-   `trackProgressIndex` to have minimum of 0
-   Mock data for user to include `submittedTutorials`, `notifications`, `favorites` and `tracks`

## 0.4.0 (April 3, 2020)

### Added

-   Routes and controllers for feedbacks
-   Tests for feedbacks
-   Mock data for feedbacks
-   New user as super admin in mock data

### Updated

-   `name` field to `submittedBy` in feedback model
-   Updated seed to add all users

## 0.3.0 (April 1, 2020)

### Added

-   Routes and controllers for tracks
-   Tests for tracks
-   Mock data for tracks
-   Util to slugify tracks

### Updated

-   Updated Track schema to include `slug`, `submittedBy`, `submittedOn` and `isApproved`

### Bug Fixes

-   Changed `tutorials` to `tracks` in responses of tracks

## 0.2.0 (March 29, 2020)

### Added

-   Routes and controllers for tutorials
-   Tests for tutorials
-   Mock data for tutorials
-   Utils to slugify tags and tutorials
-   Slug field in tutorials with unique string at the end
-   `_id` property for objects in interfaces
-   `test:watch` script

### Updated

-   Renamed `url` field to `slug`
-   Updated server to not run in `test` environment
-   Updated test command with `--runInBand` to run tests serially

### Removed

-   Data type validation test for Tag

### Bug Fixes

-   Changed method from `.insertMany()` to `.create()` in tags seed to call pre-save hook

## 0.1.0 (March 22, 2020)

### Added

-   Back-end setup
-   Test setup
-   CI setup
-   Models
-   Routes and controllers for Tags
-   Tests for Tags
