"use client";

export function Candle({ height = 100 }) {
  return (
    <div
      className="flex w-full items-end justify-center"
      style={{ height: `${height}%` }}
    >
      <div className="candle">
        <div className="flame">
          <div className="shadows"></div>
          <div className="top"></div>
          <div className="middle"></div>
          <div className="bottom"></div>
        </div>
        <div className="wick"></div>
        <div className="wax"></div>
      </div>
    </div>
  );
}
