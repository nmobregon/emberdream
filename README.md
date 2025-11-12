# Candelei

A web application where users can create virtual candles to express their wishes and intentions. Each candle burns for 12 hours, carrying intentions and dreams from around the world. Users can support candles created by others and share them with friends.

## Purpose

Candelei provides a digital space for people to express their wishes, hopes, and intentions through virtual candles. Each candle represents a personal intention that burns for a limited time, creating a sense of community and shared purpose. The platform supports multiple languages and allows users to interact with candles through support actions and sharing.

## Technologies

- **Framework**: Next.js 15.1.2 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Redis (via Upstash)
- **Rate Limiting**: Upstash Rate Limit
- **Validation**: Validator.js
- **Tour/Onboarding**: Driver.js
- **Package Manager**: pnpm

## High-Level Implementation

### Architecture
- **Frontend**: React components with client-side state management, infinite scroll pagination, and responsive design
- **Backend**: Next.js API routes handling candle creation, retrieval, and support actions
- **Data Storage**: Redis hash structure storing candles with automatic expiration (12 hours by default)
- **State Management**: React Context API for language preferences and client-side state

### Key Features
- **Candle Management**: Create candles with custom colors, wishes, names, and country selection
- **Pagination**: Infinite scroll with intersection observer for efficient loading
- **Rate Limiting**: IP-based rate limiting for API endpoints to prevent abuse
- **Input Validation**: Server-side validation and sanitization of user inputs
- **Multi-language Support**: English and Spanish with browser language detection
- **Social Features**: Support candles (with 12-hour cooldown per user), share functionality
- **Security**: Security headers, input sanitization, and rate limiting

### Data Flow
1. Users create candles via API POST endpoint with validation and rate limiting
2. Candles are stored in Redis with expiration timestamps
3. Frontend fetches candles via paginated GET endpoint
4. Candle height dynamically decreases based on remaining time
5. Support actions update candle support count (tracked via localStorage to prevent duplicate support)

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

The application requires the following environment variables:
- `REDIS_URL`: Redis connection URL (Upstash or standard Redis)
- `CANDLE_DURATION_MINUTES`: Duration candles should burn (default: 720 minutes / 12 hours)

### Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm clear-redis` - Clear expired candles from Redis
- `pnpm clear-redis:all` - Flush all Redis data

## Credits

Special thanks to [Maria](https://codepen.io/shorinamaria) for sharing her CSS candle script.
