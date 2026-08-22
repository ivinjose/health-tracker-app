# Health Tracker App

Signed-in workspace for one health-tracker account. The user switches among profiles and records that profile’s reports against an investigation catalog.

## Language

**Report**:
One numeric measurement at a sample-collection date, tagged with an investigation slug, owned by the active profile.
_Avoid_: bulk report, batch, bulk endpoint

**Draft report**:
An unsaved Report row in the New Multi Report sheet.

**Investigation**:
An account-level test type. `value` is the slug stored on a Report; `label` is the display name.
_Avoid_: slug (as a separate field name), test type
