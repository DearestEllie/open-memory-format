# IANA media type application: `application/vnd.dearestellie.omf+json`

Completed per the RFC 6838 §5.6 registration template, for submission through
the IANA media type application form (<https://www.iana.org/form/media-types>)
in the **vendor tree**. The `+json` structured syntax suffix is used per
RFC 6839 §3.1, so generic JSON processing rules apply to any consumer that
doesn't know the format specifically.

---

**Type name:** application

**Subtype name:** vnd.dearestellie.omf+json

**Required parameters:** N/A

**Optional parameters:** N/A

**Encoding considerations:** binary. This media type uses the `+json`
structured syntax suffix (RFC 6839); the content is a single JSON document
(RFC 8259) and is always encoded as UTF-8.

**Security considerations:**
Shares the security considerations of `application/json` (RFC 8259 §12).
The format is declarative data: it contains no executable content, no macros,
and no external references that a processor is required to dereference
(the `manifest.$format` member is an identifying URL, not a link a reader
needs to fetch).

Documents of this type routinely contain **sensitive personal information**:
biographical details of living and deceased persons, family relationships,
private notes, and metadata about minors and their guardians. Applications
handling this type should treat documents as private by default, must not
broaden the per-record visibility values recorded in the document, and should
protect files at rest and in transit accordingly (see the specification's
faithfulness rules, SPEC.md §5.1).

The format carries SHA-256 checksums for associated media files
(`mediaFiles[].checksumSha256`), which consumers may use to verify integrity;
the checksums authenticate content integrity only and provide no
confidentiality. As with all JSON, parsers should be robust against
deeply nested or maliciously large documents.

**Interoperability considerations:**
The document is plain UTF-8 JSON and is processable by any JSON tool.
Versioning is `major.minor` (`manifest.formatVersion`): minor versions are
strictly additive, and readers accept any document sharing their major
version while ignoring unrecognized members; a document with a different
major version is rejected rather than misread. Processors that don't know
this type specifically may process it as `application/json` per RFC 6839.

**Published specification:**
https://github.com/DearestEllie/open-memory-format (SPEC.md; includes a JSON
Schema, conformance suite, and reference implementations). The specification
is dedicated to the public domain (CC0 1.0).

**Applications that use this media type:**
DearestEllie (https://www.dearestellie.org), a nonprofit family-memory
archive service, as its export/import format; the format is an open
specification intended for use by genealogy, memorial, and
digital-preservation applications generally. A self-contained browser-based
viewer ships inside the format's zip variant.

**Fragment identifier considerations:**
As specified for `+json` in RFC 6839 §3.1.

**Additional information:**

- *Deprecated alias names for this type:* N/A
- *Magic number(s):* none. A document is reliably identifiable by the JSON
  member `"$format": "https://github.com/DearestEllie/open-memory-format"`
  in its `manifest` object (present since format version 1.1).
- *File extension(s):* `.omf.json` (a compound extension by convention; the
  trailing `.json` keeps generic tooling working, and the `.omf.` infix names
  the Open Memory Format). Bare `.omf` is deliberately not used — it is
  associated with Avid's Open Media Framework. The related zip bundle
  (document plus original media files) uses `.omf.zip` and is an ordinary
  `application/zip` archive containing an `export.json` of this media type.
- *Macintosh file type code(s):* TEXT

**Person & email address to contact for further information:**
DearestEllie, sneakocom@gmail.com

**Intended usage:** COMMON. Interchange, export/import, and long-term
personal archiving of family memory archives.

**Restrictions on usage:** none.

**Author:** DearestEllie (sneakocom@gmail.com)

**Change controller:** DearestEllie (sneakocom@gmail.com)

---

*Submission notes for the operator (not part of the template):*

- Submit via <https://www.iana.org/form/media-types>; choose the vendor tree.
- If IANA reviewers ask whether the `vnd.` producer name is legitimate,
  the producing organization is the operator of dearestellie.org; be ready
  to confirm from an address at that domain if requested.
- After approval, record the registered type in SPEC.md §1 and in
  `crosswalks/dublin-core.md`.
