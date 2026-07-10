# Library of Congress format description notes: Open Memory Format

Notes structured for a **Sustainability of Digital Formats** format
description (an "fdd" entry, <https://www.loc.gov/preservation/digital/formats/>),
the Library of Congress registry that preservation planners consult when
deciding what formats they can commit to keeping readable. LoC authors fdd
entries themselves; these notes are source material to offer them.

## Identification and description

- **Full name:** Open Memory Format (OMF), version 1.1
- **Description:** a JSON-based interchange and archiving format for family
  memory archives — the biography, stories, recipes, timeline, letters,
  photographs, and audio/video recordings a family keeps about one person (or
  a couple, family, or community elder). One UTF-8 JSON document with named
  sections; an optional zip bundle adds the original media files, a
  self-contained HTML viewer, the specification itself, and a `sha256sum`
  checksum manifest.
- **Production context:** created by DearestEllie
  (https://www.dearestellie.org), a nonprofit memory-archive service, as its
  guaranteed export format; published as an open specification for any
  implementation.
- **Relationship to other formats:** the document is a subtype of JSON
  (RFC 8259); the bundle is a standard zip. Crosswalks to GEDCOM 7, Dublin
  Core, and schema.org are maintained in the specification repository.
  Distinct from — and deliberately not sharing an extension with — Avid's
  Open Media Framework ("OMF" in audio/video post-production).
- **File type signifiers:** extensions `.omf.json` / `.omf.zip` (compound by
  convention); media type `application/vnd.dearestellie.omf+json` (vendor-tree
  registration drafted); internal identifier `"$format":
  "https://github.com/DearestEllie/open-memory-format"` in every 1.1+
  document.

## Sustainability factors

- **Disclosure:** full. The specification, a JSON Schema, TypeScript type
  definitions, a conformance suite, and two reference implementations
  (TypeScript and stdlib-only Python) are public and dedicated to the public
  domain (CC0 1.0). The specification is generated from the same code the
  producing application executes, so the published format cannot drift from
  the shipped one.
- **Adoption:** currently one producing application (DearestEllie); the
  format is young. Every archive on the service can export to it at no cost,
  so the population of documents grows with the service. Openness and
  crosswalks exist precisely to invite further implementations. (This is the
  weakest factor today, and honestly so.)
- **Transparency:** high. Plain-text JSON readable in any text editor;
  human-readable section names; an embedded `readme` member; dates preserved
  as human-written strings rather than opaque encodings.
- **Self-documentation:** high, by design. Every document carries its format
  version and (since 1.1) the specification's canonical URL; the zip bundle
  carries the full specification text, a human README, and an offline HTML
  viewer, so the documentation and a reader travel *inside* the object.
- **External dependencies:** none. No schema fetch, no font, no codec is
  required to read the document. Bundled media files retain their original
  encodings (JPEG, MP4, etc.), whose sustainability is assessed separately.
- **Impact of patents:** none known; JSON and zip are unencumbered, and the
  specification is CC0.
- **Technical protection considerations:** none. No encryption or DRM at the
  format level; integrity (not secrecy) is provided by SHA-256 checksums in
  the document and a `sha256sum`-format `checksums.txt` in the bundle.

## Quality and functionality factors

- **Normal functionality:** faithful capture of family-authored records,
  including approximate dates kept as written with explicit precision, and
  multiple tellings of the same memory (`alternateOf`).
- **Integrity:** per-file SHA-256 checksums plus a bundle-wide checksum
  manifest verifiable with standard tools (`sha256sum -c checksums.txt`).
- **Fidelity of restore:** the format round-trips into a live service,
  including per-record visibility; the specification requires importers to
  default restored archives to private.
- **Privacy characteristics** (relevant to appraisal): documents routinely
  contain sensitive personal data, including data about minors; the
  specification's faithfulness rules forbid broadening recorded visibility.

## Versioning and stability

`formatVersion` is `major.minor`. Minor versions are strictly additive
(readers accept any same-major document and ignore unknown members); major
versions are breaking and must be rejected loudly. History: 1.0 (initial);
1.1 (adds `$format` self-identification and the compound extensions; every
1.0 document remains valid 1.x).

## Submission notes for the operator

Offer these notes and the repository link to the Sustainability of Digital
Formats team via the contact route on their site. An fdd entry is most
plausible once at least one independent implementation or institutional user
exists — the conformance suite gives a second implementer a concrete target,
so this registration can reasonably follow, rather than lead, adoption.
