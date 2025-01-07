import { NextRequest, NextResponse } from "next/server";
import { createClient } from "redis";

export const GET = async (/*req: NextRequest*/) => {
  // const searchParams = req.nextUrl.searchParams
  try {
    const client = await createClient({ url: process.env.REDIS_URL })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();

    const json = await client.hGetAll("candles");
    await client.disconnect();
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!(body.country?.length && body.name?.length && body.wish?.length)) {
      return NextResponse.json(
        {
          error:
            "You must complete all the fields / Debes completar todos los campos",
        },
        { status: 400 }
      );
    }

    const client = await createClient({ url: process.env.REDIS_URL })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
    if (client.isReady && client.isOpen) {
      const name = `${body.name}-${Date.now()}`;
      await client.hSet(
        "candles",
        name,
        JSON.stringify({
          wish: body.wish,
          country: body.country,
        })
      );
      const duration = +(process.env.CANDLE_DURATION_MINUTES ?? 720);
      await client.hExpire("candles", name, duration * 60);

      return NextResponse.json({}, { status: 201 });
    } else {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
