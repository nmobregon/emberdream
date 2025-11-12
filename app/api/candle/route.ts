import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis-client";
import { getAllRatelimit, createRatelimit } from "@/lib/rate-limit";
import { validateCandleInput } from "@/lib/validation";
import { getClientIp } from "@/lib/get-client-ip";

export const GET = async (req: NextRequest) => {
  const ip = getClientIp(req);
  const { success, limit: rateLimit, reset, remaining } = await getAllRatelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        }
      }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    
    const client = await getRedisClient();
    const allCandles = await client.hGetAll("candles");
    
    // Convert to array and sort by creation time (newest first)
    // Candle names are in format: "name-timestamp"
    const candleEntries = Object.entries(allCandles);
    candleEntries.sort((a, b) => {
      const timestampA = parseInt(a[0].split("-").pop() || "0", 10);
      const timestampB = parseInt(b[0].split("-").pop() || "0", 10);
      return timestampB - timestampA; // Descending order (newest first)
    });
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCandles = candleEntries.slice(startIndex, endIndex);
    
    // Convert back to object format for backward compatibility
    const result: Record<string, string> = {};
    paginatedCandles.forEach(([key, value]) => {
      result[key] = value;
    });
    
    const total = candleEntries.length;
    const hasMore = endIndex < total;
    
    return NextResponse.json(
      {
        candles: result,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error fetching candles:", e);
    return NextResponse.json(
      { error: "Failed to fetch candles" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const ip = getClientIp(req);
  const { success, limit, reset, remaining } = await createRatelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: "Too many candles created. Please wait before creating another.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        }
      }
    );
  }

  try {
    const body = await req.json();

    // Validate and sanitize input
    const validation = validateCandleInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const sanitized = validation.sanitized!;

    const client = await getRedisClient();
    
    if (client.isReady && client.isOpen) {
      const name = `${sanitized.name}-${Date.now()}`;
      await client.hSet(
        "candles",
        name,
        JSON.stringify({
          wish: sanitized.wish,
          country: sanitized.country,
          color: sanitized.color,
          support: 1,
        })
      );
      
      const duration = +(process.env.CANDLE_DURATION_MINUTES ?? 720);
      await client.hExpire("candles", name, duration * 60);

      return NextResponse.json(
        { success: true, name },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }
  } catch (e) {
    console.error("Error creating candle:", e);
    return NextResponse.json(
      { error: "Failed to create candle" },
      { status: 500 }
    );
  }
};
