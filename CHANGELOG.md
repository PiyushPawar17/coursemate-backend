## 0.2.0 (March 29, 2020)

### Added

-   Routes and controllers for tutorials
-   Tests for tutorials
-   Mock data for tutorials
-   Utils to slugify tags and tutorials
-   Slug field in tutorials with unique string at the end
-   `_id` property for objects in interfaces
-   `test:watch` script

### Updates

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
