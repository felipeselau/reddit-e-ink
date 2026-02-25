# RSS to E-Reader

A lightweight RSS reader optimized for e-ink devices (Kindle, Kobo) and low-capability browsers. Consumes Reddit RSS feeds and renders ultra-light HTML pages with a focus on readability and minimal network usage.

## Features

- **Reddit RSS Integration** - Fetch and parse feeds from any subreddit (e.g., `/r/programming`, `/r/technology`)
- **E-Ink Optimized** - High contrast, monochrome UI with no animations or heavy elements
- **Feed Caching** - SQLite-backed cache to reduce network requests and improve performance
- **Favorites** - Save and manage favorite subreddits
- **Server-Side Rendering** - Pure HTML/CSS output, works on basic browsers

## Tech Stack

- **Runtime**: Bun
- **Web Framework**: Hono
- **Database**: SQLite with Drizzle ORM
- **RSS Parsing**: rss-parser
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build and run
bun run start
```

The server starts on `http://localhost:3000`.

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── web/                    # HTTP layer
│   ├── routes/             # Route definitions
│   └── controllers/        # Request handlers
├── application/            # Use cases / business logic
├── domain/                 # Domain models
└── infra/                  # External services
    ├── rss/                # RSS client
    ├── db/                 # Database & ORM
    └── cache/              # Caching service
```

## Architecture

Clean Architecture with hexagonal separation:

1. **Web Layer** - Hono routes and controllers
2. **Application Layer** - Use cases orchestrating business logic
3. **Domain Layer** - Pure domain models
4. **Infrastructure Layer** - RSS client, database, cache

## Routes

- `GET /` - Home / feed list
- `GET /r/:subreddit` - Posts from a subreddit
- `GET /favorites` - Saved subreddits

## License

MIT
