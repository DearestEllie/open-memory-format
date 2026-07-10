#!/usr/bin/env python3
"""Run the Python reference parser across the OMF conformance suite.

Loads every fixture listed in ``conformance/cases.json``, parses it with
``reference/python/omf.py``, and asserts the expected accept/reject outcome.
Exits 0 when every case behaves as specified, 1 otherwise. Stdlib only.

    python3 reference/run-conformance.py

Dedicated to the public domain under CC0 1.0.
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CASES_PATH = REPO_ROOT / "conformance" / "cases.json"
OMF_MODULE_PATH = REPO_ROOT / "reference" / "python" / "omf.py"


def load_omf_module():
    spec = importlib.util.spec_from_file_location("omf", OMF_MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main():
    omf = load_omf_module()
    manifest = json.loads(CASES_PATH.read_text(encoding="utf-8"))
    cases = manifest["cases"]
    failures = 0

    for case in cases:
        fixture = REPO_ROOT / "conformance" / case["file"]
        expected_valid = case["valid"]
        try:
            doc = json.loads(fixture.read_text(encoding="utf-8"))
        except json.JSONDecodeError as err:
            print(f"FAIL  {case['file']}: fixture is not even valid JSON ({err})")
            failures += 1
            continue

        error = None
        try:
            parsed = omf.parse_archive_export(doc)
        except omf.OmfError as err:
            error = err

        accepted = error is None
        if accepted == expected_valid:
            outcome = "accepted" if accepted else f"rejected ({error})"
            print(f"pass  {case['file']}: {outcome}, as expected")
            if accepted and not isinstance(parsed.get("mediaFiles"), list):
                print(f"FAIL  {case['file']}: parser did not normalize mediaFiles to a list")
                failures += 1
        else:
            wanted = "accept" if expected_valid else "reject"
            got = "accepted" if accepted else f"rejected ({error})"
            print(f"FAIL  {case['file']}: expected reader to {wanted}, but it {got}")
            print(f"      rule: {case['reason']}")
            failures += 1

    print(f"\n{len(cases)} cases, {failures} failed")
    if failures:
        print("conformance: FAILED")
        return 1
    print("conformance: OK — this parser conforms to OMF 1.1")
    return 0


if __name__ == "__main__":
    sys.exit(main())
