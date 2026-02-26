import type { Feed, Post } from '../domain/index.ts';
import { fetchRedditFeed, fetchPostComments, fetchMultiFeed } from '../infra/rss/reddit.client.ts';
import { getCachedFeed, setCachedFeed } from '../infra/cache/cache.service.ts';
import { getSubscriptions } from '../infra/db/subscriptions.ts';

export interface GetFeedInput {
  subreddit: string;
  page?: number;
  limit?: number;
}

export interface GetFeedOutput {
  feed: Feed;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export async function getFeed(input: GetFeedInput): Promise<GetFeedOutput> {
  const { subreddit, page = 1, limit = 25 } = input;
  
  if (subreddit === 'all') {
    return getHomeFeed(page, limit);
  }
  
  let feed = await getCachedFeed(subreddit);
  
  if (!feed) {
    feed = await fetchRedditFeed(subreddit);
    await setCachedFeed(subreddit, feed);
  }
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedPosts = feed.posts.slice(start, end);
  
  const paginatedFeed: Feed = {
    ...feed,
    posts: paginatedPosts,
  };
  
  return {
    feed: paginatedFeed,
    pagination: {
      page,
      limit,
      total: feed.posts.length,
      hasMore: end < feed.posts.length,
    },
  };
}

export async function getHomeFeed(page: number = 1, limit: number = 25): Promise<GetFeedOutput> {
  const subs = await getSubscriptions();
  const subredditNames = subs.map(s => s.subreddit);
  
  const cacheKey = 'all:' + subredditNames.sort().join(',');
  let feed = await getCachedFeed(cacheKey);
  
  if (!feed) {
    feed = await fetchMultiFeed(subredditNames);
    await setCachedFeed(cacheKey, feed);
  }
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedPosts = feed.posts.slice(start, end);
  
  const paginatedFeed: Feed = {
    ...feed,
    posts: paginatedPosts,
  };
  
  return {
    feed: paginatedFeed,
    pagination: {
      page,
      limit,
      total: feed.posts.length,
      hasMore: end < feed.posts.length,
    },
  };
}

export interface GetPostInput {
  subreddit: string;
  postId: string;
}

export interface GetPostOutput {
  post: Post | null;
}

export async function getPost(input: GetPostInput): Promise<GetPostOutput> {
  const { subreddit, postId } = input;
  
  let feed = await getCachedFeed(subreddit);
  
  if (!feed) {
    feed = await fetchRedditFeed(subreddit);
    await setCachedFeed(subreddit, feed);
  }
  
  const post = feed.posts.find(p => p.id === postId);
  
  if (post) {
    const comments = await fetchPostComments(subreddit, postId);
    post.commentsList = comments;
  }
  
  return { post: post || null };
}
