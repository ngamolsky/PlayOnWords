import React, { MutableRefObject, useState } from "react";
import { SimpleKeyboard } from "react-simple-keyboard";
import KeyboardLib from "react-simple-keyboard";

import "react-simple-keyboard/build/css/index.css";

type KeyboardProps = {
  onChange: (input: string, event?: MouseEvent) => void;
  keyboardRef: MutableRefObject<SimpleKeyboard | null>;
};

export const Keyboard = ({ onChange, keyboardRef }: KeyboardProps) => {
  return (
    <div>
      <KeyboardLib
        keyboardRef={(r) => (keyboardRef.current = r)}
        layout={{
          default: [
            "Q W E R T Y U I O P {bksp}",
            "A S D F G H J K L",
            "Rebus Z X C V B N M",
            "{space}",
          ],
        }}
        onChange={onChange}
        mergeDisplay={true}
        display={{
          "{space}": "Space",
          "{bksp}": "⌫",
        }}
        buttonTheme={[
          {
            class: "w-10",
            buttons: "Rebus",
          },
        ]}
      />
    </div>
  );
};
