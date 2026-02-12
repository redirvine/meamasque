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
  role: text("role", { enum: ["admin", "editor"] })
    .notNull()
    .default("admin"),
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

// Artists — name, slug, bio, relationship
export const artists = sqliteTable("artists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bio: text("bio"),
  relationship: text("relationship"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Categories — name, slug, description
export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
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
  artistId: text("artist_id").references(() => artists.id, {
    onDelete: "set null",
  }),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  dateCreated: text("date_created"),
  sortDate: integer("sort_date", { mode: "timestamp" }),
  visibility: text("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("public"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Stories — rich text content
export const stories = sqliteTable("stories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  coverImageId: text("cover_image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  authorId: text("author_id").references(() => artists.id, {
    onDelete: "set null",
  }),
  visibility: text("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("public"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// StoryImages — junction table for story-image associations
export const storyImages = sqliteTable("story_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  storyId: text("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  imageId: text("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  caption: text("caption"),
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
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// FamilyAccess — hashed access code for family-only viewing
export const familyAccess = sqliteTable("family_access", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  hashedCode: text("hashed_code").notNull(),
  label: text("label"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
