# Conformance suite

Fixtures a reader of the Open Memory Format must handle correctly.
[`cases.json`](cases.json) lists every fixture with the expected outcome
(`valid` true/false) and the reason, straight from the rules in
[SPEC.md](../SPEC.md) §5–§6.

## Claiming conformance

A tool may claim to be a **conforming OMF reader** if, for every fixture in
`cases.json`:

- it **accepts** each fixture marked `"valid": true` — parses it without
  error, ignores any fields it doesn't recognize, and treats a missing
  `mediaFiles` section as an empty list; and
- it **rejects** each fixture marked `"valid": false` — fails loudly with a
  clear error, rather than misreading the document or silently dropping it.

"Accepts" and "rejects" are about the parse decision, not about any particular
error message. The `reason` field in `cases.json` explains which rule each
fixture exercises.

A conforming **importer** additionally follows the faithfulness rules in
SPEC.md §5.1: preserve unknown fields, keep dates as written, never broaden
visibility, keep `privateNotes` private, and default an imported archive to
private.

## The fixtures

| Fixture | Expected | Exercises |
| --- | --- | --- |
| `minimal-1.0.json` | accept | 1.0 document, no `$format`, no `mediaFiles` (treated as empty). |
| `full-1.1.json` | accept | Complete 1.1 document with `$format` and a `mediaFiles` entry. |
| `future-minor-1.9.json` | accept | Hypothetical 1.9 minor version; unknown fields and sections must be ignored. |
| `wrong-major-2.0.json` | reject | Different major version — must be rejected loudly. |
| `missing-version.json` | reject | No `manifest.formatVersion`. |
| `missing-archive.json` | reject | No `archive` section. |
| `missing-section.json` | reject | A required section (`letters`) is missing. |
| `not-an-object.json` | reject | Document is not a JSON object. |

## Running it against the reference implementation

```sh
python3 ../reference/run-conformance.py
```

runs the Python reference parser ([`../reference/python/omf.py`](../reference/python/omf.py))
across every case and asserts the expected outcomes. Any other implementation
can do the same by iterating `cases.json`.

Everything in this directory is dedicated to the public domain under
[CC0 1.0](../LICENSE).
