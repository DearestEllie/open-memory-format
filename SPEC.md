# The open memory format — specification

**Version 1.1**

This document specifies the open export format for family memory archives, as
produced by [DearestEllie](https://www.dearestellie.org) and open to any
implementation. The canonical machine-readable definition ships as
[`types/memory-format.d.ts`](types/memory-format.d.ts) with a JSON Schema at
[`schema/omf-1.1.schema.json`](schema/omf-1.1.schema.json); complete examples
live in [`examples/`](examples/), and conformance fixtures in
[`conformance/`](conformance/).

The key words **MUST**, **SHOULD**, and **MAY** are to be interpreted as in
RFC 2119.

## 1. Files and extensions

An exported archive is one of:

- `<name>.omf.json` — the single JSON document described in §3.
- `<name>.omf.zip` — a plain zip containing that document plus every media
  original and supporting files (layout in §2).

The compound extension is deliberate: the final `.json` / `.zip` keeps every
operating system, text editor, and unzip tool working with no special file
association, while the `.omf.` infix names the format (Open Memory Format).
Bare `.omf` is avoided — it belongs to Avid's Open Media Framework, and a
family double-clicking their export must never land in a video editor's error
dialog. A file that has lost its name entirely is still identifiable by its
`manifest.$format` field (§3.1).

Writers SHOULD name files with these compound extensions; readers MUST NOT
require any particular filename — the document identifies itself.

## 2. Container

An export comes in two variants:

- **JSON export** — a single UTF-8 JSON document (`<name>.omf.json`;
  `export.json` inside the zip). It contains all textual content plus the
  `mediaFiles` verification manifest; the binary originals themselves are not
  bundled.
- **Zip export** — a `<name>.omf.zip` archive:

  ```
  <name>.omf.zip
  ├── export.json      the document (§3)
  ├── README.md        the human-readable README (same text as the readme section)
  ├── SPEC.md          this specification — the documentation travels with the data
  ├── viewer.html      a self-contained offline reader; open in any browser
  ├── checksums.txt    sha256sum-format lines for export.json and every bundled file
  └── media/<storageKey>   every original, at the key its mediaFiles record lists
  ```

  `viewer.html` MUST be self-contained (no network access needed) so the
  archive stays readable with nothing but a web browser. `checksums.txt` is
  standard `sha256sum` output covering `export.json` and every bundled file;
  the entire archive verifies at once with `sha256sum -c checksums.txt`.

A missing or unreadable original MUST NOT fail the whole export; writers skip
it (and MAY count skips in the manifest, e.g. as `mediaFilesMissing`) so that
nothing else in the export is held hostage by one bad file.

## 3. Document structure

The document is a JSON object with the following top-level members. Every
section marked *array* is a plain array of records — no wrappers, no paging.

| Member | Type | What it holds |
| --- | --- | --- |
| `manifest` | object | Format identity and version, generation time, archive identity, per-section record counts. |
| `archive` | object | Who this archive is about — name, dates as the family wrote them, introduction. |
| `chapters` | array | The chapters a life was organized into. |
| `stories` | array | Memories: stories, ordinary days, lessons, quotes, places (every memory that is not a recipe). |
| `recipes` | array | Memories filed as recipes (`type` is `"recipe"`). |
| `timeline` | array | Dated moments, best-effort chronological. Approximate dates stay approximate. |
| `letters` | array | Letters written to the family. |
| `photos` | array | Photo entries and their captions. |
| `voices` | array | Voice notes and videos (display metadata; originals are listed in `mediaFiles`). |
| `thingsLoved` | array | The things they loved. |
| `detailCards` | array | The small true things — sayings, songs, places, habits. |
| `privateNotes` | array | Steward-only notes. Present only in a steward's own export. |
| `contributors` | array | Who helped remember. |
| `media` | array | Display metadata for every photo, audio, and video item. |
| `mediaFiles` | array | Every original file's storage key, SHA-256 checksum, and byte size — the verification manifest. |
| `readme` | string | A human-readable README explaining how to read the export without the producing host. |

### 3.1 `manifest`

```jsonc
{
  "$format": "https://github.com/DearestEllie/open-memory-format", // self-identification (1.1+)
  "formatVersion": "1.1",           // major.minor; see §6
  "generatedAt": "2026-07-10T12:00:00.000Z", // ISO 8601 timestamp
  "archiveId": "...",               // stable id of the archive
  "archiveName": "...",             // display name at export time
  "counts": { "stories": 12, "recipes": 2, /* … one entry per section */ }
}
```

`$format` (added in 1.1) is the format's canonical URL — the address of this
specification — embedded in every document so a file found with no extension,
or long after any producing host is gone, still says what it is. Writers MUST
set it to exactly `https://github.com/DearestEllie/open-memory-format`;
readers MAY use it to recognize the format but MUST NOT require it (1.0
documents don't carry it).

`counts` maps section names to their record counts at generation time. Readers
MAY use it as a quick integrity check; they MUST NOT require any particular
set of keys.

### 3.2 Record identity and scalar conventions

- Every record carries a stable string `id`; child records carry the string
  `archiveId` of the archive they belong to.
- **Dates are kept as written.** Fields like `birth`, `death`, `era`, and
  `date` are strings holding whatever the family wrote — `"1943"`,
  `"summer, sometime in the 60s"`, `"1998-04-12"`. Timeline events carry an
  explicit `precision` (`"year" | "decade" | "month" | "day" | "approx"`).
  Readers MUST NOT normalize, reformat, or invent precision.
- **Visibility** is one of `"private" | "family" | "contributor" | "public" |
  "hidden"`. An export is made from one member's point of view, so it contains
  only what that member could see; the values are preserved so a restore can
  re-apply them.
- **Approval status** is one of `"draft" | "pending" | "approved" | "private"
  | "aside" | "rejected" | "needs_clarification"`. `"aside"` is a first-class
  status: a memory kept, deliberately, off to the side.
- Empty string (`""`) is the conventional "not set" value for optional string
  fields; `null` appears only where the types say it can.

### 3.3 Section records

Field-level shapes for every record are defined in
[`types/memory-format.d.ts`](types/memory-format.d.ts) and validated by
[`schema/omf-1.1.schema.json`](schema/omf-1.1.schema.json). Highlights:

- **`archive`** — identity (`name`, `nickname`, `relationship`), `status`
  (`living`, `deceased`, `memory_loss`, `illness`, `unknown`), `subjectType`
  (`self`, `loved_one`, `couple`, `family`, `community_elder`), `birth`/`death`
  as written, `privacy`, `intro`, `why`.
- **`stories` / `recipes`** — the same `Memory` record; a memory whose `type`
  is `"recipe"` is filed under `recipes`, everything else under `stories`.
  Memories carry `contributor`, `relationship`, `era`, `place`, `people[]`,
  `tags[]`, `chapterId`, `visibility`, `status`, `body`, and `alternateOf`
  (the id of the memory this is another telling of, `""` when it stands
  alone — families are allowed multiple truths).
- **`voices` and `media`** — both hold `MediaItem` records (`mediaType`
  `"audio" | "video"`, `title`, `duration`, `contributor`, `date`,
  `transcript`). `media` is the complete display-metadata list; `voices` is
  the same list presented as a section.
- **`mediaFiles`** — see §4.
- **`privateNotes`** — steward-only. Writers MUST include this section only in
  an export made by a steward of the archive; readers and importers MUST keep
  its contents as private as the producing host did.

## 4. Media verification (`mediaFiles` and `checksums.txt`)

Each `mediaFiles` entry identifies one original file well enough to locate and
verify it independently of any hosted app:

```jsonc
{
  "mediaId": "...",             // id of the media/photo record it belongs to
  "mediaType": "audio",         // "audio" | "video" | "photo"
  "storageKey": "…",            // path of the original; zip bundles it at media/<storageKey>
  "checksumSha256": "…",        // lowercase hex SHA-256 of the original bytes, or null (legacy)
  "byteSize": 1234,             // size in bytes, or null (legacy)
  "originalFilename": "…",      // as uploaded, or null
  "contentType": "image/jpeg"   // MIME type, or null
}
```

To verify a single original in a zip export with standard tools:

```sh
sha256sum media/<storageKey>   # compare against checksumSha256
```

To verify the whole zip at once, use its `checksums.txt` (standard `sha256sum`
output covering `export.json` and every bundled file):

```sh
sha256sum -c checksums.txt
```

`checksumSha256` and `byteSize` are `null` only for legacy files recorded
before checksumming existed; writers SHOULD populate both for everything new.

## 5. Reading and restoring

- Open the `.omf.json` in any text editor, or load it with any JSON tool.
  Every section is a plain array of records.
- A conforming reader MUST check `manifest.formatVersion` and apply the
  version policy in §6: accept any `1.x` document; reject any other major
  version (or a missing/malformed version) loudly rather than misread it.
- A conforming reader MUST tolerate the absence of `mediaFiles` (early 1.0
  documents predate it) and treat it as an empty list.
- **Unknown fields are data, not errors.** Readers MUST ignore — and importers
  SHOULD preserve — fields they don't recognize. A minor version may add
  fields; it never removes any.

### 5.1 Faithfulness rules

- Writers MUST keep dates as the family wrote them — an approximate year stays
  approximate; nothing is invented to fill a field.
- Writers MUST NOT broaden the visibility recorded on a record; an export
  contains only what the exporting member could see, with visibility values
  preserved so a restore can re-apply them.
- `privateNotes` appear only in an export made by their own steward (§3.3).
- Readers importing a document into a live service SHOULD default the imported
  archive to private and let a human widen visibility deliberately.

## 6. Versioning

`manifest.formatVersion` is a semver-shaped string, `major.minor`. Current
version: `"1.1"`.

- A **minor** bump is additive only: new optional fields or new sections. A
  reader of any `1.x` MUST accept any other `1.x` document and ignore fields
  it doesn't know — a 1.0 reader's data is never stranded by a 1.1 writer, or
  vice versa.
- A **major** bump is a breaking change (renaming or removing a section,
  changing a field's meaning). A reader MUST reject a document with a
  different major version loudly — never misread it. The migration is
  documented in this repository.

### 6.1 Version history

| Version | Changes |
| --- | --- |
| 1.0 | Initial format: the document of §3, JSON and zip variants, `mediaFiles` verification manifest. |
| 1.1 | Adds `manifest.$format` self-identification and the `.omf.json` / `.omf.zip` compound file extensions. No other changes; every 1.0 document is valid 1.x. |

## 7. Provenance

This specification is executable code in the producing application: the same
definition (`lib/export-format.ts` in the DearestEllie codebase) is shared by
the export writer, its tests, and the published spec page at
<https://www.dearestellie.org/resources/memory-format>, so the published
format and the shipped format cannot drift apart. This repository is the
standalone, public copy of that definition.
