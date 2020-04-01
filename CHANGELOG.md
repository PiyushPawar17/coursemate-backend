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
