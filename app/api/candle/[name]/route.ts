import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis-client";
import { getAllRatelimit, supportRatelimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) => {
  const ip = getClientIp(req);
  const { success, limit, reset, remaining } = await getAllRatelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        }
      }
    );
  }

  const { name } = await params;
  
  try {
    const client = await getRedisClient();
    const json = await client.hGet("candles", name);
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    console.error("Error fetching candle:", e);
    return NextResponse.json(
      { error: "Failed to fetch candle" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) => {
  const ip = getClientIp(req);
  const { success, limit, reset, remaining } = await supportRatelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: "Too many support actions. Please wait a moment.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        }
      }
    );
  }

  const { name } = await params;
  
  try {
    const client = await getRedisClient();

    // Check if IP has already supported this candle (server-side validation)
    const supportKey = `support:${name}:${ip}`;
    const hasSupported = await client.exists(supportKey);

    if (hasSupported) {
      return NextResponse.json(
        { error: "You have already supported this candle" },
        { status: 400 }
      );
    }

    // Get the current candle data
    const candleData = await client.hGet("candles", name);
    
    if (!candleData) {
      return NextResponse.json(
        { error: "Candle not found" },
        { status: 404 }
      );
    }

    // Parse, increment support, and save back
    const candle = JSON.parse(candleData);
    candle.support = (candle.support || 0) + 1;
    
    await client.hSet("candles", name, JSON.stringify(candle));
    
    // Mark IP as having supported (expires after 12 hours)
    await client.set(supportKey, "1", { EX: 12 * 60 * 60 });
    
    return NextResponse.json({ support: candle.support }, { status: 200 });
  } catch (e) {
    console.error("Error supporting candle:", e);
    return NextResponse.json(
      { error: "Failed to support candle" },
      { status: 500 }
    );
  }
};
