import { FormEvent, useLayoutEffect, useRef, useState } from "react";

import Form from "next/form";
import Image from "next/image";
import { countries } from "../_data/countries";

export const NewCandleDialog = ({
  candleCreated,
}: {
  candleCreated: VoidFunction;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialog = useRef<any>(undefined);
  const [dialogOpened, setDialogOpened] = useState(false);

  useLayoutEffect(() => {
    if (dialogOpened) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialogOpened]);

  const openDialog = () => {
    setDialogOpened(true);
  };
  const closeDialog = () => {
    setDialogOpened(false);
  };

  const newCandle = async (event: FormEvent) => {
    event.preventDefault();
    const {
      target: { name, wish, country },
    } = event as unknown as {
      target: {
        name: HTMLInputElement;
        wish: HTMLInputElement;
        country: HTMLSelectElement;
      };
    };

    await fetch("api/candle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.value,
        wish: wish.value,
        country: country.value,
      }),
    });
    candleCreated();
    setDialogOpened(false);
  };

  return (
    <>
      <button
        className={`
            fixed bottom-10 right-10 rounded-full text-2xl font-bold 
            bg-gray-200 shadow-md 
            text-black w-20 h-20 flex items-center justify-center
            hover:shadow-xl hover:bg-gray-300 `}
        title="New Candle"
        onClick={openDialog}
      >
        <Image
          src="/ember-dream-icon.png"
          alt="Ember Dream logo"
          width={50}
          height={50}
        />
      </button>
      <dialog
        ref={dialog}
        className="shadow-lg bg-white shadow-gray-300 pb-4 rounded-lg"
      >
        <div className="flex justify-between p-3">
          <h2>Light a candle / Prender una vela</h2>
          <button
            className="font-bold hover:cursor-pointer"
            onClick={closeDialog}
          >
            {/* close emoji */}
            &#10006;
          </button>
        </div>
        <Form
          action="/"
          onSubmit={newCandle}
          className="flex flex-col place-content-start"
        >
          <div className="flex odd:bg-gray-100 px-2 py-4 place-items-center gap-2">
            <label
              className="font-bold w-2/5 text-right pr-1"
              htmlFor="country"
            >
              Country / País
            </label>
            <select name="country" id="country" className="w-3/5 h-[33px]">
              <option>Select country / Selecciona país</option>
              {countries.map((country) => (
                <option value={country.code} key={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex odd:bg-gray-100 px-2 py-4 place-items-center gap-2">
            <label className="font-bold w-2/5 text-right pr-1" htmlFor="name">
              Name / Nombre
            </label>
            <input
              className="border-b border-gray-600 px-2 py-1 flex flex-auto"
              type="text"
              name="name"
              id="name"
            />
          </div>
          <div className="flex odd:bg-gray-100 px-2 py-4 place-items-center gap-2">
            <label className="font-bold w-2/5 text-right pr-1" htmlFor="wish">
              Wish / Intención
            </label>
            <input
              className="border-b border-gray-600 px-2 py-1 flex flex-auto"
              type="text"
              name="wish"
              id="wish"
            />
          </div>
          <button
            className="border border-gray-500 rounded-2xl px-4 py-2 w-3/4 self-center mt-2"
            type="submit"
          >
            Light / Encender
          </button>
        </Form>
      </dialog>
    </>
  );
};
