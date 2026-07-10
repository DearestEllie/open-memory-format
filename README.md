# The open memory format

**The documented, versioned format every [DearestEllie](https://www.dearestellie.org) archive exports to.**
Plain JSON with named sections, a media manifest with SHA-256 checksums, and no
dependence on us — or on anyone.

A family archive is a century-scale object. No company — including this one —
should be a single point of failure for it. So every DearestEllie archive
exports, free and at any time, into this open format: a format any person can
read in a text editor and any programmer can parse in an afternoon.

- **Current version:** `1.0`
- **Specification:** [SPEC.md](SPEC.md)
- **TypeScript types:** [`types/memory-format.d.ts`](types/memory-format.d.ts)
- **Example document:** [`examples/export.example.json`](examples/export.example.json)
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
(format version, generation time, per-section counts), a `mediaFiles`
verification manifest (storage key + SHA-256 checksum + byte size for every
original), and an embedded human-readable `readme`.

## Guarantees

- **Versioned.** Every document carries its format version. Breaking changes
  bump the version and are documented; an incompatible document is rejected
  loudly, never misread.
- **Verifiable.** The `mediaFiles` manifest lists each original's SHA-256
  checksum and size, so a family can prove their copies are intact with
  standard tools (`sha256sum`), with no help from us.
- **Faithful.** Dates are kept as the family wrote them — an approximate year
  stays approximate. Nothing is invented to fill a field.
- **Round-trippable.** The same format restores into a new archive, which is
  also how a family would leave one host for another.
- **Free, always.** Export is a guaranteed capability of every archive,
  protected by the commons' guiding principles. It is never gated by payment,
  and never will be.

## For implementers

Genealogy tools, digital-preservation projects, and memorial services are
welcome to read and write this format — that is the point of an open format.
Two notes worth knowing:

- **Treat unknown fields as data to preserve, not errors.** Families annotate
  their memories in ways schemas don't predict, and a version bump may add
  fields before it removes any.
- **The `privateNotes` section exists only in a steward's own export.** If you
  build an import, keep its contents as private as we do.

See [SPEC.md](SPEC.md) for the full field-level specification.

## License

This specification, the type definitions, and the examples in this repository
are dedicated to the public domain under [CC0 1.0](LICENSE). Implement freely,
no attribution required.
