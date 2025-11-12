# Redis Clearing Script

This directory contains a TypeScript script to safely erase Redis data with triple confirmation.

## Prerequisites

- Node.js installed
- `tsx` package for running TypeScript (added to devDependencies)
- Redis client package (already in package.json)
- `REDIS_URL` environment variable set

## Usage

### Option 1: Using npm/pnpm scripts (Recommended)

Clear only the "candles" hash:
```bash
pnpm clear-redis
# or
npm run clear-redis
```

Flush the entire Redis database (⚠️ DANGEROUS):
```bash
pnpm clear-redis:all
# or
npm run clear-redis:all
```

### Option 2: Direct execution

```bash
# Clear only the "candles" hash
./scripts/clear-redis.ts

# Flush entire Redis database
./scripts/clear-redis.ts --flush-all

# Or using tsx directly
npx tsx scripts/clear-redis.ts
npx tsx scripts/clear-redis.ts --flush-all
```

## Safety Features

The script includes **triple confirmation** to prevent accidental data deletion:

1. **First Confirmation**: Type `YES` to confirm you want to proceed
2. **Second Confirmation**: Type `DELETE` to confirm again
3. **Third Confirmation**: 
   - Type `CLEAR-CANDLES` for clearing candles hash
   - Type `FLUSH-ALL-DATA` for flushing entire database

If you type anything else or press Ctrl+C at any point, the operation will be cancelled with no data deleted.

## Modes

### Default Mode: Clear Candles Hash
- Deletes all items in the "candles" hash
- Safer option for regular cleanup
- Other Redis data remains intact

### Flush All Mode (--flush-all)
- ⚠️ **EXTREMELY DANGEROUS**
- Deletes ALL data in the Redis database
- Only use if you're absolutely certain

## Environment Variables

The script requires the `REDIS_URL` environment variable to be set. This should be the same URL used by your Next.js application.

Example:
```bash
REDIS_URL=redis://localhost:6379
# or for Upstash/remote Redis:
REDIS_URL=redis://default:password@host:port
```

## What It Does

1. Validates that `REDIS_URL` is set
2. Shows what will be deleted
3. Asks for triple confirmation
4. Connects to Redis
5. Performs the deletion operation:
   - **Default**: Deletes the "candles" hash using `DEL candles`
   - **Flush All**: Runs `FLUSHDB` to clear the entire database
6. Shows confirmation and statistics
7. Disconnects from Redis

## Error Handling

The script will:
- Exit safely if Redis URL is not configured
- Display Redis connection errors clearly
- Gracefully handle cancelled operations
- Clean up connections properly

## Security Notes

- The script masks the Redis password when displaying the connection URL
- Requires explicit typed confirmations (not just Y/N)
- Different confirmation phrases for different modes
- No default "yes" behavior - you must explicitly confirm each time

## Troubleshooting

### "REDIS_URL environment variable is not set"
- Make sure you have a `.env` or `.env.local` file with `REDIS_URL` defined
- Or export `REDIS_URL` in your shell before running the script

### "Redis Client Error"
- Check that your Redis server is running
- Verify the Redis URL is correct
- Ensure network connectivity to Redis server

### Permission denied when running ./scripts/clear-redis.ts
- The file should already be executable
- If not, run: `chmod +x scripts/clear-redis.ts`

### tsx not found
- Run `pnpm install` to install the tsx package
- Or use the npm scripts which handle this automatically

