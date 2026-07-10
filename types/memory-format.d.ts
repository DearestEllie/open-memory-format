/**
 * The open memory format — TypeScript definitions, version 1.1.
 *
 * Self-contained copy of the format types from the DearestEllie codebase
 * (`lib/export-format.ts` + `lib/types.ts`), published so any implementation
 * can read or write the format without the app. See SPEC.md for the
 * normative field semantics.
 *
 * Dedicated to the public domain under CC0 1.0.
 */

/**
 * The version this repository documents. `major.minor`: a minor bump is
 * additive only (readers accept any `1.x` and ignore unknown fields); a major
 * bump is breaking and must be rejected loudly. See SPEC.md §6.
 */
export declare const EXPORT_FORMAT_VERSION: "1.1";

/** The major version a conforming 1.x reader understands. */
export declare const EXPORT_FORMAT_MAJOR: 1;

/**
 * The canonical identifier of the format, embedded in every 1.1+ document as
 * `manifest.$format`. Also the URL of the public specification.
 */
export declare const EXPORT_FORMAT_URL: "https://github.com/DearestEllie/open-memory-format";

/** Stable record identifier (an opaque string). */
export type PlatformId = string;

export type ArchiveStatus =
  | "living"
  | "deceased"
  | "memory_loss"
  | "illness"
  | "unknown";

/** Who an archive is for — a separate axis from {@link ArchiveStatus}. */
export type ArchiveSubjectType =
  | "self"
  | "loved_one"
  | "couple"
  | "family"
  | "community_elder";

/** Item-level visibility, preserved so a restore can re-apply it. */
export type Visibility = "private" | "family" | "contributor" | "public" | "hidden";

export type ApprovalStatus =
  | "draft"
  | "pending"
  | "approved"
  | "private"
  | "aside"
  | "rejected"
  | "needs_clarification";

export type MemberPermission = "submit_only" | "viewer" | "editor";

export interface ArchiveProgress {
  stories: number;
  photos: number;
  timeline: number;
  letters: number;
  contributors: number;
  recordings: number;
  pending: number;
}

export interface Archive {
  id: PlatformId;
  slug: string;
  name: string;
  nickname: string;
  relationship: string;
  status: ArchiveStatus;
  subjectType: ArchiveSubjectType;
  /** Kept as the family wrote it — an approximate year stays approximate. */
  birth: string;
  /** Kept as the family wrote it; "" when not applicable. */
  death: string;
  audience: string;
  privacy: "private" | "family" | "public";
  /** How contributions enter: all | trusted | none. */
  approvalMode: "all" | "trusted" | "none";
  cover: { hue: number };
  intro: string;
  why: string;
  progress: ArchiveProgress;
  accent: number;
  /** Opt-in "leave a memory" for visitors on a public Life Page. */
  allowVisitorMemories: boolean;
  /** Opt-in: list the public Life Page in sitemaps / search indexes. */
  allowSearchIndexing: boolean;
  /** Optional "give in their memory" outbound link (label + https URL). */
  memorialGivingLabel: string;
  memorialGivingUrl: string;
}

export type MemoryType =
  | "story"
  | "ordinary_day"
  | "funny_story"
  | "lesson"
  | "quote"
  | "thing_loved"
  | "recipe"
  | "place"
  | "photo_story"
  | "voice"
  | "video"
  | "legacy_note";

export interface Memory {
  id: PlatformId;
  archiveId: PlatformId;
  type: MemoryType;
  title: string;
  contributor: string;
  relationship: string;
  /** As written — "the 60s" stays "the 60s". */
  era: string;
  place: string;
  people: string[];
  section: string;
  chapterId: string;
  visibility: Visibility;
  status: ApprovalStatus;
  tags: string[];
  body: string;
  /** The memory this is another telling of ("" when it stands alone). */
  alternateOf: string;
}

/** A small personal fact about the subject. Carries its own privacy. */
export interface DetailCard {
  id: PlatformId;
  archiveId: PlatformId;
  kind: string;
  label: string;
  value: string;
  position: number;
  visibility: Visibility;
}

