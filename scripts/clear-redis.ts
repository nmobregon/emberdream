#!/usr/bin/env tsx

/**
 * Redis Data Eraser Script
 * 
 * This script clears Redis data with triple confirmation.
 * Usage:
 *   ./scripts/clear-redis.ts              # Clear 'candles' hash
 *   ./scripts/clear-redis.ts --flush-all  # Flush entire Redis database (DANGEROUS)
 */

import { createClient } from 'redis';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  const flushAll = process.argv.includes('--flush-all');
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.error('❌ Error: REDIS_URL environment variable is not set.');
    console.error('Please set REDIS_URL in your .env file or environment.');
    process.exit(1);
  }

  console.log('\n🔴 REDIS DATA DELETION SCRIPT 🔴\n');
  console.log('⚠️  WARNING: This action is IRREVERSIBLE!\n');

  if (flushAll) {
    console.log('🔥 Mode: FLUSH ALL - Will delete ENTIRE Redis database');
  } else {
    console.log('🗑️  Mode: Clear Candles - Will delete all items in "candles" hash');
  }

  console.log(`🔗 Redis URL: ${redisUrl.replace(/:[^:]*@/, ':****@')}\n`);

  // First confirmation
  const confirm1 = await askQuestion(
    '❓ Are you ABSOLUTELY SURE you want to proceed? Type "YES" to continue: '
  );
  
  if (confirm1.trim() !== 'YES') {
    console.log('\n✅ Operation cancelled. No data was deleted.');
    rl.close();
    process.exit(0);
  }

  // Second confirmation
  const confirm2 = await askQuestion(
    '\n❓ This is your SECOND WARNING. Type "DELETE" to continue: '
  );
  
  if (confirm2.trim() !== 'DELETE') {
    console.log('\n✅ Operation cancelled. No data was deleted.');
    rl.close();
    process.exit(0);
  }

  // Third confirmation
  const finalConfirm = flushAll 
    ? 'FLUSH-ALL-DATA' 
    : 'CLEAR-CANDLES';
  
  const confirm3 = await askQuestion(
    `\n❓ FINAL CONFIRMATION. Type "${finalConfirm}" to proceed: `
  );
  
  if (confirm3.trim() !== finalConfirm) {
    console.log('\n✅ Operation cancelled. No data was deleted.');
    rl.close();
    process.exit(0);
  }

  console.log('\n🔄 Connecting to Redis...');

  try {
    const client = await createClient({ url: redisUrl })
      .on('error', (err) => console.error('Redis Client Error:', err))
      .connect();

    console.log('✅ Connected to Redis\n');

    if (flushAll) {
      console.log('🔥 Flushing entire Redis database...');
      await client.flushDb();
      console.log('✅ All data has been deleted from the database.');
    } else {
      console.log('🗑️  Checking "candles" hash...');
      const candlesCount = await client.hLen('candles');
      
      if (candlesCount === 0) {
        console.log('ℹ️  The "candles" hash is already empty.');
      } else {
        console.log(`📊 Found ${candlesCount} items in "candles" hash`);
        console.log('🗑️  Deleting all items...');
        await client.del('candles');
        console.log('✅ All candles have been deleted.');
      }
    }

    await client.disconnect();
    console.log('✅ Disconnected from Redis\n');
    console.log('🎉 Operation completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});

