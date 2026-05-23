---
"wrangler": patch
---

Strip `BEGIN TRANSACTION` / `COMMIT` wrappers from SQL files before D1 import

SQL files produced by SQLite's `.dump` command, drizzle migrations, or similar tools wrap statements in `BEGIN TRANSACTION` / `COMMIT` blocks. The D1 import API rejects these with an error about using `state.storage.transaction()` instead. Wrangler now automatically strips these wrappers so such files can be imported without modification.
