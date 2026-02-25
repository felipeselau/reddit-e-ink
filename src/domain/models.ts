export interface Comment {
  id: string;
  author: string;
  date: Date;
  content: string;
  depth: number;
}

export interface Post {
  id: string;
  title: string;
  link: string;
  author: string;
  date: Date;
  comments: string;
  content?: string;
  subreddit: string;
  commentsList?: Comment[];
}

export interface Feed {
  subreddit: string;
  posts: Post[];
  fetchedAt: Date;
}

export interface Subreddit {
  name: string;
  displayName: string;
  isFavorite: boolean;
  createdAt: Date;
}
