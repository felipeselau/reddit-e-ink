import type { Feed, Post, Comment } from '../../domain';

interface Settings {
  fontSize: number;
  showAllPosts: boolean;
  toQuery(): string;
}

class SettingsImpl implements Settings {
  constructor(
    public fontSize: number = 18,
    public showAllPosts: boolean = true
  ) {}

  toQuery(): string {
    return `?fontSize=${this.fontSize}&showAllPosts=${this.showAllPosts}`;
  }
}

const DEFAULT_SETTINGS = new SettingsImpl();

const POPULAR_SUBREDDITS = ['programming', 'technology', 'science', 'worldnews', 'linux', 'javascript', 'rust', 'python'];

function getCss(settings: Settings): string {
  return `*{box-sizing:border-box}body{font-family:Georgia,Times,serif;max-width:700px;margin:0 auto;padding:1em;background:#fff;color:#000;line-height:1.6;font-size:${settings.fontSize}px}a{color:#000;text-decoration:underline}a:hover,a:active{text-decoration:none;background:#eee}.header{border-bottom:3px double #000;padding:0.5em 0;margin-bottom:1.5em}.header h1{margin:0;font-size:1.8em}.header .subtitle{font-size:0.8em;color:#444}.nav{margin:0.5em 0;font-size:0.9em}.nav a{margin-right:1em}.subreddits{margin:1em 0;padding:0.5em 0;border-top:1px solid #ccc;border-bottom:1px solid #ccc}.subreddits a{margin-right:1em;text-decoration:none}.post{margin-bottom:2em;padding-bottom:1.5em;border-bottom:1px solid #ccc}.post-sub{font-size:0.8em;color:#666;margin-bottom:0.3em}.post-title{font-size:1.3em;font-weight:bold;margin:0 0 0.5em 0;line-height:1.3}.post-title a{text-decoration:none}.post-title a:hover{text-decoration:underline}.post-meta{font-size:0.85em;color:#333;margin-bottom:0.5em}.post-content{font-size:1em;margin:1em 0;white-space:pre-wrap;word-wrap:break-word}.post-content .link{background:#f5f5f5;padding:0.3em 0.5em;margin:0.5em 0;display:inline-block}.post-links{font-size:0.9em;margin-top:1em}.post-links a{margin-right:0.8em}.pagination{margin:2em 0;font-size:1em}.pagination a{display:inline-block;padding:0.5em 1em;border:1px solid #000;margin-right:1em;text-decoration:none}.pagination a:hover{background:#000;color:#fff}footer{font-size:0.8em;color:#666;margin-top:3em;padding-top:1em;border-top:1px solid #ccc;text-align:center}.error{background:#000;color:#fff;padding:1em;margin:1em 0}.post-detail{font-size:1.1em}.post-detail h2{font-size:1.4em;margin:0 0 0.5em 0;line-height:1.3}.post-detail .meta{font-size:0.9em;color:#444;margin-bottom:1.5em}.post-detail .content{line-height:1.8}.timestamp{font-size:0.8em;color:#888}.settings-form{margin:1em 0}.settings-form label{display:block;margin:0.5em 0}.settings-form select,.settings-form input{padding:0.3em;font-size:1em}.settings-form button{padding:0.5em 1em;font-size:1em;cursor:pointer}.comments-section{margin-top:2em;border-top:2px solid #000;padding-top:1em}.comments-header{font-size:1.2em;font-weight:bold;margin:1em 0}.comment{margin:1em 0;padding:0.5em 0;border-bottom:1px solid #ccc}.comment-depth-0{margin-left:0}.comment-depth-1{margin-left:1em}.comment-depth-2{margin-left:2em}.comment-depth-3{margin-left:3em}.comment-depth-4{margin-left:4em}.comment-author{font-weight:bold;font-size:0.9em}.comment-date{font-size:0.8em;color:#666;margin-left:0.5em}.comment-content{font-size:0.95em;margin:0.5em 0;line-height:1.5}.comment-deleted{color:#888;font-style:italic}.manage-list{margin:1em 0}.manage-item{padding:0.5em;border-bottom:1px solid #ccc;display:flex;justify-content:space-between;align-items:center}.manage-item form{display:inline}.manage-add{margin:1.5em 0;padding:1em;background:#f5f5f5}.sub-input{padding:0.5em;font-size:1em;width:200px}.sub-btn{padding:0.5em 1em;font-size:1em;cursor:pointer}`;
}

function parseSettings(query: Record<string, string | undefined>): Settings {
  const fontSize = parseInt(query.fontSize || '18', 10);
  const showAllPostsRaw = query.showAllPosts;
  const showAllPosts = showAllPostsRaw === undefined ? true : showAllPostsRaw === 'true';
  return new SettingsImpl(
    isNaN(fontSize) ? 18 : fontSize,
    showAllPosts
  );
}

