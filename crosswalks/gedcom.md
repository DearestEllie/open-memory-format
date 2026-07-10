# Crosswalk: OMF → GEDCOM 7

How Open Memory Format fields map onto [GEDCOM 7](https://gedcom.io/)
(FamilySearch GEDCOM 7.0) structures, for genealogy tools that want to import
an OMF export. GEDCOM is a lineage format and OMF is a memory format, so this
mapping is honest about what carries over and what doesn't: GEDCOM is very
good at who/when/where, and has no native home for the texture OMF exists to
keep.

The one genuinely good fit: GEDCOM 7's `PHRASE` substructure lets a date stay
exactly as the family wrote it — which is an OMF faithfulness rule (SPEC.md
§5.1). Use it.

## Document and archive

| OMF | GEDCOM 7 | Notes |
| --- | --- | --- |
| `archive` (subjectType `self`, `loved_one`, `community_elder`) | `INDI` record | One individual per archive. |
| `archive` (subjectType `couple`, `family`) | `FAM` record (+ member `INDI`s) | Lossy: OMF doesn't itemize the members; a human must. |
| `archive.name` | `INDI.NAME` | GEDCOM name pieces (`GIVN`, `SURN`) must be split by hand or heuristic — lossy. |
| `archive.nickname` | `NAME.NICK` | |
| `archive.relationship` | `ASSO` with `ROLE` on the exporter's own `INDI`, if one exists | OMF states the relationship to the family, not a pedigree link. |
| `archive.birth` | `INDI.BIRT.DATE` — put the text as written in `DATE.PHRASE` | `"1936"` parses as a year; `"summer, sometime in the 60s"` goes in `PHRASE` verbatim. Never invent precision. |
| `archive.death` | `INDI.DEAT.DATE` (+ `PHRASE`) | `""` (not applicable) → no `DEAT` structure at all. |
| `archive.status` | — | No equivalent (`living`/`memory_loss`/`illness`); GEDCOM only infers living/dead. Drop or keep in a `NOTE`. |
| `archive.intro`, `archive.why` | `INDI.NOTE` / shared `SNOTE` | |
| `manifest.generatedAt` | `HEAD.DATE` | |
| `manifest.$format`, `formatVersion` | `HEAD.SOUR` + `NOTE` | Record provenance: name the source system and the OMF version. |

## Sections

| OMF section | GEDCOM 7 | Notes |
| --- | --- | --- |
| `stories`, `recipes` | `SNOTE` records referenced from the `INDI` | GEDCOM has no story object. Title, contributor, era, place, and body must be flattened into note text — structured fields (`tags`, `people`, `alternateOf`) are lossy. A recipe is just a note to GEDCOM. |
| `stories[].contributor` | `SNOTE` → `SOUR`/`SUBM` citation, or in-text credit | GEDCOM credits submitters, not per-memory contributors, cleanly. |
| `timeline` | `INDI` event structures (`BIRT`, `DEAT`, `RESI`, `OCCU`, `EVEN` for the rest) with `DATE` + `PHRASE` | Best fit in the whole crosswalk. `precision` is carried implicitly: write only what the date text supports; put the raw text in `PHRASE`. `category` → `EVEN.TYPE`. |
| `letters` | `SNOTE` or `OBJE` (if kept as a file) | No letter object in GEDCOM. |
| `photos` | `OBJE` multimedia record; caption → `OBJE.NOTE`, file → `FILE` + `FORM` | Requires the zip variant (or the media route) for actual files; a `photos` record alone has no `FILE`. |
| `voices`, `media` | `OBJE` with `FILE.FORM` audio/video | `transcript`, `duration` → `NOTE`. |
| `mediaFiles.checksumSha256` | — | **No equivalent.** GEDCOM 7 has no checksum field. Keep `checksums.txt`/`mediaFiles` alongside the GEDCOM file if integrity matters (it does). |
| `chapters` | — | No equivalent; chapters are narrative structure. Optionally prefix flattened notes with the chapter title. |
| `detailCards`, `thingsLoved` | `INDI.NOTE`, or `FACT`/`EVEN` with `TYPE` | e.g. `1 FACT Strong tea, milk first` / `2 TYPE Thing loved`. Stretchy but serviceable. |
| `contributors` | `SUBM` records | `isMinor`, guardian fields, `permission` have no equivalent — drop them on export; never carry a child's guardian data into a format that can't protect it. |
| `privateNotes` | Do **not** export | GEDCOM's `RESN CONFIDENTIAL` exists, but many tools ignore it. The safe mapping is omission. |
| `visibility` (per record) | `RESN` (`CONFIDENTIAL`, `PRIVACY`) | Advisory only in practice. Treat GEDCOM output as the *most public* visibility present — or filter to public/family records before converting. Never broaden. |

## Worked example

OMF timeline event:

```json
{
  "id": "tl_nh_01",
  "title": "Became head librarian at Millbrook",
  "date": "1958",
  "precision": "year",
  "category": "work",
  "visibility": "family",
  "desc": "Youngest head librarian the town had ever appointed."
}
```

GEDCOM 7:

```gedcom
0 @I1@ INDI
1 NAME Nora /Hart/
2 NICK Nonie
1 BIRT
2 DATE 1936
1 OCCU Head librarian, Millbrook
2 DATE 1958
3 PHRASE 1958
2 NOTE Youngest head librarian the town had ever appointed.
2 RESN PRIVACY
```

And an approximate OMF date — `"date": "the early 60s", "precision": "approx"`
— becomes:

```gedcom
1 EVEN
2 TYPE Moved to Maple Street
2 DATE BET 1960 AND 1965
3 PHRASE the early 60s
```

…only if a human confirms the range; otherwise omit the machine-readable date
and keep just the `PHRASE`. The phrase is the truth; the range is a guess.

## Summary of loss

Going OMF → GEDCOM you keep names, dates (as written, via `PHRASE`), events,
and files; you flatten stories, recipes, letters, chapters, and detail cards
into notes; you lose per-record contributors, approval status, checksums,
`alternateOf` (multiple tellings), and enforceable visibility. GEDCOM →
OMF is easier: individuals, events, and notes all have obvious homes, and
unknown GEDCOM substructures can ride along as extra fields (readers ignore
what they don't know).
