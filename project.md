# 🧃 Hipster RSS Reader for E-Ink Devices  
**Stack: Bun + Hono + HTMX + SQLite (Drizzle ORM)**

This document defines the **features, modules, architecture, and best practices** for building a lightweight RSS Reader optimized for e-ink devices (Kindle, Kobo) and low-capability browsers.

The main target source is Reddit RSS feeds, but the architecture is extensible to any RSS/Atom feed.

---

## 🎯 Product Goals

- Consume Reddit RSS feeds
- Render ultra-light HTML pages (server-side rendering)
- Optimized for e-ink screens (high contrast, low refresh, no animations)
- Works on basic browsers (Kindle Experimental Browser)
- Minimal JavaScript (HTMX only if needed)
- Cache feeds to reduce network usage
- Modular and extensible architecture

---

## 🧱 Technology Stack

### Backend
- Bun (runtime)
- Hono (web framework)
- TypeScript
- SQLite
- Drizzle ORM
- RSS parsing library (rss-parser or equivalent)

### Frontend
- HTML (SSR)
- CSS (minimal, monochrome)
- Optional: HTMX for partial navigation

---

## ✅ Functional Requirements

### Core (MVP)

#### Feed Management
- Fetch subreddit feeds (`/r/programming`)
- Support multiple subreddits
- Parse RSS
- Normalize data (title, link, author, date, comments)
- Cache feeds (TTL configurable)

#### Reading Experience
- Post list view
- Post detail view (reader mode)
- Strip:
  - images
  - scripts
  - embeds
  - heavy HTML
- Pure text rendering

#### Navigation
- Pagination
- Previous / next links
- Server-side navigation
- Optional HTMX partial updates

---

### Intermediate Features

#### Cache & Performance
- SQLite cache
- Background refresh
- Rate limiting
- Timeout on RSS fetch

#### Favorites
- Save favorite subreddits
- List favorites
- Persist in DB

#### Filters
- Filter by keyword
- Hide NSFW
- Sort by date or comments

---

### Advanced Features (Optional)

- Offline mode
- OPML import/export
- Reading history
- Dark / light e-ink themes
- Custom fonts
- JSON API endpoints
- Multi-feed support (HN, Lobsters, generic RSS)

---

## 🧩 System Modules

### 1. Web Layer (Hono)

Responsible for:
- HTTP routes
- Controllers
- HTML rendering

/web
/routes
feed.routes.ts
post.routes.ts
favorites.routes.ts
/controllers
feed.controller.ts

Endpoints:
- `GET /r/:subreddit`
- `GET /post/:id`
- `GET /favorites`
- `GET /settings`

---

### 2. Application Layer (Use Cases)

Business logic orchestration:

/application
getFeed.usecase.ts
getPost.usecase.ts
toggleFavorite.usecase.ts

Responsibilities:
- Validate cache
- Apply filters
- Coordinate repositories and services

---

### 3. Domain Layer

Pure domain models:

/domain
Feed.ts
Post.ts
Subreddit.ts

Rules:
- No framework dependencies
- No DB or HTTP logic

---

### 4. Infrastructure Layer

#### RSS Client

/infra/rss
reddit.client.ts

Responsibilities:
- Fetch RSS
- Parse XML
- Map to domain models

#### Database

/infra/db
schema.ts
feed.repository.ts
favorite.repository.ts

#### Cache

/infra/cache
cache.service.ts

---

### 5. View Layer (Templates)

/views
layout.html
feed.html
post.html
favorites.html

Principles:
- Semantic HTML
- Minimal CSS
- No heavy JS
- Compatible with old browsers

---

### 6. Static Assets

/public
style.css

---

## 🏗️ Architecture

Hexagonal / Clean Architecture with SSR:

Browser (Kindle)
↓
Hono Router
↓
Controller
↓
Use Case
↓
RSS Client / Cache / DB
↓
HTML Template
↓
Response

Separation of concerns:
- Web ≠ Domain ≠ Infrastructure

---

## 📁 Project Structure

src/
web/
routes/
controllers/
application/
domain/
infra/
rss/
db/
cache/
views/
public/
main.ts

---

## 🧠 Best Practices

### Performance
- Aggressive caching (RSS does not need real-time updates)
- HTML < 50KB
- CSS < 10KB
- Enable gzip
- No client-side frameworks

---

### UX for E-Ink
- Large font sizes
- High contrast
- No animations
- No infinite scroll
- Link-based navigation
- Monochrome layout
- Spacing for touch navigation

---

### Code Quality
- TypeScript strict mode
- DTOs between layers
- Interfaces for repositories
- No DB access inside controllers
- Error handling per layer
- Logging with lightweight logger (pino or console)

---

### Security
- Rate limiting
- Fetch timeouts
- Sanitize HTML
- Escape XSS
- Content Security Policy headers
- No user-generated HTML rendering

---

### Observability
- `/health` endpoint
- Basic metrics
- Debug mode
- Structured logs

---

## 🧪 Testing Strategy

- Unit tests for use cases
- Mock RSS client
- HTML snapshot tests
- Cache logic tests

---

## 🚀 Deployment

Compatible with:
- Fly.io
- Railway
- Render
- VPS

Build example:

bun build src/main.ts –compile

---

## 🛣️ Roadmap

### Phase 1 (MVP)
- Reddit RSS
- HTML rendering
- Cache
- E-ink layout
- Navigation

### Phase 2
- Favorites
- Filters
- Themes
- HTMX navigation

### Phase 3
- Offline mode
- OPML import/export
- Multi-feed support
- JSON API

---

## 📌 Design Principles

- Server-side rendering first
- Minimal dependencies
- Progressive enhancement
- Accessibility over aesthetics
- Text-first interface
- Long battery life friendly
- Extensible architecture

---

## 📎 License / Usage

This architecture is intended as a reference blueprint for:
- Indie projects
- Academic work
- Experimental browsers
- Accessibility-first applications

---

**End of document**