export function renderLayout(content: string, title?: string, settings: Settings = DEFAULT_SETTINGS): string {
  const pageTitle = title ? `${title} | Hipster RSS` : 'Hipster RSS';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>${getCss(settings)}</style>
</head>
<body>
  ${content}
</body>
</html>`;
}

export function renderFeed(feed: Feed, pagination: {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}, currentSubreddit: string = 'programming', settings: Settings = DEFAULT_SETTINGS, subscriptions: string[] = POPULAR_SUBREDDITS): string {
  const postsHtml = feed.posts.map(post => renderPostItem(post, feed.subreddit === 'all' ? post.subreddit : feed.subreddit, settings)).join('\n');
  
  const q = settings.toQuery();
  const feedPath = feed.subreddit === 'all' ? '/home' : `/r/${feed.subreddit}`;
  const prevPage = pagination.page > 1 ? `<a href="${feedPath}?page=${pagination.page - 1}${q.replace('?', '&')}">Previous</a>` : '';
  const nextPage = pagination.hasMore ? `<a href="${feedPath}?page=${pagination.page + 1}${q.replace('?', '&')}">Next</a>` : '';
  
  const subredditsNav = subscriptions
    .map(sub => sub === currentSubreddit 
      ? `<b>${sub}</b>` 
      : `<a href="/r/${sub}${q}">${sub}</a>`)
    .join(' | ');

  const pageTitle = feed.subreddit === 'all' ? 'All Posts' : `/r/${feed.subreddit}`;

  const content = `
<header class="header">
  <h1>${pageTitle}</h1>
  <div class="subtitle">E-Ink Optimized RSS Reader</div>
  <nav class="nav">
    <a href="/home${q}">Home</a> |
    <a href="/manage${q}">Manage</a> |
    <a href="/settings${q}">Settings</a>
  </nav>
</header>

<nav class="subreddits">
  ${subredditsNav}
</nav>

<main>
  ${postsHtml}
</main>

<nav class="pagination">
  ${prevPage}${nextPage}
</nav>

<footer>
  <p>Last updated: ${feed.fetchedAt.toLocaleString()}</p>
</footer>`;

  return renderLayout(content, pageTitle, settings);
}

function renderPostItem(post: Post, subreddit: string, settings: Settings): string {
  const date = post.date.toLocaleDateString();
  const timeAgo = getTimeAgo(post.date);
  const preview = post.content ? truncate(cleanContent(post.content), 200) : '';
  const q = settings.toQuery();
  
  return `
<article class="post">
  <div class="post-sub">/r/${escapeHtml(subreddit)}</div>
  <h2 class="post-title">
    <a href="/r/${subreddit}/post/${post.id}${q}">${escapeHtml(post.title)}</a>
  </h2>
  <div class="post-meta">
    by ${escapeHtml(post.author)} | ${date} (${timeAgo})
  </div>
  ${preview ? `<div class="preview">${escapeHtml(preview)}</div>` : ''}
  <div class="post-links">
    <a href="${escapeHtml(post.comments)}">Comments</a>
    <a href="${escapeHtml(post.link)}">Original</a>
  </div>
</article>`;
}

export function renderPost(post: Post, settings: Settings = DEFAULT_SETTINGS): string {
  const date = post.date.toLocaleString();
  const timeAgo = getTimeAgo(post.date);
  const q = settings.toQuery();
  
  const commentsHtml = post.commentsList && post.commentsList.length > 0 
    ? renderComments(post.commentsList)
    : '';

  const content = `
<header class="header">
  <h1><a href="/r/${post.subreddit}${q}">/r/${post.subreddit}</a></h1>
  <nav class="nav">
    <a href="/">Home</a> |
    <a href="/r/${post.subreddit}${q}">Back to feed</a> |
    <a href="/manage${q}">Manage</a> |
    <a href="/settings${q}">Settings</a>
  </nav>
</header>

<main class="post-detail">
  <article>
    <h2>${escapeHtml(post.title)}</h2>
    <div class="meta">
      by ${escapeHtml(post.author)} | ${date} (${timeAgo})
    </div>
    <div class="content">
      ${post.content ? renderContent(post.content) : '<p><em>No content available</em></p>'}
    </div>
    <div class="post-links">
      <a href="${escapeHtml(post.comments)}">Comments on Reddit</a>
      <a href="${escapeHtml(post.link)}">Original Post</a>
    </div>
  </article>

  ${commentsHtml}
</main>

<footer>
  <p>E-Ink RSS Reader</p>
</footer>`;

  return renderLayout(content, post.title, settings);
}

function renderComments(comments: Comment[]): string {
  const commentsHtml = comments
    .filter(c => !c.content.includes('[deleted]') && !c.content.includes('[removed]'))
    .slice(0, 20)
    .map(comment => {
      const depthClass = `comment-depth-${Math.min(comment.depth, 4)}`;
      const date = comment.date.toLocaleDateString();
      return `
<div class="comment ${depthClass}">
  <div class="comment-author">${escapeHtml(comment.author)} <span class="comment-date">${date}</span></div>
  <div class="comment-content">${escapeHtml(comment.content)}</div>
</div>`;
    }).join('');

  return `
<div class="comments-section">
  <h3 class="comments-header">Comments (${comments.length})</h3>
  ${commentsHtml || '<p>No comments available</p>'}
</div>`;
}

export function renderSettings(settings: Settings = DEFAULT_SETTINGS): string {
  const q = settings.toQuery();
  
  const content = `
<header class="header">
  <h1>Settings</h1>
  <nav class="nav">
    <a href="/">Home</a> |
    <a href="/manage${q}">Manage</a>
  </nav>
</header>

<main>
  <h2>Display Settings</h2>
  <form class="settings-form" action="/settings" method="get">
    <label>
      Font Size: 
      <select name="fontSize">
        <option value="14" ${settings.fontSize === 14 ? 'selected' : ''}>Small (14px)</option>
        <option value="16" ${settings.fontSize === 16 ? 'selected' : ''}>Medium (16px)</option>
        <option value="18" ${settings.fontSize === 18 ? 'selected' : ''}>Large (18px)</option>
        <option value="20" ${settings.fontSize === 20 ? 'selected' : ''}>Extra Large (20px)</option>
        <option value="22" ${settings.fontSize === 22 ? 'selected' : ''}>XXL (22px)</option>
        <option value="24" ${settings.fontSize === 24 ? 'selected' : ''}>XXXL (24px)</option>
      </select>
    </label>
    <label>
      <input type="radio" name="showAllPosts" value="true" ${settings.showAllPosts ? 'checked' : ''}>
      Show reddit home page posts
    </label>
    <label>
      <input type="radio" name="showAllPosts" value="false" ${!settings.showAllPosts ? 'checked' : ''}>
      Show single subreddit
    </label>
    <button type="submit">Apply</button>
  </form>

  <h3>Preview</h3>
  <p>This is sample text to preview your font size selection.</p>
</main>

<footer>
  <p>E-Ink RSS Reader</p>
</footer>`;

  return renderLayout(content, 'Settings', settings);
}

export function renderManage(subscriptions: string[], settings: Settings = DEFAULT_SETTINGS): string {
  const q = settings.toQuery();
  
  const subsHtml = subscriptions
    .map(sub => `
<div class="manage-item">
  <span><a href="/r/${sub}${q}">/r/${sub}</a></span>
  <form method="POST" action="/manage${q}">
    <input type="hidden" name="action" value="remove">
    <input type="hidden" name="subreddit" value="${sub}">
    <button type="submit" class="sub-btn">Remove</button>
  </form>
</div>`)
    .join('');

  const content = `
<header class="header">
  <h1>Manage Subscriptions</h1>
  <nav class="nav">
    <a href="/">Home</a> |
    <a href="/settings${q}">Settings</a>
  </nav>
</header>

<main>
  <h2>Your Subreddits</h2>
  <div class="manage-list">
    ${subsHtml || '<p>No subscriptions yet.</p>'}
  </div>

  <div class="manage-add">
    <h3>Add Subreddit</h3>
    <form method="POST" action="/manage${q}">
      <input type="hidden" name="action" value="add">
      <input type="text" name="subreddit" class="sub-input" placeholder="subreddit name" required>
      <button type="submit" class="sub-btn">Add</button>
    </form>
  </div>
</main>

<footer>
  <p>E-Ink RSS Reader</p>
</footer>`;

  return renderLayout(content, 'Manage', settings);
}

export function render404(message: string, settings: Settings = DEFAULT_SETTINGS): string {
  const q = settings.toQuery();
  
  const content = `
<header class="header">
  <h1>Error</h1>
  <nav class="nav">
    <a href="/">Home</a>
  </nav>
</header>

<main>
  <div class="error">${escapeHtml(message)}</div>
  <p><a href="/r/programming${q}">Go to /r/programming</a></p>
</main>`;

  return renderLayout(content, 'Error', settings);
}

function renderContent(content: string): string {
  let html = escapeHtml(content);
  html = html.replace(/\[link\]\s*\[comments\]/gi, '');
  html = html.replace(/submitted by\s*\/u\/(\w+)/gi, '— /u/$1');
  return html;
}

function cleanContent(content: string): string {
  let text = content.replace(/\[link\]\s*\[comments\]/gi, '');
  text = text.replace(/submitted by\s*\/u\/(\w+)/gi, '');
  text = text.replace(/\n+/g, ' ');
  text = text.replace(/\s+/g, ' ');
  return text.trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export { parseSettings };
