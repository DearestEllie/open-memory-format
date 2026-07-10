# Reference implementations

Two small, dependency-free implementations of an Open Memory Format reader,
kept deliberately boring so they are easy to audit and easy to copy into your
own project. [SPEC.md](../SPEC.md) is the normative document; when in doubt,
it wins.

Both are dedicated to the public domain under [CC0 1.0](../LICENSE) — copy
them, no attribution required.

## TypeScript — [`typescript/omf.ts`](typescript/omf.ts)

A single file with plain TypeScript types for every section and a
`parseArchiveExport(json)` function that applies the format's rules:

- accepts any `1.x` document (minor versions are additive; unknown fields are
  ignored, not errors);
- rejects any other major version — or a missing/malformed version — with a
  clear thrown `Error`, never a misread;
- tolerates a missing `mediaFiles` section (early 1.0 documents) and
  normalizes it to an empty array.

No dependencies and no I/O; feed it the result of `JSON.parse` (or use
`parseArchiveExportString`). It mirrors the parser inside the producing
application, so its behavior is the shipped behavior.

## Python — [`python/omf.py`](python/omf.py)

The same parsing rules (`parse_archive_export`, raising `OmfError`), plus a
command-line **verifier** built only on the standard library (`json`,
`hashlib`, `zipfile`):

```sh
python3 python/omf.py verify grandma.omf.zip     # a zip export
python3 python/omf.py verify grandma.omf.json    # a bare JSON export
python3 python/omf.py verify ./extracted-export/ # an unzipped export directory
```

For a `.omf.json` it parses and validates the document. For a `.omf.zip` or an
extracted directory it additionally:

- verifies every line of `checksums.txt` (standard `sha256sum` format) against
  the bundled files;
- verifies every `mediaFiles` entry's `checksumSha256` against the bytes at
  `media/<storageKey>` (a missing original is reported as a warning — writers
  are allowed to skip an unreadable file; a mismatch is a failure).

It prints one line per check and exits `0` when everything checks out, `1`
otherwise — suitable for scripts and cron jobs that watch over a family's
backups.

## Conformance

A verifier or reader claiming conformance must pass the
[conformance suite](../conformance/): accept every fixture marked valid,
reject every fixture marked invalid, for the reasons listed in
[`../conformance/cases.json`](../conformance/cases.json).

[`run-conformance.py`](run-conformance.py) runs the Python reference parser
across every case and asserts the expected outcomes:

```sh
python3 reference/run-conformance.py
```

It exits `0` only when all cases behave as specified; wire the same loop over
`cases.json` into your own test suite to check any other implementation.
