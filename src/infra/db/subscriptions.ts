import { db } from '../db';
import { subscriptions } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export interface Subscription {
  id: number;
  subreddit: string;
  addedAt: Date;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const result = await db.select().from(subscriptions).all();
  return result.map(row => ({
    id: row.id,
    subreddit: row.subreddit,
    addedAt: new Date(row.addedAt),
  }));
}

export async function addSubscription(subreddit: string): Promise<boolean> {
  const normalized = subreddit.toLowerCase().trim().replace(/^\/?r\//, '');
  
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subreddit, normalized))
    .get();
  
  if (existing) {
    return false;
  }
  
  await db.insert(subscriptions).values({
    subreddit: normalized,
    addedAt: new Date(),
  }).run();
  
  return true;
}

export async function removeSubscription(subreddit: string): Promise<boolean> {
  const normalized = subreddit.toLowerCase().trim().replace(/^\/?r\//, '');
  
  const result = await db
    .delete(subscriptions)
    .where(eq(subscriptions.subreddit, normalized))
    .run();
  
  return result.rowsAffected > 0;
}

export async function isSubscribed(subreddit: string): Promise<boolean> {
  const normalized = subreddit.toLowerCase().trim().replace(/^\/?r\//, '');
  
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subreddit, normalized))
    .get();
  
  return !!existing;
}
