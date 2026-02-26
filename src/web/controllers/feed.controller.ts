import type { Context } from 'hono';
import { getFeed, getPost, getHomeFeed } from '../../application/getFeed.usecase';
import { getSubscriptions, addSubscription, removeSubscription, setHomepageSubreddit, getHomepageSubreddit } from '../../infra/db/subscriptions';
import { renderFeed, renderPost, render404, renderSettings, renderManage, parseSettings } from './templates';

export async function feedController(c: Context) {
  const subreddit = c.req.param('subreddit');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '25', 10);
  const settings = parseSettings(c.req.query());

  try {
    const subs = await getSubscriptions();
    const result = await getFeed({ subreddit, page, limit });
    return c.html(renderFeed(result.feed, result.pagination, subreddit, settings, subs.map(s => s.subreddit)));
  } catch (error) {
    console.error('Error fetching feed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.html(render404(`Failed to fetch feed: ${message}`, settings), 500);
  }
}

export async function homeController(c: Context) {
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '25', 10);
  const settings = parseSettings(c.req.query());

  try {
    const subs = await getSubscriptions();
    const result = await getHomeFeed(page, limit);
    return c.html(renderFeed(result.feed, result.pagination, 'all', settings, subs.map(s => s.subreddit)));
  } catch (error) {
    console.error('Error fetching home feed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.html(render404(`Failed to fetch home feed: ${message}`, settings), 500);
  }
}

export async function postController(c: Context) {
  const subreddit = c.req.param('subreddit');
  const postId = c.req.param('postId');
  const settings = parseSettings(c.req.query());

  try {
    const result = await getPost({ subreddit, postId });
    
    if (!result.post) {
      return c.html(render404('Post not found', settings), 404);
    }
    
    return c.html(renderPost(result.post, settings));
  } catch (error) {
    console.error('Error fetching post:', error);
    return c.html(render404('Failed to fetch post', settings), 500);
  }
}

export async function indexController(c: Context) {
  const settings = parseSettings(c.req.query());
  
  let targetSubreddit: string;
  
  if (settings.showAllPosts) {
    return c.redirect(`/home${settings.toQuery()}`);
  }
  
  if (settings.homeSubreddit) {
    targetSubreddit = settings.homeSubreddit;
  } else {
    const dbHomepage = await getHomepageSubreddit();
    targetSubreddit = dbHomepage || 'programming';
  }
  
  return c.redirect(`/r/${targetSubreddit}${settings.toQuery()}`);
}

export async function settingsController(c: Context) {
  const settings = parseSettings(c.req.query());
  return c.html(renderSettings(settings));
}

export async function subredditSearchController(c: Context) {
  const query = c.req.query('q');
  if (!query) {
    return c.redirect('/');
  }
  const settings = parseSettings(c.req.query());
  return c.redirect(`/r/${query}${settings.toQuery()}`);
}

export async function manageController(c: Context) {
  const settings = parseSettings(c.req.query());
  
  if (c.req.method === 'POST') {
    const formData = await c.req.parseBody();
    const action = formData.action as string;
    const subreddit = formData.subreddit as string;
    
    if (action === 'add' && subreddit) {
      await addSubscription(subreddit);
    } else if (action === 'remove' && subreddit) {
      await removeSubscription(subreddit);
    } else if (action === 'setHomepage' && subreddit) {
      await setHomepageSubreddit(subreddit);
    }
    
    return c.redirect(`/manage${settings.toQuery()}`);
  }
  
  const subscriptions = await getSubscriptions();
  return c.html(renderManage(subscriptions, settings));
}

export async function healthController(c: Context) {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
}
