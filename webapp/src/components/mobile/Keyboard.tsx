import React, { MutableRefObject } from "react";
import { SimpleKeyboard } from "react-simple-keyboard";
import KeyboardLib from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { ACTION_KEYS } from "../../utils/keyboardUtils";

type KeyboardProps = {
  onKeyPress: (key: string) => void;
  keyboardRef: MutableRefObject<SimpleKeyboard | null>;
  rebus: boolean;
};

export const Keyboard = ({ onKeyPress, keyboardRef, rebus }: KeyboardProps) => {
  const rows = [
    "q w e r t y u i o p",
    "a s d f g h j k l",
    "{rebus} z x c v b n m {backspace}",
  ];

  const characters = rows
    .join(" ")
    .split(" ")
    .filter((each) => each.length == 1)
    .reduce(
      (result, value) => ({ ...result, [value]: value.toUpperCase() }),
      {}
    );

  return (
    <KeyboardLib
      keyboardRef={(r) => (keyboardRef.current = r)}
      layout={{
        default: rows,
      }}
      disableButtonHold
      onKeyPress={(letter: string) => {
        if (Object.values<string>(ACTION_KEYS).includes(letter)) {
          onKeyPress(letter);
        } else {
          onKeyPress(letter.toUpperCase());
        }
      }}
      theme="hg-theme-default keyboard"
      display={{
        ...characters,
        "{space}": "Space",
        "{rebus}": "Rebus",
        "{backspace}": "⌫",
      }}
      buttonTheme={[
        {
          class: "h-10",
          buttons: "{rebus} {backspace}",
        },
        {
          class: "text-3xl",
          buttons: "{backspace}",
        },
        {
          class: rebus ? "bg-blue-300 w-12 text-l" : "w-12 text-l",
          buttons: "{rebus}",
        },
        {
          class: "text-xl h-10",
          buttons: Object.keys(characters).join(" "),
        },
      ]}
    />
  );
};