/** A family-authored section of a life. Carries its own privacy. */
export interface Chapter {
  id: PlatformId;
  archiveId: PlatformId;
  title: string;
  description: string;
  position: number;
  visibility: Visibility;
}

export interface TimelineEvent {
  id: PlatformId;
  archiveId: PlatformId;
  title: string;
  /** As written. */
  date: string;
  precision: "year" | "decade" | "month" | "day" | "approx";
  category: string;
  visibility: Visibility;
  desc: string;
}

export interface ThingLoved {
  id: PlatformId;
  archiveId: PlatformId;
  title: string;
  category: string;
  why: string;
  emoji: string;
}

export interface Letter {
  id: PlatformId;
  archiveId: PlatformId;
  author: string;
  recipient: string;
  title: string;
  /** As written. */
  date: string;
  visibility: Visibility;
  status: ApprovalStatus;
  body: string;
}

export interface Photo {
  id: PlatformId;
  archiveId: PlatformId;
  caption: string;
  album: string;
  /** As written. */
  era: string;
  hue: number;
  visibility: Visibility;
  featured?: boolean;
  needsCaption?: boolean;
}

export interface MediaItem {
  id: PlatformId;
  archiveId: PlatformId;
  mediaType: "audio" | "video";
  title: string;
  duration: string;
  contributor: string;
  visibility: Visibility;
  transcript: boolean;
  /** As written. */
  date: string;
  needsInfo?: boolean;
}

export interface Contributor {
  id: PlatformId;
  archiveId: PlatformId;
  name: string;
  relationship: string;
  permission: MemberPermission;
  status: "active" | "invited";
  contributions: number;
  /** Child-contributor controls. */
  isMinor: boolean;
  guardianName: string | null;
  /** ISO timestamp when a guardian approved this minor's contributions. */
  guardianApprovedAt: string | null;
  /** The steward trusts this contributor for auto-approval. */
  autoApprove: boolean;
}

/** Steward-only. Present only in a steward's own export; keep it private. */
export interface PrivateNote {
  id: PlatformId;
  archiveId: PlatformId;
  title: string;
  body: string;
  visibility: Visibility;
}

export interface ExportManifest {
  /** Self-identification: the format's canonical URL ({@link EXPORT_FORMAT_URL}). Absent on 1.0 documents. */
  $format?: string;
  /** `major.minor`. Readers accept any document with major {@link EXPORT_FORMAT_MAJOR}. */
  formatVersion: string;
  /** ISO 8601 timestamp. */
  generatedAt: string;
  archiveId: string;
  archiveName: string;
  /** Per-section record counts at generation time. */
  counts: Record<string, number>;
}

/**
 * One original file's storage identity — enough to locate and verify it
 * independently of the hosted app. `checksumSha256`/`byteSize` are null only
 * for a legacy row recorded before checksumming existed.
 */
export interface MediaFileManifestEntry {
  mediaId: string;
  mediaType: "audio" | "video" | "photo";
  /** In the zip variant, the original's bytes live at `media/<storageKey>`. */
  storageKey: string;
  /** Lowercase hex SHA-256 of the original bytes. */
  checksumSha256: string | null;
  byteSize: number | null;
  originalFilename: string | null;
  contentType: string | null;
}

/** The complete export document. See SPEC.md §2. */
export interface ArchiveExportDocument {
  manifest: ExportManifest;
  archive: Archive;
  chapters: Chapter[];
  detailCards: DetailCard[];
  /** Memories that are not recipes. */
  stories: Memory[];
  /** Memories with type "recipe". */
  recipes: Memory[];
  timeline: TimelineEvent[];
  letters: Letter[];
  photos: Photo[];
  /** Audio + video recordings (voice notes and video). */
  voices: MediaItem[];
  thingsLoved: ThingLoved[];
  privateNotes: PrivateNote[];
  contributors: Contributor[];
  /** Display metadata for every photo, audio, and video item. */
  media: MediaItem[];
  /**
   * Every original's storage key + SHA-256 checksum + size — the verification
   * manifest. Absent on early 1.0 documents; readers treat absence as `[]`.
   */
  mediaFiles: MediaFileManifestEntry[];
  /** Human-readable README explaining how to read the export without the producing host. */
  readme: string;
}
