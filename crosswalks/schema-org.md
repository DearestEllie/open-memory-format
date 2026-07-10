# Crosswalk: OMF → schema.org

How Open Memory Format fields map onto [schema.org](https://schema.org/)
types, for tools that publish memorial or biography pages and want structured
data (JSON-LD) alongside them.

One caution before any mapping: schema.org markup exists to be crawled.
**Only ever emit it for records whose `visibility` is `"public"`** on an
archive that allows it. An OMF export is usually private family material;
"has a schema.org mapping" is not an invitation to publish.

## The subject and the archive

| OMF | schema.org | Notes |
| --- | --- | --- |
| `archive` (subjectType `self`, `loved_one`, `community_elder`) | `Person` | |
| `archive` (subjectType `couple`, `family`) | two `Person`s / no good type | schema.org has no household or couple type that fits; `Organization` is wrong in spirit. Lossy. |
| `archive.name` | `Person.name` | |
| `archive.nickname` | `Person.alternateName` | |
| `archive.birth` | `Person.birthDate` **only if** it is a clean date/year | schema.org expects `Date`. `"1936"` is fine; `"summer, sometime in the 60s"` is not — put free text in `disambiguatingDescription` instead, and never invent a date. |
| `archive.death` | `Person.deathDate` | Same rule as `birthDate`. |
| `archive.status` | — | No equivalent (`living`, `memory_loss`, `illness`…). A death date implies deceased; nothing more should be published. |
| `archive.intro`, `why` | `Person.description` | |
| `archive.relationship` | `Person.relatedTo` | Coarse; schema.org's kinship vocabulary is thin (`parent`, `children`, `sibling`, `spouse`, `relatedTo`). |
| the archive as a work | `CreativeWork` (or `Collection`) `about` the `Person` | The archive itself — with `contributor`, `dateCreated` (`manifest.generatedAt`), `encodingFormat` (`application/vnd.dearestellie.omf+json`), and `schemaVersion` (`manifest.$format` URL — a near-perfect fit). |

## Sections

| OMF section | schema.org | Notes |
| --- | --- | --- |
| `stories` | `CreativeWork` (or `Article`/`ShortStory`) | `title` → `name`, `body` → `text`, `contributor` → `author.name`, `tags` → `keywords`, `people` → `about`/`mentions`, `place` → `contentLocation.name`, `era` → free text only (see dates note). `alternateOf` → `workTranslation` is wrong; use `sameAs`? Also wrong. Honest answer: **no equivalent** for "another telling of the same memory" — use a plain `isBasedOn` link and accept the distortion, or skip it. |
| `recipes` | `Recipe` | The type exists, but OMF recipe bodies are prose as the family wrote them — there is no structured `recipeIngredient` / `recipeInstructions` split to extract. Map `body` → `recipeInstructions` as one text block; do not machine-split a grandmother's recipe. |
| `letters` | `Message` | `author.name`, `toRecipient.name` (as text `Person`s), `text`, `dateSent` if clean. `CreativeWork` is a safe fallback. |
| `photos` | `Photograph` / `ImageObject` | `caption` → `caption`, `album` → `isPartOf` a `Collection`. The *taking* of a photo could be a `PhotographAction`, but OMF records the artifact, not the act — `Photograph` is the right type. |
| `voices`, `media` | `AudioObject` / `VideoObject` | `duration` is free text in OMF (`"2:14"`); schema.org wants ISO 8601 (`PT2M14S`) — convert only when unambiguous. `transcript` (boolean) says a transcript exists; schema.org's `transcript` wants the text itself. |
| `mediaFiles` | properties on the media object | `contentType` → `encodingFormat`, `byteSize` → `contentSize`, `storageKey`/URL → `contentUrl`, `checksumSha256` → `sha256` (a *pending* schema.org property on `MediaObject`; not yet core — say so if you rely on it). |
| `timeline` | `Event` | `title` → `name`, `desc` → `description`, `category` → `about`. `startDate` only for clean dates; `"the early 60s"` stays prose in `description`. `precision` has no equivalent — that is exactly why OMF has it. |
| `thingsLoved` | `Person.knowsAbout` is wrong; no equivalent | The closest honest mapping is prose in `Person.description`. Losing "strong tea, milk first" is the canonical example of what generic vocabularies lose. |
| `detailCards` | `PropertyValue` under `Person.additionalProperty`? | `additionalProperty` is not defined for `Person` in core schema.org. Practical options: fold into `description`, or accept nonstandard markup. Lossy either way. |
| `chapters` | `hasPart` / `isPartOf` with `CreativeWork` chapters | Serviceable. |
| `contributors` | `Person` via `CreativeWork.contributor` | `permission`, `isMinor`, guardian fields: **never publish**; no mapping is offered on purpose. |
| `privateNotes` | — | Never leaves the family. No mapping, deliberately. |
| `visibility`, `status` | — | schema.org has `creativeWorkStatus` for drafts, but publishing anything non-public is the real error. Filter first, map second. |

## Worked example

A public-visibility slice of the Nora Hart example as JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Nora Hart — family memory archive",
  "schemaVersion": "https://github.com/DearestEllie/open-memory-format",
  "encodingFormat": "application/vnd.dearestellie.omf+json",
  "dateCreated": "2026-07-10T09:30:00.000Z",
  "about": {
    "@type": "Person",
    "name": "Nora Hart",
    "alternateName": "Nonie",
    "birthDate": "1929",
    "description": "Nora ran the town library for forty years and never once returned a book late."
  },
  "hasPart": [
    {
      "@type": "CreativeWork",
      "name": "The night she kept the library open",
      "author": { "@type": "Person", "name": "June Hart" },
      "text": "The blizzard closed everything but her. She lit the reading lamps and let half the street sleep in the stacks.",
      "keywords": "library, snow",
      "contentLocation": { "@type": "Place", "name": "Millbrook Public Library" },
      "temporalCoverage": "the winter of 1978"
    },
    {
      "@type": "Recipe",
      "name": "Nonie's brown-butter shortbread",
      "author": { "@type": "Person", "name": "June Hart" },
      "recipeInstructions": "Brown a half pound of butter until it smells like toast. Two cups flour, half a cup sugar, a pinch of salt…"
    }
  ]
}
```

(`temporalCoverage` accepts free text, which makes it the least-lossy home for
an OMF `era`.)

## Summary of loss

schema.org carries people, works, recipes, events, and media files well, and
`schemaVersion` + `encodingFormat` identify the format itself cleanly. It has
no honest home for approximate dates with stated precision, multiple tellings
(`alternateOf`), things loved, detail cards, approval workflow, or
visibility — and several of the OMF fields that matter most for child safety
(`isMinor`, guardian fields) must never be mapped at all. Publish the public
slice; keep the archive itself in OMF.
