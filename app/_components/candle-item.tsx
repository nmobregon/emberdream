import { Candle } from "./candle";
import { countries } from "../_data/countries";

export function CandleItem(candleProp: {
  name: string;
  candle: string;
  navigate: boolean;
}) {
  const candle = JSON.parse(candleProp.candle);
  const [name, createdAt] = candleProp.name.split("-");
  const height =
    ((Date.now() - +createdAt) * 100) /
    (+(process.env.CANDLE_DURATION ?? 720) * 60 * 1000);
  const country = countries.find((c) => c.code === candle.country)?.name;
  const candleObj = {
    ...candle,
    height,
    country,
    name,
    date: new Date(+createdAt).toLocaleString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCopyToClipboard = (event: any) => {
    event.stopPropagation();
    navigator.clipboard.writeText(
      window.location.href + "candle/" + candleProp.name
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onShare = async (event: any) => {
    event.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ember Dreams - Candle by " + candleObj.name,
          text: candleObj.wish,
          url: window.location.href + "candle/" + candleProp.name,
        });
      } catch (error) {
        console.error("Error sharing the URL: ", error);
      }
    } else {
      console.log("Web share not supported");
    }
  };

  return (
    <>
      {candleObj && (
        <div
          className={`flex flex-col justify-end w-[300px] h-[300px] ${candleProp.navigate && "cursor-pointer"}`}
          onClick={() =>
            candleProp.navigate &&
            window.open(window.location.href + "candle/" + candleProp.name)
          }
        >
          <Candle height={100 - candleObj.height} />

          <div className="flex flex-col place-items-center w-full bg-black opacity-70 h-[50px] -mt-[30px] ">
            <p>{candleObj.wish}</p>
            <p className="text-xs">
              by {candleObj.name} ({candleObj.country})
            </p>
            <p className="text-[7px]">on {candleObj.date}</p>
            <div className="flex place-content-end w-full -mt-6 gap-2 mr-2">
              <button
                className="font-bold hover:cursor-pointer cursor-pointer"
                onClick={onCopyToClipboard}
                title="Copy / Copiar"
              >
                {/* hyperlink emoji */}
                &#128279;
              </button>
              <button
                className="font-bold hover:cursor-pointer cursor-pointer"
                onClick={onShare}
                title="Share / Compartir"
              >
                {/* share link emoji */}
                🎁
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
