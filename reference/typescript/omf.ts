/**
 * Open Memory Format — reference TypeScript parser (single file, no dependencies).
 *
 * Parses and validates an OMF document per SPEC.md: accepts any 1.x document
 * (minor versions are additive; unknown fields are ignored, not errors),
 * rejects any other major version — or a missing/malformed version — loudly,
 * and tolerates the absence of `mediaFiles` (early 1.0 documents predate it).
 *
 * A reader built on this file passes the fixtures in `conformance/cases.json`.
 *
 * Specification: https://github.com/DearestEllie/open-memory-format
 *
 * Dedicated to the public domain under CC0 1.0. Implement freely, no
 * attribution required.
 */

/** The version this file documents. */
export const OMF_VERSION = "1.1";

/** The major version this parser understands; any `1.x` document is accepted. */
export const OMF_MAJOR = 1;

/** The format's canonical URL, embedded as `manifest.$format` in 1.1+ documents. */
export const OMF_FORMAT_URL = "https://github.com/DearestEllie/open-memory-format";

/* ---------------------------------------------------------------- types --
 * Plain-TS shapes for every section. Only what the parser checks is
 * structurally required at runtime; unknown extra fields are always data,
 * never errors (SPEC.md §5). See types/memory-format.d.ts for the complete
 * field-level documentation.
 */

export type Visibility = "private" | "family" | "contributor" | "public" | "hidden";

export type ApprovalStatus =
  | "draft"
  | "pending"
  | "approved"
  | "private"
  | "aside"
  | "rejected"
  | "needs_clarification";

export interface OmfManifest {
  /** Self-identification (1.1+): the format's canonical URL. Absent on 1.0 documents. */
  $format?: string;
  /** `major.minor`. */
  formatVersion: string;
  /** ISO 8601 timestamp. */
  generatedAt: string;
  archiveId: string;
  archiveName: string;
  /** Per-section record counts at generation time. */
  counts: Record<string, number>;
  [extra: string]: unknown;
}

export interface OmfArchive {
  id: string;
  name: string;
  nickname?: string;
  relationship?: string;
  status?: "living" | "deceased" | "memory_loss" | "illness" | "unknown";
  subjectType?: "self" | "loved_one" | "couple" | "family" | "community_elder";
  /** Kept as the family wrote it. */
  birth?: string;
  /** Kept as the family wrote it; "" when not applicable. */
  death?: string;
  privacy?: "private" | "family" | "public";
  intro?: string;
  why?: string;
  [extra: string]: unknown;
}

/** Every section record carries a stable string id. */
export interface OmfRecord {
  id: string;
  archiveId?: string;
  visibility?: Visibility;
  [extra: string]: unknown;
}

export interface OmfMemory extends OmfRecord {
  type?: string;
  title?: string;
  contributor?: string;
  relationship?: string;
  /** As written — "the 60s" stays "the 60s". */
  era?: string;
  place?: string;
  people?: string[];
  chapterId?: string;
  status?: ApprovalStatus;
  tags?: string[];
  body?: string;
  /** The memory this is another telling of ("" when it stands alone). */
  alternateOf?: string;
}

export interface OmfTimelineEvent extends OmfRecord {
  title?: string;
  /** As written. */
  date?: string;
  precision?: "year" | "decade" | "month" | "day" | "approx";
  category?: string;
  desc?: string;
}

export interface OmfMediaFileEntry {
  mediaId: string;
  mediaType: "audio" | "video" | "photo";
  /** In the zip variant, the original's bytes live at `media/<storageKey>`. */
  storageKey: string;
  /** Lowercase hex SHA-256 of the original bytes, or null (legacy). */
  checksumSha256: string | null;
  byteSize: number | null;
  originalFilename: string | null;
  contentType: string | null;
  [extra: string]: unknown;
}

export interface OmfDocument {
  manifest: OmfManifest;
  archive: OmfArchive;
  chapters: OmfRecord[];
  detailCards: OmfRecord[];
  stories: OmfMemory[];
  recipes: OmfMemory[];
  timeline: OmfTimelineEvent[];
  letters: OmfRecord[];
  photos: OmfRecord[];
  voices: OmfRecord[];
  thingsLoved: OmfRecord[];
  privateNotes: OmfRecord[];
  contributors: OmfRecord[];
  media: OmfRecord[];
  /** Empty array when the document predates mediaFiles (early 1.0). */
  mediaFiles: OmfMediaFileEntry[];
  readme?: string;
  [extra: string]: unknown;
}

/* --------------------------------------------------------------- parser -- */

/** Every section that must be present as an array (mediaFiles is optional). */
export const REQUIRED_SECTIONS = [
  "chapters",
  "detailCards",
  "stories",
  "recipes",
  "timeline",
  "letters",
  "photos",
  "voices",
  "thingsLoved",
  "privateNotes",
  "contributors",
  "media",
] as const;

/**
 * Parse and validate an OMF document (already JSON.parse'd).
 * Returns the typed document or throws an Error with a clear reason.
 *
 * Version policy (SPEC.md §6): any `1.x` document is accepted — minor
 * versions are additive by definition, so a 1.0 reader's data is never
 * stranded by a 1.1 writer or vice versa. A different major version (or no
 * version) is rejected loudly, never misread.
 */
export function parseArchiveExport(json: unknown): OmfDocument {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("Export is not a JSON object.");
  }
  const doc = json as Partial<OmfDocument>;
  const version = doc.manifest?.formatVersion;
  const major = typeof version === "string" ? Number.parseInt(version, 10) : Number.NaN;
  if (!/^\d+\.\d+$/.test(String(version)) || major !== OMF_MAJOR) {
    throw new Error(
      `Unsupported export format version: ${String(version)} (this reader understands ${OMF_MAJOR}.x).`,
    );
  }
  if (!doc.archive || typeof doc.archive.id !== "string") {
    throw new Error("Export is missing its archive.");
  }
  for (const key of REQUIRED_SECTIONS) {
    if (!Array.isArray(doc[key])) {
      throw new Error(`Export section "${key}" is missing or not an array.`);
    }
  }
  // `mediaFiles` is newer than the earliest 1.0 documents — tolerate its
  // absence rather than rejecting, since every other section is intact.
  return { ...doc, mediaFiles: Array.isArray(doc.mediaFiles) ? doc.mediaFiles : [] } as OmfDocument;
}

/**
 * Convenience: parse a raw JSON string. Wraps JSON.parse so a syntax error
 * and a structural error both surface as a single thrown Error.
 */
export function parseArchiveExportString(text: string): OmfDocument {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`Export is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  return parseArchiveExport(json);
}
