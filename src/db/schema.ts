import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

// Users — admin accounts
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  name: text("name"),
  role: text("role", { enum: ["admin", "family"] })
    .notNull()
    .default("family"),
  isSiteSubject: integer("is_site_subject", { mode: "boolean" })
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Sessions — Auth.js session storage
export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// Categories — name, slug, description
export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  descriptionHeader: text("description_header"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Images — artwork images
export const images = sqliteTable("images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  description: text("description"),
  blobUrl: text("blob_url").notNull(),
  ancestorId: text("ancestor_id"),
  creatorUserId: text("creator_user_id"),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  dateCreated: text("date_created"),
  sortDate: integer("sort_date", { mode: "timestamp" }),
  visibility: text("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("public"),
  featured: integer("featured", { mode: "boolean" }).default(false),
  highlight: integer("highlight", { mode: "boolean" }).default(false),
  thumbnailUrl: text("thumbnail_url"),
  slideshowOverlayText: text("slideshow_overlay_text"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// PasswordResetTokens — hashed tokens for password reset flow
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hashedToken: text("hashed_token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Ancestors — family history records
export const ancestors = sqliteTable("ancestors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  maidenName: text("maiden_name"),
  relationship: text("relationship"),
  birthplace: text("birthplace"),
  born: text("born"),
  deathPlace: text("death_place"),
  died: text("died"),
  spouse: text("spouse"),
  occupation: text("occupation"),
  immigration: text("immigration"),
  bio: text("bio"),
  photoId: text("photo_id").references(() => images.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// AncestorPhotos — junction table for ancestor-image associations
export const ancestorPhotos = sqliteTable("ancestor_photos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ancestorId: text("ancestor_id")
    .notNull()
    .references(() => ancestors.id, { onDelete: "cascade" }),
  imageId: text("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

// AncestorMemories — text memories attached to ancestors
export const ancestorMemories = sqliteTable("ancestor_memories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  ancestorId: text("ancestor_id")
    .notNull()
    .references(() => ancestors.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Plays — acting history
export const plays = sqliteTable("plays", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  play: text("play").notNull(),
  role: text("role"),
  location: text("location"),
  description: text("description"),
  year: integer("year"),
  primaryImageId: text("primary_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  featured: integer("featured", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// PlayImages — junction table for play-image associations
export const playImages = sqliteTable("play_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  playId: text("play_id")
    .notNull()
    .references(() => plays.id, { onDelete: "cascade" }),
  imageId: text("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  caption: text("caption"),
});

// PlayMemories — text memories attached to plays
export const playMemories = sqliteTable("play_memories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  playId: text("play_id")
    .notNull()
    .references(() => plays.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// AuditLogs — tracks logins, mutations, and page views
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id"),
  userEmail: text("user_email").notNull(),
  action: text("action", {
    enum: ["login", "login_failed", "create", "update", "delete", "page_view"],
  }).notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  detail: text("detail"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Comments — threaded comments on images, plays, and ancestors
export const comments = sqliteTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  resourceType: text("resource_type", {
    enum: ["image", "play", "ancestor"],
  }).notNull(),
  resourceId: text("resource_id").notNull(),
  parentId: text("parent_id"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Likes — toggleable likes on images, plays, and ancestors
export const likes = sqliteTable("likes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  resourceType: text("resource_type", {
    enum: ["image", "play", "ancestor"],
  }).notNull(),
  resourceId: text("resource_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// SiteAbout — single-row table for the About page content
export const siteAbout = sqliteTable("site_about", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().default("Mary Elizabeth Atwood"),
  bio: text("bio"),
});

