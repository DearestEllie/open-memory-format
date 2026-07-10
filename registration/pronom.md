# PRONOM submission draft: Open Memory Format

Draft information for submission to **PRONOM**, The National Archives (UK)
technical registry of file formats
(<https://www.nationalarchives.gov.uk/PRONOM/>). PRONOM assigns the PUIDs
(`fmt/…`) that digital-preservation tools — DROID, Siegfried, Archivematica,
Preservica — use to identify formats, which is exactly the kind of
identification a century-scale family archive should have.

Two related entries are proposed: the JSON document and the zip bundle.

## Format summary

- **Format name:** Open Memory Format (JSON document)
- **Version:** 1.1 (1.0 documents differ only by absent optional members and
  are matched by the fallback signature notes below)
- **Other names:** OMF; DearestEllie archive export
- **Family:** JSON-based structured data
- **Format type:** structured text (aggregate/container of biographical
  records)
- **Developed by:** DearestEllie (https://www.dearestellie.org)
- **Disclosure:** full, open specification, dedicated to the public domain
  (CC0 1.0): <https://github.com/DearestEllie/open-memory-format>
- **MIME type:** `application/vnd.dearestellie.omf+json` (IANA vendor-tree
  registration drafted; see `iana-media-type.md`)
- **What it is:** a single UTF-8 JSON document holding a complete family
  memory archive — biography, stories, recipes, timeline, letters, photos and
  recordings metadata, contributors — plus a manifest with a format version
  and a media verification manifest of SHA-256 checksums.

## Extension information

- **`.omf.json`** — the JSON document. Compound extension by convention: the
  trailing `.json` keeps generic tools working; the `.omf.` infix names the
  format. Bare `.omf` is deliberately not used (it collides with Avid Open
  Media Framework media files, which PRONOM should *not* conflate with this
  format).
- **`.omf.zip`** — the bundle variant: a standard PKZIP archive containing
  `export.json` (the document above), `README.md`, `SPEC.md`, `viewer.html`,
  `checksums.txt`, and a `media/` directory of original files.

## Internal signature (for the JSON document)

Version 1.1+ documents self-identify. The `manifest` object — the document's
first member as written by the producing application — contains:

```json
"$format": "https://github.com/DearestEllie/open-memory-format"
```

**Proposed signature:** the byte sequence for the ASCII string
`"$format": "https://github.com/DearestEllie/open-memory-format"`
(hex: `22 24 66 6F 72 6D 61 74 22 3A 20 22 68 74 74 70 73 3A 2F 2F 67 69 74
68 75 62 2E 63 6F 6D 2F 44 65 61 72 65 73 74 45 6C 6C 69 65 2F 6F 70 65 6E
2D 6D 65 6D 6F 72 79 2D 66 6F 72 6D 61 74 22`), variable position, in
practice within the first 200 bytes of the file (BOF-anchored with a generous
maximum offset is reasonable). JSON writers other than the reference
implementation may vary whitespace around the colon; a signature tolerating
optional whitespace (`22 24 66 6F 72 6D 61 74 22` … followed by the URL
string `68 74 74 70 73 3A 2F 2F 67 69 74 68 75 62 2E 63 6F 6D 2F 44 65 61 72
65 73 74 45 6C 6C 69 65 2F 6F 70 65 6E 2D 6D 65 6D 6F 72 79 2D 66 6F 72 6D
61 74`) is more robust.

**Version 1.0 documents** predate `$format`. They can be distinguished only
weakly (a JSON file whose early bytes contain `"formatVersion": "1.0"`
together with `"archiveId"`); it may be preferable to register 1.1+ only and
treat 1.0 as identifiable-by-extension.

## Container signature (for the zip bundle)

Standard zip (PK\x03\x04) container holding a member named `export.json`
whose content matches the internal signature above — the pattern PRONOM
already uses for OOXML/ODF-style container formats.

## Sample files

- `examples/nora-hart.omf.json` and `examples/export.example.json` in the
  specification repository.
- A real `.omf.zip` export can be supplied on request (any DearestEllie
  archive exports one; a fixture zip can also be generated from the examples).

## Links

- Specification: <https://github.com/DearestEllie/open-memory-format>
- Published spec page: <https://www.dearestellie.org/resources/memory-format>
- JSON Schema: `schema/omf-1.1.schema.json` in the repository
- Reference implementations and conformance suite: `reference/` and
  `conformance/` in the repository

## Submission notes for the operator

Email `pronom@nationalarchives.gov.uk` (or use the route at
<https://www.nationalarchives.gov.uk/PRONOM/submitinfo.htm>) with this
summary and sample files attached or linked. The PRONOM team writes the final
DROID signature themselves — the internal-signature section above is source
material for them, not a finished signature file. Ask for both entries (JSON
document and zip bundle) to cross-reference each other, and to note the
deliberate non-use of bare `.omf`.
