"use client";
import { useEffect, useState } from "react";
import { CandleItem } from "./_components/candle-item";
import { NewCandleDialog } from "./_components/new-candle-dialog";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const getCandles = async () => {
  const res = await fetch("api/candle");
  return res.json();
};

const driverObj = driver({
  animate: true,
  showProgress: true,
  allowClose: true,
  allowKeyboardControl: true,
  showButtons: ["next", "previous", "close"],
  steps: [
    {
      popover: {
        title: "Welcome / Bienvenid@",
        description: `ENG: Ember Dream lets you express you wishes and intentions with a 12-hour-lasting flame <br/><br/>
          ESP: Ember Dream te permite expresar tus deseos e intenciones prendiendo una llama que dura <strong>12 horas</strong>.`,
      },
    },
    {
      element: "#new_candle_btn",
      popover: {
        title: "Spark the fire! / Enciende el fuego!",
        description:
          "ENG: Click here to light your candle and input your country, name and wish <br/><br/>ESP: Haciendo click aqui puedes encender tu vela ingresando tu país, nombre y deseo o intención.",
        side: "left",
        align: "start",
      },
    },
    {
      element: "#donate_btn",
      popover: {
        title: "Donate / Donar",
        description: `ENG: This site is non-profit but still requires effort and time. If you consider it's worth a dollar, the team will gratefully accept your donation. <br/><br/>
          ESP: Este sitio no tiene fines de lucro, pero si implica esfuerzo y tiempo. Si consideras que vale la pena, el equipo agradece tu donación.`,
        side: "right",
        align: "start",
      },
    },
    {
      popover: {
        title:
          "May all your wished come true / Que todos tus sueños se cumplan",
        description:
          "ENG: The Ember Dream team wishes you the best. <br/><br/>ESP: El equipo de Ember Dream te sea lo mejor!",
      },
    },
  ],
});

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

  const onChildRendered = () => {
    if (localStorage.getItem("visited")) return;
    driverObj.drive();
    localStorage.setItem("visited", "true");
  };

  return (
    <>
      <NewCandleDialog
        candleCreated={onCandleCreated}
        childRendered={onChildRendered}
      />
      <div className="flex flex-col md:flex-row gap-4 w-full flex-wrap self-start mt-10">
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
