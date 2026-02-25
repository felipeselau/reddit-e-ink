import Parser from 'rss-parser';
import { decode } from 'html-entities';
import type { Feed, Post, Comment } from '../../domain';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'rss-e-reddit/1.0 (e-ink reader)',
  },
});

export async function fetchRedditFeed(subreddit: string): Promise<Feed> {
  const url = `https://www.reddit.com/r/${subreddit}/.rss`;
  
  const feed = await parser.parseURL(url);
  
  const posts: Post[] = feed.items.map((item) => {
    const redditPost = item;
    const link = item.link || '';
    const comments = item.comments || link;
    
    return {
      id: extractPostId(link),
      title: decode(item.title || ''),
      link,
      author: item.creator || 'anonymous',
      date: item.pubDate ? new Date(item.pubDate) : new Date(),
      comments: comments.replace('/comments/', '/r/').replace('?ref=search', ''),
      content: item.contentSnippet || item.content || undefined,
      subreddit,
    };
  });

  return {
    subreddit,
    posts,
    fetchedAt: new Date(),
  };
}

export async function fetchMultiFeed(subreddits: string[]): Promise<Feed> {
  return fetchRedditHomeFeed();
}

export async function fetchRedditHomeFeed(): Promise<Feed> {
  const url = `https://www.reddit.com/.rss`;
  
  const feed = await parser.parseURL(url);
  
  const posts: Post[] = feed.items.map((item) => {
    const link = item.link || '';
    const comments = item.comments || link;
    const subreddit = extractSubreddit(link);
    
    return {
      id: extractPostId(link),
      title: decode(item.title || ''),
      link,
      author: item.creator || 'anonymous',
      date: item.pubDate ? new Date(item.pubDate) : new Date(),
      comments: comments.replace('/comments/', '/r/').replace('?ref=search', ''),
      content: item.contentSnippet || item.content || undefined,
      subreddit,
    };
  });

  return {
    subreddit: 'all',
    posts,
    fetchedAt: new Date(),
  };
}

export async function fetchPostComments(subreddit: string, postId: string): Promise<Comment[]> {
  const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}/.rss`;
  
  try {
    const feed = await parser.parseURL(url);
    
    const comments: Comment[] = feed.items.map((item) => {
      const content = item.contentSnippet || item.content || '';
      const author = item.creator || 'anonymous';
      const date = item.pubDate ? new Date(item.pubDate) : new Date();
      
      return {
        id: item.guid || Math.random().toString(36),
        author,
        date,
        content: decode(cleanCommentContent(content)),
        depth: extractDepth(item.title || ''),
      };
    });
    
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

function cleanCommentContent(content: string): string {
  let text = content.replace(/<[^>]+>/g, '');
  text = text.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
  text = text.replace(/\[deleted\]/gi, '[deleted]');
  text = text.replace(/\[removed\]/gi, '[removed]');
  return text.trim();
}

function extractDepth(title: string): number {
  const match = title.match(/^(\s*)/);
  if (!match) return 0;
  return Math.floor(match[1].length / 4);
}

function extractPostId(link: string): string {
  const match = link.match(/\/comments\/([a-zA-Z0-9]+)/);
  return match ? match[1] : '';
}

function extractSubreddit(link: string): string {
  const match = link.match(/reddit\.com\/r\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : 'reddit';
}
