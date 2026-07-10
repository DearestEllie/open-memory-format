# The open memory format — specification

**Version 1.0**

This document specifies the open export format for family memory archives, as
produced by [DearestEllie](https://www.dearestellie.org) and open to any
implementation. The canonical machine-readable definition ships as
[`types/memory-format.d.ts`](types/memory-format.d.ts); a complete example is
[`examples/export.example.json`](examples/export.example.json).

The key words **MUST**, **SHOULD**, and **MAY** are to be interpreted as in
RFC 2119.

## 1. Container

An export comes in two variants:

- **JSON export** — a single UTF-8 JSON document (conventionally
  `export.json`). It contains all textual content plus the `mediaFiles`
  verification manifest; the binary originals themselves are not bundled.
- **Zip export** — a `.zip` archive containing the same `export.json` at its
  root plus a `media/` directory holding every original binary file, stored at
  `media/<storageKey>` where `<storageKey>` is the record's `storageKey` from
  the `mediaFiles` section.

A missing or unreadable original MUST NOT fail the whole export; writers skip
it (and MAY count skips in the manifest, e.g. as `mediaFilesMissing`) so that
nothing else in the export is held hostage by one bad file.

## 2. Document structure

The document is a JSON object with the following top-level members. Every
section marked *array* is a plain array of records — no wrappers, no paging.

| Member | Type | What it holds |
| --- | --- | --- |
| `manifest` | object | Format version, generation time, archive identity, per-section record counts. |
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

### 2.1 `manifest`

```jsonc
{
  "formatVersion": "1.0",           // exact version string; see §5
  "generatedAt": "2026-07-10T12:00:00.000Z", // ISO 8601 timestamp
  "archiveId": "...",               // stable id of the archive
  "archiveName": "...",             // display name at export time
  "counts": { "stories": 12, "recipes": 2, /* … one entry per section */ }
}
```

`counts` maps section names to their record counts at generation time. Readers
MAY use it as a quick integrity check; they MUST NOT require any particular
set of keys.

### 2.2 Record identity and scalar conventions

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

### 2.3 Section records

Field-level shapes for every record are defined in
[`types/memory-format.d.ts`](types/memory-format.d.ts). Highlights:

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
- **`mediaFiles`** — see §3.
- **`privateNotes`** — steward-only. Writers MUST include this section only in
  an export made by a steward of the archive; readers and importers MUST keep
  its contents as private as the producing host did.

## 3. Media verification (`mediaFiles`)

Each entry identifies one original file well enough to locate and verify it
independently of any hosted app:

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

To verify a zip export with standard tools:

```sh
sha256sum media/<storageKey>   # compare against checksumSha256
```

`checksumSha256` and `byteSize` are `null` only for legacy files recorded
before checksumming existed; writers SHOULD populate both for everything new.

## 4. Reading and restoring

- Open the `.json` in any text editor, or load it with any JSON tool. Every
  section is a plain array of records.
- A conforming reader MUST check `manifest.formatVersion` and reject an
  incompatible document loudly rather than misread it.
- A conforming reader SHOULD tolerate the absence of `mediaFiles` in a
  version-`1.0` document (early 1.0 documents predate it) and treat it as an
  empty list.
- **Unknown fields are data, not errors.** Readers MUST ignore — and importers
  SHOULD preserve — fields they don't recognize. A version bump may add fields
  before it removes any.

## 5. Versioning

- `manifest.formatVersion` is a string, currently `"1.0"`.
- Any breaking change (renaming or removing a section, changing a field's
  meaning) bumps the version, and the migration is documented in this
  repository.
- Additive changes (new fields, new optional sections) MAY ship within a
  version; see the unknown-fields rule in §4.

## 6. Provenance

This specification is executable code in the producing application: the same
definition (`lib/export-format.ts` in the DearestEllie codebase) is shared by
the export writer, its tests, and the published spec page at
<https://www.dearestellie.org/resources/memory-format>, so the published
format and the shipped format cannot drift apart. This repository is the
standalone, public copy of that definition.
