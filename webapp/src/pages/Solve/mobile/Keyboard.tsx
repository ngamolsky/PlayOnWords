import React, { useEffect } from "react";

import classNames from "classnames";

type KeyboardProps = {
  onKeyPress: (
    key: string,
    isShiftModified: boolean,
    pencilMode: boolean
  ) => void;
  rebus: boolean;
  pencilMode: boolean;
  className?: string;
};

export const ACTION_KEYS = {
  REBUS: "REBUS",
  BACKSPACE: "BACKSPACE",
  TAB: "TAB",
  ENTER: "ENTER",
  RIGHT: "ARROWRIGHT",
  LEFT: "ARROWLEFT",
  UP: "ARROWUP",
  DOWN: "ARROWDOWN",
};

export const Keyboard = ({
  onKeyPress,
  rebus,
  pencilMode,
  className,
}: KeyboardProps) => {
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
        onKeyPress(e.key.toUpperCase(), e.shiftKey, pencilMode);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pencilMode]);

  return (
    <div
      className={classNames(
        "flex flex-col grow max-h-56 p-1 space-y-1 border-t-2 border-slate-100 dark:border-slate-800 dark:bg-slate-700 bg-slate-300 align-bottom",
        className
      )}
    >
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
                    "flex justify-center w-full align-middle rounded-md dark:bg-slate-800  active:bg-slate-200 dark:active:bg-slate-600 select-none",
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
                      " bg-slate-100 dark:bg-slate-800  active:scale-150 ":
                        character != ACTION_KEYS.REBUS,
                    },
                    {
                      "w-[30rem]": character == ACTION_KEYS.BACKSPACE,
                    }
                  )}
                  onClick={() => {
                    onKeyPress(character, false, pencilMode);
                  }}
                >
                  <p className="my-auto text-lg">
                    {character == ACTION_KEYS.REBUS
                      ? "REBUS"
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
