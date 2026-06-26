import { pgTable, uuid, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const designExtractions = pgTable('design_extractions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().default('guest'),
  projectId: uuid('project_id'),  // no FK for now
  primaryUrl: text('primary_url').notNull(),
  references: jsonb('references').notNull().default([]),
  status: text('status').notNull().default('pending'),
  error: text('error'),
  processingTimeMs: integer('processing_time_ms'),
  outputDesignMd: text('output_design_md'),
  outputTailwindConfig: text('output_tailwind_config'),
  outputTokensCss: text('output_tokens_css'),
  outputDesignTokensJson: text('output_design_tokens_json'),
  extractedTokens: jsonb('extracted_tokens').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  savedToKb: boolean('saved_to_kb').default(false),
  tokenHistory: jsonb('token_history').default([]),
  // Array of { tokens: ExtractedTokens, timestamp: string, label?: string }
});
