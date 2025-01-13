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
          className={`flex flex-col justify-end w-[300px] h-[300px] self-center ${candleProp.navigate && "cursor-pointer"} bg-opacity-40 bg-black rounded-t-full rounded-b-md`}
          onClick={() =>
            candleProp.navigate &&
            window.open(window.location.href + "candle/" + candleProp.name)
          }
        >
          <Candle height={100 - candleObj.height} />

          <div className="flex flex-col place-items-center w-full bg-black opacity-70 h-[50px] -mt-[30px] rounded-b-md ">
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
                <svg
                  fill="#ffffff"
                  height="16px"
                  width="16px"
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 481.6 481.6"
                  xmlSpace="preserve"
                  stroke="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <g>
                      {" "}
                      <path d="M381.6,309.4c-27.7,0-52.4,13.2-68.2,33.6l-132.3-73.9c3.1-8.9,4.8-18.5,4.8-28.4c0-10-1.7-19.5-4.9-28.5l132.2-73.8 c15.7,20.5,40.5,33.8,68.3,33.8c47.4,0,86.1-38.6,86.1-86.1S429,0,381.5,0s-86.1,38.6-86.1,86.1c0,10,1.7,19.6,4.9,28.5 l-132.1,73.8c-15.7-20.6-40.5-33.8-68.3-33.8c-47.4,0-86.1,38.6-86.1,86.1s38.7,86.1,86.2,86.1c27.8,0,52.6-13.3,68.4-33.9 l132.2,73.9c-3.2,9-5,18.7-5,28.7c0,47.4,38.6,86.1,86.1,86.1s86.1-38.6,86.1-86.1S429.1,309.4,381.6,309.4z M381.6,27.1 c32.6,0,59.1,26.5,59.1,59.1s-26.5,59.1-59.1,59.1s-59.1-26.5-59.1-59.1S349.1,27.1,381.6,27.1z M100,299.8 c-32.6,0-59.1-26.5-59.1-59.1s26.5-59.1,59.1-59.1s59.1,26.5,59.1,59.1S132.5,299.8,100,299.8z M381.6,454.5 c-32.6,0-59.1-26.5-59.1-59.1c0-32.6,26.5-59.1,59.1-59.1s59.1,26.5,59.1,59.1C440.7,428,414.2,454.5,381.6,454.5z"></path>{" "}
                    </g>{" "}
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
