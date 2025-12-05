# Changelog

## [1.0.8] - 2024-12-XX

### Fixed
- **Critical Fix**: Fixed data persistence issue where tunnel configurations would not update after initial save
- Data now correctly saves and loads on every application restart
- Added data validation on load to prevent corrupted state
- Improved error handling for localStorage operations
- Automatic cleanup of corrupted data with fallback to defaults

### Changed
- Refactored `storageUtils.ts` with improved save/load logic
- Added data versioning system for future migrations
- Added protection against localStorage quota exhaustion
- Enhanced tunnel structure validation

### Technical Details
- Data version: `1.0.8`
- All data is validated before use
- Corrupted data is automatically cleaned and replaced with default values

## [1.0.7] - Previous version
- Last stable version before fixes

