# The open memory format

**The documented, versioned format every [DearestEllie](https://www.dearestellie.org) archive exports to.**
Plain JSON with named sections, a media manifest with SHA-256 checksums, and no
dependence on us — or on anyone.

A family archive is a century-scale object. No company — including this one —
should be a single point of failure for it. So every DearestEllie archive
exports, free and at any time, into this open format: a format any person can
read in a text editor and any programmer can parse in an afternoon.

- **Current version:** `1.1`
- **File extensions:** `.omf.json` (single document) and `.omf.zip` (document
  plus originals). Compound on purpose — the final `.json` / `.zip` keeps every
  OS and tool working; bare `.omf` is avoided (it belongs to Avid's Open Media
  Framework).
- **Specification:** [SPEC.md](SPEC.md) — the single normative document
- **JSON Schema:** [`schema/omf-1.1.schema.json`](schema/omf-1.1.schema.json)
- **TypeScript types:** [`types/memory-format.d.ts`](types/memory-format.d.ts)
- **Example documents:** [`examples/`](examples/)
- **Conformance suite:** [`conformance/`](conformance/) — fixtures a reader
  must handle correctly to claim conformance
- **Reference implementations:** [`reference/`](reference/) — a dependency-free
  TypeScript parser and a stdlib-only Python reader/verifier
- **Crosswalks:** [`crosswalks/`](crosswalks/) — field mappings to GEDCOM 7,
  Dublin Core, and schema.org, plus the
  [research-donation profile](crosswalks/research-profile.md) (consented,
  identity-modal Dublin Core for scholarly corpora)
- **Format registrations:** [`registration/`](registration/) — drafts for
  IANA media type, PRONOM, and Library of Congress format descriptions
- **Published spec page:** <https://www.dearestellie.org/resources/memory-format>
- **In-browser restore viewer:** <https://www.dearestellie.org/restore> — parses
  an export entirely in your browser (nothing is uploaded) and renders every
  section read-only.

## The shape, in one paragraph

An export is a single JSON document (plus, in the zip variant, a `media/`
folder of original files next to `export.json`). The document has named
sections — `archive`, `chapters`, `stories`, `recipes`, `timeline`, `letters`,
`photos`, `voices`, `thingsLoved`, `detailCards`, `privateNotes`,
`contributors`, `media` — each a plain array of records, plus a `manifest`
(format identity and version, generation time, per-section counts), a
`mediaFiles` verification manifest (storage key + SHA-256 checksum + byte size
for every original), and an embedded human-readable `readme`. Since 1.1 the
manifest also names its own format (`"$format":
"https://github.com/DearestEllie/open-memory-format"`), so a file that has
lost its name is still identifiable.

## Guarantees

- **Versioned.** Every document carries its format version (`major.minor`).
  Minor versions are additive only — a reader of any `1.x` accepts any other
  `1.x` and ignores fields it doesn't know. Breaking changes bump the major
  version and are documented; an incompatible document is rejected loudly,
  never misread.
- **Verifiable.** The `mediaFiles` manifest lists each original's SHA-256
  checksum and size, and the zip variant carries a `checksums.txt` covering
  everything, so a family can prove their copies are intact with standard
  tools (`sha256sum -c checksums.txt`), with no help from us.
- **Faithful.** Dates are kept as the family wrote them — an approximate year
  stays approximate. Nothing is invented to fill a field, and visibility is
  never broadened.
- **Round-trippable.** The same format restores into a new archive, which is
  also how a family would leave one host for another.
- **Free, always.** Export is a guaranteed capability of every archive,
  protected by the commons' guiding principles. It is never gated by payment,
  and never will be.

## For implementers

Genealogy tools, digital-preservation projects, and memorial services are
welcome to read and write this format — that is the point of an open format.
Start with [SPEC.md](SPEC.md), validate against the
[JSON Schema](schema/omf-1.1.schema.json), borrow a
[reference implementation](reference/), and check your reader against the
[conformance suite](conformance/). Two notes worth knowing:

- **Treat unknown fields as data to preserve, not errors.** Families annotate
  their memories in ways schemas don't predict, and a minor version may add
  fields before any major version removes one.
- **The `privateNotes` section exists only in a steward's own export.** If you
  build an import, keep its contents as private as we do — and default an
  imported archive to private.

If your tool needs to map into another standard, the
[crosswalks](crosswalks/) cover GEDCOM 7, Dublin Core, and schema.org, with
honest notes about what doesn't map.

## License

This specification, the schema, the type definitions, the examples, the
conformance suite, and the reference implementations in this repository are
dedicated to the public domain under [CC0 1.0](LICENSE). Implement freely,
no attribution required.
