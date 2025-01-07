import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) => {
  const { name } = await params;
  console.log(await params, name);
  try {
    const client = await createClient({ url: process.env.REDIS_URL })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();

    const json = await client.hGet("candles", name);
    await client.disconnect();
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    console.error(e);
    throw e;
  }
};
