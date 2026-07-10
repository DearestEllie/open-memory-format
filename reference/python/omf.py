#!/usr/bin/env python3
"""Open Memory Format — reference Python reader and verifier (stdlib only).

Parses and validates an OMF document per SPEC.md: accepts any 1.x document
(minor versions are additive; unknown fields are ignored, not errors), rejects
any other major version — or a missing/malformed version — loudly, and
tolerates the absence of ``mediaFiles`` (early 1.0 documents predate it).

As a command line tool it also verifies integrity:

    python3 omf.py verify <file.omf.zip | file.omf.json | extracted-dir>

- For a ``.omf.json`` (or any ``.json``): parses and validates the document.
- For a ``.omf.zip`` or an extracted directory: additionally checks every
  line of ``checksums.txt`` (standard ``sha256sum`` format) and every
  ``mediaFiles`` entry's SHA-256 against the bundled ``media/<storageKey>``.

Exits 0 when everything checks out, 1 otherwise.

A reader built on this file passes the fixtures in ``conformance/cases.json``.

Specification: https://github.com/DearestEllie/open-memory-format

Dedicated to the public domain under CC0 1.0. Implement freely, no
attribution required.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

#: The version this file documents.
OMF_VERSION = "1.1"

#: The major version this reader understands; any 1.x document is accepted.
OMF_MAJOR = 1

#: The format's canonical URL, embedded as ``manifest.$format`` in 1.1+ documents.
OMF_FORMAT_URL = "https://github.com/DearestEllie/open-memory-format"

#: Every section that must be present as an array (``mediaFiles`` is optional).
REQUIRED_SECTIONS = (
    "chapters",
    "detailCards",
    "stories",
    "recipes",
    "timeline",
    "letters",
    "photos",
    "voices",
    "thingsLoved",
    "privateNotes",
    "contributors",
    "media",
)

_VERSION_RE = re.compile(r"^\d+\.\d+$")
_CHECKSUM_LINE_RE = re.compile(r"^([0-9a-fA-F]{64})[ \t][ *](.+)$")


class OmfError(ValueError):
    """A document failed structural or version validation."""


def parse_archive_export(doc):
    """Validate a decoded JSON value as an OMF document and return it.

    Mirrors ``parseArchiveExport`` in the TypeScript reference and the
    producing application. Raises :class:`OmfError` with a clear reason on
    any structural or version problem.

    Version policy (SPEC.md §6): any ``1.x`` document is accepted — minor
    versions are additive by definition. A different major version (or no
    version) is rejected loudly, never misread. A missing ``mediaFiles``
    section (early 1.0 documents) is treated as an empty list.
    """
    if not isinstance(doc, dict):
        raise OmfError("Export is not a JSON object.")
    manifest = doc.get("manifest")
    version = manifest.get("formatVersion") if isinstance(manifest, dict) else None
    if not isinstance(version, str) or not _VERSION_RE.match(version):
        raise OmfError(
            f"Unsupported export format version: {version!r} "
            f"(this reader understands {OMF_MAJOR}.x)."
        )
    major = int(version.split(".", 1)[0])
    if major != OMF_MAJOR:
        raise OmfError(
            f"Unsupported export format version: {version!r} "
            f"(this reader understands {OMF_MAJOR}.x)."
        )
    archive = doc.get("archive")
    if not isinstance(archive, dict) or not isinstance(archive.get("id"), str):
        raise OmfError("Export is missing its archive.")
    for key in REQUIRED_SECTIONS:
        if not isinstance(doc.get(key), list):
            raise OmfError(f'Export section "{key}" is missing or not an array.')
    out = dict(doc)
    out["mediaFiles"] = doc["mediaFiles"] if isinstance(doc.get("mediaFiles"), list) else []
    return out


# --------------------------------------------------------------- verifier --


class _Report:
    """Collects check results and prints them as they happen."""

    def __init__(self):
        self.checks = 0
        self.failures = 0
        self.warnings = 0

    def ok(self, message):
        self.checks += 1
        print(f"ok:   {message}")

    def fail(self, message):
        self.checks += 1
        self.failures += 1
        print(f"FAIL: {message}")

    def warn(self, message):
        self.warnings += 1
        print(f"warn: {message}")


def _sha256(data):
    return hashlib.sha256(data).hexdigest()


class _ZipSource:
    """Reads bundled files out of a .omf.zip."""

    def __init__(self, path):
        self.zf = zipfile.ZipFile(path)
        self._names = set(self.zf.namelist())

    def exists(self, name):
        return name in self._names

    def read(self, name):
        return self.zf.read(name)


class _DirSource:
    """Reads bundled files out of an extracted export directory."""

    def __init__(self, root):
        self.root = Path(root)

    def exists(self, name):
        return (self.root / name).is_file()

    def read(self, name):
        return (self.root / name).read_bytes()


def _verify_document(raw, label, report):
    """Parse ``raw`` JSON bytes/text and structurally validate. Returns doc or None."""
    try:
        doc = json.loads(raw)
    except json.JSONDecodeError as err:
        report.fail(f"{label}: not valid JSON ({err})")
        return None
    try:
        parsed = parse_archive_export(doc)
    except OmfError as err:
        report.fail(f"{label}: {err}")
        return None
    manifest = parsed["manifest"]
    version = manifest["formatVersion"]
    fmt = manifest.get("$format")
    identity = f'formatVersion {version}' + (f", $format present" if fmt else "")
    report.ok(f"{label}: valid OMF document ({identity})")
    if fmt is not None and fmt != OMF_FORMAT_URL:
        report.warn(f"{label}: manifest.$format is {fmt!r}, expected {OMF_FORMAT_URL!r}")
    return parsed


def _verify_checksums_txt(source, report):
    """Verify every line of checksums.txt (sha256sum format) against the bundle."""
    if not source.exists("checksums.txt"):
        report.warn("checksums.txt: not present (optional, but the zip export ships one)")
        return
    text = source.read("checksums.txt").decode("utf-8", errors="replace")
    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        report.warn("checksums.txt: present but empty")
        return
    for line in lines:
        match = _CHECKSUM_LINE_RE.match(line)
        if not match:
            report.fail(f"checksums.txt: unparseable line: {line!r}")
            continue
        expected, name = match.group(1).lower(), match.group(2)
        if not source.exists(name):
            report.fail(f"checksums.txt: listed file missing from bundle: {name}")
            continue
        actual = _sha256(source.read(name))
        if actual == expected:
            report.ok(f"checksums.txt: {name} matches")
        else:
            report.fail(f"checksums.txt: {name} checksum mismatch (expected {expected}, got {actual})")


def _verify_media_files(doc, source, report):
    """Verify each mediaFiles entry's SHA-256 against media/<storageKey>."""
    entries = doc.get("mediaFiles", [])
    if not entries:
        report.warn("mediaFiles: no entries to verify")
        return
    for entry in entries:
        if not isinstance(entry, dict):
            report.fail("mediaFiles: entry is not an object")
            continue
        key = entry.get("storageKey")
        expected = entry.get("checksumSha256")
        media_id = entry.get("mediaId", "?")
        if not isinstance(key, str) or not key:
            report.fail(f"mediaFiles[{media_id}]: missing storageKey")
            continue
        name = f"media/{key}"
        if not source.exists(name):
            # A writer skips a missing/unreadable original rather than failing
            # the export (SPEC.md §2), so absence is a warning, not a failure.
            report.warn(f"mediaFiles[{media_id}]: original not bundled at {name}")
            continue
        if expected is None:
            report.warn(f"mediaFiles[{media_id}]: legacy entry with null checksum; cannot verify {name}")
            continue
        actual = _sha256(source.read(name))
        if actual == str(expected).lower():
            report.ok(f"mediaFiles[{media_id}]: {name} matches checksumSha256")
        else:
            report.fail(
                f"mediaFiles[{media_id}]: {name} checksum mismatch "
                f"(expected {expected}, got {actual})"
            )


