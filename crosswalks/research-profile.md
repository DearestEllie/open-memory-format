# Profile: OMF → research donation (Dublin Core)

How an Open Memory Format archive is packaged for **scholarly research** when,
and only when, its steward chooses to donate it. This is a *profile* of OMF —
a documented convention layered on the base format — not a change to it. It
exists so that a memory/oral-history archive can enter a research corpus as
[Dublin Core](https://www.dublincore.org/specifications/dublin-core/dces/)
metadata (the lingua franca of oral-history and digital-humanities
collections) with its consent terms travelling alongside the data.

The reference implementation is DearestEllie's `lib/research-format.ts`. The
profile is versioned independently of an archive export; this document
describes **research profile 1.1**.

## Consent is the gate, and it is narrow

Nothing enters a research export automatically. A research copy is built only
after an Archive Steward gives explicit, recorded consent, and it contains only
material that clears every one of these rules (enforced in the source query and
re-checked by the builder as defence in depth):

- The item is **approved** and its visibility is research-eligible. Private
  notes never qualify.
- The family did not mark the item `research_excluded`.
- Structured details and formal-study answers appear **only** when the
  enrollment explicitly shares structured data; a "prefer not to answer"
  response never exports.

Consent is **revocable**. A revoked archive is removed from future corpus
deliveries; the consent list is snapshotted at the moment a corpus dataset is
generated, so a revocation during a build applies to the *next* dataset.

## Identity modes

Every research copy declares one of two identity modes (default:
`deidentified`):

| Mode | What it does |
| --- | --- |
| `named` | Contributor names and the people a memory names are preserved. |
| `deidentified` | Contributor names become deterministic pseudonyms; the archive's identifying metadata and the `people` a memory names are omitted. |

De-identification is **honest about its limit**: it pseudonymizes and omits
metadata, but it never rewrites the remembered words themselves — a name
written inside a story stays as written. That limit is stated in the consent
copy, the `dc:rights` statement, and the export README, so a receiving
researcher is never misled about what "deidentified" guarantees.

## Document shape

A single-archive research export is one JSON document:

| Field | Contents |
| --- | --- |
| `manifest` | `formatVersion`, `generatedAt`, opaque `archiveId` (stable even when deidentified), `identityMode`, and `counts`. |
| `consent` | `identityMode`, `consentRecordedAt` (ISO), and a `revocationNote` spelling out revocation semantics for the researcher. |
| `collection` | One collection-level Dublin Core record (`dc:type` `Collection`). |
| `items[]` | One Dublin Core record per eligible memory and per eligible recording/photo. |
| `structured` | *(optional)* Family-confirmed structured `assertions` and formal-study `responses`; present only when the enrollment shares structured data. |
| `readme` | Human-readable description of the copy, its identity mode, and the de-identification limit. |

### The Dublin Core record

Item and collection records use the Dublin Core element set (`dc:` / `dcterms:`)
so they drop straight into DSpace, Omeka, and OAI-PMH harvesters:

| Field | Dublin Core | Notes |
| --- | --- | --- |
| `identifier` | `dc:identifier` | The item's stable uuid; stable across identity modes. |
| `title` | `dc:title` | |
| `creator` | `dc:creator` | The contributor's name, or their pseudonym in deidentified mode. |
| `date` | `dcterms:created` | The date **as the family wrote it** — never normalized. |
| `description` | `dc:description` | The memory's words, a caption, or the collection intro. |
| `type` | `dc:type` | DCMI Type Vocabulary (`Text`, `Sound`, `MovingImage`, `StillImage`, `Collection`). |
| `genre` | refinement of `dc:type` | The app-native kind (story, recipe, quote, voice…) so the family's own vocabulary is not flattened away. |
| `language` | `dc:language` | `"und"` (undetermined) in 1.1; per-item language is not tracked. |
| `rights` | `dc:rights` | The research-use terms this item was donated under. Content rights stay with the family — this profile never assigns them. |
| `subject` | `dc:subject` | The family's own tags. |
| `spatial` | `dcterms:spatial` | The remembered place, when one was written. |
| `people` | — | People the memory names; **named mode only**. |
| `isPartOf` | `dcterms:isPartOf` | The collection identifier (absent on the collection record itself). |
| `format`, `extent` | `dc:format`, `dcterms:extent` | The media file's content type and size, when it is a media item. |
| `transcript` | — | The recording's transcript, when one exists. |

Structured assertions additionally carry provenance — whether a detail was
`user_stated` or `ai_suggested_user_confirmed` — so a researcher can filter to
directly-attested facts.

## Corpus datasets (many archives)

A corpus bundles every currently-consented archive's research JSON into one zip
with a `corpus.json` manifest recording, per archive: identity mode, consent
date, and a checksum. Media binaries are **not** bundled in v1 (text +
transcripts only). Regenerate a corpus after any revocation before handing a
dataset to a partner.

## What this profile deliberately does not do

- It does not enforce access control. Dublin Core can *state* access terms
  (`dcterms:accessRights`) but cannot enforce them; the receiving repository
  must be configured to match, and a private archive is never deposited openly.
- It does not assign content rights. The spec is CC0; a family's memories are
  theirs. `dc:rights` carries the donation terms, not a licence grant.
