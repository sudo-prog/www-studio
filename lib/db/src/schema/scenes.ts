import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const scenesTable = pgTable("scenes", {
  id:              text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:          text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name:            text("name").notNull(),
  slug:            text("slug").notNull(),
  description:     text("description"),
  tags:            text("tags"),            // JSON: string[]
  status:          text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  thumbnailUrl:    text("thumbnail_url"),
  canvasWidth:     integer("canvas_width").notNull().default(1440),
  canvasHeight:    integer("canvas_height").notNull().default(900),
  elements:        text("elements"),        // JSON: SceneElement[]
  animations:      text("animations"),      // JSON: AnimationConfig[]
  themeTokens:     text("theme_tokens"),    // JSON: wellness color tokens
  linkedProjectId: text("linked_project_id"),
  likes:           integer("likes").notNull().default(0),
  viewCount:       integer("view_count").notNull().default(0),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

export type Scene    = typeof scenesTable.$inferSelect;
export type InsertScene = typeof scenesTable.$inferInsert;
