# Format registrations

Drafts for registering the Open Memory Format with the registries that
long-lived formats live in. Registration is part of the format's job: a
century-scale archive should be identifiable by tools its authors never met.

These are **drafts for the operator to submit** — they are not yet filed.
Each document notes anything that must be checked or filled at submission
time. Contact for all three: **sneakocom@gmail.com**.

## What's here, and how to submit each

### 1. IANA media type — [`iana-media-type.md`](iana-media-type.md)

A completed RFC 6838 application for
`application/vnd.dearestellie.omf+json` in the **vendor tree** (vendor-tree
registrations are reviewed by IANA without an RFC).

**To submit:** paste the template fields into the IANA media type application
form at <https://www.iana.org/form/media-types>. Vendor-tree requests usually
get a response, possibly with reviewer questions, within a few weeks. Once
approved, the type appears at
<https://www.iana.org/assignments/media-types/> and SPEC.md should be updated
to state the registered type.

### 2. PRONOM — [`pronom.md`](pronom.md)

A draft submission to The National Archives (UK) **PRONOM** technical
registry, which assigns the PUIDs (`fmt/…`) used by digital-preservation
tools (DROID, Siegfried, Archivematica) to identify file formats.

**To submit:** email the summary to the PRONOM team at
`pronom@nationalarchives.gov.uk` (or use the submission route described at
<https://www.nationalarchives.gov.uk/PRONOM/submitinfo.htm>), attaching or
linking sample files — `examples/nora-hart.omf.json` and a real `.omf.zip`
export are good candidates. They will craft the final binary signature from
the draft's internal-signature notes.

### 3. Library of Congress format description — [`loc-fdd.md`](loc-fdd.md)

Notes structured for a **Sustainability of Digital Formats** (fdd) format
description, the Library of Congress registry preservation planners consult.
LoC writes fdd entries themselves; the practical path is to send them the
notes and a pointer to this repository.

**To submit:** contact the Sustainability of Digital Formats team via the
contact route on <https://www.loc.gov/preservation/digital/formats/> and
offer the notes in `loc-fdd.md`. Adoption beyond one producing application
strengthens the case for an entry, so this one may reasonably wait until a
second implementer exists.

## After any registration lands

- Update SPEC.md §1 (files and extensions) with the registered media type
  and, for PRONOM, the assigned PUID.
- Update `crosswalks/dublin-core.md`, which cites the media type as
  `dc:format`.
- Keep the `$format` URL and the compound extensions exactly as specified —
  registries describe the format; they don't change it.
