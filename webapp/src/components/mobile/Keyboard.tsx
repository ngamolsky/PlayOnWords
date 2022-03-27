import React, { useEffect } from "react";

import classNames from "classnames";

type KeyboardProps = {
  onKeyPress: (key: string, pencilMode: boolean) => void;
  rebus: boolean;
  pencilMode: boolean;
};

export const ACTION_KEYS = {
  REBUS: "REBUS",
  BACKSPACE: "BACKSPACE",
  TAB: "TAB",
};

export const Keyboard = ({ onKeyPress, rebus, pencilMode }: KeyboardProps) => {
  const rows = [
    "Q W E R T Y U I O P",
    "A S D F G H J K L",
    "REBUS Z X C V B N M BACKSPACE",
  ];

  const allKeys = rows.join(" ").split(" ");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        allKeys
          .concat(Object.values(ACTION_KEYS))
          .includes(e.key.toUpperCase()) &&
        !e.metaKey
      ) {
        e.preventDefault();
        onKeyPress(e.key.toUpperCase(), pencilMode);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pencilMode]);

  return (
    <div className="flex flex-col h-40 p-2 space-y-2 border-t-2 border-slate-100 dark:border-slate-800 dark:bg-slate-700 bg-slate-300">
      {rows.map((row, rowIndex) => {
        return (
          <div
            className="flex flex-row w-full space-x-1 align-middle justify-evenly grow"
            key={rowIndex}
          >
            {row.split(" ").map((character, characterIndex) => {
              return (
                <div
                  key={characterIndex}
                  className={classNames(
                    "flex justify-center w-full align-middle rounded-md dark:bg-slate-800 dark:active:bg-opacity-50 active:bg-slate-200 select-none",
                    {
                      "px-2": character == ACTION_KEYS.REBUS,
                    },
                    {
                      "dark:bg-blue-600 bg-blue-300":
                        character == ACTION_KEYS.REBUS && rebus,
                    },
                    {
                      "bg-slate-100 dark:bg-slate-800 ":
                        character == ACTION_KEYS.REBUS && !rebus,
                    },
                    {
                      " bg-slate-100 dark:bg-slate-800 ":
                        character != ACTION_KEYS.REBUS,
                    }
                  )}
                  onClick={() => {
                    onKeyPress(character, pencilMode);
                  }}
                >
                  <p className="my-auto">
                    {character == ACTION_KEYS.REBUS
                      ? "Rebus"
                      : character == ACTION_KEYS.BACKSPACE
                      ? "⌫"
                      : character}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
