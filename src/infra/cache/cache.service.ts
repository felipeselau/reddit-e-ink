import { db } from '../db';
import { feedCache } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { Feed } from '../../domain';

const DEFAULT_TTL_MINUTES = 15;

export interface CacheOptions {
  ttlMinutes?: number;
}

export async function getCachedFeed(subreddit: string): Promise<Feed | null> {
  const cached = await db
    .select()
    .from(feedCache)
    .where(eq(feedCache.subreddit, subreddit))
    .get();

  if (!cached) return null;

  if (new Date() > cached.expiresAt) {
    await db.delete(feedCache).where(eq(feedCache.subreddit, subreddit)).run();
    return null;
  }

  const feed = JSON.parse(cached.data) as Feed;
  feed.fetchedAt = new Date(feed.fetchedAt);
  for (const post of feed.posts) {
    post.date = new Date(post.date);
  }
  return feed;
}

export async function setCachedFeed(
  subreddit: string,
  feed: Feed,
  options: CacheOptions = {}
): Promise<void> {
  const ttlMinutes = options.ttlMinutes ?? DEFAULT_TTL_MINUTES;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  const data = JSON.stringify(feed);

  await db
    .insert(feedCache)
    .values({
      subreddit,
      data,
      fetchedAt: now,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: feedCache.subreddit,
      set: {
        data,
        fetchedAt: now,
        expiresAt,
      },
    })
    .run();
}

export async function invalidateCache(subreddit: string): Promise<void> {
  await db.delete(feedCache).where(eq(feedCache.subreddit, subreddit)).run();
}
