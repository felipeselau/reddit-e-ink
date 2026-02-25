import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const subreddits = sqliteTable('subreddits', {
  name: text('name').primaryKey(),
  displayName: text('display_name').notNull(),
  isFavorite: integer('is_favorite').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const feedCache = sqliteTable('feed_cache', {
  subreddit: text('subreddit').primaryKey(),
  data: text('data').notNull(),
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subreddit: text('subreddit').notNull().unique(),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
});

export type Subreddit = typeof subreddits.$inferSelect;
export type FeedCache = typeof feedCache.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