def verify(path):
    """Verify a .omf.zip, .omf.json, or extracted directory. Returns exit code."""
    target = Path(path)
    report = _Report()

    if not target.exists():
        print(f"FAIL: no such file or directory: {target}")
        return 1

    if target.is_dir():
        source = _DirSource(target)
        if not source.exists("export.json"):
            report.fail(f"{target}: directory has no export.json")
        else:
            doc = _verify_document(source.read("export.json"), "export.json", report)
            _verify_checksums_txt(source, report)
            if doc is not None:
                _verify_media_files(doc, source, report)
    elif zipfile.is_zipfile(target):
        source = _ZipSource(target)
        if not source.exists("export.json"):
            report.fail(f"{target.name}: zip has no export.json at its root")
        else:
            doc = _verify_document(source.read("export.json"), "export.json", report)
            _verify_checksums_txt(source, report)
            if doc is not None:
                _verify_media_files(doc, source, report)
    else:
        _verify_document(target.read_bytes(), target.name, report)

    print(
        f"\n{target}: {report.checks} checks, {report.failures} failed, "
        f"{report.warnings} warnings"
    )
    if report.failures:
        print("result: FAILED")
        return 1
    print("result: OK")
    return 0


def main(argv):
    if len(argv) != 3 or argv[1] != "verify":
        print(__doc__.strip().splitlines()[0])
        print()
        print("usage: python3 omf.py verify <file.omf.zip | file.omf.json | extracted-dir>")
        return 2
    return verify(argv[2])


if __name__ == "__main__":
    sys.exit(main(sys.argv))
