"use client";
import { CandleItem } from "@/app/_components/candle-item";
import { use, useEffect, useState } from "react";

export default function CandlePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const nameParam = use(params);
  const [candle, setCandle] = useState<string>();

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/candle/${nameParam.name}`);
      const json = await res.json();
      setCandle(json);
    })();
  }, [nameParam.name]);

  return (
    <div className="flex place-content-center h-full w-full mt-10">
      {candle && (
        <CandleItem name={nameParam.name} candle={candle} navigate={false} />
      )}
    </div>
  );
}
