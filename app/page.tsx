"use client";
import { useEffect, useState } from "react";
import { CandleItem } from "./_components/candle-item";
import { NewCandleDialog } from "./_components/new-candle-dialog";

const getCandles = async () => {
  const res = await fetch("api/candle");
  return res.json();
};

export default function Home() {
  const [candles, setCandles] = useState([]);

  useEffect(() => {
    (async () => {
      const candles = await getCandles();
      setCandles(candles);
    })();
  }, []);

  const onCandleCreated = async () => {
    const candles = await getCandles();
    setCandles(candles);
  };

  return (
    <>
      <NewCandleDialog candleCreated={onCandleCreated} />
      <div className="flex gap-4 w-full flex-wrap self-start mt-10">
        {Object.keys(candles).map((candleKey) => (
          <CandleItem
            candle={candles[candleKey as unknown as number]}
            key={candleKey}
            name={candleKey}
            navigate
          />
        ))}
      </div>
    </>
  );
}
