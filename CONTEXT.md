# Health Tracker App

Signed-in workspace for one health-tracker account. The user switches among profiles and records that profile’s reports against an investigation catalog.

## Language

**Report**:
One numeric measurement at a sample-collection date, tagged with an investigation `_id`, owned by the active profile.
_Avoid_: bulk report, batch, bulk endpoint

**Draft report**:
An unsaved Report row in the New Multi Report sheet.

**Investigation**:
An account-level test type identified by Mongo `_id`. `label` is the display name; `unit` is optional.
_Avoid_: slug, test type

**Backup**:
A read-only zip of the whole account (every profile’s reports, catalog, appointments, and attachments). Restoring replaces current health data with that snapshot; it does not change login.
_Avoid_: merge restore
