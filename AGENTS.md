# Agent instructions

## Identifier and FK migrations

When replacing a document identifier (slug, `value`, UUID, composite key, etc.) with another id, the plan must include these inventories **before** implementation. Do not bury them in a file list.

1. **APIs** — Every endpoint that accepts or returns the old identifier (path, query, JSON/multipart body, response fields/object keys). State the new contract. Include response-only leaks (parent documents that embed the old FK).
2. **URLs** — Every app and API URL: path segments, search params, deep links, bookmarks. State whether names stay and only values change, and whether old links keep working.
3. **Existing data** — In-place rewrite of stored FKs to the corresponding new id. Do not delete or re-seed as the default. Spell out mapping (including account vs profile scope), what is untouched, backup, abort-without-write on unmapped rows, idempotency, and deploy order.

Ask if any of these three is out of scope; do not omit them by default.
