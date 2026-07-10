# Crosswalk: OMF → Dublin Core

How Open Memory Format fields map onto the
[Dublin Core Metadata Element Set](https://www.dublincore.org/specifications/dublin-core/dces/)
(the 15 `dc:` elements, with a few `dcterms:` refinements noted), for
archives, libraries, and repository software (DSpace, Omeka, OAI-PMH
harvesters) that describe deposited objects with DC.

DC describes *resources*; it does not model family relationships, visibility,
or narrative structure. The natural use is one DC description for the export
as a whole (the deposited `.omf.zip`), and optionally one per record for
item-level catalogs.

## The export as a deposited object

| OMF | Dublin Core | Notes |
| --- | --- | --- |
| `manifest.archiveName` | `dc:title` | e.g. "Nora Hart — family memory archive". |
| `contributors[].name` | `dc:contributor` | One element per contributor. The steward who made the export is closest to `dc:creator`. |
| `archive.name` | `dc:subject` | The person the archive is *about* is a subject, not a creator. |
| `manifest.generatedAt` | `dc:date` (refine: `dcterms:created`) | ISO 8601 already; safe to declare `dcterms:W3CDTF` encoding for this one field. |
| `readme`, `archive.intro` | `dc:description` | |
| media type | `dc:format` | `application/vnd.dearestellie.omf+json` for the document; `application/zip` for the zip variant. |
| `manifest.archiveId` | `dc:identifier` | An opaque platform id — pair it with a repository-assigned identifier. |
| `manifest.$format` | `dc:relation` (refine: `dcterms:conformsTo`) | `https://github.com/DearestEllie/open-memory-format`. `dcterms:conformsTo` is exactly right for a format/spec reference. |
| — | `dc:type` | `Collection` (DCMI Type Vocabulary) for the export; see below for records. |
| — | `dc:rights` | **Not CC0.** This spec is CC0; a family's memories are theirs. Rights for the content must come from the depositor — there is no rights field inside OMF. |
| `archive.privacy`, per-record `visibility` | `dcterms:accessRights` | DC can *state* access terms but not enforce them. Repository access control must be configured to match; never deposit a private archive openly. |
| — | `dc:language` | Not recorded in OMF — supply at deposit time. |
| — | `dc:publisher`, `dc:source`, `dc:coverage` | Supply at deposit time if wanted; no OMF field maps cleanly. |

## Per-record descriptions

| OMF field (stories, letters, photos, media…) | Dublin Core | Notes |
| --- | --- | --- |
| `title` / `caption` | `dc:title` | |
| `contributor` | `dc:creator` | The person who wrote the memory down. |
| `era` / `date` | `dc:date` | **Lossy in spirit, faithful in letter:** OMF dates are free text ("summer, sometime in the 80s"). Put the text in `dc:date` *without* an encoding scheme — do not normalize it to W3CDTF, which would invent precision. |
| `body` / `desc` / `why` | `dc:description` | |
| `tags[]` | `dc:subject` | One element per tag. |
| `people[]` | `dc:subject` (or `dcterms:references`) | DC has no person-depicted element in the classic 15. |
| `place` | `dc:coverage` | Spatial coverage as free text. |
| `mediaFiles[].contentType` | `dc:format` | e.g. `image/jpeg`. |
| `mediaFiles[].originalFilename`, `storageKey` | `dc:identifier` | |
| `mediaFiles[].checksumSha256`, `byteSize` | — | No DC element. Repositories keep fixity in PREMIS (`premis:fixity`) or their own audit layer; carry the OMF values into that layer, not into DC. |
| `alternateOf` | `dc:relation` (refine: `dcterms:isVersionOf`) | "Another telling of" is close to, but warmer than, versioning. |
| `chapterId` | `dc:relation` (refine: `dcterms:isPartOf`) | Chapter as parent collection. |
| `status` (approval), `visibility` | — | No equivalent; handle in repository workflow/access control. `privateNotes` should simply never be deposited anywhere shared. |
| record type | `dc:type` | `Text` for stories/recipes/letters, `Image` for photos, `Sound` for audio, `MovingImage` for video, `Event` for timeline entries. |

## Worked example

The Nora Hart example export, described as one deposited object
(OAI-DC-style XML):

```xml
<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
           xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Nora Hart — family memory archive</dc:title>
  <dc:contributor>June Hart</dc:contributor>
  <dc:contributor>Samuel Hart</dc:contributor>
  <dc:subject>Nora Hart</dc:subject>
  <dc:description>Nora ran the town library for forty years and never once
    returned a book late. Stories, a recipe, a timeline, letters, and one
    photograph, kept by her family.</dc:description>
  <dc:date>2026-07-10T09:30:00.000Z</dc:date>
  <dc:type>Collection</dc:type>
  <dc:format>application/vnd.dearestellie.omf+json</dc:format>
  <dc:identifier>arch_nh_41d7</dc:identifier>
  <dc:relation>https://github.com/DearestEllie/open-memory-format</dc:relation>
  <dc:rights>© the Hart family. Access restricted to family; not for
    publication.</dc:rights>
</oai_dc:dc>
```

## Summary of loss

DC captures identity, agents, dates, and format well, and `dcterms:conformsTo`
names OMF itself cleanly. It cannot carry checksums (use PREMIS), enforce
visibility (use access control), or represent narrative structure, multiple
tellings, approval status, or guardian/minor fields — those stay inside the
OMF document, which is deposited intact anyway. That is the intended division
of labor: DC describes the box; OMF is what's in it.
